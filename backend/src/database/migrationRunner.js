import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dbFactory from './connectionFactory.js'
import { dbConfig } from '../config/database.js'
import { logMigration, logStartup, logError } from '../middleware/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function runMigrations() {
  const db = await dbFactory.getConnection()
  
  try {
    // Create migrations table if it doesn't exist
    await createMigrationsTable(db)
    
    // Get migration files for current database type
    const migrationDir = path.join(__dirname, 'migrations', dbConfig.type.toLowerCase())
    
    if (!fs.existsSync(migrationDir)) {
      logStartup(`No migrations directory found for ${dbConfig.type}`, 'warn')
      return
    }
    
    const migrationFiles = fs.readdirSync(migrationDir)
      .filter(file => file.endsWith('.sql'))
      .sort()
    
    // Get executed migrations
    const executedMigrations = await getExecutedMigrations(db)
    
    logStartup(`Found ${migrationFiles.length} migration files for ${dbConfig.type}`, 'info')
    
    for (const file of migrationFiles) {
      if (executedMigrations.includes(file)) {
        logMigration(file, true)
        logStartup(`Skipping ${file} (already executed)`, 'info')
        continue
      }
      
      logStartup(`Running migration: ${file}`, 'info')
      
      const filePath = path.join(migrationDir, file)
      const sql = fs.readFileSync(filePath, 'utf8')
      
      // Split SQL statements (handle multiple statements in one file)
      const statements = sql
        .split(';')
        .map(stmt => {
          // Remove comment lines and trim
          const lines = stmt.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('--'))
          return lines.join(' ')
        })
        .filter(stmt => stmt.trim().length > 0)
      
      try {
        await db.beginTransaction()
        
        for (const statement of statements) {
          await db.query(statement)
        }
        
        // Record migration as executed
        const executedAt = dbConfig.type.toLowerCase() === 'mysql'
          ? new Date().toISOString().slice(0, 19).replace('T', ' ')
          : new Date().toISOString()

        await db.query(
          'INSERT INTO migrations (filename, executed_at) VALUES (?, ?)',
          [file, executedAt]
        )
        
        await db.commit()
        logMigration(file, true)
        
      } catch (error) {
        await db.rollback()
        logMigration(file, false, error)
        throw error
      }
    }
    
    logStartup('All migrations completed successfully!', 'success')
    
  } catch (error) {
    logError(error, 'Migration process failed')
    throw error
  }
}

async function createMigrationsTable(db) {
  let sql

  switch (dbConfig.type.toLowerCase()) {
    case 'sqlite':
      sql = `CREATE TABLE IF NOT EXISTS migrations (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               filename TEXT NOT NULL UNIQUE,
               executed_at TEXT NOT NULL
             )`
      break
    case 'mysql':
      sql = `CREATE TABLE IF NOT EXISTS migrations (
               id INT AUTO_INCREMENT PRIMARY KEY,
               filename VARCHAR(255) NOT NULL UNIQUE,
               executed_at TIMESTAMP NOT NULL
             )`
      break
    case 'postgresql':
    case 'postgres':
    default:
      sql = `CREATE TABLE IF NOT EXISTS migrations (
               id SERIAL PRIMARY KEY,
               filename VARCHAR(255) NOT NULL UNIQUE,
               executed_at TIMESTAMP NOT NULL
             )`
      break
  }

  await db.query(sql)
}

async function getExecutedMigrations(db) {
  const result = await db.query('SELECT filename FROM migrations ORDER BY id')
  return result.map(row => row.filename)
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  
  if (args.includes('--reset')) {
    logStartup('Resetting database...', 'warn')
    // Add reset functionality if needed
  }
  
  runMigrations()
    .then(() => {
      logStartup('Migration runner completed', 'success')
      process.exit(0)
    })
    .catch(error => {
      logError(error, 'Migration runner failed')
      process.exit(1)
    })
}