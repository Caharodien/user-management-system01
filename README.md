##### Developer 1/Amama == Develoiper 2/Mahawan

## User Management API Documentation

# Table of Contents

Database Setup
API Endpoints
Authentication
Email Configuration
Admin Features
Error Handling
Deployment Guidelines

# Prerequisites

Node.js
MySQL 9.2 or higher
npm

# installation

npm install

# On config.json

{
"dbConfig": {
"host": "auth-db.local",
"port": 3306,
"username": "auth_user",
"password": "SecureAuth@2023",
"database": "user_auth_system"
},
"jwtSecret": "XkP9s#v2y$B&E)H+",
"systemEmail": "no-reply@user-auth-api.com",
"mailSettings": {
"service": "MailGun",
"port": 465,
"credentials": {
"user": "api@mg.user-auth.com",
"pass": "MailGunPass123"
}
}
}

# Start the server:

npm run start:dev

# Used mqsql shell 

\connect auth_user@localhost

CREATE DATABASE user_auth_system;

API Endpoints

### API Endpoints

## Authentication Endpoints

# Confirm Email Address

Endpoint: POST /auth/confirm
Description: Validate user's email
Request Body:
{
"validationCode": "email-verification-token"
}

{
  "title": "Mr",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "acceptTerms": true
}

# LOGIN

Endpoint: POST /auth/login
Description: Authenticate and receive tokens
Request Body:
{
"email": "alice.johnson@example.org",
"secret": "VerySecure!456"
}

#  Verify Email

Endpoint: POST /accounts/verify-email
Description: Verify a user's email address
Request Body:
{
  "token": "verification-token-from-email"
}


# Authenticate

Endpoint: POST /accounts/authenticate
Description: Authenticate a user and get JWT token
Request Body:
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}

# Response 

{
  "id": 5,
  "title": "Mr",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "User",
  "created": "2025-04-05T11:38:07.000Z",
  "updated": null,
  "isVerified": true,
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "69b39e251eea4f40a8b0fd89f839e1a978a34..."
}


# Refresh Token

Endpoint: POST /accounts/refresh-token
Description: Get a new JWT token using a refresh token
Request Cookies: Include the refreshToken cookie
Response: New JWT token and refresh token


# Revoke Token

Endpoint: POST /accounts/revoke-token
Description: Revoke a refresh token
Request Body:
{
  "token": "refresh-token-to-revoke"
}


# Get All Accounts (Admin only)

Endpoint: GET /accounts
Description: Get all user accounts
Auth Required: Yes (Admin)
Response: Array of user accounts

# Get Account by ID

Endpoint: GET /accounts/{id}
Description: Get a specific user account
Auth Required: Yes (Admin or account owner)
Response: User account details

# Create Account (Admin only)

Endpoint: POST /accounts
Description: Create a new user account
Auth Required: Yes (Admin)
Request Body:
{
  "title": "Mr",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "role": "User"
}

Response: Created user account details

# Update Account

Endpoint: PUT /accounts/{id}
Description: Update a user account
Auth Required: Yes (Admin or account owner)
Request Body:
{
  "firstName": "Updated",
  "lastName": "Name"
}

Response: Updated user account details

# Delete Account

Endpoint: DELETE /accounts/{id}
Description: Delete a user account
Auth Required: Yes (Admin or account owner)
Response: A message indicating successful deletion


## Forgot Password

Endpoint: POST /accounts/forgot-password
Description: Request a password reset
Request Body:
{
  "email": "john.doe@example.com"
}
Response: A message to check email for reset instructions

## Validate Reset Token

Endpoint: POST /accounts/validate-reset-token
Description: Validate a password reset token
Request Body:
{
  "token": "reset-token-from-email"
}
Response: A message indicating valid token

## Verify Reset Token

Endpoint: POST /auth/check-reset-token
Description: Confirm reset token validity
Request Body:
{
"token": "password-reset-code"
}
Response: Token validation status



# Error Handling
# The API uses standard HTTP status codes:

# 200: Success
# 400: Bad Request
# 401: Unauthorized
# 403: Forbidden
# 404: Not Found
# 500: Server Error
# Error responses follow this format:

# {
  # "message": "Error description"
# }