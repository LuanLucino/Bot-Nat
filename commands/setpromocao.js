const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const produtos = JSON.parse(fs.readFileSync('./resources/products.json', 'utf8'));
const promocoesPath = './resources/promotions.json';
let promocoes = JSON.parse(fs.readFileSync(promocoesPath, 'utf8'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setpromocao')
    .setDescription('Adicionar ou remover promoções (apenas administradores)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('acao')
        .setDescription('Escolha a ação')
        .setRequired(true)
        .addChoices(
          { name: 'Adicionar', value: 'adicionar' },
          { name: 'Remover', value: 'remover' }
        )
    )
    .addStringOption(option =>
      option.setName('produto')
        .setDescription('Selecione o produto pelo ID')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addNumberOption(option =>
      option.setName('preco')
        .setDescription('Preço promocional (necessário para adicionar)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const acao = interaction.options.getString('acao');
    const produtoId = interaction.options.getString('produto');
    const precoPromo = interaction.options.getNumber('preco');

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

    // Canal fixo de promoções
    const promoChannelId = "1475641664914591946";

    if (acao === 'adicionar') {
      if (!precoPromo) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xFF0000)
              .setTitle("❌ Preço ausente")
              .setDescription("Você precisa informar o preço promocional para adicionar.")
          ],
          ephemeral: true
        });
      }

      promocoes[produtoId] = { preco_promocional: precoPromo };
      fs.writeFileSync(promocoesPath, JSON.stringify(promocoes, null, 2));

      const confirmEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("✅ Promoção adicionada")
        .setDescription(`O produto **${produtos[produtoId].nome}** agora está em promoção por R$${precoPromo.toFixed(2)}.`);

      await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });

      // Enviar anúncio no canal de promoções
      try {
        const promoChannel = await interaction.client.channels.fetch(promoChannelId);
        if (promoChannel) {
          const promoEmbed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle("🔥 Nova Promoção!")
            .setDescription(`O produto **${produtos[produtoId].nome}** entrou em promoção!`)
            .addFields(
              { name: "Preço original", value: `R$${produtos[produtoId].preco.toFixed(2)}`, inline: true },
              { name: "Preço promocional", value: `R$${precoPromo.toFixed(2)}`, inline: true }
            )
            .setTimestamp();

          await promoChannel.send({ embeds: [promoEmbed] });
        }
      } catch (error) {
        console.error("Erro ao enviar para canal de promoções:", error);
      }
    }

    if (acao === 'remover') {
      if (!promocoes[produtoId]) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xFF0000)
              .setTitle("❌ Produto não está em promoção")
              .setDescription("Este produto não possui promoção ativa.")
          ],
          ephemeral: true
        });
      }

      delete promocoes[produtoId];
      fs.writeFileSync(promocoesPath, JSON.stringify(promocoes, null, 2));

      const confirmEmbed = new EmbedBuilder()
        .setColor(0xe67e22)
        .setTitle("🗑️ Promoção removida")
        .setDescription(`O produto **${produtos[produtoId].nome}** foi removido das promoções.`);

      await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });

      // Enviar anúncio no canal de promoções
      try {
        const promoChannel = await interaction.client.channels.fetch(promoChannelId);
        if (promoChannel) {
          const promoEmbed = new EmbedBuilder()
            .setColor(0xe67e22)
            .setTitle("📢 Promoção encerrada")
            .setDescription(`O produto **${produtos[produtoId].nome}** não está mais em promoção.`)
            .setTimestamp();

          await promoChannel.send({ embeds: [promoEmbed] });
        }
      } catch (error) {
        console.error("Erro ao enviar para canal de promoções:", error);
      }
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
