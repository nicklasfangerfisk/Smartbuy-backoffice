# SmartBack Inventory System

## Overview

SmartBack is a comprehensive inventory management system built with React, TypeScript, Material-UI (Joy UI), and Supabase. This documentation provides everything you need to set up, develop, and maintain the application.

## Quick Start

### Local Development

For the best local development experience (frontend + API routes + environment parity), always use:

```bash
vercel dev
```

- This runs both the Vite frontend and Vercel API endpoints together
- All API routes are available at `/api/*` as in production
- Environment variables and routing match your deployed Vercel environment
- Hot reloading and HMR work out of the box **only with `npm run dev`** (frontend only)

**Note:**
- When using `vercel dev`, you may see Vite websocket/HMR errors in the browser console. This is expected—Vercel does not support Vite's native HMR websocket. Your app and API routes will still work; just refresh the page to see changes.
- Use `npm run dev` only for frontend-only rapid development (no API routes).

### Available Scripts

```bash
# Development
npm run dev          # Frontend development server (Vite)
vercel dev          # Full-stack development (recommended)

# Build
npm run build       # Production build
npm run preview     # Preview production build

# Release Management
npm run auto-release # Automated release with versioning
npm run patch       # Quick patch release
npm run minor       # Quick minor release  
npm run major       # Quick major release

# Type Generation
npm run update-types # Update Supabase types
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: Material-UI Joy UI
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel
- **Build Tool**: Vite
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)

## Project Structure

```
/src
├── App.tsx                    # Root component
├── main.tsx                   # Entry point
├── auth/                      # Authentication components
├── navigation/                # Navigation components  
├── Page/                      # Page components (main views)
├── Dialog/                    # Reusable modal components
├── utils/                     # Utility functions
├── api/                       # API functions
├── hooks/                     # Custom React hooks
├── general/                   # Type definitions
└── components/                # Shared UI components
/migrations                    # Database migrations
/documentation                 # Project documentation
```

## Environment Setup

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up environment variables** (see `supabase-setup.md`)
4. **Apply database migrations** (see `supabase-setup.md`)
5. **Start development server**: `vercel dev`

## Documentation Structure

- **01-setup/**: Setup guides and configuration
- **02-architecture/**: Application structure and design patterns
- **03-features/**: Feature documentation and specifications
- **04-ui-ux/**: User interface and experience guidelines
- **05-development/**: Development workflows and tools
- **06-guides/**: Step-by-step guides for common tasks
- **07-legacy/**: Archived documentation and status files

## Getting Help

- Check the specific documentation sections for detailed information
- Review the guides section for step-by-step instructions
- Consult the architecture documentation for technical details
- Refer to the legacy section for historical context

## Next Steps

1. **Setup**: Follow the setup guides in `01-setup/`
2. **Architecture**: Understand the application structure in `02-architecture/`
3. **Features**: Explore feature documentation in `03-features/`
4. **Development**: Learn development workflows in `05-development/`
