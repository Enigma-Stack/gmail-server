const CryptoJS = require('crypto-js');

function hashAndProcess(inputString) {
    // Hash the input using SHA-256
    const hash = CryptoJS.SHA256(inputString.toLowerCase()).toString(CryptoJS.enc.Hex);

    // Take the first 4 characters of the hash
    const firstFourChars = hash.substring(0, 4);

    // Convert the 4 characters into an integer
    const intValue = parseInt(firstFourChars, 16);

    // Modulo 100
    const result = intValue % 100;

    return result;
}

module.exports = { hashAndProcess };
