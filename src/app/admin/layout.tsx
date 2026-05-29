/**
 * Admin layout — forces dynamic rendering on Cloudflare Workers.
 * Without this, the /admin route may 404 because the Workers
 * deployment doesn't include static HTML for client-only pages.
 */
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
