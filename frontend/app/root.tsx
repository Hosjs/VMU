import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    // ScrollRestoration, // TẮT TẠM để test
} from "react-router";

import type { Route } from "./+types/root";
// import { PageTransitionProvider } from "./components/PageTransition"; // TẮT TẠM để test
import { AuthProvider } from "./contexts/AuthContext";
import "./app.css";

export const links: Route.LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
];

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <Meta />
            <Links />
        </head>
        <body
            className="min-h-screen relative"
            style={{
                backgroundImage: 'url("/images/background-app.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
        {/* Global Background Overlay */}
        <div
            className="fixed inset-0 bg-white/70 backdrop-blur-sm"
            style={{ zIndex: -1 }}
        ></div>

        <AuthProvider>
            {/* TẮT TẠM PageTransition và ScrollRestoration để test */}
            {children}
        </AuthProvider>
        {/* <ScrollRestoration /> */}
        <Scripts />
        </body>
        </html>
    );
}

export default function App() {
    console.log('🔄 App component rendering at:', new Date().toISOString());
    return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Oops!";
    let details = "An unexpected error occurred.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error";
        details =
            error.status === 404
                ? "The requested page could not be found."
                : error.statusText || details;
    } else if (error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="container mx-auto p-4 pt-16">
            <h1 className="text-2xl font-bold">{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
            )}
        </main>
    );
}