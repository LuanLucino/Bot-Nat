const { SlashCommandBuilder } = require('discord.js');

const produtos = {
  1: { nome: "Camiseta básica", preco: 49.90 },
  2: { nome: "Jaqueta jeans", preco: 159.90 },
  3: { nome: "Bolsa de couro", preco: 199.90 },
  4: { nome: "Boné estilizado", preco: 79.90 }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pedido')
    .setDescription('Registrar um novo pedido de roupa ou acessório')
    .addStringOption(option =>
      option.setName('produto')
        .setDescription('Digite o número do produto (ex: 1 para Camiseta)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('genero')
        .setDescription('Escolha o gênero: masculino ou feminino')
        .setRequired(true)),
  async execute(interaction) {
    const produtoInput = interaction.options.getString('produto');
    const genero = interaction.options.getString('genero');

    // Converter entrada em número
    const produtoId = parseInt(produtoInput, 10);
    const produto = produtos[produtoId];

    if (!produto) {
      return interaction.reply({
        content: "❌ Produto inválido! Digite um número válido (1 a 4).",
        ephemeral: true
      });
    }

    // Calcular total (nesse caso só 1 item, mas pode evoluir para lista)
    const total = produto.preco;

    // Confirmação para o cliente
    await interaction.reply({
      content: `🛒 **Pedido Registrado!**\n\nProduto: ${produto.nome}\nPreço: R$${produto.preco.toFixed(2)}\nGênero: ${genero}\n\n💰 **Total: R$${total.toFixed(2)}**\n\nA Nat entrará em contato para confirmar o pedido.`,
      ephemeral: true
    });

    // Enviar para canal privado de administração
    const adminChannelId = process.env.ADMIN_CHANNEL_ID;
    try {
      const adminChannel = await interaction.client.channels.fetch(adminChannelId);
      if (adminChannel) {
        await adminChannel.send(
          `📦 **Novo Pedido**\n👤 Cliente: ${interaction.user.tag}\n👕 Produto: ${produto.nome}\n💰 Preço: R$${produto.preco.toFixed(2)}\n⚧ Gênero: ${genero}\n💵 Total: R$${total.toFixed(2)}`
        );
      }
    } catch (error) {
      console.error("Erro ao enviar para canal de administração:", error);
    }
  },
};
