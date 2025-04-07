User Authentication API Documentation
Table of Contents
Database Configuration
API Endpoints
Security Authentication
Notification Setup
Administrator Functions
Error Management
Deployment Instructions

Prerequisites
Node.js v18+
MySQL 10.3 or newer
npm 9+

installation
npm ci --production

On config.json
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

Start the server:
npm run dev

Used mysql shell
\connect auth_user@localhost

CREATE DATABASE user_auth_system;

API Endpoints
Authentication Endpoints
Initial registrant becomes System Administrator
Endpoint: POST /auth/signup
Description: Create new user profile
Request Body:

{
"salutation": "Dr",
"givenName": "Alice",
"familyName": "Johnson",
"email": "alice.johnson@example.org",
"secret": "VerySecure!456",
"confirmSecret": "VerySecure!456",
"agreedToTerms": true
}

Confirm Email Address
Endpoint: POST /auth/confirm
Description: Validate user's email
Request Body:
{
"validationCode": "email-verification-token"
}

Login
Endpoint: POST /auth/login
Description: Authenticate and receive tokens
Request Body:
{
"email": "alice.johnson@example.org",
"secret": "VerySecure!456"
}

Response
{
"userId": 7,
"salutation": "Dr",
"givenName": "Alice",
"familyName": "Johnson",
"email": "alice.johnson@example.org",
"accessLevel": "Admin",
"registered": "2025-04-06T09:15:22.000Z",
"lastModified": null,
"emailConfirmed": true,
"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"renewalToken": "88c29e251fa34f40a8b0fd89f839e1a978a34..."
}

Renew Access Token
Endpoint: POST /auth/renew
Description: Obtain fresh access token
Request Cookies: Must include renewalToken cookie
Response: New access and renewal tokens

Invalidate Token
Endpoint: POST /auth/invalidate
Description: Disable a renewal token
Request Body:
{
"token": "token-to-disable"
}

List All Users (Admin only)
Endpoint: GET /auth/users
Description: Retrieve all user profiles
Auth Required: Yes (Admin)
Response: Collection of user objects

Get User Profile
Endpoint: GET /auth/users/{userId}
Description: Fetch specific user details
Auth Required: Yes (Admin or profile owner)
Response: Complete user information

Add New User (Admin only)
Endpoint: POST /auth/users
Description: Register new system user
Auth Required: Yes (Admin)
Request Body:
{
"salutation": "Ms",
"givenName": "Sarah",
"familyName": "Williams",
"email": "sarah.w@example.org",
"secret": "AnotherSecure!789",
"confirmSecret": "AnotherSecure!789",
"accessLevel": "User"
}

Response: Newly created user object

Modify User
Endpoint: PATCH /auth/users/{userId}
Description: Update user information
Auth Required: Yes (Admin or profile owner)
Request Body:
{
"givenName": "Sarah",
"familyName": "Wilson"
}

Response: Updated user details

Remove User
Endpoint: DELETE /auth/users/{userId}
Description: Delete user account
Auth Required: Yes (Admin or profile owner)
Response: Confirmation of deletion

Password Recovery
Endpoint: POST /auth/request-reset
Description: Initiate password recovery
Request Body:
{
"email": "alice.johnson@example.org"
}
Response: Instructions to check email

Verify Reset Token
Endpoint: POST /auth/check-reset-token
Description: Confirm reset token validity
Request Body:
{
"token": "password-reset-code"
}
Response: Token validation status

Complete Password Reset
Endpoint: POST /auth/complete-reset
Description: Finalize password change
Request Body:
{
"token": "password-reset-code",
"newSecret": "BrandNew!123",
"confirmSecret": "BrandNew!123"
}
Response: Password update confirmation