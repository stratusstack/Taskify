# Task Management Application - Developer Guide

## Overview

This is a comprehensive task management application built with React, TypeScript, and modern web technologies. The application allows users to create projects, manage tasks within those projects, track time, set reminders, and visualize task dependencies.

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui components
- **State Management**: React hooks (useState, useContext, custom hooks)
- **Routing**: React Router DOM
- **Data Persistence**: localStorage (with future extensibility for backend)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner (toast notifications)

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── auth/            # Authentication related components
│   └── *.tsx            # Feature-specific components
├── hooks/               # Custom React hooks
├── pages/               # Page components (route handlers)
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── contexts/            # React contexts
├── data/                # Mock data and constants
├── lib/                 # Library configurations
└── main.tsx            # Application entry point
```

## Core Types

### Task Type (`src/types/task.ts`)
- **Task**: Main entity with status, priority, time tracking, dependencies
- **TaskStatus**: 'To Do' | 'In Progress' | 'On Hold' | 'Done'
- **TaskPriority**: 'Low' | 'Medium' | 'High' | 'Critical'
- **TaskTimeEntry**: Time tracking entries with start/end times
- **TaskActivity**: Activity log for status changes, notes, etc.

### Project Type (`src/types/project.ts`)
- **Project**: Simple project entity with name, description, archive status

## Key Components

### Core Application Components

#### 1. ProjectTasks (`src/pages/ProjectTasks.tsx`)
**Purpose**: Main page component for project task management
**Features**:
- Task filtering and searching
- Multiple view modes (table, board, dependencies)
- Real-time timer functionality
- Activity tracking
- Integration with all dialogs and modals

#### 2. TaskTableView (`src/components/TaskTableView.tsx`)
**Purpose**: Table-based task display grouped by status
**Features**:
- Status-based grouping with visual indicators
- Configurable column display
- Responsive design
- Accessibility support with proper ARIA labels

#### 3. TaskBoard (`src/components/TaskBoard.tsx`)
**Purpose**: Kanban board view for tasks
**Features**:
- Visual status columns with color coding
- Drag and drop functionality (implied structure)
- Status-specific styling and icons

#### 4. TaskDependenciesCanvas (`src/components/TaskDependenciesCanvas.tsx`)
**Purpose**: Visual dependency graph using React Flow
**Features**:
- Interactive node-based dependency visualization
- Color-coded nodes by status
- Zoom and pan controls
- Mini-map for navigation

### Time Tracking Components

#### 1. TimeTrackingWidget (`src/components/TimeTrackingWidget.tsx`)
**Purpose**: Central time tracking interface
**Features**:
- Active timer display
- Quick actions for starting/stopping timers
- Integration with task status updates

#### 2. ActiveTimerCard (`src/components/ActiveTimerCard.tsx`)
**Purpose**: Display currently active timer
**Features**:
- Real-time timer display
- Session duration tracking
- Break reminders for long sessions
- Priority indicators

### Dialog Components

#### 1. CreateTaskDialog (`src/components/CreateTaskDialog.tsx`)
**Purpose**: Task creation interface
**Features**:
- Form validation with react-hook-form
- Date pickers for start/end dates
- Tag management
- Dependency selection

#### 2. TaskActivityDialog (`src/components/TaskActivityDialog.tsx`)
**Purpose**: Task activity history and note management
**Features**:
- Activity timeline display
- Add new notes/activities
- Activity type filtering

#### 3. TaskFilterDialog (`src/components/TaskFilterDialog.tsx`)
**Purpose**: Advanced task filtering
**Features**:
- Multi-criteria filtering (status, priority, tags, dates)
- Filter persistence
- Clear all filters option

### UI Components

All UI components are based on shadcn/ui and customized for the application's design system:
- **Form Controls**: Input, Select, Checkbox, RadioGroup
- **Navigation**: Sidebar, Breadcrumb, Navigation menus
- **Feedback**: Toast, Dialog, Alert
- **Data Display**: Table, Card, Badge

## Custom Hooks

### 1. `useProjectTasks` (`src/hooks/useProjectTasks.tsx`)
**Purpose**: Central task management hook
**Features**:
- Task CRUD operations
- localStorage persistence
- Project data management
- State migration for backward compatibility

### 2. `useRealTimeTimer` (`src/hooks/useRealTimeTimer.tsx`)
**Purpose**: Real-time timer functionality
**Features**:
- Start/stop timer management
- Time calculation
- Integration with task status

### 3. `useReminderNotifications` (`src/hooks/useReminderNotifications.tsx`)
**Purpose**: Task reminder system
**Features**:
- Browser notification integration
- Reminder scheduling
- Permission management

### 4. `useBreakReminder` (`src/hooks/useBreakReminder.tsx`)
**Purpose**: Break reminder system for long work sessions
**Features**:
- Session duration tracking
- Break notifications
- Configurable break intervals

## Design System

### Color Tokens
The application uses a semantic color system defined in `src/index.css`:
- **Primary Colors**: Brand colors for interactive elements
- **Status Colors**: Specific colors for task statuses
- **Semantic Colors**: Success, warning, error, info states
- **Neutral Colors**: Text, backgrounds, borders

### Typography
- Font family: Inter (via Google Fonts)
- Responsive font sizes using Tailwind CSS
- Consistent line heights and letter spacing

### Spacing and Layout
- Consistent spacing scale (4px base unit)
- Responsive breakpoints
- Flexible grid system

## State Management

### Local State
- Component-level state using `useState`
- Form state using `react-hook-form`

### Shared State
- Custom hooks for data management
- Context providers for auth and global settings
- localStorage for persistence

### State Flow
1. **Data Loading**: useProjectTasks loads from localStorage
2. **State Updates**: Hook functions update state and localStorage
3. **UI Updates**: Components re-render based on state changes
4. **Persistence**: Changes automatically saved to localStorage

## Performance Optimizations

### React Optimizations
- `React.memo` for expensive components
- `useCallback` for event handlers
- `useMemo` for computed values
- `React.lazy` for code splitting (where applicable)

### Bundle Optimization
- Tree shaking with Vite
- Dynamic imports for large dependencies
- Optimal chunk splitting

## Error Handling

### Error Boundaries
- `ErrorBoundary` component wraps key sections
- Graceful error display
- Error reporting capability

### Form Validation
- Schema-based validation with Zod
- Real-time field validation
- User-friendly error messages

### Data Validation
- Type checking with TypeScript
- Runtime validation for localStorage data
- Migration handling for data structure changes

## Testing Strategy

### Component Testing
- Unit tests for individual components
- Integration tests for complex workflows
- Accessibility testing

### Hook Testing
- Custom hook testing with testing-library
- State management testing
- Side effect testing

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for consistent formatting
- Prettier for code formatting
- Consistent naming conventions

### Component Architecture
- Single Responsibility Principle
- Composition over inheritance
- Props interface documentation
- Error boundary usage

### Performance Best Practices
- Avoid unnecessary re-renders
- Optimize expensive operations
- Use proper dependency arrays
- Implement proper memoization

## Future Enhancements

### Backend Integration
- API layer abstraction
- Authentication system
- Real-time collaboration
- Data synchronization

### Advanced Features
- Team collaboration
- Advanced reporting
- Mobile application
- Offline functionality

### Performance Improvements
- Virtual scrolling for large lists
- Background task processing
- Progressive loading
- Service worker implementation

## Deployment

### Build Process
```bash
npm run build
```

### Environment Configuration
- Environment variables for API endpoints
- Build-time configuration
- Runtime configuration

### Deployment Targets
- Static hosting (Vercel, Netlify)
- CDN deployment
- Docker containerization

## Contributing

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build for production: `npm run build`

### Code Review Process
- Feature branches for new development
- Pull request reviews
- Automated testing on PRs
- Code quality checks

### Documentation
- Component documentation in JSDoc format
- Type documentation with TypeScript
- README updates for new features
- Architecture decision records (ADRs)