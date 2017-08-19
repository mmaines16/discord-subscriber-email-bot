exports.validateEmailCommand = function(commandArgs, message) {
    if(commandArgs.length != 2) {
        return {
            result: false,
            error: {
                message: "Sorry I didn't get that; Please try again with only the !email command followed by one email seperated by a space. Example: (!email test@gmail.com) Thank You!"
            }
        };
    }
    else if(!commandArgs[1].includes("@")) {
        return {
            result: false,
            error: {
                message: "Sorry the email you gave is not valid please try again making sure the email is valid, Example: (test@gmail.com), or with different email"
            }
        }
    }
    else {
        return {
            result: true,
            error: {}
        };
    }
};

exports.validateNameCommand = function(commandArgs) {
    if(commandArgs.length != 3) {
        return {
            result: false,
            error: {
                message: "Incorrect useage of !name command. Please try again only using one word for oth first and last name seperated by a single space. Thank you!"
            }
        }
    }
    else {
        return {
            result: true,
            error: {}
        };
    }
};