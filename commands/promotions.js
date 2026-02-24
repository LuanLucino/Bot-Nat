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
    .setName('promocoes')
    .setDescription('Exibe as promoções atuais'),

  async execute(interaction) {
    const produtos = carregarProdutos();
    const promocoes = carregarPromocoes();

    const itensPromocao = Object.entries(promocoes).map(([id, promo]) => {
      const produto = produtos[id];
      if (!produto) return null;
      return `${id}. ${produto.nome} ~~R$${produto.preco.toFixed(2)}~~ ➝ **R$${promo.preco_promocional.toFixed(2)}** 🔖`;
    }).filter(Boolean);

    if (itensPromocao.length === 0) {
      const semPromoEmbed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("❌ Nenhuma promoção ativa")
        .setDescription("No momento não há promoções disponíveis.");

      return interaction.reply({ embeds: [semPromoEmbed], ephemeral: true });
    }

    const promoEmbed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("🔥 Promoções Ativas")
      .setDescription("Aproveite os descontos especiais!")
      .addFields({ name: "Itens em promoção", value: itensPromocao.join('\n') })
      .setFooter({ text: "Use /pedido para aproveitar as promoções." });

    await interaction.reply({ embeds: [promoEmbed], ephemeral: true });
  }
};
