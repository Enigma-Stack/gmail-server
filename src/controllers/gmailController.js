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
    },

    getMail: async (req, res) => {
        try {
            const emailData = await gmailService.getMail(req.oauth2Client, req.params.id);
            res.json(emailData);
        } catch (error) {
            logger.error('Error fetching email: ', error);
            res.status(500).send('Internal Server Error');
        }
    },    

    getEmailsByPage: async (req, res) => {
        try {
            const pageToken = req.query.pageToken;
            const emailData = await gmailService.getEmailsByPage(req.oauth2Client, pageToken);
            res.json(emailData);
        } catch (error) {
            logger.error('Error fetching emails by page: ', error);
            res.status(500).send('Internal Server Error');
        }
    },

};

module.exports = gmailController;
