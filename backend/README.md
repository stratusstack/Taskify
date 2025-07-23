# Taskify Backend Service

A Node.js backend service supporting both PostgreSQL and SQLite databases with automatic migration system.

## Features

- **Database Agnostic**: Supports both PostgreSQL and SQLite databases
- **Automatic Migrations**: Database schema setup and migration system
- **RESTful API**: Complete CRUD operations for users, projects, tasks, and time entries
- **Environment-based Configuration**: Easy switching between database types
- **Security**: Rate limiting, CORS, helmet security headers
- **Error Handling**: Comprehensive error handling middleware
- **Performance**: Compression, connection pooling

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Choose your database type
DB_TYPE=sqlite  # or 'postgresql'

# For SQLite (default)
SQLITE_PATH=./database.sqlite

# For PostgreSQL (if using)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=taskify
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

### 3. Database Setup

Run database setup and migrations:

```bash
npm run db:setup
```

### 4. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

## Database Configuration

### Using SQLite (Default)

SQLite is the default database and requires minimal setup:

```env
DB_TYPE=sqlite
SQLITE_PATH=./database.sqlite
```

### Using PostgreSQL

For PostgreSQL, ensure you have PostgreSQL installed and running:

```env
DB_TYPE=postgresql
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=taskify
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

## Database Schema

### Tables

1. **users** - User accounts
2. **projects** - Projects belonging to users
3. **tasks** - Tasks within projects
4. **time_entries** - Time tracking entries for tasks

### Migration Files

Migration files are located in:
- `src/database/migrations/postgresql/` - PostgreSQL-specific migrations
- `src/database/migrations/sqlite/` - SQLite-specific migrations

Each migration file includes `IF NOT EXISTS` checks to prevent errors on re-run.

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Projects
- `GET /api/projects` - Get all projects (supports ?user_id and ?status filters)
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks (supports ?project_id, ?status, ?priority filters)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Time Entries
- `GET /api/time-entries` - Get all time entries (supports ?task_id, ?user_id, ?is_active filters)
- `GET /api/time-entries/:id` - Get time entry by ID
- `POST /api/time-entries` - Start new time entry
- `PUT /api/time-entries/:id/stop` - Stop active time entry
- `PUT /api/time-entries/:id` - Update time entry
- `DELETE /api/time-entries/:id` - Delete time entry

### Health Check
- `GET /health` - Health check endpoint with database status

## Scripts

```bash
# Development
npm run dev          # Start development server with nodemon

# Production
npm start            # Start production server

# Database
npm run db:setup     # Setup database and run migrations
npm run db:migrate   # Run pending migrations
npm run db:migrate rollback # Rollback last migration

# Code Quality
npm run lint         # Run ESLint
npm test            # Run tests
```

## Example Usage

### Create a User
```bash
curl -X POST http://localhost:3001/api/users \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password_hash": "hashed_password_here",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Create a Project
```bash
curl -X POST http://localhost:3001/api/projects \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_id": 1,
    "name": "My Project",
    "description": "Project description",
    "color": "#3B82F6"
  }'
```

### Create a Task
```bash
curl -X POST http://localhost:3001/api/tasks \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_id": 1,
    "title": "Complete backend setup",
    "description": "Setup Node.js backend with database support",
    "priority": "high",
    "tags": ["backend", "setup"]
  }'
```

### Start Time Tracking
```bash
curl -X POST http://localhost:3001/api/time-entries \\
  -H "Content-Type: application/json" \\
  -d '{
    "task_id": 1,
    "user_id": 1,
    "description": "Working on backend setup"
  }'
```

## Architecture

### Database Factory Pattern

The application uses a factory pattern to create database connections:

```javascript
import dbFactory from './database/connectionFactory.js';

// Initialize connection
const db = await dbFactory.createConnection();

// Use connection
const result = await db.query('SELECT * FROM users');
```

### Migration System

The migration system automatically runs SQL files based on the configured database type:

1. Checks for executed migrations in the `migrations` table
2. Runs pending migrations in order
3. Records successful migrations
4. Supports rollback of last migration

### Error Handling

Comprehensive error handling with database-specific error codes:
- PostgreSQL constraint violations
- SQLite constraint violations  
- Validation errors
- Not found errors

## Security Features

- **Rate Limiting**: 100 requests per 15-minute window
- **CORS**: Configurable origin restrictions
- **Helmet**: Security headers
- **Input Validation**: Parameter validation and sanitization
- **SQL Injection Protection**: Parameterized queries

## Performance Features

- **Connection Pooling**: PostgreSQL connection pooling
- **Compression**: Response compression
- **Indexing**: Database indexes for common queries
- **Query Optimization**: Efficient JOIN queries

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `NODE_ENV` | development | Environment mode |
| `DB_TYPE` | sqlite | Database type ('postgresql' or 'sqlite') |
| `SQLITE_PATH` | ./database.sqlite | SQLite database file path |
| `POSTGRES_HOST` | localhost | PostgreSQL host |
| `POSTGRES_PORT` | 5432 | PostgreSQL port |
| `POSTGRES_DB` | taskify | PostgreSQL database name |
| `POSTGRES_USER` | postgres | PostgreSQL username |
| `POSTGRES_PASSWORD` | password | PostgreSQL password |
| `CORS_ORIGIN` | http://localhost:5173 | Allowed CORS origin |
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |

## Troubleshooting

### Database Connection Issues

1. **PostgreSQL**: Ensure PostgreSQL is running and credentials are correct
2. **SQLite**: Ensure the application has write permissions to the database file directory

### Migration Issues

- Check migration file syntax
- Ensure proper file ordering (001_, 002_, etc.)
- Use `npm run db:migrate rollback` to undo last migration if needed

### Port Conflicts

If port 3001 is in use, set a different port:
```bash
export PORT=3002
npm start
```

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure migrations work for both database types

## License

This project is licensed under the MIT License.