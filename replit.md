# SwapDotSo DEX Platform

## Overview

SwapDotSo is a decentralized exchange (DEX) platform built as a full-stack TypeScript application. It provides token swapping, liquidity pool management, and analytics functionality with support for both Balancer and Uniswap V3 pool types. The platform features a modern React frontend with a Node.js/Express backend and PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.
Color scheme: Light theme with specific palette: #000000 (black), #CFFFE2 (mint), #A2D5C6 (sage), #F6F6F6 (light gray).
Footer requirement: Complete footer with social links and navigation sections.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in SPA (Single Page Application) mode
- **Routing**: Wouter for client-side routing with pages for landing, swap, pools, analytics, and docs
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI primitives with custom shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with custom CSS variables for theming and glass morphism effects
- **Color Scheme**: Light theme using specific user palette: black (#000000), mint (#CFFFE2), sage (#A2D5C6), light gray (#F6F6F6)
- **Build Tool**: Vite for fast development and optimized production builds
- **Animations**: Framer Motion for smooth transitions and micro-interactions

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with endpoints for tokens, pools, swaps, and analytics
- **Development Server**: Custom Vite integration for seamless full-stack development
- **Request Logging**: Custom middleware for API request/response logging
- **Error Handling**: Centralized error handling with proper HTTP status codes

### Data Layer
- **Database**: PostgreSQL with connection via environment variable
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema**: Shared TypeScript schema definitions for tokens, pools, swaps, and analytics
- **Validation**: Zod schemas for runtime type validation integrated with Drizzle
- **Storage Interface**: Abstracted storage layer with in-memory mock data for development

### Component Architecture
- **Design System**: Consistent component library built on Radix UI primitives
- **Footer Component**: Professional footer with social links, navigation sections, and company info
- **Modal System**: Centralized modal management for wallet connection, swap confirmation, and settings
- **Form Handling**: React Hook Form with Zod resolvers for type-safe form validation
- **Responsive Design**: Mobile-first approach with proper breakpoint handling
- **Accessibility**: Built-in accessibility features through Radix UI components

### Development Experience
- **Hot Reload**: Vite HMR for instant development feedback
- **Type Safety**: End-to-end TypeScript with strict configuration
- **Path Mapping**: Absolute imports with @ aliases for clean import statements
- **Environment**: Development/production environment handling with proper configurations

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL with `@neondatabase/serverless` driver
- **Connection Management**: Environment-based database URL configuration

### UI and Styling
- **Radix UI**: Comprehensive primitive components for accessible UI building
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Lucide React**: Consistent icon library for the interface
- **Framer Motion**: Animation library for smooth user interactions

### Development Tools
- **Vite**: Build tool with React plugin and custom error overlay integration
- **ESBuild**: Fast bundling for production server builds
- **TypeScript**: Type checking with strict configuration
- **Drizzle Kit**: Database schema management and migration tools

### Third-party Integrations
- **React Query**: Server state management with caching and background updates
- **Date-fns**: Date manipulation and formatting utilities
- **React Hook Form**: Form state management with validation
- **Recharts**: Chart library for analytics visualization

### Replit Integration
- **Replit Plugins**: Custom Vite plugins for enhanced Replit development experience
- **Runtime Error Modal**: Development error overlay for better debugging
- **Cartographer**: Code mapping for improved development workflow