require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const gmailRoutes = require('./routes/gmailRoutes');
const otpRoutes = require('./routes/otpRoutes');
const aesRoutes = require('./routes/aesRoutes');
const config = require('./config');
const oauth2Client = require('./middlewares/oauthClient');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    req.oauth2Client = oauth2Client;
    next();
});

app.use('/auth', authRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/aes', aesRoutes);

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});