const gmailService = require('../services/gmailService');
const logger = require('../utils/logger');

const gmailController = {
    getInbox: async (req, res) => {
        try {
            const inboxData = await gmailService.getInbox(req.oauth2Client);
            res.json(inboxData);
        } catch (error) {
            logger.error('Error fetching inbox: ', error);
            res.status(500).send('Internal Server Error');
        }
    },

    getSentItems: async (req, res) => {
        try {
            const sentItemsData = await gmailService.getSentItems(req.oauth2Client);
            res.json(sentItemsData);
        } catch (error) {
            logger.error('Error fetching sent items: ', error);
            res.status(500).send('Internal Server Error');
        }
    }
};

module.exports = gmailController;
