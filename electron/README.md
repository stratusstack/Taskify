# Taskify Desktop

Electron wrapper for the Taskify task management application.

## Quick Start

### Development Mode
```bash
# Install dependencies
npm install

# Start all services (frontend, backend, electron)
npm run dev:all

# Or start electron only (requires frontend/backend running separately)
npm run dev
```

### Production Build
```bash
# Build and package for current platform
npm run build
npm run pack

# Create distributable for specific platforms
npm run dist:mac    # macOS
npm run dist:win    # Windows
npm run dist:linux  # Linux
```

## Architecture

This Electron app bundles your existing React frontend and Express backend into a single desktop application:

- **Frontend**: React app served from built files
- **Backend**: Express server running locally in Electron
- **Database**: SQLite stored in user data directory

## Scripts

- `npm run dev` - Start Electron in development mode
- `npm run dev:all` - Start frontend, backend, and Electron together
- `npm run build` - Build frontend and backend for packaging
- `npm run pack` - Package app for current platform (no installer)
- `npm run dist` - Create installer/distributor for current platform
- `npm run clean` - Remove build and dist directories

## File Structure

```
electron/
├── main.js           # Electron main process
├── preload.js        # Secure IPC bridge
├── scripts/
│   ├── build.js      # Build automation
│   └── dev.js        # Development server
├── build/            # Built frontend/backend (generated)
└── dist/             # Packaged applications (generated)
```

## Database Storage

In production, SQLite database is stored in:
- **macOS**: `~/Library/Application Support/taskify-desktop/taskify.sqlite`
- **Windows**: `%APPDATA%/taskify-desktop/taskify.sqlite`
- **Linux**: `~/.config/taskify-desktop/taskify.sqlite`

## Building for Distribution

The build process:
1. Builds React frontend (`frontend/dist`)
2. Copies backend files and dependencies
3. Creates production environment configuration
4. Packages everything with Electron Builder

## Configuration

Key environment variables for production:
- `NODE_ENV=production`
- `DB_TYPE=sqlite`
- `JWT_SECRET` (automatically generated for builds)
- `PORT=3001` (internal backend port)

## Platform Support

- **macOS**: Universal binary (Intel + Apple Silicon)
- **Windows**: x64 installer
- **Linux**: AppImage format