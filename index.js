// index.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot działa"));
app.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

// Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Command collection
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
  for (const file of commandFiles) {
    try {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      // Support both slash metadata (command.data) and prefix name (command.name)
      if (command.name) client.commands.set(command.name, command);
      if (command.data && command.data.name) client.commands.set(command.data.name, command);
      console.log(`Loaded command ${file}`);
    } catch (err) {
      console.error(`Failed to load command ${file}:`, err);
    }
  }
} else {
  console.warn("Folder commands/ nie istnieje. Utwórz go i dodaj pliki komend.");
}

// Global error handlers
process.on("unhandledRejection", (err) => {
  console.error("UnhandledRejection:", err);
});
process.on("uncaughtException", (err) => {
  console.error("UncaughtException:", err);
});

// Presence
client.on("ready", () => {
  console.log(`Bot zalogowany jako ${client.user.tag}`);

  client.user.setPresence({
    status: "online",
    activities: [
      { name: "Welcome To Happi Spark Studio", type: 3 } // 3 = Watching
    ]
  }).catch(console.error);
});

// Message prefix handler
const PREFIX = process.env.PREFIX || "!";

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    const content = message.content.trim();
    if (!content.startsWith(PREFIX)) return;

    const args = content.slice(PREFIX.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (!command) return;

    // If command expects (client, message, args)
    if (typeof command.execute === "function") {
      await command.execute(client, message, args);
    } else {
      message.reply("Ta komenda nie ma zdefiniowanej funkcji execute.").catch(console.error);
    }
  } catch (err) {
    console.error("Error handling message command:", err);
    try { await message.reply("Wystąpił błąd podczas wykonywania komendy."); } catch {}
  }
});

// Slash command interaction handler
client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      await interaction.reply({ content: "Nie znaleziono komendy.", ephemeral: true });
      return;
    }

    // If command.execute expects interaction
    await command.execute(interaction);
  } catch (err) {
    console.error("Error handling slash command:", err);
    if (interaction.replied || interaction.deferred) {
      try { await interaction.followUp({ content: "Błąd podczas wykonywania komendy.", ephemeral: true }); } catch {}
    } else {
      try { await interaction.reply({ content: "Błąd podczas wykonywania komendy.", ephemeral: true }); } catch {}
    }
  }
});

// Safe login
const token = process.env.TOKEN;
if (!token) {
  console.error("Brak TOKEN w zmiennych środowiskowych. Ustaw TOKEN w Railway Variables i zrestartuj serwis.");
  process.exit(1);
} else {
  client.login(token).catch(err => {
    console.error("Błąd logowania bota:", err);
  });
}
