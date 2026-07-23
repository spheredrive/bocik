const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // optional for guild-only registration

if (!token || !clientId) {
  console.error("Ustaw TOKEN i CLIENT_ID w zmiennych środowiskowych.");
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, "commands");
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"))) {
  const cmd = require(path.join(commandsPath, file));
  if (cmd.data) commands.push(cmd.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("Rejestruję komendy...");
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log("Komendy zarejestrowane dla guild:", guildId);
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log("Globalne komendy zarejestrowane (może potrwać do godziny).");
    }
  } catch (err) {
    console.error("Błąd rejestracji komend:", err);
  }
})();
