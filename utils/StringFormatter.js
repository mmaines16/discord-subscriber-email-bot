exports.toNameFormat = function(str) {

    const newString = str.toLowerCase().trim();

    return newString[0].toUpperCase() + newString.substring(1);
}