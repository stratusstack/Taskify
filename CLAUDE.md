# CLAUDE.md - Taskify Project Guide

## Project Overview

**Taskify** is a modern task management application featuring a clean design aesthetic with bold, vivid colors. Built as a full-stack monorepo, it provides comprehensive project and task management capabilities with time tracking, notes, and user authentication.

## Architecture

This is a monorepo with separate frontend and backend applications:

```
taskify/
├── frontend/          # React TypeScript frontend (main development directory)
├── backend/          # Node.js Express backend
├── README.md         # Project documentation
├── Project_Requirements.md  # Detailed requirements
└── CLAUDE.md         # This file
```

## Technology Stack

### Frontend (`frontend/`)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (with HMR for development)
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui components
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner
- **Navigation**: React Router DOM
- **State**: React Context API

### Backend (`backend/`)
- **Runtime**: Node.js 18+ with ES modules
- **Framework**: Express.js
- **Databases**: Triple support for SQLite, PostgreSQL, and MySQL
- **Authentication**: JWT with bcrypt password hashing
- **Security**: Helmet, CORS, rate limiting
- **Testing**: Jest with Supertest
- **Migration**: Custom database-agnostic migration system

## Development Commands

### Frontend Commands
```bash
cd frontend
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production (TypeScript + Vite)
npm run lint     # ESLint code linting
npm run preview  # Preview production build
```

### Backend Commands
```bash
cd backend
npm run dev          # Development with nodemon
npm run start        # Production server
npm test            # Run Jest test suite
npm run test:watch  # Watch mode testing
npm run db:migrate  # Run database migrations
npm run db:reset    # Reset database and re-run migrations
```

## Database Configuration

The backend supports SQLite (default), PostgreSQL, and MySQL through environment variables:

### SQLite (Default - No setup required)
```env
DB_TYPE=sqlite
SQLITE_DB=./database.sqlite
```

### PostgreSQL
```env
DB_TYPE=postgresql
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=taskify
PG_USER=your_username
PG_PASSWORD=your_password
```

### MySQL
```env
DB_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=taskify
MYSQL_USER=root
MYSQL_PASSWORD=your_password
```

## Key Features

### Task Management
- **CRUD Operations**: Full create, read, update, delete for tasks
- **Status Tracking**: 'To Do', 'In Progress', 'On Hold', 'Done'
- **Priority Levels**: Low, Medium, High, Critical
- **Advanced Time Tracking**: 
  - Live timer with minute-by-minute updates when tasks are 'In Progress'
  - Animated time counter with progressive visual rewards
  - Time investment indicators (Clock → Zap → Flame → Trophy icons)
  - Automatic preservation of accumulated time when status changes
- **Visual Progress Indicators**: 
  - Wave animation for active "In Progress" tasks (theme-aware colors)
  - Count-up animations for time display on card load
  - Dynamic styling based on time investment levels
- **Notes System**: Multiple notes per task
- **Due Dates**: Start and end date management with overdue indicators

### Daily Hit Lists (Personal Todo)
- **Instant Access**: Quick daily todo list for personal chores and tasks
- **One List Per User**: Each user maintains a single hit list unless manually deleted
- **Homepage Integration**: Always displayed on homepage when items exist
- **CRUD Operations**: Add, edit, mark complete/incomplete, delete individual items
- **Inline Editing**: Click any item text to edit directly
- **Persistent Storage**: Hit lists survive server restarts and user sessions
- **Clean UI**: Compact, minimal design with hover interactions
- **Smart Sorting**: Incomplete items shown first, then completed ones
- **Progress Tracking**: Shows count of remaining incomplete items
- **Full Reset**: Option to delete entire list and start fresh
- **Responsive Design**: Works seamlessly on all device sizes

### Project Organization
- **Project-based Structure**: All tasks belong to projects
- **Grid Layout**: Responsive project cards with consistent styling
- **Project CRUD**: Create, update, delete projects
- **Archive Functionality**: Archive completed projects
- **Search & Filter**: Real-time search and status filtering

