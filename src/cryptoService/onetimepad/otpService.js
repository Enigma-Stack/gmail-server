const { getKeyForUUID } = require('./keyStore'); // Adjust the path accordingly

const generateRandomKey = (length) => {
    let key = '';
    for (let i = 0; i < length; i++) {
        key += String.fromCharCode(Math.floor(Math.random() * 26) + 97); // Generates a lowercase letter
    }
    return key;
};

const isAuthorized = (currentUserEmail, uuid) => {
    const keyData = getKeyForUUID(uuid);
    if (!keyData) {
        return false; // Key data not found for UUID
    }

    // Check if the currentUserEmail matches the recipientUserId stored with the key
    return keyData.recipientUserId === currentUserEmail;
};


module.exports = { generateRandomKey, isAuthorized };
