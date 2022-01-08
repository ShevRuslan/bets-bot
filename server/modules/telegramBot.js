const TelegramBot = require("node-telegram-bot-api");
module.exports = class {
  BOT = null;
  id = null;
  constructor({ token, id }) {
    this.BOT = new TelegramBot(token, { polling: false });
    this.id = id;
  }
  sendMessage(text) {
    this.BOT.sendMessage(this.id, text);
    this.count++;
  }
};
