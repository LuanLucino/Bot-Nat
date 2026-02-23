const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ajuda')
    .setDescription('Mostra os comandos disponíveis'),
  async execute(interaction) {
    await interaction.reply({
      content: "📖 **Ajuda do Tielinha**\n\n`/catalogo` → Mostra o catálogo\n`/promocoes` → Exibe promoções\n`/pedido` → Registrar um pedido\n`/ajuda` → Exibe esta lista",
      ephemeral: true
    });
  },
};
