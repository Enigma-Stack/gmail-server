const fs = require('fs');
const path = require('path');

// Path to the JSON file
const filePath = path.join(__dirname, 'otpKeys.json');

const storeKeyWithUUID = (uuid, key, recipientUserId) => {
    // Read the current content of the file
    let data = {};
    if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    // Update the data with the new key
    data[uuid] = { key, recipientUserId };
    console.log(recipientUserId)
    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
};

const getKeyForUUID = (uuid) => {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data[uuid] || null;
};

module.exports = { storeKeyWithUUID, getKeyForUUID };
