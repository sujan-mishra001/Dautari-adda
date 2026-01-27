# Dautari Adda Frontend

React + TypeScript + Vite frontend for the Dautari Adda Restaurant Management System.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Common components (Header, Footer, etc.)
│   │   ├── layout/         # Layout components
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin-specific pages
│   │   │   ├── Dashboard.tsx
│   │   │   └── ...
│   │   ├── restaurant/     # Restaurant operations pages
│   │   │   ├── POS.tsx
│   │   │   ├── KOT.tsx
│   │   │   ├── Menu.tsx
│   │   │   └── ...
│   │   ├── shared/         # Shared pages across roles
│   │   │   ├── Settings.tsx
│   │   │   └── ...
│   │   └── worker/         # Worker-specific pages
│   ├── context/            # React context providers
│   │   └── AuthContext.tsx
│   ├── services/           # API service layer
│   │   └── api.ts
│   ├── assets/             # Static assets (images, fonts, etc.)
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
│
├── public/                 # Public static files
├── dist/                   # Production build output (generated)
├── node_modules/           # Dependencies (generated)
│
├── index.html              # HTML template
├── package.json            # NPM dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── eslint.config.js        # ESLint configuration
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file (optional):
   ```env
   VITE_API_URL=http://localhost:8000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 📦 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🎨 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Material-UI (MUI)** - React component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests

## 🔐 User Roles & Routes

The application supports role-based access control:

### Admin Routes
- `/dashboard` - Admin dashboard with analytics
- `/reports` - Generate and view reports
- `/settings` - System settings and configuration
- All restaurant and worker routes

### Restaurant Routes (Admin + Restaurant Staff)
- `/pos` - Point of Sale system
- `/kot` - Kitchen Order Tickets management
- `/menu` - Menu management
- `/inventory` - Inventory tracking
- `/purchase` - Purchase orders and suppliers
- `/customers` - Customer management
- `/orders` - Order history and management
- `/sessions` - Session management

### Worker Routes (Admin + Workers)
- `/pos` - Limited POS access for order taking

## 🏗️ Architecture

### Component Organization

- **Pages**: Top-level route components organized by role
- **Components**: Reusable UI components used across pages
- **Context**: Global state management using React Context
- **Services**: API communication layer

### State Management

- **AuthContext**: User authentication and authorization state
- **Local State**: Component-level state using `useState` and `useReducer`

### API Integration

All API calls are centralized in `src/services/api.ts`:
- Axios instance with base URL and interceptors
- Token-based authentication
- Error handling
- Request/response transformation

## 📱 Mobile Responsiveness

The UI is designed to be mobile-responsive following these principles:
- Mobile-first approach
- Breakpoints aligned with Material-UI standards
- Touch-friendly UI elements
- Optimized layouts for different screen sizes

## 🔧 Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent naming conventions:
  - Components: PascalCase
  - Files: PascalCase for components, camelCase for utilities
  - Variables/Functions: camelCase

### Type Safety

- Define proper TypeScript interfaces for data models
- Use type inference where possible
- Avoid `any` type unless absolutely necessary

### Component Structure

```tsx
import React from 'react';
import { ComponentProps } from './types';

const MyComponent: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  
  return (
    // JSX
  );
};

export default MyComponent;
```

## 🐛 Debugging

- Use React DevTools for component inspection
- Check browser console for errors
- Use Network tab to debug API calls
- Enable source maps in development

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Test your changes
5. Create a pull request

## 📞 Support

For issues or questions, contact the development team.