### Authentication & Security
- **User Registration/Login**: JWT-based authentication with detailed validation error messages
- **Password Security**: bcrypt hashing with salt rounds
- **Enhanced Validation**: 
  - Username: 3-50 characters, alphanumeric with underscores/hyphens
  - Email: Valid email format validation
  - Password: 8+ characters with uppercase, lowercase, and number requirements
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Server-side validation with specific error feedback
- **CORS Protection**: Configured for production

### Design System
- **New-Professional Style**: Bold, vivid colors with high contrast. Create an intentionally "undesigned" aesthetic with raw typography and slightly asymmetrical layouts. Buttons should have thick borders and strong color contrast. Avoid gradients and subtle shadows in favor of stark, bold design elements.
- **Three Theme Options**: 
  - 🌈 **Neon Cyber**: Blue Violet, Dark Turquoise, Yellow - Electric cyberpunk aesthetic
  - 📖 **Readable**: High contrast navy and blue tones - Optimal for readability and focus
  - 🌿 **Natural**: Forest green, sage green, and warm orange - Calming earth tones
- **Typography**: Optimized for deep work and productivity
- **Responsive Design**: Mobile-first approach
- **Interactive Animations**: Subtle hover effects and progress animations

## API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - List tasks (with filtering)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/notes` - Add task note

### Time Tracking
- `POST /api/time-entries/start` - Start time tracking
- `POST /api/time-entries/stop` - Stop time tracking
- `GET /api/time-entries/task/:id` - Get task time entries

### Hit Lists (Daily Todo)
- `GET /api/hit-lists` - Get user's hit list with items
- `POST /api/hit-lists` - Create new hit list (auto-created on first item)
- `DELETE /api/hit-lists/:id` - Delete entire hit list
- `POST /api/hit-lists/:id/items` - Add todo item
- `PUT /api/hit-lists/:id/items/:itemId` - Update todo item (text/completion)
- `DELETE /api/hit-lists/:id/items/:itemId` - Delete todo item

## File Structure

### Frontend Structure
```
frontend/src/
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── auth/            # Authentication components
│   ├── DeleteDialog.tsx # Confirmation dialogs
│   ├── Layout.tsx       # Main app layout
│   ├── ProjectCard.tsx  # Project display component
│   ├── ProjectDialog.tsx # Project creation/edit
│   ├── TaskCard.tsx     # Task display component
│   ├── TaskDialog.tsx   # Task creation/edit
│   ├── TaskNotes.tsx    # Task notes management
│   ├── ThemeSwitcher.tsx # Theme selection
│   ├── TodoList.tsx     # Daily hit list component
│   └── TodoItem.tsx     # Individual todo item component
├── contexts/
│   ├── AuthContext.tsx  # Authentication state
│   └── ThemeContext.tsx # Theme management
├── pages/
│   ├── Home.tsx         # Landing page
│   ├── Login.tsx        # Authentication page
│   ├── Projects.tsx     # Project management page
│   └── Tasks.tsx        # Task management page
├── services/
│   └── api.ts          # API client
├── types/
│   └── index.ts        # TypeScript definitions
├── data/
│   └── demoData.ts     # Demo/sample data
└── utils/
    └── [utility functions]
```

### Backend Structure
```
backend/src/
├── config/
│   └── database.js         # Database configuration
├── database/
│   ├── connections/
│   │   ├── postgresql.js   # PostgreSQL connection
│   │   └── sqlite.js       # SQLite connection
│   ├── migrations/
│   │   ├── postgresql/     # PostgreSQL migration files
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_add_checklist_items.sql
│   │   │   └── 003_add_hit_lists.sql
│   │   └── sqlite/         # SQLite migration files
│   │       ├── 001_initial_schema.sql
│   │       ├── 002_add_checklist_items.sql
│   │       └── 003_add_hit_lists.sql
│   ├── connectionFactory.js # Database factory
│   └── migrationRunner.js  # Migration system
├── middleware/
│   └── errorHandler.js     # Error handling
├── routes/
│   ├── users.js           # User authentication
│   ├── projects.js        # Project management
│   ├── tasks.js           # Task management
│   ├── timeEntries.js     # Time tracking
│   └── hitLists.js        # Daily hit lists/todo management
└── server.js              # Express app setup
```

## Development Workflow

