import { NextResponse } from 'next/server'

// Define paths that don't require authentication
const PUBLIC_PATHS = [
    '/',
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/forgot-password',
    '/auth/verify-email',
    '/api',  // Allow API routes to handle their own auth
    '_next', // Next.js system routes
    'favicon.ico',
    // '/onboarding/company-info',
    // '/onboarding/payment',
]

export function middleware(request) {
    const { pathname } = request.nextUrl
    
    // Allow public paths to pass through
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    // Check for authentication tokens
    const hasAccessToken = request.cookies.has('accessToken')
    const hasRefreshToken = request.cookies.has('refreshToken')

    // If no tokens present, redirect to login
    if (!hasAccessToken && !hasRefreshToken) {
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
