const Discord = require("discord.js");
const client = new Discord.Client();
const RichEmbed = Discord.RichEmbed;
const fetch = require("node-fetch");
const _ = require("lodash");
const Table = require("easy-table");
const emoji = require("node-emoji");
const moment = require("moment-timezone");

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const SESSION_COOKIE = process.env.SESSION_COOKIE;

function getLeaderboard() {
  return new Promise((resolve, reject) => {
    fetch(
      "https://adventofcode.com/2018/leaderboard/private/view/194157.json",
      {
        method: "GET",
        headers: {
          cookie: SESSION_COOKIE
        }
      }
    ).then(res => {
      res.text().then(text => {
        const result = JSON.parse(text);
        resolve(result);
      });
    });
  });
}

function renderLeaderboard(results) {
  const members = _.reverse(
    _.sortBy(results.members, member => member.local_score)
  );
  var maxDays = moment.tz("EST").date();
  const data = _.map(members, member => {
    return {
      name: member.name,
      score: member.local_score,
      stars: _.mapValues(member.completion_day_level, day => _.size(day))
    };
  });

  const t = new Table();

  data.forEach(row => {
    t.cell("Name", row.name);
    t.cell("Score", row.score);
    var stars = "";
    for (var i = 1; i <= maxDays; ++i) {
      if (row.stars[i]) {
        if (row.stars[i] === 0) stars += emoji.get("poop");
        if (row.stars[i] === 1) stars += emoji.get("star");
        if (row.stars[i] === 2) stars += emoji.get("star2");
      } else {
        stars += emoji.get("poop");
      }
    }
    t.cell("Days", stars);
    t.newRow();
  });
  const message =
    "```css\n[Advent of Code leaderboard]\n" + t.toString + "\n```";
  return message;
}

client.on("ready", () => {
  console.log("Bot is ready.");
});

client.on("message", message => {
  if (message.content === "aoc") {
    getLeaderboard().then(results => {
      message.channel.send(renderLeaderboard(results));
    });
  }
});

client.login(DISCORD_TOKEN);
