# Prysm Build Log

## 19-02-2026

- Started modeling the tables
- Creating the register function

## 21-02-2026

- Added AuthModule with JWT support
- Implemented signup functionality in AuthController and AuthService
- Updated Prisma schema and created initial migration for PostgreSQL
- Added Prisma adapter and enhanced PrismaService
- Set global API prefix and CORS settings in main.ts
- Extended Express Request type to include user information
- Updated README to reflect new migration commands and ORM usage
- Created .env.example for environment variables
- Updated .gitignore for Prisma generated files
- Removed unused DTOs and entities
- Changed license from UNLICENSED to MIT

## 23-02-2026

- Implemented signin functionality
- Created a simple homepage
- Removed accessToken from signup and signin response
- Built interfaces for models
- Refactored signToken function to return User interface
- Modelled error log
- Built exception filter and applied it
- Built user guard and jwt strategy
- Implemented refresh function to refresh access tokens and get new refresh token
- Abstracted functions similar to both signToken and refresh
- Built refresh token model to accomodate multiple refresh tokens per user for multiple devices
- Changed system to use jti (JWT ID) for refresh token lookup
- Implemented signout functionality

## 24-02-2026

- Implemented getMe functionality to get user profile
- Created a CurrentUser decorator so controller does not depend on Request and service does not know about HTTP
- Built a new interface for authenticated users so as not to send back full user data
- Built global response shapes for success and error responses
- Implemented updateMe and deleteMe
- Implemented organization creation and assigned user who created it with OWNER role
