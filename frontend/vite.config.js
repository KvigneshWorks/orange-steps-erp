import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base is conditional on command: local `vite`/`vite dev` (your XAMPP-served
// /tesseract/ dev setup) stays exactly as before — only `vite build`
// (production) switches to '/' because the live site is deployed straight
// into public_html/public/ and served from the domain root (whitenode.in/),
// not under a /whitenode/ or /tesseract/ subpath. A non-root base here would
// make every built JS/CSS asset URL 404 on the live site.
export default defineConfig(({ command }) => ({
    plugins: [
        react(),
        tailwindcss(),
    ],
    base: command === 'build' ? '/' : '/tesseract/',
    // Strip noisy dev-only console.log/console.debug calls from the
    // production bundle only -- console.error/console.warn are left in
    // place so real problems are still visible in the browser console on
    // the live site.
    esbuild: command === 'build' ? {
        pure: ['console.log', 'console.debug'],
    } : undefined,
    build: command === 'build' ? {
        rollupOptions: {
            output: {
                // React/ReactDOM change far less often than the app's own
                // pages. Splitting them into their own chunk means a
                // returning visitor's browser can keep serving React from
                // the long-lived cache already set in public/.htaccess
                // across ordinary deploys that only touch page code,
                // instead of re-downloading React on every release.
                manualChunks(id) {
                    if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
                        return 'vendor-react';
                    }
                },
            },
        },
    } : undefined,
    server: {
        port: 5173,
        strictPort: true,
        hmr: { overlay: false },
        proxy: {
            '/tesseract/api': {
                target: 'http://localhost/tesseract/public',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/tesseract/, ''),
            }
        }
    }
}))
