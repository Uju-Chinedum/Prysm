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
- Abstreacted functions similar to both signToken and refresh
