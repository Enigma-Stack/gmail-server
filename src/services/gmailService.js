const { google } = require("googleapis");
const { Base64 } = require("js-base64");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

const gmailService = {
    getEmail: async (authClient) => {
        const gmail = google.gmail({ version: "v1", auth: authClient });
        try {
            const profile = await gmail.users.getProfile({
                userId: "me",
                auth: authClient,
            });
            return ({ email: profile.data.emailAddress });
        } catch (error) {
            logger.error("Error fetching user email:", error);
            throw error;
        }
    },

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

    getEmailsByPage: async (authClient, pageToken = null) => {
        const gmail = google.gmail({ version: "v1", auth: authClient });
        try {
            const response = await gmail.users.messages.list({
                userId: "me",
                maxResults: 150,
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

    getMail: async (authClient, messageId) => {
        const gmail = google.gmail({ version: "v1", auth: authClient });
        try {
            const response = await gmail.users.messages.get({
                userId: "me",
                id: messageId,
                format: "full",
            });

            const emailData = {
                id: response.data.id,
                threadId: response.data.threadId,
                labelIds: response.data.labelIds,
                encryption: {
                    flag: 0, // Default to no encryption
                    bodyUuid: null, // UUID for the body
                    attachmentUuid: null, // UUID for the attachment
                },
                snippet: "", //response.data.snippet,
                headers: {
                    date: response.data.payload.headers.find(
                        (header) => header.name === "Date"
                    )?.value,
                    to: response.data.payload.headers.find(
                        (header) => header.name === "To"
                    )?.value,
                    from: response.data.payload.headers.find(
                        (header) => header.name === "From"
                    )?.value,
                    subject: response.data.payload.headers.find(
                        (header) => header.name === "Subject"
                    )?.value,
                    cc: response.data.payload.headers.find(
                        (header) => header.name === "Cc"
                    )?.value,
                    Bcc: response.data.payload.headers.find(
                        (header) => header.name === "Bcc"
                    )?.value,
                },
                attachments: [],
                reponse: response,
            };

            // Extract headers and check for custom encryption headers
            response.data.payload.headers.forEach((header) => {
                // console.log("this is the header: ", header);
                emailData.headers[header.name.toLowerCase()] = header.value;

                if (
                    header.name === "X-Body-Encryption" &&
                    header.value.startsWith("OTP")
                ) {
                    // console.log("first if", header.name, header.value);
                    emailData.encryption.flag = 1;
                    // const bodyUuidHeader = response.data.payload.headers.find(
                    //     (h) => h.name === "X-Body-UUID"
                    // );
                    if (header.value) {
                        emailData.encryption.bodyUuid = header.value.slice(
                            18,
                            header.value.length
                        );
                    }
                }

                if (
                    header.name === "X-Attachment-Encryption" &&
                    header.value.startsWith("OTP")
                ) {
                    // console.log("first if", header.name, header.value);
                    emailData.encryption.flag = 1;
                    // const attachmentUuidHeader =
                    //     response.data.payload.headers.find(
                    //         (h) => h.name === "X-Attachment-UUID"
                    //     );
                    if (header.value) {
                        emailData.encryption.attachmentUuid =
                            header.value.slice(24, header.value.length);
                    }
                }

                if (
                    header.name === "X-Body-Encryption" &&
                    header.value.startsWith("AES")
                ) {
                    // console.log("first if", header.name, header.value);
                    emailData.encryption.flag = 2;
                    // const bodyUuidHeader = response.data.payload.headers.find(
                    //     (h) => h.name === "X-Body-UUID"
                    // );
                    // if (header.value) {
                    //     emailData.encryption.bodyUuid = header.value.slice(
                    //         18,
                    //         header.value.length
                    //     );
                    // }
                }

                if (
                    header.name === "X-Attachment-Encryption" &&
                    header.value.startsWith("AES")
                ) {
                    // console.log("first if", header.name, header.value);
                    emailData.encryption.flag = 2;
                    // const attachmentUuidHeader =
                    //     response.data.payload.headers.find(
                    //         (h) => h.name === "X-Attachment-UUID"
                    //     );
                    // if (header.value) {
                    //     emailData.encryption.attachmentUuid =
                    //         header.value.slice(24, header.value.length);
                    // }
                }
            });

            const extractBody = (parts) => {
                parts.forEach((part) => {
                    if (part.parts) {
                        extractBody(part.parts); // Recursive call for multipart
                    } else if (
                        part.mimeType === "text/plain" ||
                        part.mimeType === "text/html"
                    ) {
                        emailData.snippet += Buffer.from(
                            part.body.data,
                            "base64"
                        ).toString(); // Decode and append
                    }
                });
            };

            if (response.data.payload.parts) {
                extractBody(response.data.payload.parts);
            } else if (
                response.data.payload.body &&
                response.data.payload.body.data
            ) {
                // For non-multipart messages
                emailData.snippet = Buffer.from(
                    response.data.payload.body.data,
                    "base64"
                ).toString();
            }

            if (response.data.payload.parts) {
                response.data.payload.parts.forEach((part) => {
                    if (
                        part.filename &&
                        part.filename.length > 0 &&
                        part.body &&
                        part.body.attachmentId
                    ) {
                        emailData.attachments.push({
                            filename: part.filename,
                            mimeType: part.mimeType,
                            attachmentId: part.body.attachmentId,
                        });
                    }
                });
            }

            //Change unread->read
            if (emailData.labelIds.includes("UNREAD")) {
                await gmail.users.messages.modify({
                    userId: "me",
                    id: messageId,
                    requestBody: {
                        removeLabelIds: ["UNREAD"],
                    },
                });
            }

            return emailData;
        } catch (error) {
            throw error;
        }
    },

    sendEmailWithAttachment: async (authClient, emailDetails) => {
        const gmail = google.gmail({ version: "v1", auth: authClient });

        logger.info("Reading the attachment file");
        const fileContent = fs.readFileSync(emailDetails.attachmentFilePath);
        const encodedFileContent = Buffer.from(fileContent).toString("base64");

        logger.info("Constructing the MIME message");
        const boundary = "foo_bar_baz";

        let bodyEncryptionHeader = "";
        let attachmentEncryptionHeader = "";

        if (emailDetails.encryption === "1") {
            // OTP Encryption
            bodyEncryptionHeader = `X-Body-Encryption: OTP; X-Body-UUID: ${emailDetails.bodyUuid}`;
            attachmentEncryptionHeader = `X-Attachment-Encryption: OTP; X-Attachment-UUID: ${emailDetails.attachmentUuid}`;
        } else if (emailDetails.encryption === "0") {
            // No Encryption
            bodyEncryptionHeader = `X-Body-Encryption: None; X-Body-UUID: None`;
            attachmentEncryptionHeader = `X-Attachment-Encryption: None; X-Attachment-UUID: None`;
        } else if (emailDetails.encryption === "2") {
            // AES Encryption
            bodyEncryptionHeader = `X-Body-Encryption: AES; X-Body-UUID: AES`;
            attachmentEncryptionHeader = `X-Attachment-Encryption: AES; X-Attachment-UUID: AES`;
        }
        // Add more conditions if there are other types of encryption.

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
            `${emailDetails.body}`,
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

    getAttachment: async (authClient, messageId, attachmentId) => {
        const gmail = google.gmail({ version: "v1", auth: authClient });
        try {
            const response = await gmail.users.messages.attachments.get({
                userId: "me",
                messageId: messageId,
                id: attachmentId,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getSentEmailsByPage: async (authClient, pageToken = null) => {
        const gmail = google.gmail({ version: "v1", auth: authClient });
        try {
            const response = await gmail.users.messages.list({
                userId: "me",
                maxResults: 150,
                labelIds: ["SENT"],
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
