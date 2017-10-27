const fs = require('fs');

const ActiveCampaignController = require('../controllers/ActiveCampaignController');
const config = JSON.parse(fs.readFileSync('./config.json'));

const lead = {
    "email": "mmaines@cisco.com",
    "username": "mmaines-cisco",
    "firstName": "Mason",
    "lastName": "Cisco"
};

let usernameTag = `${config.server.memberTagPrefix}-${lead.username}`;

console.log("apiKey: ", config.email_list.api_key);

ActiveCampaignController.CreateAndTagLead(lead, [ config.email_list.tag, usernameTag ], config.email_list.api_key)
.then(function(response) {
    console.log(response);
    if(response.status != 200 && config.email_list.provider == 'market_hero')
        console.log(`${config.email_list.provider} could not tag lead: response.status = ${response.status}`);
})
.catch(function(err) {
    console.log(err)
});

setTimeout(function() {
    ActiveCampaignController.RemoveTag(lead, [config.email_list.tag], config.email_list.api_key)
    .then(function(response) {
        if(response.status != 200 && config.email_list.provider == 'market_hero')
            console.log(`MarketHero could not tag lead: response.status = ${response.status}`);
    })
    .catch(function(err) {
        console.log(err)
    });
    
    ActiveCampaignController.GetLead(lead, config.email_list.api_key).then(function(response) {
        console.log(response);
    })
    .catch(function(err) {
        console.log(err);
    });
    
    setTimeout(function() {
        ActiveCampaignController.TagLead(lead, [config.email_list.tag], config.email_list.api_key)
        .then(function(response) {
            if(response.status != 200 && config.email_list.provider == 'market_hero')
                console.log(`MarketHero could not tag lead: response.status = ${response.status}`);
        })
        .catch(function(err) {
            console.log(err)
        });
        
        ActiveCampaignController.GetLead(lead, config.email_list.api_key).then(function(response) {
            console.log(response);
        })
        .catch(function(err) {
            console.log(err);
        });

        ActiveCampaignController.GetLeadByTag(usernameTag, config.email_list.api_key)
        .then(function(response) {
            console.log(response);
            if(response.status != 200 && config.email_list.provider == 'market_hero')
                console.log(`${config.email_list.provider} could not tag lead: response.status = ${response.status}`);
        })
        .catch(function(err) {
            console.log(err)
        });

    }, 10000);

}, 15000);

