# Overview

EduManage is a comprehensive education management system built as a full-stack web application. It provides a centralized platform for managing students, classes, attendance, fees, homework, and announcements within an educational institution. The system supports multiple user roles (tutors, students, parents) with role-based access control and authentication.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Development**: tsx for TypeScript execution in development mode
- **Production**: esbuild for fast bundling and ESM module format
- **API Design**: RESTful endpoints with consistent error handling and request logging
- **Middleware**: Custom logging middleware for API request monitoring

## Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless database hosting
- **ORM**: Drizzle ORM for type-safe database queries and schema management
- **Schema**: Comprehensive relational schema with tables for users, students, classes, attendance, fees, homework, homework submissions, and announcements
- **Migrations**: Drizzle Kit for database migrations and schema updates
- **Connection**: Environment-based database URL configuration with connection pooling

## Authentication and Authorization
- **Authentication**: Simple email/password authentication with role-based login
- **Session Management**: Client-side session storage using localStorage
- **Authorization**: Role-based access control supporting tutor, student, and parent roles
- **Security**: Password-based authentication with role validation on login

## External Dependencies
- **Database Hosting**: Neon Database (PostgreSQL-compatible serverless database)
- **Development Tools**: Replit integration with development banner and cartographer plugin
- **UI Framework**: Radix UI primitives for accessible component foundation
- **Form Validation**: Zod for runtime type validation and schema definition
- **Date Handling**: date-fns for date manipulation and formatting
- **Styling**: Tailwind CSS with PostCSS for CSS processing

## Key Design Patterns
- **Monorepo Structure**: Shared schema definitions between client and server
- **Type Safety**: End-to-end TypeScript with shared types and validation schemas
- **Component Architecture**: Modular UI components with separation of concerns
- **Query Caching**: Optimistic updates and background refetching with React Query
- **Error Handling**: Centralized error handling with user-friendly toast notifications
- **Responsive Design**: Mobile-first responsive design with Tailwind CSS utilities