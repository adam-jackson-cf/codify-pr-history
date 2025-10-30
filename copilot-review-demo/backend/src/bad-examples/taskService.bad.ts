import sqlite3 from 'sqlite3';

/**
 * BAD EXAMPLE: Task service with critical SQL injection vulnerabilities
 *
 * Issues demonstrated:
 * 1. SQL injection via string concatenation
 * 2. No parameterized queries
 * 3. Missing error handling
 * 4. No authorization checks
 * 5. Using 'any' types
 * 6. No logging
 */
export class TaskService {
  private db: any; // VIOLATION: Using 'any' type

  constructor(databasePath: string) {
    this.db = new sqlite3.Database(databasePath);
    this.initializeDatabase();
  }

  // VIOLATION: No error handling
  private initializeDatabase() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        priority TEXT NOT NULL DEFAULT 'medium',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `;

    this.db.run(createTableQuery);
  }

  /**
   * VIOLATION: SQL injection via string concatenation
   * VIOLATION: No error handling
   */
  async createTask(userId: number, title: string, description: string): Promise<any> {
    const now = new Date().toISOString();

    // CRITICAL VIOLATION: SQL injection vulnerability!
    // An attacker could pass: title = "'; DROP TABLE tasks; --"
    const query = `
      INSERT INTO tasks (userId, title, description, status, priority, createdAt, updatedAt)
      VALUES (${userId}, '${title}', '${description}', 'pending', 'medium', '${now}', '${now}')
    `;

    // VIOLATION: No error handling
    return new Promise((resolve) => {
      this.db.run(query, function (err: any) {
        // VIOLATION: Swallowing errors silently
        resolve({ id: this.lastID });
      });
    });
  }

  /**
   * VIOLATION: SQL injection in WHERE clause
   * VIOLATION: No authorization check
   */
  async getTaskById(taskId: number) {
    // CRITICAL VIOLATION: SQL injection!
    // An attacker could pass: taskId = "1 OR 1=1"
    const query = `SELECT * FROM tasks WHERE id = ${taskId}`;

    return new Promise((resolve) => {
      this.db.get(query, (err: any, row: any) => {
        // VIOLATION: Swallowing errors
        resolve(row);
      });
    });
  }

  /**
   * VIOLATION: No authorization - returns all users' tasks!
   * VIOLATION: No pagination
   */
  async getAllTasks() {
    // VIOLATION: No user authorization - exposes all tasks from all users!
    const query = `SELECT * FROM tasks`;

    return new Promise((resolve) => {
      this.db.all(query, (err: any, rows: any) => {
        // VIOLATION: No error handling
        resolve(rows || []);
      });
    });
  }

  /**
   * VIOLATION: Critical SQL injection in UPDATE
   * VIOLATION: No authorization check
   */
  async updateTask(taskId: number, title: string, status: string) {
    const now = new Date().toISOString();

    // CRITICAL VIOLATION: Multiple SQL injection points!
    const query = `
      UPDATE tasks
      SET title = '${title}',
          status = '${status}',
          updatedAt = '${now}'
      WHERE id = ${taskId}
    `;

    // VIOLATION: No error handling
    // VIOLATION: No authorization check
    return new Promise((resolve) => {
      this.db.run(query, (err: any) => {
        resolve(true);
      });
    });
  }

  /**
   * VIOLATION: SQL injection in DELETE
   * VIOLATION: No authorization check
   */
  async deleteTask(taskId: number) {
    // CRITICAL VIOLATION: SQL injection + no authorization
    // Anyone can delete any task!
    const query = `DELETE FROM tasks WHERE id = ${taskId}`;

    return new Promise((resolve) => {
      this.db.run(query, (err: any) => {
        // VIOLATION: No error handling
        resolve(true);
      });
    });
  }

  /**
   * VIOLATION: Extremely dangerous search with SQL injection
   */
  async searchTasks(searchTerm: string) {
    // CRITICAL VIOLATION: SQL injection via LIKE clause
    // An attacker could pass: searchTerm = "' OR '1'='1"
    const query = `
      SELECT * FROM tasks
      WHERE title LIKE '%${searchTerm}%'
    `;

    return new Promise((resolve) => {
      this.db.all(query, (err: any, rows: any) => {
        // VIOLATION: No error handling
        // VIOLATION: No logging
        resolve(rows || []);
      });
    });
  }

  /**
   * VIOLATION: Dynamic table name (extreme SQL injection risk)
   */
  async dangerousQuery(tableName: string, columnName: string, value: string) {
    // EXTREMELY CRITICAL: Never trust user input for table/column names!
    const query = `SELECT * FROM ${tableName} WHERE ${columnName} = '${value}'`;

    return new Promise((resolve) => {
      this.db.all(query, (err: any, rows: any) => {
        resolve(rows || []);
      });
    });
  }
}
