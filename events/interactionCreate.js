const { 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ChannelType 
} = require('discord.js');

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

    // Botão "Comprar" → cria ticket
    if (interaction.isButton() && interaction.customId === 'comprar_produto') {
      try {
        const guild = interaction.guild;
        const categoryId = "1476324901253025844"; // Categoria Carrinhos

        const channel = await guild.channels.create({
          name: `${interaction.user.username}-compra`,
          type: ChannelType.GuildText,
          parent: categoryId
          // Sem permissionOverwrites → usa configuração padrão da categoria
        });

        const embed = new EmbedBuilder()
          .setColor(0x2ecc71)
          .setTitle("🛒 Ticket de Compra")
          .setDescription("Selecione abaixo a forma de pagamento para continuar sua compra.");

        const rowPagamento = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('forma_pagamento')
            .setPlaceholder('Selecione a forma de pagamento')
            .addOptions([
              { label: 'Cartão', value: 'cartao' },
              { label: 'Pix', value: 'pix' },
              { label: 'Cancelar Pedido', value: 'cancelar' }
            ])
        );

        await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [rowPagamento] });
        await interaction.reply({ content: "✅ Ticket de compra criado!", ephemeral: true });
      } catch (error) {
        console.error("Erro ao criar ticket:", error);
        await interaction.reply({ content: "❌ Não foi possível criar o ticket.", ephemeral: true });
      }
      return;
    }

    // Handler do Select Menu de pagamento
    if (interaction.isStringSelectMenu() && interaction.customId === 'forma_pagamento') {
      const escolha = interaction.values[0];

      if (escolha === 'cartao') {
        await interaction.reply({ content: "💳 Checkout gerado para pagamento com cartão.", ephemeral: true });
        // Aqui você pode integrar com API de checkout e gerar link
      }

      if (escolha === 'pix') {
        await interaction.reply({ content: "🔑 Instruções de pagamento via Pix serão enviadas.", ephemeral: true });
        // Aqui você pode integrar com API de Pix
      }

      if (escolha === 'cancelar') {
        const rowConfirmacao = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('confirmar_cancelamento')
            .setLabel('Confirmar Cancelamento')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('manter_compra')
            .setLabel('Manter Compra')
            .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ 
          embeds: [
            new EmbedBuilder()
              .setColor(0xE74C3C)
              .setTitle("⚠️ Confirmar Cancelamento")
              .setDescription("Tem certeza que deseja cancelar a compra? Ao confirmar, o ticket será fechado.")
          ],
          components: [rowConfirmacao],
          ephemeral: true
        });
      }
      return;
    }

    // Handler dos botões de confirmação de cancelamento
    if (interaction.isButton()) {
      if (interaction.customId === 'confirmar_cancelamento') {
        await interaction.reply({ content: "❌ Compra cancelada. O ticket será fechado.", ephemeral: true });
        await interaction.channel.delete().catch(err => console.error("Erro ao deletar canal:", err));
      }

      if (interaction.customId === 'manter_compra') {
        await interaction.reply({ content: "✅ Compra mantida. Continue o processo normalmente.", ephemeral: true });
      }
    }
  }
};
