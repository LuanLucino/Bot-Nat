const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    // Handler para autocomplete
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command || !command.autocomplete) return;

      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error("Erro no autocomplete:", error);
      }
      return;
    }

    // Handler para comandos normais
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
      }
      return;
    }

    // Handler do botão "Comprar" → mostra Select Menu
    if (interaction.isButton() && interaction.customId === 'comprar_produto') {
      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_modelo')
          .setPlaceholder('Selecione o modelo')
          .addOptions([
            { label: 'Masculino', value: 'masculino' },
            { label: 'Feminino', value: 'feminino' },
            { label: 'Ambos', value: 'ambos' }
          ])
      );

      await interaction.reply({ content: 'Escolha o modelo:', components: [row], ephemeral: true });
      return;
    }

    // Handler do Select Menu → abre modal
    if (interaction.isStringSelectMenu() && interaction.customId === 'select_modelo') {
      const modelo = interaction.values[0];

      const modal = new ModalBuilder()
        .setCustomId(`modal_comprar_produto_${modelo}`)
        .setTitle('🛒 Finalizar Compra');

      const nomeInput = new TextInputBuilder()
        .setCustomId('nome_cliente')
        .setLabel('Seu nome completo')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const obsInput = new TextInputBuilder()
        .setCustomId('observacoes')
        .setLabel('Observações (ex: tamanho, cor)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nomeInput),
        new ActionRowBuilder().addComponents(obsInput)
      );

      await interaction.showModal(modal);
      return;
    }

    // Handler do modal enviado
    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_comprar_produto_')) {
      const modelo = interaction.customId.replace('modal_comprar_produto_', '');
      const nomeCliente = interaction.fields.getTextInputValue('nome_cliente');
      const observacoes = interaction.fields.getTextInputValue('observacoes');

      const confirmEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("✅ Pedido registrado")
        .setDescription("Seu pedido foi enviado com sucesso!")
        .addFields(
          { name: "Nome", value: nomeCliente, inline: true },
          { name: "Modelo", value: modelo, inline: true },
          { name: "Observações", value: observacoes || "Nenhuma", inline: false }
        )
        .setFooter({ text: "Um administrador entrará em contato para confirmar." });

      await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });

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
              { name: "Modelo", value: modelo, inline: true },
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
