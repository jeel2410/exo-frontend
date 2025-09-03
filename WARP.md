# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
- **Start development server**: `npm run dev` (uses Vite)
- **Build for production**: `npm run build` (TypeScript compilation + Vite build)
- **Preview production build**: `npm run preview`
- **Lint code**: `npm run lint` (uses ESLint)

### Testing
This project does not appear to have automated tests configured yet.

### Deployment
- **Firebase deployment**: `firebase deploy` (deploys to Firebase Hosting)
- Build artifacts are in `dist/` folder

## High-Level Architecture

### Application Type
This is a **React-based admin dashboard** for ExoTrack, a project and contract management system. The app supports two primary user roles:
- **Project Managers** - create and manage projects
- **Users/Contractors** - create contracts and requests within projects

### Technology Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS 4.0
- **State Management**: React Context (AuthContext, SidebarContext, LoaderProvider)
- **Data Fetching**: TanStack Query + Axios
- **Routing**: React Router 7 with role-based route protection
- **Internationalization**: i18next (English/French support)
- **Hosting**: Firebase Hosting

### Authentication & Authorization
- **Authentication**: Custom token-based auth stored in localStorage
- **Authorization**: Role-based routing with two user types:
  - `project_manager`: Access to project management features
  - `user`: Access to contractor features (contracts, requests)
- **Route Protection**: 
  - `PublicRoute`: For unauthenticated users
  - `ProtectedRoute`: For any authenticated user
  - `RoleBasedRoute`: For specific user roles

### API Architecture
- **Base URL**: `https://exotrack.makuta.cash/api/V1`
- **Service Layer**: Centralized in `src/services/`
  - `apibase.service.ts`: Axios instances (guest + authorized)
  - Individual services for different domains (auth, project, contract, etc.)
- **Auth Header**: Uses custom `VAuthorization` header (not standard `Authorization`)

### Key Application Flows

#### Project Manager Flow
1. Sign in → Project Dashboard (`/project-dashboard`)
2. Create/manage projects (`/project-create`, `/edit-project/:id`)
3. View project details and associated contracts/requests
4. Review and approve contractor requests

#### Contractor/User Flow
1. Sign in → Requests Dashboard (`/requests`)
2. Browse available projects (`/contract-project-list`)
3. Create contracts for projects (`/create-contract/:projectId`)
4. Submit requests against contracts (`/add-request/:projectId/:contractId`)
5. Track request status and history

### Component Architecture
- **Atomic Design**: Components organized in `lib/components/atoms` and `molecules`
- **Domain Components**: Feature-specific components in `components/dashboard/`
- **Layout System**: `AppLayout` with sidebar navigation and responsive design
- **Common Components**: Reusable UI components in `components/common/`
- **Skeleton Loading**: Comprehensive skeleton system for all major views

### Data Management
- **Local Storage**: User session, preferences, and temporary data
- **React Query**: Server state management and caching
- **Context API**: Global application state (auth, sidebar, loading)

### Internationalization
- **Languages**: English (default) + French
- **Translation Files**: `public/locales/en.json` and `fr.json`
- **Implementation**: i18next with browser language detection

### Important File Locations
- **Main Entry**: `src/main.tsx`
- **Route Configuration**: `src/App.tsx` (comprehensive role-based routing)
- **Services**: `src/services/` (API layer)
- **Contexts**: `src/context/` (global state)
- **Layout**: `src/layout/AppLayout.tsx` (main app shell)
- **Localization**: `public/locales/` (translation files)

### Development Notes
- Uses Vite for fast development and building
- SVG icons are handled via vite-plugin-svgr
- Custom PostCSS configuration for TailwindCSS
- Firebase hosting configuration included
- Project uses newer React 19 features

### Key Business Logic
The application centers around a **Project → Contract → Request** hierarchy:
1. Project Managers create Projects
2. Contractors create Contracts linked to Projects  
3. Contractors submit Requests linked to Contracts
4. Requests go through review/approval workflow with status tracking
