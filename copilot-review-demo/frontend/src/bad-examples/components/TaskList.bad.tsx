import React, { useState, useEffect } from 'react';

/**
 * BAD EXAMPLE: TaskList component with multiple violations
 *
 * Issues demonstrated:
 * 1. Using 'any' types everywhere
 * 2. No error handling
 * 3. No loading states
 * 4. Not using useCallback (unnecessary re-renders)
 * 5. Prop drilling nightmare (passing data 5+ levels deep)
 * 6. Missing key props in lists
 * 7. Inline styles instead of CSS
 * 8. No accessibility attributes
 */

// VIOLATION: No prop interface, using 'any'
export function TaskList(props: any) {
  // VIOLATION: Using 'any' type
  const [tasks, setTasks] = useState<any>([]);
  // VIOLATION: No loading state
  // VIOLATION: No error state

  // VIOLATION: Not using useCallback, causes unnecessary re-renders
  useEffect(() => {
    // VIOLATION: No error handling
    fetch('http://localhost:3000/api/tasks', {
      headers: {
        Authorization: `Bearer ${props.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks));
  }, []); // VIOLATION: Missing dependency (props.token)

  // VIOLATION: No error handling
  // VIOLATION: Not using useCallback
  const deleteTask = (id: any) => {
    // VIOLATION: No confirmation dialog
    fetch(`http://localhost:3000/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${props.token}` },
    }).then(() => {
      // VIOLATION: Not checking response status
      setTasks(tasks.filter((t: any) => t.id !== id));
    });
  };

  // VIOLATION: Inline styles instead of CSS classes
  const cardStyle = {
    border: '1px solid black',
    padding: '10px',
    margin: '5px',
  };

  return (
    <div>
      {/* VIOLATION: No loading state UI */}
      {/* VIOLATION: No error state UI */}
      {/* VIOLATION: No empty state UI */}

      {/* VIOLATION: Missing key prop! React will complain */}
      {tasks.map((task: any) => (
        <div style={cardStyle}>
          {/* VIOLATION: No accessibility attributes */}
          <h3>{task.title}</h3>
          <p>{task.description}</p>

          {/* VIOLATION: Using div as button (not accessible) */}
          <div onClick={() => deleteTask(task.id)} style={{ color: 'red', cursor: 'pointer' }}>
            Delete
          </div>

          {/* VIOLATION: Inline event handler (performance issue) */}
          <select onChange={(e) => updateStatus(task.id, e.target.value)} value={task.status}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* VIOLATION: Prop drilling - passing props through multiple levels */}
          <TaskDetails
            task={task}
            token={props.token}
            user={props.user}
            settings={props.settings}
            theme={props.theme}
          />
        </div>
      ))}
    </div>
  );

  // VIOLATION: Function defined inside component body (recreated every render)
  function updateStatus(id: any, status: any) {
    // VIOLATION: No error handling
    fetch(`http://localhost:3000/api/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${props.token}`,
      },
      body: JSON.stringify({ status }),
    }).then(() => {
      // VIOLATION: Not checking response, not updating local state properly
      console.log('updated');
    });
  }
}

// VIOLATION: Prop drilling continues here
function TaskDetails(props: any) {
  return (
    <div>
      <TaskMetadata
        task={props.task}
        token={props.token}
        user={props.user}
        settings={props.settings}
        theme={props.theme}
      />
    </div>
  );
}

// VIOLATION: More prop drilling...
function TaskMetadata(props: any) {
  return (
    <div>
      <TaskTimestamp
        task={props.task}
        token={props.token}
        user={props.user}
        settings={props.settings}
        theme={props.theme}
      />
    </div>
  );
}

// VIOLATION: Prop drilling 5 levels deep!
function TaskTimestamp(props: any) {
  return (
    <div>
      {/* VIOLATION: Accessing nested property without null check */}
      Created: {props.task.createdAt}
    </div>
  );
}
