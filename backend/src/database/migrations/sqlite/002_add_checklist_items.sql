-- Checklist items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  is_completed INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_checklist_items_task_id ON checklist_items (task_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_sort_order ON checklist_items (task_id, sort_order);