import sqlite3 from 'sqlite3';
import { promisify } from 'util';

/**
 * Interface for Task data
 */
interface Task {
  id: number;
  userId: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for creating a new task
 */
interface CreateTaskInput {
  userId: number;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Interface for updating a task
 */
interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Task service with proper database security practices
 *
 * Demonstrates:
 * - Parameterized queries to prevent SQL injection
 * - Proper error handling
 * - Type-safe database operations
 * - Promise-based async operations
 */
export class TaskService {
  private db: sqlite3.Database;

  constructor(databasePath: string) {
    this.db = new sqlite3.Database(databasePath);
    this.initializeDatabase();
  }

  /**
   * Initialize the database schema
   * @private
   */
  private initializeDatabase(): void {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        priority TEXT NOT NULL DEFAULT 'medium',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        CHECK(status IN ('pending', 'in_progress', 'completed')),
        CHECK(priority IN ('low', 'medium', 'high'))
      )
    `;

    this.db.run(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating tasks table:', err);
        throw new Error('Failed to initialize database');
      }
    });
  }

  /**
   * Create a new task using parameterized query
   * @param input - Task creation data
   * @returns Created task
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    try {
      const now = new Date().toISOString();
      const priority = input.priority || 'medium';

      // Use parameterized query to prevent SQL injection
      const query = `
        INSERT INTO tasks (userId, title, description, status, priority, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        input.userId,
        input.title,
        input.description || '',
        'pending',
        priority,
        now,
        now,
      ];

      const run = promisify(this.db.run.bind(this.db));
      const result: any = await run(query, params);

      console.info(`Task created: ID ${result.lastID} for user ${input.userId}`);

      // Fetch and return the created task
      const createdTask = await this.getTaskById(result.lastID, input.userId);

      if (!createdTask) {
        throw new Error('Failed to retrieve created task');
      }

      return createdTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  /**
   * Get a task by ID with authorization check
   * @param taskId - Task ID to fetch
   * @param userId - User ID for authorization
   * @returns Task or null if not found
   */
  async getTaskById(taskId: number, userId: number): Promise<Task | null> {
    try {
      // Use parameterized query for security
      const query = `
        SELECT * FROM tasks
        WHERE id = ? AND userId = ?
      `;

      const get = promisify(this.db.get.bind(this.db));
      const task = await get(query, [taskId, userId]) as Task | undefined;

      return task || null;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw new Error('Failed to fetch task');
    }
  }

  /**
   * Get all tasks for a user with pagination
   * @param userId - User ID
   * @param limit - Number of tasks to return
   * @param offset - Number of tasks to skip
   * @returns Array of tasks
   */
  async getTasksByUser(
    userId: number,
    limit: number = 10,
    offset: number = 0
  ): Promise<Task[]> {
    try {
      // Use parameterized query with pagination
      const query = `
        SELECT * FROM tasks
        WHERE userId = ?
        ORDER BY createdAt DESC
        LIMIT ? OFFSET ?
      `;

      const all = promisify(this.db.all.bind(this.db));
      const tasks = await all(query, [userId, limit, offset]) as Task[];

      return tasks;
    } catch (error) {
      console.error('Error fetching tasks for user:', error);
      throw new Error('Failed to fetch tasks');
    }
  }

  /**
   * Update a task with authorization check
   * @param taskId - Task ID to update
   * @param userId - User ID for authorization
   * @param updates - Fields to update
   * @returns Updated task or null if not found
   */
  async updateTask(
    taskId: number,
    userId: number,
    updates: UpdateTaskInput
  ): Promise<Task | null> {
    try {
      // First verify the task belongs to the user
      const existingTask = await this.getTaskById(taskId, userId);

      if (!existingTask) {
        return null;
      }

      // Build update query dynamically but safely with parameterized values
      const updateFields: string[] = [];
      const params: any[] = [];

      if (updates.title !== undefined) {
        updateFields.push('title = ?');
        params.push(updates.title);
      }

      if (updates.description !== undefined) {
        updateFields.push('description = ?');
        params.push(updates.description);
      }

      if (updates.status !== undefined) {
        updateFields.push('status = ?');
        params.push(updates.status);
      }

      if (updates.priority !== undefined) {
        updateFields.push('priority = ?');
        params.push(updates.priority);
      }

      // Always update the updatedAt timestamp
      updateFields.push('updatedAt = ?');
      params.push(new Date().toISOString());

      // Add WHERE clause parameters
      params.push(taskId);
      params.push(userId);

      const query = `
        UPDATE tasks
        SET ${updateFields.join(', ')}
        WHERE id = ? AND userId = ?
      `;

      const run = promisify(this.db.run.bind(this.db));
      await run(query, params);

      console.info(`Task updated: ID ${taskId} by user ${userId}`);

      // Fetch and return updated task
      return await this.getTaskById(taskId, userId);
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  /**
   * Delete a task with authorization check
   * @param taskId - Task ID to delete
   * @param userId - User ID for authorization
   * @returns True if deleted, false if not found
   */
  async deleteTask(taskId: number, userId: number): Promise<boolean> {
    try {
      // Verify task exists and belongs to user
      const task = await this.getTaskById(taskId, userId);

      if (!task) {
        return false;
      }

      // Use parameterized query for deletion
      const query = `
        DELETE FROM tasks
        WHERE id = ? AND userId = ?
      `;

      const run = promisify(this.db.run.bind(this.db));
      const result: any = await run(query, [taskId, userId]);

      console.info(`Task deleted: ID ${taskId} by user ${userId}`);

      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }

  /**
   * Search tasks by title with proper escaping
   * @param userId - User ID
   * @param searchTerm - Search term for task title
   * @returns Array of matching tasks
   */
  async searchTasks(userId: number, searchTerm: string): Promise<Task[]> {
    try {
      // Use LIKE with parameterized query (SQLite handles escaping)
      const query = `
        SELECT * FROM tasks
        WHERE userId = ? AND title LIKE ?
        ORDER BY createdAt DESC
      `;

      const all = promisify(this.db.all.bind(this.db));
      const tasks = await all(query, [userId, `%${searchTerm}%`]) as Task[];

      return tasks;
    } catch (error) {
      console.error('Error searching tasks:', error);
      throw new Error('Failed to search tasks');
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    const close = promisify(this.db.close.bind(this.db));
    await close();
  }
}
