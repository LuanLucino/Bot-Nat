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

    // Confirmação para o cliente (apenas visível para quem fez o pedido)
    await interaction.reply({
      content: `🛒 **Pedido Registrado!**\n\nProduto: ${produto}\nTamanho: ${tamanho}\n\nA Nat entrará em contato para confirmar o pedido.`,
      ephemeral: true
    });

    // Enviar para canal privado de administração
    const adminChannelId = process.env.ADMIN_CHANNEL_ID;

    try {
      const adminChannel = await interaction.client.channels.fetch(adminChannelId);

      if (adminChannel) {
        await adminChannel.send(
          `📦 **Novo Pedido Recebido**\n👤 Cliente: ${interaction.user.tag}\n👕 Produto: ${produto}\n📏 Tamanho: ${tamanho}`
        );
      } else {
        console.error("❌ Canal de administração não encontrado. Verifique o ADMIN_CHANNEL_ID no .env");
      }
    } catch (error) {
      console.error("❌ Erro ao enviar pedido para o canal de administração:", error);
    }
  },
};
