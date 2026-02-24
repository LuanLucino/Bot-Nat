const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const produtosPath = './resources/products.json';
let produtos = JSON.parse(fs.readFileSync(produtosPath, 'utf8'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setpreco')
    .setDescription('Alterar o preço normal de um produto (apenas administradores)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('produto')
        .setDescription('Selecione o produto pelo ID')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addNumberOption(option =>
      option.setName('preco')
        .setDescription('Novo preço do produto')
        .setRequired(true)
    ),

  async execute(interaction) {
    // Canal permitido para executar o comando
    const canalPermitido = "1475643173005955235";
    if (interaction.channelId !== canalPermitido) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("❌ Canal inválido")
            .setDescription("Este comando só pode ser usado no canal de administração de preços.")
        ],
        ephemeral: true
      });
    }

    const produtoId = interaction.options.getString('produto');
    const novoPreco = interaction.options.getNumber('preco');

    if (!produtos[produtoId]) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("❌ Produto inválido")
            .setDescription("O ID informado não corresponde a nenhum produto.")
        ],
        ephemeral: true
      });
    }

    const antigoPreco = produtos[produtoId].preco;
    produtos[produtoId].preco = novoPreco;
    fs.writeFileSync(produtosPath, JSON.stringify(produtos, null, 2));
    // Recarregar produtos para refletir alteração
    produtos = JSON.parse(fs.readFileSync(produtosPath, 'utf8'));

    const confirmEmbed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle("✅ Preço atualizado")
      .setDescription(`O produto **${produtos[produtoId].nome}** teve seu preço alterado.`)
      .addFields(
        { name: "Preço antigo", value: `R$${antigoPreco.toFixed(2)}`, inline: true },
        { name: "Novo preço", value: `R$${novoPreco.toFixed(2)}`, inline: true }
      );

    await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });

    // Canal de administração para log
    const adminChannelId = process.env.ADMIN_CHANNEL_ID;
    try {
      const adminChannel = await interaction.client.channels.fetch(adminChannelId);
      if (adminChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor(0x3498db)
          .setTitle("📢 Preço atualizado")
          .setDescription(`O produto **${produtos[produtoId].nome}** teve seu preço alterado.`)
          .addFields(
            { name: "Preço antigo", value: `R$${antigoPreco.toFixed(2)}`, inline: true },
            { name: "Novo preço", value: `R$${novoPreco.toFixed(2)}`, inline: true }
          )
          .setTimestamp();

        await adminChannel.send({ embeds: [logEmbed] });
      }
    } catch (error) {
      console.error("Erro ao enviar para canal de administração:", error);
    }

    // Canal de promoções para notificação pública
    const promoChannelId = "1475641664914591946";
    try {
      const promoChannel = await interaction.client.channels.fetch(promoChannelId);
      if (promoChannel) {
        const promoEmbed = new EmbedBuilder()
          .setColor(0x2980b9)
          .setTitle("🔄 Preço atualizado")
          .setDescription(`O produto **${produtos[produtoId].nome}** teve seu preço alterado.`)
          .addFields(
            { name: "Preço antigo", value: `R$${antigoPreco.toFixed(2)}`, inline: true },
            { name: "Novo preço", value: `R$${novoPreco.toFixed(2)}`, inline: true }
          )
          .setTimestamp();

        await promoChannel.send({ embeds: [promoEmbed] });
      }
    } catch (error) {
      console.error("Erro ao enviar para canal de promoções:", error);
    }
  },

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = Object.entries(produtos).map(([id, produto]) => ({
      name: `${id}. ${produto.nome} - R$${produto.preco.toFixed(2)}`,
      value: id
    }));

    const filtered = focusedValue
      ? choices.filter(choice =>
          choice.name.toLowerCase().includes(focusedValue.toLowerCase())
        )
      : choices;

    await interaction.respond(filtered.slice(0, 25));
  }
};
