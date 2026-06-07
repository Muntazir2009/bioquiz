/**
 * Admin layout — forces dynamic rendering on Cloudflare Workers.
 */
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
