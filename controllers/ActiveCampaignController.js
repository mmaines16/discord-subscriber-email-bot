const Promise = require('promise');
const request = require('request');
const ActiveCampaign = require('activecampaign');
const apiURL = require('../config.json').email_list.api_url;

// ============ Helper Functions ================
const formatTags = function(tags) {
    let tagString = "";
    
    tags.forEach(function(tag) {
        if(!tagString == "") {
            tagString = tagString + `, ${tag}`; 
        }
        else {
            tagString = tagString + `${tag}`;  
        }  
    });
    
    // Debug: 
    // console.log(tagString);
    
    return tagString;
}

// ============ Controller Functions ===============
exports.CreateAndTagLead = function(lead, tags, apiKey) {
    return new Promise(function(resolve, reject) {
        const ac = new ActiveCampaign(apiURL, apiKey);
        
        ac.credentials_test().then(function(result) {
            if(result.success) {
                // Valid Account 

                // Create and Tag Lead
                const contact = {
                    email: lead.email,
                    first_name: lead.firstName,
                    last_name: lead.lastName,
                    tags: formatTags(tags),
                    "p[1]": 1
                };
                
                const contact_add = ac.api("contact/add", contact);
                contact_add.then(function(result) {
                    // Contact Created, Tagged, and Added to List
                    resolve(result);
                }, function(result) {
                    // Error
                    console.log("Error Creating and Tagging New Lead")
                    console.log(result.data);
                });
                
                
            }
            else {
                // Invalid Account
                reject(new Error("Invalid Active Campaign Account Credentials"));
            }
        });  
    });
}

exports.TagLead = function(lead, tags, apiKey) {
    return new Promise(function(resolve, reject) {
        const ac = new ActiveCampaign(apiURL, apiKey);
        
        ac.credentials_test().then(function(result) {
            if(result.success) {
                // Valid Account 

                // Create and Tag Lead
                let contact = {
                    email: lead.email,
                    tags: formatTags(tags),
                };
                
                const contact_add = ac.api("contact/tag/add", contact);
                contact_add.then(function(result) {
                    // Contact Created, Tagged, and Added to List
                    resolve(result);
                }, function(result) {
                    // Error
                    console.log("Error Creating and Tagging New Lead")
                    console.log(result.data);
                });
                
                
            }
            else {
                // Invalid Account
                reject(new Error("Invalid Active Campaign Account Credentials"));
            }
        });  
    });
};

exports.RemoveTag = function(lead, tags, apiKey) {
return new Promise(function(resolve, reject) {
        const ac = new ActiveCampaign(apiURL, apiKey);
        
        ac.credentials_test().then(function(result) {
            if(result.success) {
                // Valid Account 
                
                // Remove Tag From Contact
                let contact = {
                    email: lead.email,
                    tags: formatTags(tags),
                };
                
                const contact_remove_tag = ac.api("contact/tag/remove", contact);
                contact_remove_tag.then(function(result) {
                    // Tags Removed from Contact
                    resolve(result);
                }, function(result) {
                    // Error
                    console.log("Error Removing Tags From Lead")
                    console.log(result.data);
                });
            }
            else {
                // Invalid Account
                reject(new Error("Invalid Active Campaign Account Credentials"));
            }
        });  
    });
};

exports.isLeadInList = function(lead, apiKey) {
    const ac = new ActiveCampaign(apiURL, apiKey);
    
    const contact_exists = ac.api(`contact/view?email=${lead.email}`, {});
    contact_exists.then(function(result) {
        // Contact Exists
        return true;
    }, function(result) {
        // Contact Not Found
        return false;
    });
}

exports.GetLead = function(lead, apiKey) {
    return new Promise(function(resolve, reject) {
        const ac = new ActiveCampaign(apiURL, apiKey);
        
        ac.credentials_test().then(function(result) {
            if(result.success) {
                // Valid Account 
                
                // Get Contact From Email List
                
                const contact_exists = ac.api(`contact/view?email=${lead.email}`, {});
                contact_exists.then(function(result) {
                    // Contact Exists
                    return resolve(result);
                }, function(result) {
                    // Contact Not Found
                    return reject(result);
                });
                
                
            }
            else {
                // Invalid Account
                reject(new Error("Invalid Active Campaign Account Credentials"));
            }
        }); 
    });
}

exports.GetLeadByTag = function(tag, apiKey) {
    return new Promise(function(resolve, reject) {
        const ac = new ActiveCampaign(apiURL, apiKey);
        
        ac.credentials_test().then(function(result) {
            if(result.success) {
                // Valid Account 
                
                // Get Contact From Email List
                
                const contact_exists = ac.api(`contact/list`, {"filters[tagname]": tag});
                contact_exists.then(function(result) {
                    
                    if(result.result_code == 1) {
                        // Contact Exists
                        return resolve(result['0']);
                    }
                    
                    // Contact Not Found
                    return reject(result);    
                    
                }, function(result) {
                    // Contact Not Found
                    return reject(result);
                });
                
                
            }
            else {
                // Invalid Account
                reject(new Error("Invalid Active Campaign Account Credentials"));
            }
        }); 
    });
}