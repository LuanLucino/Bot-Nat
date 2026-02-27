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
    .addAttachmentOption(option =>
      option.setName('imagem1')
        .setDescription('Imagem principal do produto')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option.setName('imagem2')
        .setDescription('Imagem extra (opcional)')
        .setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('imagem3')
        .setDescription('Outra imagem extra (opcional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const nome = interaction.options.getString('nome');
    const preco = interaction.options.getNumber('preco');

    // Pegar imagens
    const imagens = [];
    const img1 = interaction.options.getAttachment('imagem1');
    const img2 = interaction.options.getAttachment('imagem2');
    const img3 = interaction.options.getAttachment('imagem3');

    if (img1) imagens.push(img1.url);
    if (img2) imagens.push(img2.url);
    if (img3) imagens.push(img3.url);

    // Embed do produto (usa a primeira imagem como destaque)
    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle(nome)
      .setDescription(`Preço: R$${preco.toFixed(2)}`)
      .setImage(img1.url) // destaque
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
