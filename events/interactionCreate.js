const { 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ChannelType 
} = require('discord.js');

// Importa o módulo de pagamento
const { gerarCheckout } = require('../payments/pagbank');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    const categoryCarrinhos = "1476324901253025844"; // Categoria Carrinhos
    const categoryFinalizados = "1476341804981948510"; // Categoria Compras Finalizadas
    const roleVendasId = "1476326465229553775"; // Cargo de vendas

    // Handler para autocomplete
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

    // Handler para comandos normais
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

    // Botão "Comprar" → cria ticket
    if (interaction.isButton() && interaction.customId === 'comprar_produto') {
      try {
        const channel = await interaction.guild.channels.create({
          name: `${interaction.user.username}-compra`,
          type: ChannelType.GuildText,
          parent: categoryCarrinhos,
          permissionOverwrites: [
            { id: interaction.guild.id, deny: ['ViewChannel'] },
            { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
            { id: roleVendasId, allow: ['ViewChannel', 'SendMessages'] }
          ]
        });

        const embed = new EmbedBuilder()
          .setColor(0x2ecc71)
          .setTitle("🛒 Ticket de Compra")
          .setDescription("Selecione abaixo a forma de pagamento ou cancele o pedido.");

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

        await channel.send({ 
          content: `<@${interaction.user.id}>`, 
          embeds: [embed], 
          components: [rowPagamento, rowCancelar] 
        });

        await interaction.reply({ content: "✅ Ticket de compra criado!", flags: 64 });
      } catch (error) {
        console.error("Erro ao criar ticket:", error);
        await interaction.reply({ content: "❌ Não foi possível criar o ticket.", flags: 64 });
      }
      return;
    }

    // Handler do Select Menu de pagamento
    if (interaction.isStringSelectMenu() && interaction.customId === 'forma_pagamento') {
      const escolha = interaction.values[0];

      if (escolha === 'cartao') {
        try {
          const link = await gerarCheckout("Compra via Cartão", 15.00);
          await interaction.reply({ content: `💳 Pague com cartão aqui: ${link}`, flags: 64 });
          await interaction.channel.setParent(categoryFinalizados, { lockPermissions: false });
          await interaction.channel.permissionOverwrites.set([
            { id: interaction.guild.id, deny: ['ViewChannel'] },
            { id: roleVendasId, allow: ['ViewChannel', 'SendMessages'] }
          ]);
        } catch (err) {
          console.error("Erro no checkout cartão:", err);
          await interaction.reply({ content: "❌ Erro ao gerar checkout de cartão.", flags: 64 });
        }
      }

      if (escolha === 'pix') {
        try {
          const link = await gerarCheckout("Compra via Pix", 15.00);
          await interaction.reply({ content: `🔑 Pague via Pix aqui: ${link}`, flags: 64 });
          await interaction.channel.setParent(categoryFinalizados, { lockPermissions: false });
          await interaction.channel.permissionOverwrites.set([
            { id: interaction.guild.id, deny: ['ViewChannel'] },
            { id: roleVendasId, allow: ['ViewChannel', 'SendMessages'] }
          ]);
        } catch (err) {
          console.error("Erro no checkout Pix:", err);
          await interaction.reply({ content: "❌ Erro ao gerar checkout Pix.", flags: 64 });
        }
      }
      return;
    }

    // Handler do botão Cancelar Pedido
    if (interaction.isButton() && interaction.customId === 'cancelar_pedido') {
      const rowConfirmacao = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('confirmar_cancelamento')
          .setLabel('Confirmar Cancelamento')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('manter_compra')
          .setLabel('Manter Compra')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({ 
        embeds: [
          new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle("⚠️ Confirmar Cancelamento")
            .setDescription("Tem certeza que deseja cancelar a compra? Ao confirmar, o ticket será movido para finalizados e você não terá mais acesso.")
        ],
        components: [rowConfirmacao],
        flags: 64
      });
      return;
    }

    // Handler dos botões de confirmação de cancelamento
    if (interaction.isButton()) {
      if (interaction.customId === 'confirmar_cancelamento') {
        await interaction.reply({ content: "❌ Compra cancelada. O ticket foi movido para finalizados.", flags: 64 });
        await interaction.channel.setParent(categoryFinalizados, { lockPermissions: false });
        await interaction.channel.permissionOverwrites.set([
          { id: interaction.guild.id, deny: ['ViewChannel'] },
          { id: roleVendasId, allow: ['ViewChannel', 'SendMessages'] }
        ]);
      }

      if (interaction.customId === 'manter_compra') {
        await interaction.reply({ content: "✅ Compra mantida. Continue o processo normalmente.", flags: 64 });
      }
    }
  }
};
