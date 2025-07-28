-- Create task_activities table
CREATE TABLE IF NOT EXISTS task_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  user_id INTEGER,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('status_change', 'note', 'time_logged', 'priority_change', 'tag_added', 'tag_removed')),
  description TEXT NOT NULL,
  metadata TEXT, -- JSON as TEXT in SQLite
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_activities_task_id ON task_activities(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activities_user_id ON task_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_task_activities_created_at ON task_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_task_activities_type ON task_activities(activity_type);