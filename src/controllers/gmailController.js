const gmailService = require("../services/gmailService");
const logger = require("../utils/logger");

const gmailController = {
    getMyEmail: async (req, res) => {
        try {
            const email = await gmailService.getEmail(req.oauth2Client);
            res.json(email);
        } catch (error) {
            logger.error("Error fetching inbox: ", error);
            res.status(500).send("Internal Server Error");
        }
    },

    getInbox: async (req, res) => {
        try {
            const inboxData = await gmailService.getInbox(req.oauth2Client);
            res.json(inboxData);
        } catch (error) {
            logger.error("Error fetching inbox: ", error);
            res.status(500).send("Internal Server Error");
        }
    },

    getSentItems: async (req, res) => {
        try {
            const sentItemsData = await gmailService.getSentItems(
                req.oauth2Client
            );
            res.json(sentItemsData);
        } catch (error) {
            logger.error("Error fetching sent items: ", error);
            res.status(500).send("Internal Server Error");
        }
    },

    getMail: async (req, res) => {
        try {
            const emailData = await gmailService.getMail(
                req.oauth2Client,
                req.params.id
            );
            res.json(emailData);
        } catch (error) {
            logger.error("Error fetching email: ", error);
            res.status(500).send("Internal Server Error");
        }
    },

    getEmailsByPage: async (req, res) => {
        try {
            const pageToken = req.query.pageToken;
            const emailData = await gmailService.getEmailsByPage(
                req.oauth2Client,
                pageToken
            );
            res.json(emailData);
        } catch (error) {
            logger.error("Error fetching emails by page: ", error);
            res.status(500).send("Internal Server Error");
        }
    },

    getSentEmailsByPage: async (req, res) => {
        try {
            const pageToken = req.query.pageToken;
            const emailData = await gmailService.getSentEmailsByPage(
                req.oauth2Client,
                pageToken
            );
            res.json(emailData);
        } catch (error) {
            logger.error("Error fetching sent emails by page: ", error);
            res.status(500).send("Internal Server Error");
        }
    },

    sendEmailWithAttachment: async (req, res) => {
        try {
            const emailDetails = {
                to: req.body.to,
                subject: req.body.subject,
                body: req.body.body,
                attachmentMimeType: req.file.mimetype,
                attachmentFileName: req.file.originalname,
                attachmentFilePath: req.file.path,
                encryption: req.body.encryption,
                bodyUuid: req.body.bodyUuid, // UUID for the body
                attachmentUuid: req.body.attachmentUuid, // UUID for the attachment
            };

            logger.info("req body: ", req.body);
            const sendResult = await gmailService.sendEmailWithAttachment(
                req.oauth2Client,
                emailDetails
            );
            res.json(sendResult);
        } catch (error) {
            logger.error("Error sending email with attachment: ", error);
            res.status(500).send("Internal Server Error");
        }
    },

    getAttachment: async (req, res) => {
        try {
            const { messageId, attachmentId } = req.params;
            logger.info(`Fetching email details for messageId: ${messageId}`);

            // Fetch the email details to get the filename
            const emailData = await gmailService.getMail(
                req.oauth2Client,
                messageId
            );

            logger.info(
                `Looking for attachment with attachmentId: ${attachmentId}`
            );
            const attachmentPart = emailData.attachments.find(
                (part) => part.attachmentId === attachmentId
            );
            const filename = attachmentPart
                ? attachmentPart.filename
                : "attachment";
            logger.info(`Attachment filename: ${filename}`);

            const attachmentData = await gmailService.getAttachment(
                req.oauth2Client,
                messageId,
                attachmentId
            );
            const decodedData = Buffer.from(attachmentData.data, "base64");

            // Set the appropriate content type and content disposition
            // res.type(attachmentPart.mimeType); // Set the correct MIME type if available
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${filename}"`
            );
            res.send(decodedData);
        } catch (error) {
            logger.error("Error fetching attachment: ", error);
            res.status(500).send("Internal Server Error");
        }
    },
};

module.exports = gmailController;
