const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const express = require('express');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Carregar todos os comandos da pasta ./commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

// Carregar todos os eventos da pasta ./events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Inicializa o bot
client.login(process.env.TOKEN);

// ----------------------
// Servidor Express
// ----------------------
const app = express();
app.use(express.json());

// Endpoint para receber notificações do PagBank
app.post('/pagbank-webhook', (req, res) => {
  console.log("Notificação recebida:", req.body);

  // Aqui você pode verificar o status do pagamento
  // Exemplo: se status === "PAID", mover o ticket para finalizados
  // Você terá que implementar a lógica de buscar o canal e atualizar permissões

  res.sendStatus(200);
});

// Railway vai expor essa porta automaticamente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook PagBank rodando na porta ${PORT}`);
});
