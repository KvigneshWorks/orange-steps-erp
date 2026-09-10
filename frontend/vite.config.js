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
