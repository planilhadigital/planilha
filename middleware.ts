import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    
    // Se o usuário está acessando o dashboard e não tem empresa associada (Visitante)
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      const empresasCount = token?.empresasCount as number || 0
      
      // Bloquear e redirecionar visitantes puros para onboarding (exceto se já for rota livre tipo /dashboard/sandbox)
      if (empresasCount === 0 && req.nextUrl.pathname !== "/dashboard/sandbox") {
        return NextResponse.redirect(new URL("/onboarding", req.url))
      }
    }
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
