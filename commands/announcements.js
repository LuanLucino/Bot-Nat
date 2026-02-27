const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('anunciar')
    .setDescription('Anunciar um produto no canal de anúncios (apenas administradores)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('nome')
        .setDescription('Nome do produto')
        .setRequired(true)
    )
    .addNumberOption(option =>
      option.setName('preco')
        .setDescription('Preço do produto')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('imagens')
        .setDescription('Links das imagens separados por espaço')
        .setRequired(true)
    ),

  async execute(interaction) {
    const nome = interaction.options.getString('nome');
    const preco = interaction.options.getNumber('preco');
    const imagensInput = interaction.options.getString('imagens');

    // Transformar em array de links
    const imagens = imagensInput.split(' ').filter(url => url.trim() !== "");

    // Embed do produto (usa a primeira imagem como destaque)
    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle(nome)
      .setDescription(`Preço: R$${preco.toFixed(2)}`)
      .setImage(imagens.length > 0 ? imagens[0] : null)
      .setFooter({ text: "Clique em comprar para registrar seu interesse." });

    // Botão de compra
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('comprar_produto')
          .setLabel('🛒 Comprar')
          .setStyle(ButtonStyle.Primary)
      );

    // Canal fixo de anúncios
    const anuncioChannelId = "1475652551050526883";
    try {
      const anuncioChannel = await interaction.client.channels.fetch(anuncioChannelId);
      if (anuncioChannel) {
        await anuncioChannel.send({ embeds: [embed], components: [row], files: imagens });
        await interaction.reply({ content: "✅ Produto anunciado com sucesso!", ephemeral: true });
      }
    } catch (error) {
      console.error("Erro ao enviar anúncio:", error);
      await interaction.reply({ content: "❌ Não foi possível anunciar o produto.", ephemeral: true });
    }
  }
};
