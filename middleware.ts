import { withAuth } from "next-auth/middleware";

export default withAuth({
  // Must match authOptions.pages so the middleware redirects to /login,
  // not the default /api/auth/signin which creates an absolute-URL redirect loop.
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  // Protect all /dashboard/** routes — public pages are unaffected
  matcher: ["/dashboard/:path*"],
};
