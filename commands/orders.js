const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('orders')
    .setDescription('Register a new clothing or accessory order')
    .addStringOption(option =>
      option.setName('product')
        .setDescription('Product name')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('size')
        .setDescription('Size (if applicable)')
        .setRequired(false)),
  async execute(interaction) {
    const product = interaction.options.getString('product');
    const size = interaction.options.getString('size') || 'N/A';

    // Confirmação para o cliente
    await interaction.reply({
      content: `🛒 **Order Registered!**\n\nProduct: ${product}\nSize: ${size}\n\nA Nat entrará em contato para confirmar o pedido.`,
      ephemeral: true
    });

    // Enviar para canal privado de administração
    const adminChannelId = process.env.ADMIN_CHANNEL_ID; // Defina no .env
    const adminChannel = interaction.client.channels.cache.get(adminChannelId);

    if (adminChannel) {
      adminChannel.send(
        `📦 **Novo Pedido**\nCliente: ${interaction.user.tag}\nProduto: ${product}\nTamanho: ${size}`
      );
    } else {
      console.error("Canal de administração não encontrado!");
    }
  },
};
