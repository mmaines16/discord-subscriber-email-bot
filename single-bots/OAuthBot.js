const Discord = require('discord.js');
const Express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Import Passport and Discord Strategy
const passport = require('passport');
var DiscordStrategy = require('passport-discord').Strategy;

// Import Server Dependencies
const hbs = require('express-handlebars');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Import Utils
const StringFormatter = require('./utils/StringFormatter');
const ListHelpers = require('./utils/ListHelpers');

// Import Validators
const CommandValidator = require('./validators/CommandValidator');

// Import Config
const config = JSON.parse(fs.readFileSync('./config.json'));

// Import Controlers
const MarketHeroController = require('./controllers/MarketHeroController');

//Set Default Variables and Constants
const tag = config.email_list.tag;
var leads = [];

// Initialize the Discord Client (websocket)
const client = new Discord.Client();

// Intialize the Express Server
const server = new Express();

// Configure Server
server.engine('.hbs', hbs({extname: '.hbs', layoutsDir: __dirname + '/views/layouts', defaultLayout: 'layout', partialsDir: __dirname + '/views/parials'}));
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', '.hbs');
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cookieParser());
server.use(Express.static(path.join(__dirname, 'public')));


// Configure Passport and Discord Strategy
passport.use(new DiscordStrategy(
    {
        clientID: config.bot.client_id,
        clientSecret: config.bot.client_secret,
        callbackURL: config.bot.callback,
        scope: config.bot.scopes
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log("Token: ", accessToken);
        console.log("Profile: ", profile);

        cb(null, profile);
    }
));


server.get('/test', passport.authenticate('discord', {session: false}), function(req, res) {
    res.render('index2', {});
})

server.get('/success', function(req, res) {
    res.render('index2');
});

server.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/failure', 
    session: false
}), function(req, res) {
    res.render('last-step', {user: req.user, serverName: config.server.name}); // Successful auth 
});

server.post('/tag-email', function(req, res) {
    let guild = client.guilds.find("name", config.server.name);
    let defaultChannel = guild.channels.find("name", config.server.defaultChannel);
    console.log(req.body);

    // Apply to email list
    let email = req.body.email.toLowerCase().trim();
    let firstName = StringFormatter.toNameFormat(req.body.firstName);
    let lastName = StringFormatter.toNameFormat(req.body.lastName);
    let username = req.body.username.trim();

    let lead = {
        "email": email,
        "username": username,
        "firstName": firstName,
        "lastName": lastName,
    };

    let usernameTag = `${config.server.memberTagPrefix}-${username}`;
    
    

    /* 
     * use api check if email is in list
     * if email not in list create it 
     * use api to tag email
    */
    MarketHeroController.TagLead(lead, [config.email_list.tag, usernameTag], config.email_list.api_key)
    .then(function(response) {
        if(response.status != 200)
            console.log(`MarketHero could not tag lead: response.status = ${response.status}`);
    })
    .catch(console.error);

    let subscriberRole = guild.roles.find("name", config.server.roles.verified_role);
    client.fetchUser(req.body.userId)
    .then(user=> {
        guild.fetchMember(user).then(member => {
            member.addRole(subscriberRole);
        }).catch(err => {
            console.log("User is not a member of the Guild");
        });
    }).catch(err => {
        console.log('subscriber role could not be applied');
        console.log(err);
    });

    res.redirect('/success');
});

// Discord Event Handlers
client.on('ready', () => {
  console.log('I am ready!');
});


server.listen(8000, function() {
    console.log('server running on port 8000');
});

client.login(config.bot.token);