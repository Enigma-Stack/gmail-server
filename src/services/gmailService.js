const { google } = require("googleapis");

const gmailService = {
    getInbox: async (authClient) => {
        const gmail = google.gmail({ version: "v1", auth: authClient });
        try {
            const response = await gmail.users.messages.list({
                userId: "me",
                labelIds: ["INBOX"],
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getSentItems: async (authClient) => {
        const gmail = google.gmail({ version: "v1", auth: authClient });
        try {
            const response = await gmail.users.messages.list({
                userId: "me",
                labelIds: ["SENT"],
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get mains from message ID
    getMail: async (authClient, messageId) => {
        const gmail = google.gmail({ version: "v1", auth: authClient });
        try {
            const response = await gmail.users.messages.get({
                userId: "me",
                id: messageId,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getEmailsByPage: async (authClient, pageToken = null) => {
        const gmail = google.gmail({ version: "v1", auth: authClient });
        try {
            const response = await gmail.users.messages.list({
                userId: "me",
                maxResults: 50,
                labelIds: ["INBOX"],
                pageToken: pageToken,
            });

            const messages = await Promise.all(
                response.data.messages.map(async (message) => {
                    const fullMessage = await gmail.users.messages.get({
                        userId: "me",
                        id: message.id,
                        format: "metadata",
                    });

                    return extractRelevantFields(fullMessage.data);
                })
            );

            return {
                nextPageToken: response.data.nextPageToken,
                messages: messages,
            };
        } catch (error) {
            throw error;
        }
    },
};

// Helper function to extract relevant fields
function extractRelevantFields(data) {
    const headers = data.payload.headers;
    const extractHeader = (name) => headers.find((h) => h.name === name)?.value;

    return {
        id: data.id,
        historyId: data.historyId,
        labelIds: data.labelIds,
        // Extract specific headers based on their names
        deliveredTo: extractHeader("Delivered-To"),
        from: extractHeader("From"),
        date: extractHeader("Date"),
        cc: extractHeader("Cc"),
        subject: extractHeader("Subject"),
        to: extractHeader("To"),
        bcc: extractHeader("Bcc"),
    };
}

module.exports = gmailService;
