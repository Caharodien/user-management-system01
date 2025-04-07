User Management API
A secure user authentication and management system built with Node.js, Express, MySQL, and Sequelize. This API includes features such as user registration, login with JWT, email verification, password reset, and role-based access control.

👥 Developers
Amama

Mahawan

📌 Table of Contents
Prerequisites

Installation

Configuration

Database Setup

Running the Server

API Endpoints

Authentication

Account Management

Password Reset

Error Handling

Deployment Notes

🧰 Prerequisites
Node.js

MySQL 9.2+

npm

📦 Installation
Clone the repository and install dependencies:

bash
Copy
Edit
npm install
⚙️ Configuration
Update the config.json file with your environment-specific details:

json
Copy
Edit
{
  "database": {
    "host": "localhost",
    "port": 3306,
    "user": "roots",
    "password": "Sancija-11",
    "database": "node-mysql-signup-verification-api"
  },
  "secret": "TcxtoIgRRbUqqgW174x1zAA==",
  "emailFrom": "info@node-mysql-signup-verification-api.com",
  "smtpOptions": {
    "host": "smtp.ethereal.email",
    "port": 587,
    "auth": {
      "user": "ladarius66@ethereal.email",
      "pass": "HaCUhbSy1XEmTpTExr"
    }
  }
}
🗃️ Database Setup
Create the database using MySQL shell or a GUI tool:

sql
Copy
Edit
CREATE DATABASE `node-mysql-signup-verification-api`;
🚀 Running the Server
Start the server in development mode:

bash
Copy
Edit
npm run start:dev
📡 API Endpoints
🔐 Authentication
Register New User
POST /accounts/register
Registers a new user. First registered user is assigned the "Admin" role.

json
Copy
Edit
{
  "title": "Mr",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "acceptTerms": true
}
Verify Email
POST /accounts/verify-email

json
Copy
Edit
{
  "token": "verification-token-from-email"
}
Authenticate
POST /accounts/authenticate

json
Copy
Edit
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
Response:

json
Copy
Edit
{
  "id": 1,
  "title": "Mr",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "User",
  "created": "2025-04-05T11:38:07.000Z",
  "updated": null,
  "isVerified": true,
  "jwtToken": "eyJhbGciOi...",
  "refreshToken": "69b39e251eea4f..."
}
Refresh Token
POST /accounts/refresh-token
Uses a valid refresh token (via cookies) to issue a new JWT.

Revoke Token
POST /accounts/revoke-token
Revokes a given refresh token.

json
Copy
Edit
{
  "token": "refresh-token-to-revoke"
}
👤 Account Management
Get All Accounts (Admin Only)
GET /accounts
Returns a list of all registered users.

Get User by ID
GET /accounts/{id}
Returns user data by ID (Admin or account owner only).

Create New Account (Admin Only)
POST /accounts

json
Copy
Edit
{
  "title": "Mr",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "role": "User"
}
Update Account
PUT /accounts/{id}

json
Copy
Edit
{
  "firstName": "Updated",
  "lastName": "Name"
}
Delete Account
DELETE /accounts/{id}
Deletes a user account (Admin or owner only).

🔁 Password Reset
Forgot Password
POST /accounts/forgot-password

json
Copy
Edit
{
  "email": "john.doe@example.com"
}
Validate Reset Token
POST /accounts/validate-reset-token

json
Copy
Edit
{
  "token": "reset-token-from-email"
}
Reset Password
POST /accounts/reset-password

json
Copy
Edit
{
  "token": "reset-token-from-email",
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
❗ Error Handling
The API returns standard HTTP status codes for errors:

Code	Description
200	Success
400	Bad Request
401	Unauthorized
403	Forbidden
404	Not Found
500	Server Error
Error Format:

json
Copy
Edit
{
  "message": "Error description"
}
🚚 Deployment Notes
Ensure the environment variables in config.json are production-safe.

Use HTTPS in production.

Change email provider for production (e.g., SendGrid, Mailgun).

Use a secure secret key in production.

