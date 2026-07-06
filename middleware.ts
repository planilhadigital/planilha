import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    
    // Desativado temporariamente a pedido do usuário
    // if (req.nextUrl.pathname.startsWith("/dashboard")) {
    //   const empresasCount = token?.empresasCount as number || 0
    //   if (empresasCount === 0 && req.nextUrl.pathname !== "/dashboard/sandbox") {
    //     return NextResponse.redirect(new URL("/onboarding", req.url))
    //   }
    // }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ["/dashboard/:path*"]
}
