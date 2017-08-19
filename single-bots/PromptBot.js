const Discord = require('discord.js');
const Express = require('express');
const axios = require('axios');
const fs = require('fs');

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

// Discord Event Handlers
client.on('ready', () => {
  console.log('I am ready!');
});

// -------------- DEPRECIATED-----------------------
// USE ONLY FOR DEBUGGING
// client.on('guildMemberAdd', member => {
//     setTimeout(function() {
//         let guild = client.guilds.find("name", config.server.name);
//         let defaultChannel = guild.channels.find("name", config.server.defaultChannel);
//         let subscriberRole = guild.roles.find("name", "subscriber");
//         member.addRole(subscriberRole);
//         defaultChannel.send(`
//             Welcome to ${config.server.name}! Please use the !register command to unlock your membership. You will be asked to provide a valid
//             email address and some basic information. This is neccessary as it will allow me to provide you with the best
//             content and service as well as make you eligible for special perks (including alpha access to future programs)
//             I apologize for the inconvience, and thank you for you cooperation!
//         `, {reply: member});
//     }, 3000)
// });
// ---------------------------------------------------

client.on('guildMemberUpdate', (oldMember, newMember) => {

    console.log("guildMemberUpdate -> fired!");

    let guild = client.guilds.find("name", config.server.name);
    let defaultChannel = guild.channels.find("name", config.server.defaultChannel);
    let subscriberRole = guild.roles.find("name", config.server.roles.basic_role);
    
    //if(newMember.roles.find("name", subscriberRole.name)) console.log("Role Added! -> ", subscriberRole.name);
    //if(!oldMember.roles.find("name", subscriberRole.name)) console.log("Old Member did not have role -> ", subscriberRole.name);
    

    if(newMember.roles.find("name", subscriberRole.name) && !oldMember.roles.find("name", subscriberRole.name)) {
        setTimeout(function() {
            defaultChannel.send(`
                Welcome to ${config.server.name}! Please use the !register command to unlock your membership. You will be asked to provide a valid
                email address and some basic information. This is neccessary as it will allow me to provide you with the best
                content and service as well as make you eligible for special perks (including alpha access to future programs)
                I apologize for the inconvience, and thank you for you cooperation!
            `, {reply: newMember});
        }, 3500);
    }
});

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
    case '!useradded':
        console.log(message.author.id);
        let subscriberRole = guild.roles.find("name", config.server.roles.basic_role);
        guild.fetchMember(message.author)
        .then(member=> {
            member.addRole(subscriberRole);
            
        }).catch(err => {
            console.log('subscriber role could not be applied');
            console.log(err);
            error = true;
        });

        if(error) break;
        
        message.reply(`
            Please use the !register command to unlock your membership. You will be asked to provide a valid
            email address and some basic information. This is neccessary as it will allow my to provide you with the best
            content and service as well as make you eligible for special perks (including alpha access to future programs)
            I apologize for the inconvience, and thank you for you cooperation!
        `);
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

            // Debug
            //console.log("NewLeads: ", leads);
            //console.log("Complete Lead: ", lead);

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
                message.reply("Welcome to Bot Test Server!");
            
            break;
        }
        break;
  }
});

server.listen(8000, function() {
    console.log('server running on port 8000');
});

client.login(config.bot.token);