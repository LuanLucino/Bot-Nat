const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

function carregarProdutos() {
  return JSON.parse(fs.readFileSync('./resources/products.json', 'utf8'));
}

function carregarPromocoes() {
  return JSON.parse(fs.readFileSync('./resources/promotions.json', 'utf8'));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('catalogo')
    .setDescription('Exibe o catálogo de produtos disponíveis'),

  async execute(interaction) {
    const produtos = carregarProdutos();
    const promocoes = carregarPromocoes();

    const itens = Object.entries(produtos).map(([id, produto]) => {
      const promo = promocoes[id];
      if (promo) {
        return `${id}. ${produto.nome} ~~R$${produto.preco.toFixed(2)}~~ ➝ **R$${promo.preco_promocional.toFixed(2)}** 🔖`;
      }
      return `${id}. ${produto.nome} - R$${produto.preco.toFixed(2)}`;
    });

    const catalogoEmbed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle("📖 Catálogo de Produtos")
      .setDescription("Confira os itens disponíveis para pedido:")
      .addFields({ name: "Produtos", value: itens.join('\n') })
      .setFooter({ text: "Use /pedido para registrar seu pedido." });

    await interaction.reply({ embeds: [catalogoEmbed], ephemeral: true });
  }
};
