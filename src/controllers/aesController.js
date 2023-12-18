const logger = require("../utils/logger");
const config = require("../config");
const aesService = require("../services/aesService");

const aesController = {
    sendEmailWithAttachmentAES: async (req, res) => {
        try {
            console.log("here", req.body)
            const emailDetails = {
                to: req.body.to,
                subject: req.body.subject,
                body: req.body.body,
                attachmentMimeType: req.file.mimetype,
                attachmentFileName: req.file.originalname,
                attachmentFilePath: req.file.path,
                encryption: req.body.encryption,
                from: req.body.from
            };

            logger.info("req body: ", req.body);
            const sendResult = await aesService.sendEmailWithAttachmentAES(
                req.oauth2Client,
                emailDetails
            );
            res.json(sendResult);
        } catch (error) {
            logger.error("Error sending email with attachment: ", error);
            res.status(500).send("Internal Server Error");
        }
    },

};

module.exports = aesController;
