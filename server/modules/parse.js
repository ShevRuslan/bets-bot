const axios = require("axios-https-proxy-fix");
const path = require("path");
const fs = require("fs");
const TelegramBot = require("../modules/telegramBot");
module.exports = class {
  proxy = [];
  currentProxy = 0;
  telegramBotMessages = {};
  telegramBot;
  timeoutCheck = false;
  isParse = true;
  lastTimeUpdate = 0;
  constructor() {
    this.proxy = this.getProxy();
    this.telegramBot = this.initTelegramBot();
  }
  initTelegramBot = () => {
    const pathToConfig = path.join("server", "public", "Bot.txt");
    const file = fs.readFileSync(pathToConfig, "utf8");
    const content = file.toString();
    const _config = content.split("^");
    return new TelegramBot({
      token: _config[0],
      id: _config[1].replace(/(\r\n|\n|\r)/gm, ""),
    });
  };
  getLastTimeUpdate = async (request, response) => {
    response.status(200).json({ lastTimeUpdate: this.lastTimeUpdate });
  };
  startParse = async (request, response) => {
    this.isParse = true;
    this.timeoutCheck = setTimeout(() => {
      this.parse();
    }, 0);
    response.status(200).json({ status: "success" });
  };
  stopParse = async (request, response) => {
    clearTimeout(this.timeoutCheck);
    this.isParse = false;
    this.currentProxy = 0;
    response.status(200).json({ status: "success" });
  };
  parse = async () => {
    clearTimeout(this.timeoutCheck);
    try {
      this.lastTimeUpdate = Date.now();
      const response = await axios({
        url: "https://1xstavka.ru/LiveFeed/Get1x2_VZip?sports=1&count=1000&antisports=188&mode=4&country=1&partner=51&getEmpty=true&noFilterBlockEvent=true",
        method: "GET",
        proxy: {
          host: this.proxy[this.currentProxy].ip,
          port: this.proxy[this.currentProxy].port,
          auth: {
            username: this.proxy[this.currentProxy].login,
            password: this.proxy[this.currentProxy].password,
          },
        },
      });
      const matches = response.data.Value;
      console.log(matches.length);
      if (matches != null) {
        for await (let match of matches) {
          this.firstAlgorithm(match);
          this.secondAlgorithm(match);
          this.thirdAlgorithm(match);
          this.fourthAlgorithm(match);
        }
      }
    } catch (err) {
      console.log(err);
    }
    this.currentProxy++;
    if (this.currentProxy <= this.proxy.length) this.currentProxy = 0;
    if (this.isParse) {
      this.timeoutCheck = setTimeout(() => {
        this.parse();
      }, 0);
    }
  };
  firstAlgorithm = (match) => {
    let id = match["I"];
    const firstTeam = match["O1"];
    const secondTeam = match["O2"];
    const champ = match["L"];
    const time = (match["SC"]["TS"] / 60).toFixed(2);
    if (+time >= 70 && +time <= 71) {
      const pointFirst = match["SC"]["FS"]["S1"] ?? 0;
      const pointSecond = match["SC"]["FS"]["S2"] ?? 0;
      if (pointFirst == pointSecond) {
        if (match["E"][1] != undefined) {
          const coef = +match["E"][1]["C"];
          if (coef >= 2.6) {
            console.log(
              `1 АЛГОРИТМ ${champ} | ${firstTeam} - ${secondTeam} (${time}) | ${pointFirst} : ${pointSecond}  ${coef}`
            );
            if (!this.telegramBotMessages[id]) {
              const textMessage = `${champ}\n${firstTeam} - ${secondTeam}\nВремя: 70 минута\nСчёт: ${pointFirst} : ${pointSecond}\nРынок: ничья\nКоэфициент: ${coef}`;
              this.telegramBot.sendMessage(textMessage);
              this.telegramBotMessages[id] = {};
            }
          } else console.log(`1 АЛГОРИТМ ${firstTeam} - ${secondTeam} ${coef}`);
        }
      }
    }
  };
  secondAlgorithm = async (match) => {
    let id = match["I"];
    const firstTeam = match["O1"];
    const secondTeam = match["O2"];
    const champ = match["L"];
    const time = (match["SC"]["TS"] / 60).toFixed(2);
    if (+time >= 70 && +time <= 71) {
      const pointFirst = match["SC"]["FS"]["S1"] ?? 0;
      const pointSecond = match["SC"]["FS"]["S2"] ?? 0;
      let coef = await this.getStatsMatch(match["I"]);
      if (+coef >= 3) {
        console.log(
          `2 АЛГОРИТМ ${champ} | ${firstTeam} - ${secondTeam} (${time}) | ${pointFirst} : ${pointSecond}  ${coef}`
        );
        if (!this.telegramBotMessages[id]) {
          const textMessage = `${champ}\n${firstTeam} - ${secondTeam}\nВремя: 70 минута\nСчёт: ${pointFirst} : ${pointSecond}\nРынок: не будет следующего гола\nКоэфициент: ${coef}`;
          this.telegramBot.sendMessage(textMessage);
          this.telegramBotMessages[id] = {};
        }
      } else console.log(`2 АЛГОРИТМ  ${firstTeam} - ${secondTeam} ${coef}`);
    }
  };
  thirdAlgorithm = async (match) => {
    let id = match["I"];
    const firstTeam = match["O1"];
    const secondTeam = match["O2"];
    const champ = match["L"];
    const time = (match["SC"]["TS"] / 60).toFixed(2);
    try {
      const response = await axios({
        url: `https://1xstavka.ru/LiveFeed/GetGameZip?id=${id}&lng=ru&cfview=0&isSubGames=true&GroupEvents=true&allEventsGroupSubGames=true&countevents=250&partner=51&grMode=2&marketType=1`,
        method: "GET",
        proxy: {
          host: this.proxy[this.currentProxy].ip,
          port: this.proxy[this.currentProxy].port,
          auth: {
            username: this.proxy[this.currentProxy].login,
            password: this.proxy[this.currentProxy].password,
          },
        },
      });
      const stats = response.data.Value["GE"];
      stats.forEach((stat) => {
        if (stat["G"] == "1007") {
          const totalM = stat["E"][1];
          for (let total of totalM) {
            if (+total["P"] >= 3.25 && +total["P"] <= 5.25) {
              if (+total["C"] >= 1.8) {
                if (+time >= 20 && +time <= 21) {
                  const pointFirst = match["SC"]["FS"]["S1"] ?? 0;
                  const pointSecond = match["SC"]["FS"]["S2"] ?? 0;
                  let coef = +total["C"];
                  if (pointFirst == 0 && pointSecond == 0) {
                    console.log(
                      `3 АЛГОРИТМ ${champ} | ${firstTeam} - ${secondTeam} (${time}) | ${pointFirst} : ${pointSecond}  ${coef}`
                    );
                    if (!this.telegramBotMessages[id]) {
                      const textMessage = `${champ}\n${firstTeam} - ${secondTeam}\nВремя: 20 минута\nСчёт: ${pointFirst} : ${pointSecond}\nРынок: азиатский тотал ( тотал меньше указаных значений)\nКоэфициент: ${coef}`;
                      this.telegramBot.sendMessage(textMessage);
                      this.telegramBotMessages[id] = {};
                    }
                    break;
                  } else {
                    console.log(
                      `3 АЛГОРИТМ ${firstTeam} - ${secondTeam} ${pointFirst}:${pointSecond} ${coef}`
                    );
                  }
                }
              }
            }
          }
        }
      });
    } catch (err) {}
  };
  fourthAlgorithm = async (match) => {
    let type = match["SC"]["CPS"];
    let id = match["I"];
    if (type == "Перерыв") {
      const firstTeam = match["O1"];
      const secondTeam = match["O2"];
      try {
        const response = await axios({
          url: `https://1xstavka.ru/LiveFeed/GetGameZip?id=${id}&lng=ru&cfview=0&isSubGames=true&GroupEvents=true&allEventsGroupSubGames=true&countevents=250&partner=51&grMode=2&marketType=1`,
          method: "GET",
          proxy: {
            host: this.proxy[this.currentProxy].ip,
            port: this.proxy[this.currentProxy].port,
            auth: {
              username: this.proxy[this.currentProxy].login,
              password: this.proxy[this.currentProxy].password,
            },
          },
        });
        const stats = response.data.Value["GE"];
        stats.forEach((stat) => {
          if (stat["G"] == "1007") {
            const totalM = stat["E"][1];
            for (let total of totalM) {
              if (+total["P"] >= 2 && +total["P"] <= 3.5) {
                console.log;
                if (+total["C"] >= 1.8) {
                  const pointFirst = match["SC"]["FS"]["S1"] ?? 0;
                  const pointSecond = match["SC"]["FS"]["S2"] ?? 0;
                  let coef = +total["C"];
                  if (pointFirst == 0 && pointSecond == 0) {
                    console.log(
                      `4 АЛГОРИТМ ${champ} | ${firstTeam} - ${secondTeam} (${time}) | ${pointFirst} : ${pointSecond}  ${coef}`
                    );
                    if (!this.telegramBotMessages[id]) {
                      const textMessage = `${champ}\n${firstTeam} - ${secondTeam}\nВремя: перерыв после первого тайма\nСчёт: ${pointFirst} : ${pointSecond}\nРынок: азиатский тотал ( тотал меньше указаных значений)\nКоэфициент: ${coef}`;
                      this.telegramBot.sendMessage(textMessage);
                      this.telegramBotMessages[id] = {};
                    }
                    break;
                  } else {
                    console.log(
                      `4 АЛГОРИТМ ${firstTeam} - ${secondTeam} ${pointFirst} : ${pointSecond} ${coef}`
                    );
                  }
                }
              }
            }
          }
        });
      } catch (err) {}
    }
  };
  getStatsMatch = async (id) => {
    let coefs;
    const response = await axios({
      url: `https://1xstavka.ru/LiveFeed/GetGameZip?id=${id}&lng=ru&cfview=0&isSubGames=true&GroupEvents=true&allEventsGroupSubGames=true&countevents=250&partner=51&grMode=2&marketType=1`,
      method: "GET",
      proxy: {
        host: this.proxy[this.currentProxy].ip,
        port: this.proxy[this.currentProxy].port,
        auth: {
          username: this.proxy[this.currentProxy].login,
          password: this.proxy[this.currentProxy].password,
        },
      },
    });
    const stats = response.data.Value["GE"];
    stats.forEach((stat) => {
      if (stat["G"] == "11") {
        coefs = stat["E"][2][0]["C"];
      }
    });
    return coefs;
  };
  getProxy = () => {
    const pathToProxy = path.join("server", "public", "Proxy.txt");
    const contents = [];
    const file = fs.readFileSync(pathToProxy, "utf8");
    let content = file.toString();
    let arrayStickrs = content.split("\n");
    arrayStickrs.map((weapon) => {
      let arrayParams = weapon.split(":");
      let proxy = {
        ip: arrayParams[0],
        port: arrayParams[1],
        login: arrayParams[2],
        password: arrayParams[3].replace(/(\r\n|\n|\r)/gm, ""),
      };
      contents.push(proxy);
    });
    return contents;
  };
  makeDate(date) {
    let convertDate = new Date(Date.now());
    let year = convertDate.getFullYear();
    let month = convertDate.getMonth() + 1;
    let day = convertDate.getDate();
    let hours = convertDate.getHours();
    let minutes = convertDate.getMinutes();
    let seconds = convertDate.getSeconds();
    if (date < 10) date = "0" + date;
    if (month < 10) month = "0" + month;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
  }
};
