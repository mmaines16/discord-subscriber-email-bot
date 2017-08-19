const Promise = require('promise');
const request = require('request');
const axios = require('axios');

exports.TagLead = function(lead, tags, apiKey) {
    return new Promise(function(resolve, reject) {

        const axiosConfig = {
            data: {
                "apiKey": apiKey,
                "firstName": lead.firstName,
                "lastName": lead.lastName,
                "email": lead.email,
                "tags": tags
            },
            headers: {
                "Content-Type": "application/json"
            }
        };

        axios.post('http://api.markethero.io/v1/api/tag-lead', axiosConfig.data)
        .then(function (response) {
            resolve(response);
        })
        .catch(function(err) {
            const response = err.response;
            console.log(response.data.errors);
            reject(err);
        });
    });
    
};

exports.RemoveTag = function(lead, tags, apiKey) {
    return new Promise(function(resolve, reject) {

        const axiosConfig = {
            data: {
                "apiKey": apiKey,
                "email": lead.email,
                "tags": tags
            },
            headers: {
                "Content-Type": "application/json"
            }
        };

        axios.delete('http://api.markethero.io/v1/api/tag-lead', axiosConfig)
        .then(function (response) {
            resolve(response);
        })
        .catch(function(err) {
            const response = err.response;
            console.log(response.data.errors);
            reject(err);
        });
    });
};