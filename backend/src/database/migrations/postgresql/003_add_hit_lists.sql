-- Hit Lists table for personal todo lists
CREATE TABLE IF NOT EXISTS hit_lists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT 'My Hit List',
  user_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Todo Items table for hit list items
CREATE TABLE IF NOT EXISTS todo_items (
  id SERIAL PRIMARY KEY,
  hit_list_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hit_list_id) REFERENCES hit_lists (id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hit_lists_user_id ON hit_lists (user_id);
CREATE INDEX IF NOT EXISTS idx_todo_items_hit_list_id ON todo_items (hit_list_id);
CREATE INDEX IF NOT EXISTS idx_todo_items_sort_order ON todo_items (hit_list_id, sort_order);