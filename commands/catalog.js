const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

// Carregar produtos do arquivo JSON
const produtos = JSON.parse(fs.readFileSync('./inventory/products.json', 'utf8'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('catalogo')
    .setDescription('Mostra o catálogo de roupas e acessórios disponíveis'),
  async execute(interaction) {
    let lista = [];

    for (const id in produtos) {
      const produto = produtos[id];
      lista.push(`${id}. ${produto.nome} - R$${produto.preco.toFixed(2)}`);
    }

    await interaction.reply({
      content: `👕 **Catálogo Nat**\n\n${lista.join('\n')}`,
      ephemeral: false
    });
  },
};
