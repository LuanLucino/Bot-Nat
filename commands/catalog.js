const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('catalog')
    .setDescription('Shows the clothing and accessories catalog'),
  async execute(interaction) {
    await interaction.reply({
      content: "👕 **Nat Catalog**\n\n1. Basic T-shirt - R$49,90\n2. Denim Jacket - R$159,90\n3. Leather Bag - R$199,90\n4. Stylish Cap - R$79,90",
      ephemeral: false
    });
  },
};
