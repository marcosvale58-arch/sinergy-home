import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/layout-wrapper";

export const metadata: Metadata = {
  title: "SINERGYHOME - Smart Financial & Household Organizer",
  description: "Secure, responsive, and complete high-scale financial technology and household management engine.",
};

import { ErrorBoundary } from "@/components/error-boundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var isExt = function(msg, src, err) {
                  var str = (msg || '') + ' ' + (src || '') + ' ' + (err && err.stack ? err.stack : '');
                  return str.indexOf('chrome-extension://') !== -1 ||
                         str.indexOf('moz-extension://') !== -1 ||
                         str.indexOf('eppiocemhmnlbhjplcgkofciiegomcon') !== -1 ||
                         str.indexOf('M_ID') !== -1;
                };

                var origOnError = window.onerror;
                window.onerror = function(msg, src, line, col, err) {
                  if (isExt(msg, src, err)) {
                    return true;
                  }
                  if (origOnError) return origOnError.apply(this, arguments);
                };

                window.addEventListener('error', function(e) {
                  if (isExt(e.message, e.filename, e.error)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(e) {
                  var reason = e.reason;
                  if (reason && isExt(reason.message, '', reason)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50" suppressHydrationWarning>
        <ErrorBoundary>
          <LayoutWrapper>{children}</LayoutWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}