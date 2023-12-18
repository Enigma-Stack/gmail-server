const { v4: uuidv4 } = require("uuid");
const {
    generateRandomKey,
    isAuthorized,
} = require("../cryptoService/onetimepad/otpService");
const { storeKeyWithUUID } = require("../cryptoService/onetimepad/keyStore");
const { getKeyForUUID } = require("../cryptoService/onetimepad/keyStore");
const logger = require("../utils/logger");
const config = require("../config");

const otpController = {
    generateOTPKey: async (req, res) => {
        try {
            logger.info("Generating new OTP key");

            const length = req.params.length; // Get the length from query params
            const uuid = uuidv4(); // Generate a new UUID
            const keyLength = length;
            logger.debug(`Generated UUID: ${uuid}, Key Length: ${keyLength}`);

            const key = generateRandomKey(keyLength);
            logger.debug(`OTP Key generated: ${key}`);

            // Assuming the recipient's user ID is passed in the request
            const recipientUserId = req.params.recipientUserId; // Replace with actual logic to get recipient's user ID
            logger.debug(`Recipient User ID: ${recipientUserId}`);

            storeKeyWithUUID(uuid, key, recipientUserId);
            logger.info(
                `OTP Key stored with UUID: ${uuid} for Recipient User ID: ${recipientUserId}`
            );

            res.json({
                success: true,
                message: "OTP Key generated",
                uuid,
                key,
            });
            logger.info(`OTP Key response sent to client`);
        } catch (error) {
            logger.error("Error generating OTP key: ", error);
            res.status(500).send("Internal Server Error");
        }
    },

    getOTPOpen: async (req, res) => {
        try {
            const uuid = req.params.uuid;
            const currentUser = req.params.userEmail;

            if (isAuthorized(currentUser, uuid)) {
                const keyData = getKeyForUUID(uuid);
                if (keyData && keyData.key) {
                    res.json({ success: true, key: keyData.key });
                } else {
                    res.status(404).send("Key not found");
                }
            } else {
                res.status(403).send("Unauthorized");
            }
        } catch (error) {
            logger.error("Error retrieving OTP key: ", error);
            res.status(500).send("Internal Server Error");
        }
    },

    // ... other OTP-related methods ...
};

module.exports = otpController;
