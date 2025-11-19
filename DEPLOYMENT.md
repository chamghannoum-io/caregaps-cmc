# Deployment Guide

This guide covers deploying the Care Gap Management System to various platforms.

---

## 📦 Build for Production

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 3. Preview Locally

```bash
npm run preview
```

Visit `http://localhost:4173` to preview the production build.

---

## 🌐 Deployment Options

### Vercel (Recommended)

**Easy one-click deployment**

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel auto-detects Vite configuration
5. Click "Deploy"

**Or use Vercel CLI:**

```bash
npm install -g vercel
vercel
```

### Netlify

1. Push your code to GitHub
2. Visit [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy"

**Or use Netlify CLI:**

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### GitHub Pages

1. Install gh-pages:

```bash
npm install -D gh-pages
```

2. Update `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

3. Add to `package.json`:

```json
{
  "scripts": {
    "deploy": "vite build && gh-pages -d dist"
  }
}
```

4. Deploy:

```bash
npm run deploy
```

### AWS Amplify

1. Push code to GitHub
2. Visit [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
3. Click "New app" → "Host web app"
4. Connect to GitHub
5. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Click "Save and deploy"

### Azure Static Web Apps

1. Push code to GitHub
2. Visit [Azure Portal](https://portal.azure.com)
3. Create "Static Web App"
4. Connect to GitHub
5. Build configuration:
   - App location: `/`
   - Output location: `dist`
6. Click "Create"

### Cloudflare Pages

1. Push code to GitHub
2. Visit [Cloudflare Pages](https://pages.cloudflare.com/)
3. Click "Create a project"
4. Connect to GitHub
5. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Click "Save and Deploy"

### Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Build and run:

```bash
docker build -t caregaps-cmc .
docker run -p 80:80 caregaps-cmc
```

---

## ⚙️ Environment Variables

If you need environment variables:

1. Create `.env` file:

```env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=Care Gap Management
```

2. Access in code:

```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

3. Configure in deployment platform:
   - **Vercel**: Project Settings → Environment Variables
   - **Netlify**: Site Settings → Environment Variables
   - **Others**: Check platform documentation

---

## 🔒 Security Considerations

### Headers

Add security headers in your deployment platform:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### HTTPS

Always use HTTPS in production. Most platforms enable this by default.

### CSP (Content Security Policy)

Add to your `index.html` or server configuration:

```html
<meta 
  http-equiv="Content-Security-Policy" 
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
>
```

---

## 📊 Performance Optimization

### Compression

Enable gzip/brotli compression on your server or CDN.

### Caching

Set cache headers for static assets:

```
Cache-Control: public, max-age=31536000, immutable
```

### CDN

Use a CDN for faster global delivery:
- Cloudflare
- AWS CloudFront
- Vercel Edge Network (automatic)

---

## 🔍 Monitoring

### Error Tracking

Consider integrating:
- [Sentry](https://sentry.io/)
- [LogRocket](https://logrocket.com/)
- [Rollbar](https://rollbar.com/)

### Analytics

Add web analytics:
- Google Analytics
- Plausible
- Fathom Analytics

### Performance

Monitor with:
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)

---

## 🧪 CI/CD

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🆘 Troubleshooting

### Build Fails

1. Clear cache: `rm -rf node_modules dist && npm install`
2. Check Node version: `node -v` (should be 18+)
3. Check for TypeScript errors: `npm run build`

### Routing Issues

If routes don't work after deployment, configure your platform:

**Vercel** - Create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify** - Create `_redirects` in `public/`:
```
/*    /index.html   200
```

### Blank Page

1. Check browser console for errors
2. Verify base URL in `vite.config.ts`
3. Check that all assets are loading

---

## 📚 Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Deployment Docs](https://react.dev/learn/start-a-new-react-project#deploying-to-production)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)

---

Need help? Check the [main README](./README.md) or open an issue on GitHub.

