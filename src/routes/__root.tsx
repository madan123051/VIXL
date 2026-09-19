import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { FirebaseBoot } from "@/components/firebase-boot";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const APP_NAME = "VIXL";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "VIXL — Visual Excellence Lab. Still, aerial, and moving image. Observed, then understood.",
      },
      { name: "theme-color", content: "#000000" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter+Tight:ital,wght@0,400;0,500;0,600;1,400&family=Syne:wght@500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const desk = pathname.startsWith("/admin");

  return (
    <html lang="en" className="dark antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg">
        <PreviewHostBridge />
        <FirebaseBoot />
        <AuthProvider>
          <TooltipProvider>
            {desk ? null : <Navbar />}
            <Outlet />
            {desk ? null : <Footer />}
            <Toaster
              theme="dark"
              position="bottom-center"
              toastOptions={{
                className:
                  "bg-surface text-fg shadow-[0_0_0_1px_rgb(255_255_255_/_0.08)]",
              }}
            />
          </TooltipProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
