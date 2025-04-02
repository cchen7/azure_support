const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)){
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'azure_support.db');
const db = new sqlite3.Database(dbPath);

function initDatabase() {
  console.log('Initializing database...');
  
  // Create tables if they don't exist
  db.serialize(() => {
    // Subscriptions table - stores subscription IDs and names, no sensitive data
    db.run(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        displayName TEXT NOT NULL,
        state TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Cases table - stores basic case information, no sensitive data
    db.run(`
      CREATE TABLE IF NOT EXISTS support_cases (
        id TEXT PRIMARY KEY,
        subscription_id TEXT NOT NULL,
        title TEXT NOT NULL,
        severity TEXT,
        status TEXT,
        created_time DATETIME,
        last_updated DATETIME,
        service_name TEXT,
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
      )
    `);

    // Case communications reference table - minimal metadata only
    db.run(`
      CREATE TABLE IF NOT EXISTS case_communications (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        sender TEXT,
        created_time DATETIME,
        type TEXT,
        FOREIGN KEY (case_id) REFERENCES support_cases(id)
      )
    `);
  });

  console.log('Database initialized');
  return db;
}

// Export both the initialization function and the db connection
module.exports = initDatabase;
module.exports.getDb = () => db;
