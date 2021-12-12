const { default: axios } = require("axios");

module.exports = class {
  parse = async () => {
    try {
      const response = await axios({
        url: "https://1xstavka.ru/LiveFeed/Get1x2_VZip?sports=1&count=1000&antisports=188&mode=4&country=1&partner=51&getEmpty=true&noFilterBlockEvent=true",
        method: "GET",
      });
      const matches = response.data.Value;
      if (matches != null) {
        for await (let match of matches) {
          this.firstAlgorithm(match);
          this.secondAlgorithm(match);
          this.thirdAlgorithm(match);
          // const firstTeam = match["O1"];
          // const secondTeam = match["O2"];
          // const champ = match["L"];
          // const time = +(match["SC"]["TS"] / 60).toFixed(2);
          // const pointFirst = match["SC"]["FS"]["S1"] ?? 0;
          // const pointSecond = match["SC"]["FS"]["S2"] ?? 0;
          // if (match["E"][1] != undefined) {
          //   const coef = match["E"][1]["C"];
          //   console.log(`${champ} | ${firstTeam} - ${secondTeam} (${time}) | ${pointFirst} : ${pointSecond}  ${coef}`);
          // }
        }
      }
    } catch (err) {}
    this.parse();
  };
  firstAlgorithm = (match) => {
    const firstTeam = match["O1"];
    const secondTeam = match["O2"];
    const champ = match["L"];
    const time = (match["SC"]["TS"] / 60).toFixed(2);
    if (+time >= 70 && +time <= 71) {
      const pointFirst = match["SC"]["FS"]["S1"] ?? 0;
      const pointSecond = match["SC"]["FS"]["S2"] ?? 0;
      if (pointFirst == pointSecond) {
        if (match["E"][1] != undefined) {
          const coef = match["E"][1]["C"];
          console.log(
            `1 АЛГОРИТМ ${champ} | ${firstTeam} - ${secondTeam} (${time}) | ${pointFirst} : ${pointSecond}  ${coef}`
          );
        }
      }
    }
  };
  secondAlgorithm = async (match) => {
    const firstTeam = match["O1"];
    const secondTeam = match["O2"];
    const champ = match["L"];
    const time = (match["SC"]["TS"] / 60).toFixed(2);
    if (+time >= 70 && +time <= 71) {
      const pointFirst = match["SC"]["FS"]["S1"] ?? 0;
      const pointSecond = match["SC"]["FS"]["S2"] ?? 0;
      let coef = await this.getStatsMatch(match["I"]);
      console.log(
        `2 АЛГОРИТМ ${champ} | ${firstTeam} - ${secondTeam} (${time}) | ${pointFirst} : ${pointSecond}  ${coef}`
      );
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
                  console.log(
                    `3 АЛГОРИТМ ${champ} | ${firstTeam} - ${secondTeam} (${time}) | ${pointFirst} : ${pointSecond}  ${coef}`
                  );
                  break;
                }
              }
            }
          }
        }
      });
    } catch (err) {}
  };
  getStatsMatch = async (id) => {
    let coefs;
    const response = await axios({
      url: `https://1xstavka.ru/LiveFeed/GetGameZip?id=${id}&lng=ru&cfview=0&isSubGames=true&GroupEvents=true&allEventsGroupSubGames=true&countevents=250&partner=51&grMode=2&marketType=1`,
      method: "GET",
    });
    const stats = response.data.Value["GE"];
    stats.forEach((stat) => {
      if (stat["G"] == "11") {
        coefs = stat["E"][2][0]["C"];
      }
    });
    return coefs;
  };
};
