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
        .setDescription('Imagem principal do produto (obrigatória)')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option.setName('imagem2')
        .setDescription('Imagem extra (opcional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const nome = interaction.options.getString('nome');
    const preco = interaction.options.getNumber('preco');
    const img1 = interaction.options.getAttachment('imagem1');
    const img2 = interaction.options.getAttachment('imagem2');

    // Embed principal (nome, preço e imagem1)
    const embedPrincipal = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle(nome)
      .setDescription(`Preço: R$${preco.toFixed(2)}`)
      .setImage(img1.url)
      .setFooter({ text: "Clique em comprar para registrar seu interesse." });

    // Embed extra (imagem2, se existir)
    const embedsExtras = [];
    if (img2) {
      embedsExtras.push(new EmbedBuilder().setImage(img2.url));
    }

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
        await anuncioChannel.send({ embeds: [embedPrincipal, ...embedsExtras], components: [row] });
        await interaction.reply({ content: "✅ Produto anunciado com sucesso!", ephemeral: true });
      }
    } catch (error) {
      console.error("Erro ao enviar anúncio:", error);
      await interaction.reply({ content: "❌ Não foi possível anunciar o produto.", ephemeral: true });
    }
  }
};
