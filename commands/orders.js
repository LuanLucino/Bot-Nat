const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pedido') // comando em português
    .setDescription('Registrar um novo pedido de roupa ou acessório')
    .addStringOption(option =>
      option.setName('produto')
        .setDescription('Nome do produto')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('tamanho')
        .setDescription('Tamanho (se aplicável)')
        .setRequired(false)),
  async execute(interaction) {
    const produto = interaction.options.getString('produto');
    const tamanho = interaction.options.getString('tamanho') || 'N/A';

    // Confirmação para o cliente
    await interaction.reply({
      content: `🛒 **Pedido Registrado!**\n\nProduto: ${produto}\nTamanho: ${tamanho}\n\nA Nat entrará em contato para confirmar o pedido.`,
      ephemeral: true
    });

    // Enviar para canal privado de administração
    const adminChannelId = process.env.ADMIN_CHANNEL_ID;
    const adminChannel = await interaction.client.channels.fetch(adminChannelId);

    if (adminChannel) {
      adminChannel.send(
        `📦 **Novo Pedido**\nCliente: ${interaction.user.tag}\nProduto: ${produto}\nTamanho: ${tamanho}`
      );
    } else {
      console.error("Canal de administração não encontrado!");
    }
  },
};
