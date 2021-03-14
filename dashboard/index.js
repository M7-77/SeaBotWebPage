

const url = require("url");
const path = require("path");

const Discord = require("discord.js");

const express = require("express");
const app = express();
const moment = require("moment");
require("moment-duration-format");

const passport = require("passport");
const session = require("express-session");
const LevelStore = require("level-session-store")(session);
const Strategy = require("passport-discord").Strategy;
const helmet = require("helmet");

const md = require("marked"); 
// 
module.exports = (client , config , db) => {

  const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`);

  const templateDir = path.resolve(`${dataDir}${path.sep}templates`);

  app.use("/templates", express.static(path.resolve(`${dataDir}${path.sep}templates/css-js`))); 
  app.use(express.static(`${templateDir}`));

  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  passport.use(new Strategy({
    clientID: client.user.id,
    clientSecret: client.config.DISCORD_OATUH2,
    callbackURL: "https://" + client.config.DASHBOARD_DOMAIN + "/auth",
    scope: ["identify", "guilds" , "guilds.join"]
  },
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
  }));

  
  app.use(session({
    secret: client.config.DASHBOARD_SECRET,
    resave: false,
    saveUninitialized: false,
  }));

  // Initializes passport and session.
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(helmet());

  // The domain name used in various endpoints to link between pages.
  app.locals.domain = client.config.DASHBOARD_DOMAIN;
  
  // The EJS templating engine gives us more power to create complex web pages. 
  // This lets us have a separate header, footer, and "blocks" we can use in our pages.
  app.engine("html", require("ejs").renderFile);
  app.set("view engine", "html");

  // body-parser reads incoming JSON or FORM data and simplifies their
  // use in code.
  var bodyParser = require("body-parser");
  app.use(bodyParser.json());       // to support JSON-encoded bodies
  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  })); 

  /* 
  Authentication Checks. For each page where the user should be logged in, double-checks
  whether the login is valid and the session is still active.
  */
  function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
  }



  const renderTemplate = (res, req, template, data = {}) => {
    const baseData = {
      bot: client,
      path: req.path,
      user: req.isAuthenticated() ? req.user : null,
      DISCORD: require("discord.js")
    };
    res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
  };





  app.get("/login", (req, res, next) => {
    if (req.session.backURL) {
      req.session.backURL = req.session.backURL;
    } else if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname === app.locals.domain) {
        req.session.backURL = parsed.path;
      }
    } else {
      req.session.backURL = "/";
    }
    next();
  },
  passport.authenticate("discord"));


app.get("/" , (req , res , next) =>{

    renderTemplate(res, req, "index.ejs");
});


app.get("/dashboard" , (req , res , next) =>{
if(req.user){
    renderTemplate(res, req, "servers.ejs");
}else{res.redirect("login")}
})

  app.get("/auth", passport.authenticate("discord", { failureRedirect: "/autherror" }), (req, res) => {
    if (client.config.DEVS.includes(req.user.id)) {
      req.session.isAdmin = true;
    } else {
      req.session.isAdmin = false;
    }
    if (req.session.backURL) {
      const url = req.session.backURL;
      req.session.backURL = null;
      res.redirect(url);
    } else {
      res.redirect("/");
    }
  });
  

  app.get("/autherror", (req, res) => {
    renderTemplate(res, req, "autherror.ejs");
  });





  // Destroys the session to log out the user.
  app.get("/logout", function(req, res) {
    req.session.destroy(() => {
      req.logout();
      res.redirect("/"); 
    });
  });


  app.get("/dashboard/:guildID", checkAuth, (req, res) => {
    if(req.user){
let isAdmin = false
let guild = client.guilds.cache.get(req.params.guildID)
if(!guild) return res.json({status:false , message: "The guild not found"}) 
let member = guild.members.cache.get(req.user.id)
if(config.DEVS.includes(req.user.id)){ isAdmin = true }
if(!isAdmin){
if(!member ) return res.json({status:false , message: "you don't found on the guild"}) 
if(!member.permissions.has("MANAGE_GUILD") && !isAdmin) return res.json({status:false , message: "you don't have enough permissions"}) 
}
    renderTemplate(res, req, "manage-server.ejs" , {"settings": {prefix: "!"} , guildID: req.params.guildID});
}else{res.redirect("login")}
  });

app.post('/api/settings/:guildID', function (req, res) {
console.log(req.body)
})

app.get('/api/settings/:guildID', function (req, res) {
res.json({prefix:"!"})
})

app.get("/api/join-support", (req , res) =>{
let guild = client.guilds.cache.get(config.Bot_SupportServer_ID)
if(!guild){
return res.json({status:false , message:"the guild is not found"})
}
if(req.user) {
let able1 = true
client.users.fetch(req.user.id).catch(err =>{
able1 = err
}).then(user =>{
if(able1 !== true) return res.json({status:false , message:able1.message})
if(guild.member(user)) return res.json({status:false , message:"You're already on the server"})
let able2 = true
guild.addMember(user , {accessToken: req.user.accessToken}).catch(err=>{
able1 = err
}).then(user =>{
if(able2 !== true) return res.json({status:false , message:able1.message})
res.json({status:true , message:"Your are now in " + guild.name + " !" })
})
})
} else {
return res.json({status:false , message:"Not connected with the discord"})
}
});

app.listen(client.config.DASHBOARD_PORT || 3000);
}