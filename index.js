const config = require("./config.js")
const Discord = require("discord.js")


const MongoDB = require("./MongoDBSimpleClient/index.js")
const db = new MongoDB(config.MongoDB_CONNECT , "bot")

let bot = new Discord.Client();

bot.login(config.DISCORD_TOKEN)

bot.config = config

bot.db = db

bot.on("ready", () =>{
console.log("ready with " + bot.user.username)
const discord_client = require("./DiscordClient/index.js")
discord_client(bot , config, db)

const dashboard = require("./dashboard/index.js")
dashboard(bot , config , db)
})
