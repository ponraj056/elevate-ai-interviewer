import mysql from 'mysql2/promise'

// Configuration using standard environment variables
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'elevate_interviewer',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Use globalThis to share state across Turbopack module instances
const globalState = globalThis as any

if (!globalState.__dbPool) globalState.__dbPool = null
if (!globalState.__dbConnected) globalState.__dbConnected = false
if (!globalState.__dbLastAttempt) globalState.__dbLastAttempt = 0
if (!globalState.__dbConnectionFailed) globalState.__dbConnectionFailed = false

// In-memory fallback database for resilient offline operation
// Stored on globalThis so all API routes share the same data
if (!globalState.__inMemoryDb) {
  globalState.__inMemoryDb = {
    users: new Map<string, any>(),
    interviews: new Map<string, any>(),
    questions: new Map<string, any[]>(),
    qa_logs: new Map<string, any[]>(),
    voice_logs: new Map<string, any[]>(),
    coding_logs: new Map<string, any[]>(),
  }
}

export const inMemoryDb = globalState.__inMemoryDb as {
  users: Map<string, any>
  interviews: Map<string, any>
  questions: Map<string, any[]>
  qa_logs: Map<string, any[]>
  voice_logs: Map<string, any[]>
  coding_logs: Map<string, any[]>
}

export async function getDbConnection() {
  if (globalState.__dbPool && globalState.__dbConnected) return globalState.__dbPool

  // Don't retry MySQL connection for 60 seconds after a failure
  if (globalState.__dbConnectionFailed && Date.now() - globalState.__dbLastAttempt < 60000) {
    return null
  }

  globalState.__dbLastAttempt = Date.now()

  try {
    // 1. Try connecting without database first to create the schema if needed
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
    })

    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``)
    await tempConnection.end()

    // 2. Initialize connection pool
    globalState.__dbPool = mysql.createPool(dbConfig)
    globalState.__dbConnected = true
    globalState.__dbConnectionFailed = false
    console.log('[MySQL Database] Connected successfully to host:', dbConfig.host)

    // 3. Perform automatic schema setup
    await initSchema(globalState.__dbPool)

    return globalState.__dbPool
  } catch (error) {
    if (!globalState.__dbConnectionFailed) {
      console.warn('[MySQL Database] Connection failed, using in-memory database:', error instanceof Error ? error.message : error)
    }
    globalState.__dbConnected = false
    globalState.__dbConnectionFailed = true
    globalState.__dbPool = null
    return null
  }
}

async function initSchema(dbPool: mysql.Pool) {
  try {
    // Users authentication table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Interviews main report table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS interviews (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NULL,
        resume_text LONGTEXT NULL,
        skills JSON NULL,
        projects JSON NULL,
        experience JSON NULL,
        education JSON NULL,
        overall_score INT DEFAULT 0,
        weighted_breakdown JSON NULL,
        summary TEXT NULL,
        strengths JSON NULL,
        weaknesses JSON NULL,
        tips JSON NULL,
        communication_details JSON NULL,
        coding_details JSON NULL,
        integrity JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // Handle schema migration in case the table already existed without user_id
    try {
      await dbPool.query(`ALTER TABLE interviews ADD COLUMN user_id VARCHAR(255) NULL`)
      await dbPool.query(`ALTER TABLE interviews ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL`)
    } catch (e) {
      // Column or constraint already exists
    }

    // Generated Questions Bank table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        interview_id VARCHAR(255) NOT NULL,
        section VARCHAR(100) NOT NULL,
        question TEXT NOT NULL,
        ideal_answer TEXT NOT NULL,
        FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
      )
    `)

    // Q&A Round Logs table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS qa_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        interview_id VARCHAR(255) NOT NULL,
        section VARCHAR(100) NOT NULL,
        question TEXT NOT NULL,
        user_answer TEXT NOT NULL,
        ideal_answer TEXT NOT NULL,
        score INT DEFAULT 0,
        explanation TEXT NULL,
        FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
      )
    `)

    // Voice assessments table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS voice_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        interview_id VARCHAR(255) NOT NULL,
        prompt TEXT NOT NULL,
        transcript TEXT NOT NULL,
        fluency_score INT DEFAULT 0,
        pronunciation_score INT DEFAULT 0,
        grammar_score INT DEFAULT 0,
        structure_score INT DEFAULT 0,
        wpm INT DEFAULT 0,
        mispronounced_words JSON NULL,
        feedback_text TEXT NULL,
        FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
      )
    `)

    // CodingRound submissions table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS coding_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        interview_id VARCHAR(255) NOT NULL,
        problem_description TEXT NOT NULL,
        code TEXT NOT NULL,
        run_output TEXT NOT NULL,
        correctness BOOLEAN DEFAULT FALSE,
        complexity VARCHAR(255) NULL,
        code_quality TEXT NULL,
        score INT DEFAULT 0,
        feedback TEXT NULL,
        optimal_solution TEXT NULL,
        FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
      )
    `)

    console.log('[MySQL Database] Schema tables initialized successfully.')
  } catch (schemaError) {
    console.error('[MySQL Database] Schema migration failed:', schemaError)
    throw schemaError
  }
}
