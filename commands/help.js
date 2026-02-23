const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows available commands and how to use them'),
  async execute(interaction) {
    await interaction.reply({
      content: "📖 **Tielinha Help**\n\nAqui estão os comandos disponíveis:\n\n`/catalog` → Mostra o catálogo de roupas e acessórios\n`/promotions` → Exibe promoções e descontos atuais\n`/orders` → Registrar um pedido\n`/help` → Exibe esta lista de ajuda\n\nMais funções serão adicionadas em breve!",
      ephemeral: true
    });
  },
};
