# Football Optimizer

A comprehensive football lineup optimizer and substitution manager built by **Peak Mentality Coach**.

![Football Optimizer](https://img.shields.io/badge/version-1.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.2.2-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

### 🎯 Core Features
- **Player Management** - Add, edit, and manage your team roster with detailed player profiles
- **Lineup Builder** - Create and optimize starting lineups with multiple formation options
- **Live Game Manager** - Track game time, manage substitutions, and get real-time suggestions
- **Set Pieces** - Plan and save corner kicks, free kicks, and throw-in layouts
- **Smart Optimizer** - AI-powered substitution suggestions based on player constraints

### ⚡ Advanced Features
- **Player Notes System**
  - Mark players as injured or unavailable
  - Set minutes limits for individual players
  - Define safe positions for each player
  - Exclude specific players from auto-optimizer
  - Add custom notes and constraints

- **Drag-and-Drop Interface**
  - Intuitive player positioning with dnd-kit
  - Visual formation editor
  - Real-time lineup updates

- **Multiple Formations**
  - 4-3-3
  - 4-4-2
  - 3-5-2
  - 4-2-3-1
  - 3-4-3

- **Data Persistence**
  - Local storage for all data
  - Export/Import functionality
  - Backup and restore capabilities

### 🎨 UI/UX
- Peak Mentality Coach branding
- Montserrat typography
- Responsive design (mobile, tablet, desktop)
- Smooth animations with Framer Motion
- Professional color scheme

## Tech Stack

- **Frontend Framework**: React 18.2 + TypeScript
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.3
- **Drag & Drop**: @dnd-kit/core
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM 6.20

## Installation

### Prerequisites
- Node.js 16+ and npm/yarn installed
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/PeakMentalityCoach/Quick-Substitution-app.git
   cd Quick-Substitution-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   Navigate to http://localhost:3000
   ```

## Development

### Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build production-ready app to `/dist`
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

### Project Structure

```
Quick-Substitution-app/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── PMCLogo.tsx
│   │   ├── Navigation.tsx
│   │   ├── Sidebar.tsx
│   │   ├── PlayerCard.tsx
│   │   ├── PlayerForm.tsx
│   │   ├── NotesModal.tsx
│   │   ├── PositionGrid.tsx
│   │   ├── DraggablePlayer.tsx
│   │   ├── DroppablePosition.tsx
│   │   ├── SubstitutionPanel.tsx
│   │   ├── PlayerManager.tsx
│   │   └── FormationSelector.tsx
│   ├── pages/           # Page components
│   │   ├── Dashboard.tsx
│   │   ├── LineupPage.tsx
│   │   ├── GamePage.tsx
│   │   ├── SetPiecesPage.tsx
│   │   └── SettingsPage.tsx
│   ├── hooks/           # Custom React hooks
│   │   └── useAppContext.tsx
│   ├── utils/           # Utility functions
│   │   ├── optimizer.ts
│   │   ├── storage.ts
│   │   ├── formations.ts
│   │   └── helpers.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── styles/          # Global styles
│   │   └── index.css
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Deployment

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Or use Netlify Dashboard**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Deploy!

### Deploy to Vercel

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy via Vercel CLI**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Or use Vercel Dashboard**
   - Import GitHub repository
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - Deploy!

### Deploy to SiteGround (or any cPanel host)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Upload to host**
   - Connect via FTP/SFTP to your hosting
   - Upload all files from the `dist/` folder to your `public_html/` or app directory
   - Ensure `.htaccess` file is configured for SPA routing:

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

3. **Configure domain**
   - Point your domain to the deployment directory
   - Access via your domain URL

### Environment Variables

This app doesn't require any environment variables or backend services. All data is stored locally in the browser using `localStorage`.

## Usage Guide

### 1. Getting Started
1. Open the app and go to **Settings**
2. Add your team name and coach name
3. Add players to your roster with their positions and skill levels
4. Set player notes (injuries, minutes limits, safe positions)

### 2. Building a Lineup
1. Navigate to **Lineup** page
2. Select your preferred formation
3. Click **Auto-Optimize** to let the optimizer build the best lineup
4. Or manually drag players to positions
5. Lineup is automatically saved

### 3. Managing a Game
1. Go to **Game** page
2. Click **Start** to begin the game clock
3. Click **Get Substitution Suggestions** to see optimizer recommendations
4. Apply suggestions with one click
5. Track substitutions used and game time

### 4. Planning Set Pieces
1. Visit **Set Pieces** page
2. Create new set piece layouts
3. Name them (e.g., "Corner Left", "Free Kick Center")
4. Save for quick reference during games

### 5. Player Notes & Constraints
1. Click the notes icon on any player card
2. Set injury status
3. Define minutes limit (optimizer will suggest sub when reached)
4. Select safe positions (optimizer will only place player there)
5. Exclude from optimizer for manual control

## Optimizer Logic

The optimizer uses a sophisticated scoring algorithm:

1. **Position Compatibility**
   - Preferred position: 100% skill score
   - Alternative positions: 80% skill score
   - Same group (defenders, midfielders, forwards): 50% skill score
   - Other positions: 20% skill score

2. **Constraint Handling**
   - Respects injury status
   - Enforces minutes limits
   - Honors safe position restrictions
   - Excludes manual-control players

3. **Fatigue Factor**
   - Players with high minutes get lower priority
   - Minutes limit warnings trigger substitutions
   - Fresh players prioritized for subs

4. **Substitution Priorities**
   - **High**: Injured players, minutes limit reached
   - **Medium**: High fatigue, not in safe position
   - **Low**: Tactical improvements

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Credits

**Developed by Peak Mentality Coach**

- Website: [Peak Mentality Coach](https://peakmentalitycoach.com)
- Built with React, TypeScript, Tailwind CSS, and dnd-kit
- Powered by intelligent optimization algorithms

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Contact: support@peakmentalitycoach.com

---

**Made with ❤️ by Peak Mentality Coach**
