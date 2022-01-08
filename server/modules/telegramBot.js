const TelegramBot = require("node-telegram-bot-api");
module.exports = class {
  BOT = null;
  id = null;
  constructor() {
    this.BOT = new TelegramBot(
      "5032195209:AAHGogMGSgwPrL00lgwvVkqcHTIGC2w3a5M",
      { polling: false }
    );
    this.id = 722760924;
  }
  sendMessage(text) {
    this.BOT.sendMessage(this.id, text);
    this.count++;
  }
};
