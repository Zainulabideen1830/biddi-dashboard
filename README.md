# Biddi Web App - Authentication System

## Overview

The Biddi Web App uses a robust authentication system that combines client-side state management with server-side validation to ensure secure and reliable user authentication.

## Authentication Architecture

### Key Components

1. **Auth Store (Zustand)**
   - Manages authentication state (tokens, user data)
   - Handles token refresh
   - Provides authenticated API fetch utilities
   - Implements periodic validation of authentication state

2. **AuthInitializer**
   - Initializes authentication state on app load
   - Validates existing authentication from localStorage

3. **AuthGuard**
   - Protects routes based on authentication status
   - Enforces business rules (email verification, company info, subscription)
   - Redirects users to appropriate pages based on their onboarding status

4. **API Client**
   - Integrates with the auth store
   - Automatically handles token refresh
   - Validates authentication state before making API calls

### Authentication Flow

1. **Initial Load**
   - AuthInitializer checks for existing authentication in localStorage
   - If found, validates with server via `/api/auth/me` endpoint
   - Sets up periodic validation

2. **Login**
   - User credentials are validated against the server
   - On success, tokens and user data are stored in the auth store
   - Auth store persists this data to localStorage

3. **Protected Routes**
   - AuthGuard checks authentication status before rendering protected content
   - If authentication is invalid or missing, redirects to login

4. **API Calls**
   - API client checks token validity before making requests
   - Automatically refreshes tokens when needed
   - Handles authentication failures gracefully

5. **Periodic Validation**
   - Auth state is validated periodically (every 5 minutes by default)
   - Ensures that deleted users or revoked tokens are detected

6. **Logout**
   - Clears authentication state from both client and server
   - Invalidates refresh tokens on the server

## Security Features

- **Token Validation**: Authentication tokens are validated with the server before use
- **Automatic Token Refresh**: Access tokens are automatically refreshed when expired
- **Server Synchronization**: Client auth state is kept in sync with server state
- **Secure Storage**: Tokens are stored in localStorage with appropriate security measures
- **Periodic Validation**: Regular checks ensure authentication remains valid

## Benefits Over Previous Implementation

1. **Improved Security**:
   - Regular validation prevents access with deleted accounts or revoked tokens
   - Server-side validation ensures authentication integrity

2. **Better User Experience**:
   - Seamless token refresh without disrupting the user
   - Appropriate redirects based on authentication status

3. **Architectural Improvements**:
   - Clear separation of concerns between components
   - Consistent authentication state across the application
   - Reduced redundancy in authentication logic

4. **Maintainability**:
   - Centralized authentication logic in the auth store
   - Well-documented code with clear responsibilities
   - Easier to extend or modify authentication behavior

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
