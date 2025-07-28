-- Create task_time_entries table for SQLite
CREATE TABLE IF NOT EXISTS task_time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration_minutes INTEGER,
    date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for time entry queries
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON task_time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON task_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON task_time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON task_time_entries(start_time);