-- Create task_reminders table
CREATE TABLE IF NOT EXISTS task_reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  reminder_time DATETIME NOT NULL,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_sent BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_reminders_task_id ON task_reminders(task_id);
CREATE INDEX IF NOT EXISTS idx_task_reminders_user_id ON task_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_task_reminders_time ON task_reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_task_reminders_active ON task_reminders(is_active);