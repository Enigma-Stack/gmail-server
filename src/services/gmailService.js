const { google } = require('googleapis');

const gmailService = {
    getInbox: async (authClient) => {
        const gmail = google.gmail({ version: 'v1', auth: authClient });
        try {
            const response = await gmail.users.messages.list({
                userId: 'me',
                labelIds: ['INBOX'],
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getSentItems: async (authClient) => {
        const gmail = google.gmail({ version: 'v1', auth: authClient });
        try {
            const response = await gmail.users.messages.list({
                userId: 'me',
                labelIds: ['SENT'],
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // You can add more methods for other functionalities like sendEmail, getDrafts, etc.
};

module.exports = gmailService;
