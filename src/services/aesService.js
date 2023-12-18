const { google } = require("googleapis");
const { Base64 } = require("js-base64");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");
const { decryptAES, encryptAES } = require("../cryptoService/aes/crypto")

const aesService = {
    sendEmailWithAttachmentAES: async (authClient, emailDetails) => {
        const gmail = google.gmail({ version: "v1", auth: authClient });

        logger.info("Reading the attachment file");
        const fileContent = fs.readFileSync(emailDetails.attachmentFilePath);
        const encodedFileContent = Buffer.from(fileContent).toString("base64");

        // Decrypting receieved file -> from
        // const decryptedAttachment = decryptAES(encodedFileContent, emailDetails.from);
        const decryptedBody = decryptAES(emailDetails.body, emailDetails.from);

        // Encrypting file
        // const encryptedAttachment = encryptAES(decryptedAttachment, emailDetails.to);
        const encryptedBody = encryptAES(decryptedBody, emailDetails.to);


        logger.info("Constructing the MIME message");
        const boundary = "foo_bar_baz";

        bodyEncryptionHeader = `X-Body-Encryption: AES; X-Body: AES`;
        attachmentEncryptionHeader = `X-Attachment-Encryption: AES; X-Attachment: AES`;

        let raw = [
            `MIME-Version: 1.0`,
            `To: ${emailDetails.to}`,
            `Subject: ${emailDetails.subject}`,
            bodyEncryptionHeader,
            attachmentEncryptionHeader,
            `Content-Type: multipart/mixed; boundary="${boundary}"`,
            ``,
            `--${boundary}`,
            `Content-Type: text/plain; charset="UTF-8"`,
            `Content-Transfer-Encoding: 7bit`,
            ``,
            `${encryptedBody}`,
            ``,
            `--${boundary}`,
            `Content-Type: ${
                emailDetails.attachmentMimeType
            }; name="${path.basename(emailDetails.attachmentFilePath)}"`,
            `Content-Disposition: attachment; filename="${emailDetails.attachmentFileName}"`,
            `Content-Transfer-Encoding: base64`,
            ``,
            encodedFileContent,
            `--${boundary}--`,
        ].join("\r\n");

        logger.info(raw);

        let encodedRaw = Base64.encodeURI(raw);

        try {
            logger.info("Sending email via Gmail API");
            const response = await gmail.users.messages.send({
                userId: "me",
                requestBody: {
                    raw: encodedRaw,
                },
            });
            logger.info(
                `Email sent successfully, Message ID: ${response.data.id}`
            );
            return response.data;
        } catch (error) {
            logger.error("Error sending email with attachment: ", error);
            throw error;
        }
    },

    // getAttachment: async (authClient, messageId, attachmentId) => {
    //     const gmail = google.gmail({ version: "v1", auth: authClient });
    //     try {
    //         const response = await gmail.users.messages.attachments.get({
    //             userId: "me",
    //             messageId: messageId,
    //             id: attachmentId,
    //         });
    //         return response.data;
    //     } catch (error) {
    //         throw error;
    //     }
    // },
};

module.exports = aesService;
