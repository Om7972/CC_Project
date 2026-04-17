# CloudMart Frontend

React + Vite frontend for the CloudMart multi-vendor marketplace.

## Features

- React 18 with Vite
- React Router for navigation
- React Query (TanStack) for data fetching
- Zustand for state management
- Tailwind CSS for styling
- Socket.io for real-time chat
- Stripe integration for payments
- AWS Cognito authentication
- Responsive design
- Toast notifications

## Setup

1. Copy `.env.example` to `.env.local` and update values
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Project Structure

```
src/
├── pages/          # Page components
├── components/     # Reusable components
├── hooks/          # Custom React hooks
├── store/          # Zustand stores
├── services/       # API and service clients
├── utils/          # Utility functions
├── styles/         # Global styles
└── App.jsx         # Main app component
```

## Key Pages

- `/` - Landing page
- `/products` - Product listing
- `/product/:id` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/login` - Login
- `/register` - Register
- `/vendor` - Vendor dashboard
- `/admin` - Admin panel
- `/profile` - User profile
- `/orders` - Order history
- `/chat` - Chat interface

## Build

```bash
npm run build
```

## Docker

```bash
docker build -t cloudmart-frontend .
docker run -p 5173:5173 cloudmart-frontend
```
