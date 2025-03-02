import { NextResponse } from 'next/server'

// Define paths that don't require authentication
const PUBLIC_PATHS = [
    '/',
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/api',  // Allow API routes to handle their own auth
    '_next', // Next.js system routes
    'favicon.ico',
    // '/onboarding/company-info',
    // '/onboarding/payment',
]

// Define paths that should redirect to dashboard if authenticated
const AUTH_ONLY_PATHS = [
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/forgot-password',
    '/auth/reset-password',
]

export function middleware(request) {
    const { pathname } = request.nextUrl
    
    // Check for authentication tokens
    const hasAccessToken = request.cookies.has('accessToken')
    const hasRefreshToken = request.cookies.has('refreshToken')
    const isAuthenticated = hasAccessToken || hasRefreshToken
    
    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && AUTH_ONLY_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Allow public paths to pass through
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    // If no tokens present, redirect to login
    if (!isAuthenticated) {
        const url = new URL('/auth/sign-in', request.url)
        url.searchParams.set('returnUrl', pathname)
        return NextResponse.redirect(url)
    }

    // If we have either token, allow the request
    return NextResponse.next()
}

export const config = {
    matcher: [
        // Match all paths except static files and api routes
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ]
}
