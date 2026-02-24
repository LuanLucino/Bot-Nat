const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  // Ignorar o comando /pedido
  if (file === 'orders.js') {
    console.log(`⏩ Ignorando ${file} (comando /pedido removido)`);
    continue;
  }

  const command = require(`./commands/${file}`);
  if (!command.data) {
    console.error(`⚠️ O arquivo ${file} não exporta 'data'. Verifique se está no formato correto.`);
    continue;
  }
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`🔄 Registrando ${commands.length} comandos...`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log('✅ Comandos registrados com sucesso!');
  } catch (error) {
    console.error(error);
  }
})();
