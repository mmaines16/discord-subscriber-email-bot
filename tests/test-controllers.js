const fs = require('fs');

const MarketHeroController = require('../controllers/MarketHeroController');
const config = JSON.parse(fs.readFileSync('./config.json'));

const lead = {
    "email": "test@test.com",
    "username": "testiclies",
    "firstName": "Test",
    "lastName": "One"
};

let usernameTag = `${config.server.memberTagPrefix}-${lead.username}`;

//console.log("apiKey: ", config.email_list.api_key);

MarketHeroController.TagLead(lead, [config.email_list.tag, usernameTag], config.email_list.api_key)
.then(function(response) {
    if(response.status != 200)
        console.log(`MarketHero could not tag lead: response.status = ${response.status}`);
})
.catch(function(err) {
    console.log(err)
});

setTimeout(function() {
    MarketHeroController.RemoveTag(lead, [config.email_list.tag, usernameTag], config.email_list.api_key)
    .then(function(response) {
        if(response.status != 200)
            console.log(`MarketHero could not tag lead: response.status = ${response.status}`);
    })
    .catch(function(err) {
        //console.log(err)
    });

}, 15000)

