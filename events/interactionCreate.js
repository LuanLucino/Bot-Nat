const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  once: false, // esse evento acontece várias vezes, não apenas uma
  async execute(interaction, client) {
    // Handler do botão "Comprar"
    if (interaction.isButton() && interaction.customId === 'comprar_produto') {
      const modal = new ModalBuilder()
        .setCustomId('modal_comprar_produto')
        .setTitle('🛒 Finalizar Compra');

      // Campo Nome
      const nomeInput = new TextInputBuilder()
        .setCustomId('nome_cliente')
        .setLabel('Seu nome completo')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      // Campo Quantidade
      const qtdInput = new TextInputBuilder()
        .setCustomId('quantidade')
        .setLabel('Quantidade desejada')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      // Campo Observações
      const obsInput = new TextInputBuilder()
        .setCustomId('observacoes')
        .setLabel('Observações (ex: tamanho, cor)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nomeInput),
        new ActionRowBuilder().addComponents(qtdInput),
        new ActionRowBuilder().addComponents(obsInput)
      );

      await interaction.showModal(modal);
    }

    // Handler do modal enviado
    if (interaction.isModalSubmit() && interaction.customId === 'modal_comprar_produto') {
      const nomeCliente = interaction.fields.getTextInputValue('nome_cliente');
      const quantidade = interaction.fields.getTextInputValue('quantidade');
      const observacoes = interaction.fields.getTextInputValue('observacoes');

      const confirmEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("✅ Pedido registrado")
        .setDescription("Seu pedido foi enviado com sucesso!")
        .addFields(
          { name: "Nome", value: nomeCliente, inline: true },
          { name: "Quantidade", value: quantidade, inline: true },
          { name: "Observações", value: observacoes || "Nenhuma", inline: false }
        )
        .setFooter({ text: "Um administrador entrará em contato para confirmar." });

      await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });

      // Opcional: enviar para canal de administração
      const adminChannelId = "1475643173005955235";
      try {
        const adminChannel = await client.channels.fetch(adminChannelId);
        if (adminChannel) {
          const adminEmbed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle("📦 Novo Pedido via anúncio")
            .addFields(
              { name: "Cliente", value: interaction.user.tag, inline: false },
              { name: "Nome", value: nomeCliente, inline: true },
              { name: "Quantidade", value: quantidade, inline: true },
              { name: "Observações", value: observacoes || "Nenhuma", inline: false }
            )
            .setTimestamp();

          await adminChannel.send({ embeds: [adminEmbed] });
        }
      } catch (error) {
        console.error("Erro ao enviar pedido para canal de administração:", error);
      }
    }
  }
};
