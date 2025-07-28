-- Create task_time_entries table for PostgreSQL
CREATE TABLE IF NOT EXISTS task_time_entries (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN end_time IS NOT NULL THEN 
                EXTRACT(EPOCH FROM (end_time - start_time)) / 60
            ELSE NULL 
        END
    ) STORED,
    date DATE GENERATED ALWAYS AS (start_time::DATE) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for time entry queries
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON task_time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON task_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON task_time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON task_time_entries(start_time);