-- Create task_reminders table
CREATE TABLE IF NOT EXISTS task_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_reminders_task_id ON task_reminders(task_id);
CREATE INDEX IF NOT EXISTS idx_task_reminders_user_id ON task_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_task_reminders_time ON task_reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_task_reminders_active ON task_reminders(is_active);