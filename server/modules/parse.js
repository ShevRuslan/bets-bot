const { default: axios } = require("axios");

module.exports = class {
  parse = async () => {
    const response = await axios({
      url: "https://1xstavka.ru/LiveFeed/Get1x2_VZip?sports=1&count=1000&antisports=188&mode=4&country=1&partner=51&getEmpty=true&noFilterBlockEvent=true",
      method: "GET",
    });
    const matches = response.data.Value;
    console.log(matches.length);
    if (matches != null) {
      for await (let match of matches) {
        const firstTeam = match["O1"];
        const secondTeam = match["O2"];
        const champ = match["L"];
        const time = (match["SC"]["TS"] / 60).toFixed(2);
        const pointFirst = match["SC"]["FS"]["S1"] ?? 0;
        const pointSecond = match["SC"]["FS"]["S2"] ?? 0;
        if (match["E"][1] != undefined) {
          const coef = match["E"][1]["C"];
          console.log(`${champ} | ${firstTeam} - ${secondTeam} (${time}) | ${pointFirst} : ${pointSecond}  ${coef}`);
          await this.getStatsMatch(match["I"]);
        }
      }
    }
  };
  getStatsMatch = async (id) => {
    const response = await axios({
      url: `https://1xstavka.ru/LiveFeed/GetGameZip?id=${id}&lng=ru&cfview=0&isSubGames=true&GroupEvents=true&allEventsGroupSubGames=true&countevents=250&partner=51&grMode=2&marketType=1`,
      method: "GET",
    });
    const stats = response.data.Value["GE"];
    stats.forEach((stat) => {
      if (stat["G"] == "11") {
        stat["E"].forEach((arrayCoefs) => {
          console.log(arrayCoefs[0]["C"]);
        });
      }
    });
  };
};
