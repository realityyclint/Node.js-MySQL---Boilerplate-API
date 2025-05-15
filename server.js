require('dotenv').config();
require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./_middleware/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

const allowedOrigins = [process.env.FRONTEND_URL]; // Add this in Render environment variables
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));


// API routes
app.use('/accounts', require('./accounts/accounts.controller'));
app.use('/accounts/departments', require('./departments/index')); // Use the updated department controller
app.use('/accounts/employees', require('./employees/index'));
app.use('/accounts/workflows', require('./workflows/index'));
app.use('/accounts/requests', require('./requests/index'));

// Swagger docs route
app.use('/api-docs', require('./_helpers/swagger'));

// Global error handler
app.use(errorHandler);

// Start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));
