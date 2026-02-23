const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('catalogo') // comando em português
    .setDescription('Mostra o catálogo de roupas e acessórios disponíveis'),
  async execute(interaction) {
    await interaction.reply({
      content: "👕 **Catálogo Nat**\n\n1. Camiseta básica - R$49,90\n2. Jaqueta jeans - R$159,90\n3. Bolsa de couro - R$199,90\n4. Boné estilizado - R$79,90",
      ephemeral: false
    });
  },
};
