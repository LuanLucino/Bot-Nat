const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ajuda')
    .setDescription('Mostra os comandos disponíveis'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle("📖 Ajuda — Tielinha")
      .addFields(
        {
          name: "Comandos gerais",
          value: "`/catalogo` → Exibe o catálogo de produtos\n`/promocoes` → Exibe as promoções ativas\n`/ajuda` → Exibe esta lista"
        },
        {
          name: "Comandos de administração",
          value: "`/anunciar` → Anunciar um produto com imagem\n`/setpromocao` → Adicionar ou remover promoções\n`/setpreco` → Alterar o preço de um produto"
        }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
