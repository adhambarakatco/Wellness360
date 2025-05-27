import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define paths that don't require authentication
const publicPaths = [
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
]

// Define paths that are always accessible even when authenticated
const alwaysAccessible = ['/', '/about', '/features']

// Define protected paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/settings',
]

export async function middleware(request: NextRequest) {
  
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }  

  // Check if the path is public, always accessible, or protected
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  const isAlwaysAccessible = alwaysAccessible.some(path => pathname === path)
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path)) || 
                          (!isPublicPath && !isAlwaysAccessible)
  
  // Get the tokens from cookies
  const token = request.cookies.get('access_token')?.value
  const isProfileCompleted = request.cookies.get('isProfileCompleted')?.value

  // If the path is public and user is authenticated, redirect to dashboard
  if (isPublicPath && token && !isAlwaysAccessible) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If the path is protected and user is not authenticated, redirect to login
  if (isProtectedPath && !token) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.set('redirectTo', pathname, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
    return response
  }

  // If user is authenticated but profile is not completed
  if (token && isProfileCompleted === 'false') {
    // Allow access to complete-profile page
    if (pathname === '/complete-profile') {
      return NextResponse.next()
    }
    // Redirect to complete-profile for all other protected paths
    if (isProtectedPath) {
      return NextResponse.redirect(new URL('/complete-profile', request.url))
    }
  }

  // If trying to access complete-profile when profile is already completed
  if (pathname === '/complete-profile' && token && isProfileCompleted !== 'false') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Configure paths that trigger the middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth|videos|images).*)',
  ],
}