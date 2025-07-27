# replit.md

## Overview
SecureEstate is a comprehensive digital legacy management platform built with a modern full-stack architecture. The application helps users manage their digital assets, establish emergency contacts (nominees), and maintain well-being check-ins to ensure their loved ones can access important information when needed. The system uses a sophisticated monitoring approach where users must periodically confirm their well-being, triggering alerts to designated contacts if they become unresponsive.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with Neon serverless PostgreSQL
- **Authentication**: Replit Auth using OpenID Connect (OIDC)
- **Session Management**: Express sessions with PostgreSQL store

### Key Components

#### Authentication System
- **Provider**: Replit's OIDC authentication system
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Authorization**: Route-level middleware for protecting endpoints
- **Admin Access**: Role-based access for administrative functions

#### Asset Management
- **Asset Types**: Bank accounts, properties, investments, cryptocurrency, and other financial instruments
- **Storage Options**: Local storage, Google Drive, or DigiLocker integration planned
- **CRUD Operations**: Full create, read, update, delete functionality with user ownership validation

#### Well-being Monitoring
- **Check-in System**: Configurable frequency-based health checks (default 24 hours)
- **Alert Escalation**: Progressive alert system with configurable thresholds
- **Status Tracking**: Active, pending, and critical status levels based on missed check-ins

#### Emergency Contact System
- **Nominee Management**: Primary and secondary emergency contacts
- **Contact Information**: Email, phone, and relationship tracking
- **Notification System**: Automated alerts when well-being thresholds are exceeded

### Data Flow

#### User Registration/Authentication Flow
1. User initiates login via Replit OIDC
2. System creates or updates user record in PostgreSQL
3. Session established with PostgreSQL-backed store
4. User profile and preferences synchronized

#### Asset Management Flow
1. User creates/updates asset information through React forms
2. Validation using Zod schemas on both client and server
3. Data persisted to PostgreSQL via Drizzle ORM
4. Real-time UI updates through TanStack Query cache invalidation

#### Well-being Monitoring Flow
1. User configures check-in frequency and alert thresholds
2. System tracks last check-in timestamp and alert counter
3. Background processes (future implementation) monitor overdue check-ins
4. Alert escalation to nominees when thresholds exceeded
5. Manual check-in resets alert counter and updates timestamp

### External Dependencies

#### Core Infrastructure
- **Database**: Neon serverless PostgreSQL for data persistence
- **Authentication**: Replit OIDC service for user management
- **Hosting**: Designed for Replit deployment environment

#### Frontend Libraries
- **UI Components**: Comprehensive Radix UI primitive collection
- **Icons**: Lucide React icon library
- **Styling**: Tailwind CSS with shadcn/ui design system
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns utility library

#### Backend Libraries
- **Database**: Drizzle ORM with Neon serverless adapter
- **Validation**: Zod for runtime type checking and validation
- **Session Management**: Express session with PostgreSQL adapter
- **Authentication**: OpenID Client for OIDC integration

### Deployment Strategy

#### Development Environment
- **Hot Reload**: Vite development server with HMR
- **TypeScript**: Real-time compilation and type checking
- **Database**: Neon serverless PostgreSQL with migration support
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS

#### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: esbuild compilation to ESM format
- **Assets**: Static file serving through Express
- **Database**: Drizzle migrations for schema management

#### Key Architectural Decisions

**Database Choice**: Neon serverless PostgreSQL was chosen for its scalability, built-in connection pooling, and compatibility with Drizzle ORM. This provides robust ACID compliance for sensitive financial data while maintaining serverless benefits.

**Authentication Strategy**: Replit OIDC integration simplifies user management and provides secure authentication without implementing custom user registration/login flows. This reduces security surface area and leverages proven authentication infrastructure.

**State Management**: TanStack Query handles server state with built-in caching, background updates, and optimistic updates. This provides excellent user experience while maintaining data consistency and reducing unnecessary API calls.

**UI Framework**: Shadcn/ui components provide a consistent, accessible design system built on Radix UI primitives. This ensures proper accessibility compliance while maintaining design flexibility through Tailwind CSS customization.

**Monorepo Structure**: Shared schema definitions between client and server ensure type safety across the full stack while maintaining code reuse and consistency in data validation.