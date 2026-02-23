const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('promotions')
    .setDescription('Shows current promotions and discounts'),
  async execute(interaction) {
    await interaction.reply({
      content: "💸 **Current Promotions**\n\n1. Camiseta básica — de R$49,90 por **R$39,90**\n2. Jaqueta jeans — de R$159,90 por **R$129,90**\n3. Bolsa de couro — de R$199,90 por **R$169,90**\n\nAproveite enquanto durar o estoque!",
      ephemeral: false
    });
  },
};
