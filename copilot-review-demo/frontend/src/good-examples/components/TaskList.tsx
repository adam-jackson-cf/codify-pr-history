import React, { useState, useEffect, useCallback } from 'react';

/**
 * Interface for Task data
 */
interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

/**
 * Props interface for TaskList component
 */
interface TaskListProps {
  /** Authentication token for API requests */
  token: string;
  /** Callback when a task is selected */
  onTaskSelect?: (task: Task) => void;
  /** Optional filter by status */
  statusFilter?: 'all' | Task['status'];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * TaskList component with proper React patterns
 *
 * Demonstrates:
 * - Proper TypeScript prop typing
 * - Error handling and loading states
 * - useEffect for data fetching
 * - useCallback for memoization
 * - Proper event handling
 * - Accessible markup
 * - Clean separation of concerns
 */
export function TaskList({ token, onTaskSelect, statusFilter = 'all' }: TaskListProps): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch tasks from API
   */
  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  /**
   * Effect to fetch tasks on mount and when statusFilter changes
   */
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, statusFilter]);

  /**
   * Handle task deletion with confirmation
   */
  const handleDeleteTask = useCallback(
    async (taskId: number, taskTitle: string) => {
      // Confirm before deletion
      const confirmed = window.confirm(`Are you sure you want to delete "${taskTitle}"?`);

      if (!confirmed) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete task');
        }

        // Remove from local state
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
        setError(errorMessage);
        console.error('Error deleting task:', err);
      }
    },
    [token]
  );

  /**
   * Handle task status update
   */
  const handleStatusChange = useCallback(
    async (taskId: number, newStatus: Task['status']) => {
      try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error('Failed to update task status');
        }

        const data = await response.json();

        // Update local state
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === taskId ? data.task : task))
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
        setError(errorMessage);
        console.error('Error updating task:', err);
      }
    },
    [token]
  );

  /**
   * Handle task selection
   */
  const handleTaskClick = useCallback(
    (task: Task) => {
      if (onTaskSelect) {
        onTaskSelect(task);
      }
    },
    [onTaskSelect]
  );

  /**
   * Get filtered tasks based on status filter
   */
  const filteredTasks = useCallback(() => {
    if (statusFilter === 'all') {
      return tasks;
    }
    return tasks.filter((task) => task.status === statusFilter);
  }, [tasks, statusFilter]);

  /**
   * Get priority badge color
   */
  const getPriorityColor = (priority: Task['priority']): string => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[priority];
  };

  // Loading state
  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center p-8" role="status" aria-live="polite">
        <p>Loading tasks...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded" role="alert">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={fetchTasks}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const displayTasks = filteredTasks();

  // Empty state
  if (displayTasks.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <ul className="space-y-4" role="list">
        {displayTasks.map((task) => (
          <li
            key={task.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            role="listitem"
          >
            <div className="flex justify-between items-start">
              <button
                onClick={() => handleTaskClick(task)}
                className="text-left flex-1"
                aria-label={`View details for ${task.title}`}
              >
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <p className="text-gray-600 mt-1">{task.description}</p>
              </button>

              <button
                onClick={() => handleDeleteTask(task.id, task.title)}
                className="ml-4 text-red-600 hover:text-red-800"
                aria-label={`Delete ${task.title}`}
              >
                Delete
              </button>
            </div>

            <div className="mt-3 flex items-center gap-4">
              <span className={`px-2 py-1 rounded text-sm ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>

              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                className="border rounded px-2 py-1 text-sm"
                aria-label={`Change status for ${task.title}`}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <span className="text-sm text-gray-500">
                Created: {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
