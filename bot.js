'use strict';

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

// =============================== ROLE MANAGEMENT =========================================

client.on('guildMemberUpdate', (oldMember, newMember) => {
    
    //Database for resub and unsub lookup
    
    //If  old Member has sub already the add resub tag in markethero and ignore register
    
    // If old member has unsub then tag market hero as resub and pull info from database

    let guild = client.guilds.find("name", config.server.name);
    let defaultChannel = guild.channels.find("name", config.server.defaultChannel);
    let subscriberRole = guild.roles.find("name", config.server.roles.basic_role);
    let unsubscribeRole = guild.roles.find("name", config.server.unsubscribe_role);
    
    if(newMember.roles.find("name", subscriberRole.name) && !oldMember.roles.find("name", subscriberRole.name)) {
        
        setTimeout(function() {
            const registerUrl = process.env.NODE_ENV=DEVELOPMENT ? config.server.registerDEVURL : config.server.registerURL;
            
            defaultChannel.send(`
                Welcome to ${config.server.name}! Please go to the following url ${registerURL} or use the !register command to unlock your membership. 
                
                You will be asked to provide a valid email address and some basic information. This is neccessary as it will allow me to provide you with the best content and service as well as make you eligible for special perks (including alpha access to future programs)
                
                I apologize for the inconvience, and thank you for you cooperation!
            `, {reply: newMember});
        }, 3500);
    }
    else if(!newMember.roles.find("name", subscriberRole.name) && oldMember.roles.find("name", subscriberRole.name)) {
        
    }
});

// =============================== END ROLE MANAGEMENT =====================================


// ================================ PROMPT =================================================
client.on('message', message => {

  let error = false;
  let guild = client.guilds.find("name", config.server.name);


  switch (message.content) {
    case '!ping':
        message.reply('pong');
        break;
    case '!clear':
        message.channel.bulkDelete(99).then().catch();
        break;
    case '!register':
        // Create a new role with data
        message.reply('Please enter your email using => !email your@email.com');
        break;
    default:
        if(message.content.includes('!email') && !message.author.bot) {
            let commandArgs = message.content.split(' ');

            // ------------ COMMAND VALIDATION ---------------------
            let validation = CommandValidator.validateEmailCommand(commandArgs);

            if(validation.result === false) {
                message.reply(validation.error.message);
                break;
            }
            // ------------------------------------------------------

            let email = commandArgs[1];
            let username = message.author.username;

            let lead = {
                "email": email,
                "username": username,
                "firstName": "",
                "lastName": "",
            };

            leads.push(lead);

            message.reply('Please enter your name using => !name first last');
            
            break;
        }
        else if(message.content.includes('!name') && !message.author.bot) {
            
            let commandArgs = message.content.split(' ');
            const username = message.author.username;

            // ------------ COMMAND VALIDATION ---------------------
            let validation = CommandValidator.validateNameCommand(commandArgs);

            if(validation.result === false) {
                message.reply(validation.error.message);
                break;
            }
            // ------------------------------------------------------

            // Grab Lead from the list of leads in the registration process
            let newLeads = [];
            const lead = ListHelpers.findByPropertyName(leads, "username", username);

            // Filter Out the registered Lead from the list of leads in the registration process
            leads = ListHelpers.removeByPropName(leads, "username", username);

            lead.firstName = StringFormatter.toNameFormat(commandArgs[1]);
            lead.lastName = StringFormatter.toNameFormat(commandArgs[2]);

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

            let error = false;

            let subscriberRole = guild.roles.find("name", config.server.roles.verified_role);
            guild.fetchMember(message.author)
            .then(member=> {
                member.addRole(subscriberRole);
            }).catch(err => {
                console.log('subscriber role could not be applied');
                console.log(err);
                error = true;
            });


            // To-Do: Complete Reistration
            if(!error)
                message.reply("Your membership has been unlocked. Welcome to Bot Test Server!");
            
            break;
        }
        break;
  }
});

// ==================================== END PROMPT ===========================================

// ==================================== OAUTH2 Server ========================================

// Configure Passport and Discord Strategy
passport.use(new DiscordStrategy(
    {
        clientID: config.bot.client_id,
        clientSecret: config.bot.client_secret,
        callbackURL: process.env.NODE_ENV=DEVELOPMENT ? config.bot.dev_callback : config.bot.callback,
        scope: config.bot.scopes
    },
    function(accessToken, refreshToken, profile, cb) {
        //console.log("Token: ", accessToken);
        //console.log("Profile: ", profile);

        cb(null, profile);
    }
));


server.get('/', passport.authenticate('discord', {session: false}), function(req, res) {
    res.render('index2', {});
})

server.get('/test', passport.authenticate('discord', {session: false}), function(req, res) {
    res.render('index3', {});
});

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
            defaultChannel.send("Your membership has been unlocked. Welcome to Bot Test Server!", member);

            //Set Timeout -> Clear Chat
        }).catch(err => {
            console.log("User is not a member of the Guild");
        });
    }).catch(err => {
        console.log('subscriber role could not be applied');
        console.log(err);
    });

    res.redirect('/success');
});

//================================= END OAUTH2 SERVER =========================

// Discord Event Handlers
client.on('ready', () => {
  console.log('I am ready!');
});


server.listen(8000, function() {
    console.log('server running on port 8000');
});

client.login(config.bot.token);