const fs = require("fs");
const path = require("path");
const { hashAndProcess } = require("./keyStore");
const CryptoJS = require("crypto-js");
const logger = require("../../utils/logger");

// Path to the JSON file
const filePath = path.join(__dirname, "aes_keys.json");

function hashKeyForAES(key) {
    // Hash the 1KB key to a 256-bit (32-byte) key
    return CryptoJS.SHA256(key).toString(CryptoJS.enc.Hex);
}

function decryptAES(text, email) {
    let data = {};
    if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    let index = hashAndProcess(email);
    let secretKey = data[index];
    try {
        const hashedKey = hashKeyForAES(secretKey); // Hash the key
        const parts = text.split(':');
        const iv = CryptoJS.enc.Hex.parse(parts[0]);
        const encryptedText = parts[1];
        const key = CryptoJS.enc.Hex.parse(hashedKey);

        const decrypted = CryptoJS.AES.decrypt(encryptedText, key, { iv: iv });
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
}

function encryptAES(text, email) {
    let data = {};
    if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    let index = hashAndProcess(email);
    let secretKey = data[index];
    const hashedKey = hashKeyForAES(secretKey); // Hash the key
    const key = CryptoJS.enc.Hex.parse(hashedKey);
    const iv = CryptoJS.lib.WordArray.random(16); // 16 bytes IV

    const encrypted = CryptoJS.AES.encrypt(text, key, { iv: iv }).toString();
    const ivHex = CryptoJS.enc.Hex.stringify(iv);

    return `${ivHex}:${encrypted}`;
}

module.exports = { decryptAES, encryptAES };
