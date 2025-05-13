// config.js
require('dotenv').config();

module.exports = {
    database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    secret: process.env.JWT_SECRET || 'fallback_secret',
    emailFrom: process.env.EMAIL_FROM || 'info@example.com',
    smtpOptions: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    }
};
