# Deployment Guide

## 🚀 Deploy to Vercel

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin master
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your `caregaps-cmc` repository
   - Configure environment variables (see below)
   - Click "Deploy"

### Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_BUCKET=patients
```

### How It Works

The app uses **Vercel Serverless Functions** for the proxy:
- `/api/webhook` - Proxies requests to n8n webhook
- `/api/resume` - Proxies resume requests to n8n

No separate proxy server needed! ✨

---

## 🏠 Local Development

### With Local Proxy (Old Method)

If you prefer the local proxy server:

1. Create `.env` file:
   ```
   VITE_SUPABASE_ANON_KEY=your_key
   VITE_SUPABASE_BUCKET=patients
   VITE_PROXY_URL=http://localhost:3002
   ```

2. Start proxy server:
   ```bash
   node proxy-server.cjs
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

### With Vercel Dev (Recommended)

Test the serverless functions locally:

```bash
npm install -g vercel
vercel dev
```

This runs both the frontend and API routes locally!

---

## 🌐 Alternative Hosting

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variables
4. Note: You'll need to deploy the proxy separately (Render/Railway)

### Cloudflare Pages

1. Build command: `npm run build`
2. Output directory: `dist`
3. Add environment variables
4. Note: Convert API routes to Cloudflare Workers

---

## 🔧 Troubleshooting

### CORS Errors

If you see CORS errors:
- Check that your n8n instance allows requests from your Vercel domain
- Verify the webhook URLs are correct
- Check browser console for details

### API Routes Not Working

- Ensure `vercel.json` exists in root directory
- Check Vercel deployment logs
- Verify API routes are in `/api` folder

### Environment Variables

- Vercel requires `VITE_` prefix for client-side variables
- Redeploy after changing environment variables
- Check Settings → Environment Variables in Vercel dashboard

---

## ✅ Checklist Before Deploy

- [ ] Environment variables set in Vercel
- [ ] n8n webhook URL is accessible
- [ ] Supabase credentials are correct
- [ ] Git repository is up to date
- [ ] Build completes successfully locally (`npm run build`)

---

## 📝 Notes

- Vercel serverless functions have a 10-second timeout on hobby plan
- API routes automatically handle CORS
- No need to run separate proxy server
- Automatic HTTPS included