### Starting Development
1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure if needed
   npm run dev           # Starts on :3001
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev           # Starts on :5173
   ```

### Database Setup
- **SQLite**: Works automatically, creates `database.sqlite`
- **PostgreSQL**: Set environment variables and ensure DB exists
- **Migrations**: Run automatically on server start

### Testing
- **Backend**: Comprehensive test suite with Jest and Supertest
- **Coverage**: Tests cover authentication, CRUD operations, hit lists, error handling
- **Hit Lists**: Complete test coverage for all hit list and todo item operations
- **Run Tests**: `cd backend && npm test`
- **Test Files**: `users.test.js`, `projects.test.js`, `tasks.test.js`, `hitLists.test.js`

## Demo Mode
- **Access**: Click "View Demo" on homepage
- **Features**: Pre-populated with sample projects and tasks
- **Purpose**: Explore functionality without registration

## Theme Customization
Themes are managed through CSS custom properties in `frontend/src/index.css`:
- Add new color schemes
- Update `ThemeContext.tsx` for new theme options
- Modify `ThemeSwitcher.tsx` to include new themes

## Security Features
- **JWT Authentication**: Secure token-based sessions
- **Password Hashing**: bcrypt with configurable salt rounds
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Server-side data validation
- **CORS**: Cross-origin request protection
- **Helmet**: Security headers middleware

## Performance Optimizations
- **Vite HMR**: Sub-second hot module replacement
- **Database Indexes**: Optimized queries for performance
- **Lazy Loading**: Components loaded on demand
- **Efficient State**: Minimal re-renders with Context API
- **Smooth Animations**: CSS-only animations with hardware acceleration
- **Optimized Timer Updates**: Efficient live time tracking with automatic cleanup
- **Bundle Analysis**: Built-in Vite bundle analysis

## Deployment Notes
- **Environment**: Node.js 18+ required
- **Database**: Choose SQLite for simplicity, PostgreSQL or MySQL for scale
- **Build Process**: `npm run build` in both directories
- **Security**: Update CORS origins for production
- **Monitoring**: Built-in error handling and logging

## Key Commands Summary
```bash
# Development
cd frontend && npm run dev    # Frontend dev server
cd backend && npm run dev     # Backend dev server

# Production Build
cd frontend && npm run build  # Build frontend
cd backend && npm start       # Start production backend

# Database
cd backend && npm run db:migrate  # Run migrations
cd backend && npm run db:reset    # Reset database

# Testing
cd backend && npm test        # Run backend tests
cd frontend && npm run lint   # Lint frontend code
```

This project is optimized for productivity-focused task management with a distinctive visual design, robust technical architecture, and delightful user interactions that make time tracking and task management engaging and rewarding.

## Recent Enhancements

### Visual & UX Improvements
- **Enhanced Time Tracking**: Live timer with animated counters and progressive visual rewards
- **Progress Wave Animation**: Subtle flowing wave animation for "In Progress" tasks
- **Theme-Aware Animations**: All animations adapt to the selected theme colors
- **Interactive Elements**: Always-visible task actions and hover effects
- **Improved Button States**: Better visual feedback for different button variants

### Technical Improvements
- **Fixed Timer Bug**: Preserved accumulated time when switching task statuses
- **Reduced Theme Options**: Streamlined to 3 carefully crafted themes (Neon Cyber, Readable, Natural)
- **Enhanced Validation**: Detailed validation error messages for user registration
- **Grid-Only Layout**: Simplified project display with responsive grid layout
- **Animation Performance**: CSS-only animations with proper cleanup

### Latest Features (Daily Hit Lists)
- **Personal Todo System**: Quick access daily hit list for personal chores and tasks
- **Database Schema**: New `hit_lists` and `todo_items` tables with proper relationships
- **API Endpoints**: Complete REST API for hit list and todo item management
- **Homepage Integration**: Seamless integration with existing homepage layout
- **Compact UI Design**: Minimal, clean interface optimized for quick task entry
- **Comprehensive Testing**: Full test suite covering all hit list operations
- **Persistent Storage**: Data survives server restarts and user sessions
- **Smart Navigation**: Added "Daily Todo" link to main navigation
