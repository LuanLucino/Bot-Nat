const fs = require('fs');
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require('discord.js');

const { gerarCheckout } = require('../payments/pagbank');

function buildCartEmbed(cartItems) {
  const linhas = cartItems.map((item, i) => `${i + 1}. ${item.nome} — R$${item.preco.toFixed(2)}`);
  const total = cartItems.reduce((sum, item) => sum + item.preco, 0);

  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle("🛒 Carrinho de Compras")
    .setDescription(linhas.join('\n'))
    .addFields({ name: "💰 Total", value: `**R$${total.toFixed(2)}**` })
    .setFooter({ text: "Selecione a forma de pagamento ou cancele o pedido." });
}

function buildRows() {
  const rowPagamento = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('forma_pagamento')
      .setPlaceholder('Selecione a forma de pagamento')
      .addOptions([
        { label: 'Cartão', value: 'cartao' },
        { label: 'Pix', value: 'pix' }
      ])
  );

  const rowCancelar = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('cancelar_pedido')
      .setLabel('Cancelar Pedido')
      .setStyle(ButtonStyle.Danger)
  );

  return [rowPagamento, rowCancelar];
}

async function gerenciarCarrinho(interaction, nomeProduto, precoProduto, categoryCarrinhos, roleVendasId) {
  const novoItem = { nome: nomeProduto, preco: parseFloat(precoProduto) };

  const ticketExistente = interaction.guild.channels.cache.find(
    ch => ch.name === `${interaction.user.username}-compra` && ch.parentId === categoryCarrinhos
  );

  if (ticketExistente) {
    let cartItems = [];
    try {
      cartItems = JSON.parse(ticketExistente.topic || '[]');
    } catch {
      cartItems = [];
    }
    cartItems.push(novoItem);

    await ticketExistente.setTopic(JSON.stringify(cartItems));

    try {
      const pinnedMessages = await ticketExistente.messages.fetchPinned();
      const cartMessage = pinnedMessages.first();
      if (cartMessage) {
        await cartMessage.edit({
          embeds: [buildCartEmbed(cartItems)],
          components: buildRows()
        });
      }
    } catch (err) {
      console.error("Erro ao atualizar carrinho:", err);
    }

    await interaction.reply({
      content: `✅ **${nomeProduto}** adicionado ao carrinho em ${ticketExistente}!`,
      flags: 64
    });
  } else {
    const cartItems = [novoItem];

    const channel = await interaction.guild.channels.create({
      name: `${interaction.user.username}-compra`,
      type: ChannelType.GuildText,
      parent: categoryCarrinhos,
      topic: JSON.stringify(cartItems),
      permissionOverwrites: [
        { id: interaction.guild.id, deny: ['ViewChannel'] },
        { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
        { id: roleVendasId, allow: ['ViewChannel', 'SendMessages'] }
      ]
    });

    const cartMessage = await channel.send({
      content: `<@${interaction.user.id}>`,
      embeds: [buildCartEmbed(cartItems)],
      components: buildRows()
    });

    await cartMessage.pin();

    await interaction.reply({
      content: `✅ Carrinho criado em ${channel}!`,
      flags: 64
    });
  }
}

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    const categoryCarrinhos = process.env.ABERTOS_CATEGORY_ID;
    const categoryFinalizados = process.env.FINALIZADOS_CATEGORY_ID;
    const roleVendasId = process.env.ROLE_VENDAS_ID;

    // Autocomplete
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command || !command.autocomplete) return;
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error("Erro no autocomplete:", error);
      }
      return;
    }

    // Comandos slash
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Houve um erro ao executar este comando!', flags: 64 });
      }
      return;
    }

    // Botão "Comprar" vindo de um anúncio
    if (interaction.isButton() && interaction.customId === 'comprar_produto') {
      try {
        const embed = interaction.message.embeds[0];
        const nomeProduto = embed?.title || 'Produto';
        const descricao = embed?.description || '';
        const precoMatch = descricao.match(/R\$([\d,.]+)/);
        const precoProduto = precoMatch ? precoMatch[1].replace(',', '.') : '0';

        await gerenciarCarrinho(interaction, nomeProduto, precoProduto, categoryCarrinhos, roleVendasId);
      } catch (error) {
        console.error("Erro ao gerenciar carrinho:", error);
        if (!interaction.replied) {
          await interaction.reply({ content: "❌ Não foi possível processar o pedido.", flags: 64 });
        }
      }
      return;
    }

    // Select Menu "Comprar do Catálogo"
    if (interaction.isStringSelectMenu() && interaction.customId === 'comprar_catalogo') {
      try {
        const produtoId = interaction.values[0];
        const produtos = JSON.parse(fs.readFileSync('./resources/products.json', 'utf8'));
        const promocoes = JSON.parse(fs.readFileSync('./resources/promotions.json', 'utf8'));

        const produto = produtos[produtoId];
        if (!produto) {
          return interaction.reply({ content: "❌ Produto não encontrado.", flags: 64 });
        }

        const promo = promocoes[produtoId];
        const preco = promo ? promo.preco_promocional : produto.preco;

        await gerenciarCarrinho(interaction, produto.nome, preco.toFixed(2), categoryCarrinhos, roleVendasId);
      } catch (error) {
        console.error("Erro ao adicionar produto do catálogo:", error);
        if (!interaction.replied) {
          await interaction.reply({ content: "❌ Não foi possível processar o pedido.", flags: 64 });
        }
      }
      return;
    }

    // Select Menu de pagamento
    if (interaction.isStringSelectMenu() && interaction.customId === 'forma_pagamento') {
      const escolha = interaction.values[0];

      let cartItems = [];
      try {
        cartItems = JSON.parse(interaction.channel.topic || '[]');
      } catch {
        cartItems = [];
      }

      const total = cartItems.reduce((sum, item) => sum + item.preco, 0);
      const descricao = cartItems.length === 1
        ? cartItems[0].nome
        : `${cartItems.length} produtos`;

      await interaction.deferReply({ ephemeral: true });

      const resultado = await gerarCheckout(descricao, total, interaction.channel.id);

      if (resultado.erro) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xE74C3C)
              .setTitle("❌ Erro no Checkout")
              .setDescription(`Erro ao gerar checkout: ${resultado.mensagem}`)
          ]
        });
        return;
      }

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Pagar agora")
          .setStyle(ButtonStyle.Link)
          .setURL(resultado.url)
      );

      if (escolha === 'cartao') {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x3498db)
              .setTitle("💳 Pagamento com Cartão")
              .setDescription("Clique no botão abaixo para realizar o pagamento:")
          ],
          components: [row]
        });
      }

      if (escolha === 'pix') {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x2ecc71)
              .setTitle("🔑 Pagamento via Pix")
              .setDescription("Escaneie o QR Code abaixo ou clique no botão para pagar:")
              .setImage("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + encodeURIComponent(resultado.url))
          ],
          components: [row]
        });
      }
      return;
    }

    // Botão Cancelar Pedido
    if (interaction.isButton() && interaction.customId === 'cancelar_pedido') {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle("⚠️ Confirmar Cancelamento")
            .setDescription("Tem certeza que deseja cancelar? O carrinho será encerrado e você perderá o acesso.")
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('confirmar_cancelamento')
              .setLabel('Confirmar Cancelamento')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('manter_compra')
              .setLabel('Manter Compra')
              .setStyle(ButtonStyle.Primary)
          )
        ],
        flags: 64
      });
      return;
    }

    // Confirmação de cancelamento
    if (interaction.isButton() && interaction.customId === 'confirmar_cancelamento') {
      await interaction.reply({ content: "❌ Compra cancelada. O ticket foi encerrado.", flags: 64 });
      await interaction.channel.setParent(categoryFinalizados, { lockPermissions: false });
      await interaction.channel.permissionOverwrites.set([
        { id: interaction.guild.id, deny: ['ViewChannel'] },
        { id: roleVendasId, allow: ['ViewChannel', 'SendMessages'] }
      ]);
      return;
    }

    if (interaction.isButton() && interaction.customId === 'manter_compra') {
      await interaction.reply({ content: "✅ Compra mantida. Continue o processo normalmente.", flags: 64 });
      return;
    }
  }
};
