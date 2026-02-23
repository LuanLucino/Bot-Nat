const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

// Carregar promoções do arquivo JSON
const promocoes = JSON.parse(fs.readFileSync('./inventory/promotions.json', 'utf8'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('promocoes')
    .setDescription('Mostra as promoções e descontos atuais'),
  async execute(interaction) {
    let lista = [];

    for (const id in promocoes) {
      const item = promocoes[id];
      lista.push(`${id}. ${item.nome} — de R$${item.preco_original.toFixed(2)} por **R$${item.preco_promocional.toFixed(2)}**`);
    }

    await interaction.reply({
      content: `💸 **Promoções Atuais**\n\n${lista.join('\n')}\n\nAproveite enquanto durar o estoque!`,
      ephemeral: false
    });
  },
};
