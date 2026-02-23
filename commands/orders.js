const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const produtos = JSON.parse(fs.readFileSync('./resources/products.json', 'utf8'));
const promocoes = JSON.parse(fs.readFileSync('./resources/promotions.json', 'utf8'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pedido')
    .setDescription('Registrar um novo pedido de roupas ou acessórios')
    .addStringOption(option =>
      option.setName('modelo')
        .setDescription('Escolha o modelo')
        .setRequired(true)
        .addChoices(
          { name: 'Masculino', value: 'masculino' },
          { name: 'Feminino', value: 'feminino' }
        )
    )
    .addStringOption(option =>
      option.setName('produtos')
        .setDescription('Selecione os produtos desejados')
        .setRequired(true)
        .setAutocomplete(true)),

  async execute(interaction) {
    const produtosInput = interaction.options.getString('produtos');
    const modelo = interaction.options.getString('modelo');
    const ids = produtosInput.split(',').map(id => id.trim());

    let itens = [];
    let total = 0;

    for (const id of ids) {
      const produto = produtos[id];
      if (produto) {
        const promocao = promocoes[id];
        const preco = promocao ? promocao.preco_promocional : produto.preco;
        itens.push(`${id}. ${produto.nome} - R$${preco.toFixed(2)}${promocao ? " 🔖 Promoção" : ""}`);
        total += preco;
      }
    }

    if (itens.length === 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("❌ Pedido inválido")
            .setDescription("Nenhum produto válido encontrado! Verifique os números disponíveis no catálogo.")
        ],
        ephemeral: true
      });
    }

    const pedidoEmbed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle("🛒 Pedido Registrado")
      .setDescription("Seu pedido foi registrado com sucesso!")
      .addFields(
        { name: "Itens", value: itens.join('\n'), inline: false },
        { name: "Modelo", value: modelo, inline: true },
        { name: "Total", value: `R$${total.toFixed(2)}`, inline: true }
      )
      .setFooter({ text: "A Nat entrará em contato para confirmar o pedido." });

    await interaction.reply({ embeds: [pedidoEmbed], ephemeral: true });

    // Enviar para canal privado de administração
    const adminChannelId = process.env.ADMIN_CHANNEL_ID;
    try {
      const adminChannel = await interaction.client.channels.fetch(adminChannelId);
      if (adminChannel) {
        const adminEmbed = new EmbedBuilder()
          .setColor(0xFFD700)
          .setTitle("📦 Novo Pedido")
          .addFields(
            { name: "Cliente", value: interaction.user.tag, inline: false },
            { name: "Itens", value: itens.join('\n'), inline: false },
            { name: "Modelo", value: modelo, inline: true },
            { name: "Total", value: `R$${total.toFixed(2)}`, inline: true }
          )
          .setTimestamp();

        await adminChannel.send({ embeds: [adminEmbed] });
      }
    } catch (error) {
      console.error("Erro ao enviar para canal de administração:", error);
    }
  },

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = Object.entries(produtos).map(([id, produto]) => ({
      name: `${id}. ${produto.nome} - R$${produto.preco.toFixed(2)}`,
      value: id
    }));

    const filtered = focusedValue
      ? choices.filter(choice =>
          choice.name.toLowerCase().includes(focusedValue.toLowerCase())
        )
      : choices;

    await interaction.respond(filtered.slice(0, 25));
  }
};
