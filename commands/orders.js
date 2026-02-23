const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

// Carregar produtos e promoções
const produtos = JSON.parse(fs.readFileSync('./resources/products.json', 'utf8'));
const promocoes = JSON.parse(fs.readFileSync('./resources/promotions.json', 'utf8'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pedido')
    .setDescription('Registrar um novo pedido de roupas ou acessórios')
    .addStringOption(option =>
      option.setName('modelo')
        .setDescription('Escolha o modelo')
        .setRequired(true)
        .addChoices(
          { name: 'Masculino', value: 'masculino' },
          { name: 'Feminino', value: 'feminino' }
        )
    )
    .addStringOption(option =>
      option.setName('produtos')
        .setDescription('Selecione os produtos desejados (digite o número ou nome)')
        .setRequired(true)
        .setAutocomplete(true)),

  async execute(interaction) {
    const produtosInput = interaction.options.getString('produtos');
    const modelo = interaction.options.getString('modelo');

    const ids = produtosInput.split(',').map(id => id.trim());

    let itens = [];
    let total = 0;

    for (const id of ids) {
      const produto = produtos[id];
      if (produto) {
        const promocao = promocoes[id];
        const preco = promocao ? promocao.preco_promocional : produto.preco;

        itens.push(`${id}. ${produto.nome} - R$${preco.toFixed(2)}${promocao ? " (em promoção)" : ""}`);
        total += preco;
      }
    }

    if (itens.length === 0) {
      return interaction.reply({
        content: "❌ Nenhum produto válido encontrado! Verifique os números disponíveis no catálogo.",
        ephemeral: true
      });
    }

    await interaction.reply({
      content: `🛒 **Pedido Registrado!**\n\n${itens.join('\n')}\n\n👕 Modelo: ${modelo}\n💰 **Total: R$${total.toFixed(2)}**\n\nA Nat entrará em contato para confirmar o pedido.`,
      ephemeral: true
    });

    const adminChannelId = process.env.ADMIN_CHANNEL_ID;
    try {
      const adminChannel = await interaction.client.channels.fetch(adminChannelId);
      if (adminChannel) {
        await adminChannel.send(
          `📦 **Novo Pedido**\n👤 Cliente: ${interaction.user.tag}\n${itens.join('\n')}\n👕 Modelo: ${modelo}\n💵 Total: R$${total.toFixed(2)}`
        );
      }
    } catch (error) {
      console.error("Erro ao enviar para canal de administração:", error);
    }
  },

  async autocomplete(interaction) {
  const focusedValue = interaction.options.getFocused();

  // Garantir que temos produtos carregados
  if (!produtos || Object.keys(produtos).length === 0) {
    return interaction.respond([]);
  }

  // Gerar lista de produtos a partir do JSON
  const choices = Object.entries(produtos).map(([id, produto]) => ({
    name: `${id}. ${produto.nome} - R$${produto.preco.toFixed(2)}`,
    value: id
  }));

  // Se o usuário não digitou nada, mostra todos
  let filtered = choices;
  if (focusedValue) {
    filtered = choices.filter(choice =>
      choice.name.toLowerCase().includes(focusedValue.toLowerCase())
    );
  }

  // Responder com até 25 opções
  await interaction.respond(filtered.slice(0, 25));
}

};
