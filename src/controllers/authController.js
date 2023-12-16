const oauth2Client = require('../oauthClient');
const logger = require('../utils/logger');
const config = require('../config');

const authController = {
    redirectToGoogle: (req, res) => {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://mail.google.com/'
        });
        res.redirect(url);
    },

    handleGoogleCallback: async (req, res) => {
        try {
            const { code } = req.query;
            if (!code) {
                throw new Error('Code not found in the request');
            }

            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);

            // Handle tokens as per your application's needs

            // res.redirect(config.redirectUri); 
            res.status(200).send("Authentication successful")
        } catch (error) {
            logger.error('Error in Google Auth Callback: ', error);
            res.status(500).send('Internal Server Error');
        }
    },

    signOut: (req, res) => {
        oauth2Client.revokeCredentials(() => {
            res.send('Logged out');
        });
    }
};

module.exports = authController;
