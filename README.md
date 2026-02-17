# Prysm

## Overview

Prysm is a multi-tenant project management SaaS backend built with NestJS.
It allows organizations to manage projects, tasks, and team members efficiently while enforcing role-based access control and multi-tenancy.

**Key features:**

- Multi-tenant architecture with organization-level data isolation
- Role-based access (Owner, Admin, Member)
- Project and task management with deadlines and assignments
- Audit logging and soft deletes for compliance

## Problem

Many teams struggle with organizing projects, tasks, and team collaboration in a single system while keeping sensitive data isolated per organization.

Existing SaaS solutions are either too heavy, lack multi-tenancy in their API, or do not provide fine-grained role-based access. Prysm addresses these issues by providing:

- Clear separation of data per organization
- Role-based permissions
- Extensible API that can integrate with modern frontend apps or mobile clients

## Architecture

Prysm follows a modular NestJS architecture with a focus on maintainability and scalability:

- **Modules:** Auth, Users, Organizations, Projects, Tasks
- **Multi-Tenancy:** Single database with `organizationId` scoped tables
- **Access Control:** Guards and custom decorators enforce role-based permissions
- **Background Jobs:** Redis + Bull for asynchronous tasks (e.g., notifications, emails)

## Tech Stack

- **Backend Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** Prisma or Sequelize
- **Caching / Queues:** Redis + Bull
- **Authentication:** JWT (Access + Refresh Tokens), Cookies

## Getting Started

### Prerequisites

- Node.js >= 20
- PostgreSQL >= 15
- Redis server (local or cloud)

### Installation

```sh
git clone https://github.com/Uju-Chinedum/Prysm.git
cd prysm
npm install
```

### Environment Variables

See `.env,example` file at root of project and add them to your `.env` file.

### Running Locally

```sh
npm run migrate:dev:up   # Run database migrations
npm run start:dev # Start NestJS in development mode
```

## API Documentation

**Base URL:** `/api/v1`

## License

MIT License © 2026 Uju Chinedum
