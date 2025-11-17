# PMC Tactical Optimizer - Deployment Guide

## Production Build

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Building for Production

```bash
# Install dependencies
npm install

# Build the production bundle
npm run build
```

The build will create an optimized production bundle in the `dist/` directory.

---

## Deployment Options

### 1. Netlify (Recommended)

Netlify offers the easiest deployment with automatic CI/CD.

#### Steps:

1. **Create Netlify Account**
   - Go to https://netlify.com
   - Sign up or log in

2. **Connect Repository**
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Select the repository

3. **Configure Build Settings**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18 or higher

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy

#### Custom Domain (Optional)
- Go to Site settings → Domain management
- Add your custom domain
- Follow DNS configuration instructions

#### Environment Variables
No environment variables required for base deployment.

---

### 2. Vercel

Vercel provides excellent performance and automatic deployments.

#### Steps:

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via CLI**
   ```bash
   vercel
   ```
   Follow the prompts to configure your project.

3. **Or Deploy via Web Dashboard**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your Git repository
   - Vercel auto-detects Vite configuration
   - Click "Deploy"

#### Build Configuration
Vercel automatically detects the Vite framework. No additional configuration needed.

---

### 3. SiteGround (or any Static Host)

For traditional hosting providers like SiteGround.

#### Steps:

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Upload Files**
   - The `dist/` folder contains all production files
   - Upload contents of `dist/` to your web server root directory (usually `public_html/`)

3. **Via FTP/SFTP**
   - Connect to your SiteGround FTP/SFTP
   - Navigate to `public_html/` (or your domain's root)
   - Upload all files from `dist/` directory
   - Ensure file permissions are correct (644 for files, 755 for directories)

4. **Via SiteGround File Manager**
   - Log into SiteGround cPanel
   - Open File Manager
   - Navigate to `public_html/`
   - Upload the `dist/` folder contents
   - Extract if uploaded as zip

5. **Configure .htaccess** (for single-page app routing)
   Create/update `.htaccess` in your root directory:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

## Performance Optimization

### Included Optimizations
- ✅ Code splitting (vendor, animations, dnd, icons)
- ✅ Minification and compression
- ✅ Tree shaking
- ✅ Lazy loading components
- ✅ Optimized images
- ✅ Console logs removed in production
- ✅ Source maps disabled

### Additional Optimizations
1. **Enable CDN** (Netlify/Vercel do this automatically)
2. **Enable Gzip/Brotli Compression** (enabled by default on modern hosts)
3. **Set Cache Headers** (configured automatically on Netlify/Vercel)

---

## Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Verify responsive design on mobile/tablet/desktop
- [ ] Test squad management (add/edit/delete players)
- [ ] Test player notes modal
- [ ] Test lineup builder
- [ ] Test in-game substitution optimizer
- [ ] Test set-piece planner
- [ ] Test drag-and-drop functionality
- [ ] Test data import/export
- [ ] Verify local storage persistence
- [ ] Test all animations and transitions
- [ ] Check console for errors

---

## Monitoring & Maintenance

### Analytics (Optional)
Add Google Analytics or similar by adding the tracking code to `index.html`.

### Error Tracking (Optional)
Consider integrating Sentry or LogRocket for production error tracking.

### Updates
1. Make changes to your code
2. Test locally with `npm run dev`
3. Build with `npm run build`
4. Deploy (automatic on Netlify/Vercel, manual upload for SiteGround)

---

## Technical Support

For PMC Tactical Optimizer support:
- Documentation: Check project README.md
- Issues: Create GitHub issue in repository
- Contact: Peak Mentality Coach

---

## Build Specifications

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3
- **Animations:** Framer Motion
- **Drag & Drop:** dnd-kit
- **Icons:** Lucide React
- **Routing:** React Router 6

---

**Last Updated:** 2025-11-17
**Version:** 1.0.0 Production
