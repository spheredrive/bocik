const { SlashCommandBuilder } = require("discord.js");

const DEFAULT_INFO = "This is official nekohappi bot for support and help with happi spark studio :)";
// You can override by setting process.env.INFO_TEXT in Railway Variables

module.exports = {
  // Slash command metadata
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Wyświetla informacje o NekoHappi i o autorze bota"),

  // Prefix command name for loader
  name: "info",
  description: "Wyświetla informacje o NekoHappi i o autorze bota",

  // Execute for slash interactions
  async execute(interactionOrClient, maybeMessageOrArgs, maybeArgs) {
    // Support both interaction and message usage
    const infoText = process.env.INFO_TEXT || DEFAULT_INFO;

    // If called as interaction
    if (interactionOrClient && typeof interactionOrClient.reply === "function" && interactionOrClient.isChatInputCommand && interactionOrClient.isChatInputCommand()) {
      await interactionOrClient.reply({ content: `**NekoHappi info**\n\n${infoText}`, ephemeral: false });
      return;
    }

    // If called as message command: signature (client, message, args)
    const message = maybeMessageOrArgs;
    if (message && message.reply) {
      await message.reply(`**NekoHappi info**\n\n${infoText}`);
      return;
    }

    // Fallback: if called differently, try to log
    console.warn("info command called with unexpected parameters");
  }
};
