-- Checklist items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_checklist_items_task_id ON checklist_items (task_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_sort_order ON checklist_items (task_id, sort_order);