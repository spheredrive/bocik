const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

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

// Global error handlers to log crashes instead of cichego zamknięcia
process.on("unhandledRejection", (err) => {
  console.error("UnhandledRejection:", err);
});
process.on("uncaughtException", (err) => {
  console.error("UncaughtException:", err);
});

// Presence i gotowy handler
client.on("ready", () => {
  console.log(`Bot zalogowany jako ${client.user.tag}`);

  client.user.setPresence({
    status: "online",
    activities: [
      { name: "Welcome To Happi Spark Studio", type: 3 } // 3 = Watching
    ]
  }).catch(console.error);
});



// Prosty handler komend
client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  const content = msg.content.trim();

  if (content === "!ping") {
    msg.reply("Pong!").catch(err => console.error("reply error:", err));
  }
});

// Bezpieczne logowanie
const token = process.env.TOKEN;
if (!token) {
  console.error("Brak TOKEN w zmiennych środowiskowych. Ustaw TOKEN w Railway Variables i zrestartuj serwis.");
} else {
  client.login(token).catch(err => {
    console.error("Błąd logowania bota:", err);
    // Nie wyrzucamy wyjątku — logujemy i pozwalamy platformie zrestartować proces jeśli trzeba
  });
}
