import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import nextConfig from '../next.config'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('firebaseIdToken');

  console.log(`[Middleware] Path: ${pathname}, Token found: ${!!token?.value}`);

  // --- i18n functionality is commented out as requested ---
  // const { i18n } = nextConfig;
  // if (i18n) {
  //     const pathnameIsMissingLocale = i18n.locales.every(
  //       (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  //     )
    
  //     if (pathnameIsMissingLocale) {
  //       const locale = i18n.defaultLocale
  //       return NextResponse.redirect(
  //         new URL(
  //           `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
  //           request.url
  //         )
  //       )
  //     }
  // }


  // --- Authentication ---
  const isAuthPage = pathname.startsWith('/login');

  if (!token && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url)
    console.log('[Middleware] No token on dashboard route, redirecting to /login');
    return NextResponse.redirect(loginUrl)
  }

  if (token && isAuthPage) {
     const dashboardUrl = new URL('/dashboard', request.url)
     console.log('[Middleware] Token found on login route, redirecting to /dashboard');
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
