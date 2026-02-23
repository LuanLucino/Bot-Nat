const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

// Carregar produtos do arquivo JSON
const produtos = JSON.parse(fs.readFileSync('./resources/products.json', 'utf8'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pedido')
    .setDescription('Registrar um novo pedido de roupa ou acessório')
    .addStringOption(option =>
      option.setName('produtos')
        .setDescription('Digite os números dos produtos separados por vírgula (ex: 1,2)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('genero')
        .setDescription('Escolha o gênero: masculino ou feminino')
        .setRequired(true)),
  async execute(interaction) {
    const produtosInput = interaction.options.getString('produtos');
    const genero = interaction.options.getString('genero');

    // Transformar entrada em array de IDs
    const ids = produtosInput.split(',').map(id => id.trim());

    let itens = [];
    let total = 0;

    for (const id of ids) {
      const produto = produtos[id];
      if (produto) {
        itens.push(`${id}. ${produto.nome} - R$${produto.preco.toFixed(2)}`);
        total += produto.preco;
      }
    }

    if (itens.length === 0) {
      return interaction.reply({
        content: "❌ Nenhum produto válido encontrado! Verifique os números disponíveis no catálogo.",
        ephemeral: true
      });
    }

    // Confirmação para o cliente
    await interaction.reply({
      content: `🛒 **Pedido Registrado!**\n\n${itens.join('\n')}\n\n⚧ Gênero: ${genero}\n💰 **Total: R$${total.toFixed(2)}**\n\nA Nat entrará em contato para confirmar o pedido.`,
      ephemeral: true
    });

    // Enviar para canal privado de administração
    const adminChannelId = process.env.ADMIN_CHANNEL_ID;
    try {
      const adminChannel = await interaction.client.channels.fetch(adminChannelId);
      if (adminChannel) {
        await adminChannel.send(
          `📦 **Novo Pedido**\n👤 Cliente: ${interaction.user.tag}\n${itens.join('\n')}\n⚧ Gênero: ${genero}\n💵 Total: R$${total.toFixed(2)}`
        );
      }
    } catch (error) {
      console.error("Erro ao enviar para canal de administração:", error);
    }
  },
};
