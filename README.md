# Node.js + MySQL Boilerplate API

## Introduction
A starter RESTful API built with Node.js, Express, and MySQL. This boilerplate is designed for quick development of back-end services for web and mobile applications, following best practices like MVC structure and modular routing.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rodriguez1718/Node.js-MySQL---Boilerplate-API
   cd node-mysql-boilerplate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure your database and email settings:**

   Inside your configuration file (e.g., `config.json`), use the following format:
   ```json
   {
     "database": {
       "host": "localhost",
       "port": 3306,
       "user": "root",
       "password": "",
       "database": "node-mysql-signup-verification-api"
     },
     "secret": "THIS IS USED TO SIGN AND VERIFY JWT TOKENS, REPLACE IT WITH YOUR OWN SECRET, IT CAN BE ANY STRING",
     "emailFrom": "info@node-mysql-signup-verification-api.com",
     "smtpOptions": {
       "host": "[ENTER YOUR OWN SMTP OPTIONS OR CREATE FREE TEST ACCOUNT IN ONE CLICK AT https://ethereal.email/]",
       "port": 587,
       "auth": {
         "user": "",
         "pass": ""
       }
     }
   }
   ```

4. **Start the backend server:**
   ```bash
   npm start
   ```

## Usage

- Use Postman or Thunder Client to test endpoints.
- Sample endpoints:
  - `POST /accounts/register` – Create an account
  - `POST /accounts/verify-email` – Verify account
  - `POST /accounts/authenticate` – Authenticate account
  - `POST /accounts/forgot-password` – Send a token to an account to reset password
  - `POST /accounts/reset-password` – Reset password
  - `POST /accounts/refresh-token` – Refresh cookie tokens
  - `GET /accounts` – Get all accounts
  - `PUT /accounts/{id}` – Update an account


## Contributing

Follow the Git and GitHub workflow outlined in the project guidelines. Make sure to create a separate branch for each feature or fix, and submit a pull request for review.

## License

MIT License
