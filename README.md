# 🎯 Taskify - Modern Task Management

A brutally beautiful task management application built with modern technologies and designed for deep work and focused productivity.

![Taskify Banner](https://img.shields.io/badge/Task%20Management-Brutalism%20Style-ff6b6b?style=for-the-badge)

## ✨ Features

- **🎨 New-Brutalism Design**: Bold, vivid colors with three distinctive themes
- **📋 Task Management**: Complete CRUD operations with status tracking
- **⏰ Time Tracking**: Built-in timer with automatic time logging
- **📁 Project Organization**: Group tasks into organized projects
- **📝 Notes System**: Add detailed notes to any task
- **🔐 Authentication**: Secure JWT-based user authentication
- **📱 Responsive Design**: Works beautifully on all devices
- **🚀 Demo Mode**: Try the app without registration

## 🎨 Design Themes

**🌈 Neon Cyber**: Electric blues, purples, and pinks  
**🔥 Retro Wave**: Hot pinks, oranges, and purples  
**⚡ Acid Green**: Bright greens, yellows, and blues  

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **Sonner** for toast notifications
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **Dual Database Support**: PostgreSQL & SQLite
- **JWT Authentication**
- **Automated Migrations**
- **Comprehensive Test Suite**
- **Security Middleware**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL (optional - SQLite works out of the box)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd taskify
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment file
   cp .env.example .env
   
   # Start the server (uses SQLite by default)
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start the development server
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 🎯 Usage

### Demo Mode
Visit the homepage and click "View Demo" to explore Taskify with sample data - no registration required!

### Getting Started
1. **Sign Up**: Create your free account
2. **Create Project**: Organize your work into projects
3. **Add Tasks**: Create tasks with priorities, due dates, and descriptions
4. **Track Time**: Use the built-in timer for tasks in progress
5. **Add Notes**: Keep detailed records of your progress
6. **Stay Organized**: Use filters and search to find what you need

## 🗄️ Database Configuration

### SQLite (Default)
Works out of the box - no setup required!

### PostgreSQL
Update your `.env` file:
```env
DB_TYPE=postgresql
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=taskify
PG_USER=your_username
PG_PASSWORD=your_password
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

The test suite includes:
- User authentication tests
- Project CRUD operations
- Task management functionality
- API error handling
- Database operations

## 🏗️ Project Structure

```
taskify/
├── frontend/          # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript definitions
│   │   └── data/          # Demo data
├── backend/           # Node.js Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── database/      # Database layer
│   │   ├── middleware/    # Express middleware
│   │   └── config/        # Configuration
│   └── tests/             # Test suites
```

## 🎨 Customization

### Adding New Themes
1. Add theme colors in `frontend/src/index.css`
2. Update the theme context in `frontend/src/contexts/ThemeContext.tsx`
3. Add theme option to `ThemeSwitcher` component

### Database Schema
The application supports easy schema modifications through migrations:
- SQLite: `backend/src/database/migrations/sqlite/`
- PostgreSQL: `backend/src/database/migrations/postgresql/`

## 🔧 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - List tasks (filterable)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/notes` - Add task note

### Time Tracking
- `POST /api/time-entries/start` - Start time tracking
- `POST /api/time-entries/stop` - Stop time tracking
- `GET /api/time-entries/task/:id` - Get task time entries

## 📈 Performance

- **Fast Builds**: Vite for sub-second HMR
- **Optimized Queries**: Database indexes for performance
- **Lazy Loading**: Components loaded on demand
- **Efficient State**: Minimal re-renders with React contexts

## 🔒 Security

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Server-side validation
- **CORS Protection**: Configured for production

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Lucide** for the comprehensive icon set
- **Tailwind CSS** for the utility-first styling approach
- **The open-source community** for the amazing tools and inspiration

---

**Built with ❤️ for productivity enthusiasts**

*Ready to revolutionize your task management? Get started with Taskify today!*