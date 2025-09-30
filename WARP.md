# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Development Commands

### Development and Building
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compilation then Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code linting

### TypeScript
- `npx tsc -b` - Run TypeScript compiler check only
- Files use TypeScript with multiple tsconfig files (tsconfig.json, tsconfig.app.json, tsconfig.node.json)

## Architecture Overview

### Tech Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6 with React plugin and SVGR for SVG imports
- **Routing**: React Router v7 with BrowserRouter
- **Styling**: Tailwind CSS 4 with PostCSS
- **State Management**: React Tanstack Query for server state, React Context for local state
- **Authentication**: Custom auth system with localStorage and JWT tokens
- **Forms**: Formik with Yup validation
- **Icons**: React Icons, country flag icons
- **Internationalization**: i18next with browser language detection and HTTP backend

### Project Structure
- `src/components/` - Organized by feature areas (dashboard, header, modal, table, common)
- `src/pages/` - Page components organized by domain (Auth, Dashboard, user, OtherPage)
- `src/services/` - API service classes for different domains (auth, project, contract, etc.)
- `src/hooks/` - Custom React hooks (useUser, useModal, useRoleRoute, etc.)
- `src/context/` - React contexts (AuthContext, LoaderProvider, SidebarContext)
- `src/utils/` - Utility functions and route protection components
- `src/types/` - TypeScript type definitions

### Authentication Architecture
- Uses custom AuthContext provider with role-based access control
- Two user types: "project_manager" and "user"
- Route protection via ProtectedRoute (authentication) and RoleBasedRoute (authorization)
- API requests use two axios instances: guestRequest and authorizedRequest
- Tokens stored in localStorage with custom VAuthorization header

### API Architecture
- Base URL: `https://exotrack.makuta.cash/api/V1`
- ApiBaseService class provides configured axios instances
- Service classes for each domain (auth, project, contract, request, etc.)
- Custom authorization header: `VAuthorization: Bearer {token}`
- Centralized localStorage management via LocalStorageService

### Key Features
- Role-based routing with different dashboards per user type
- Project management system with contracts and requests
- Multi-language support (English/French) with dynamic loading
- File upload capabilities with drag-and-drop
- Rich text editing with multiple editor options (TinyMCE, Tiptap, React Quill)
- Data visualization with ApexCharts
- Calendar functionality with FullCalendar
- Toast notifications with react-toastify

### Development Notes
- Uses ESM modules with top-level await support
- SVG imports configured as React components via vite-plugin-svgr
- Package overrides configured for React 19 compatibility
- Includes i18n configuration for internationalization
- Firebase configuration present (.firebaserc, firebase.json)

### Amount Formatting Standards
- **Always use `formatAmount()` from `src/utils/numberFormat.ts` for displaying monetary amounts**
- Format: French thousands separator (space) with English decimal separator (dot)
- Example: 10000.50 displays as "10 000.50" (not "10,000.50" or "10 000,50")
- Always shows exactly 2 decimal places
- DashBoardCard components automatically format amounts passed to the `count` prop
