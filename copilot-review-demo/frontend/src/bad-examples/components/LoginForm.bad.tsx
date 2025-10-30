import React from 'react';

/**
 * BAD EXAMPLE: LoginForm with multiple violations
 *
 * Issues demonstrated:
 * 1. No input validation
 * 2. No error handling
 * 3. No loading states
 * 4. No TypeScript prop types
 * 5. Direct DOM manipulation
 * 6. No accessibility attributes
 * 7. Inline styles
 * 8. No controlled inputs
 */

// VIOLATION: No prop interface, using 'any'
export function LoginForm(props: any) {
  // VIOLATION: No state for form data, errors, or loading

  // VIOLATION: No validation, no error handling
  const handleSubmit = (e: any) => {
    e.preventDefault();

    // VIOLATION: Direct DOM access instead of React state
    const email = (document.getElementById('email') as any).value;
    const password = (document.getElementById('password') as any).value;

    // VIOLATION: No validation!
    // Empty strings, invalid emails, weak passwords all accepted

    // VIOLATION: No error handling, no try-catch
    fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        // VIOLATION: Not checking if request was successful
        props.onLogin(data);
      });
    // VIOLATION: No .catch() for errors!
  };

  // VIOLATION: Inline styles
  const formStyle = {
    width: '300px',
    padding: '20px',
    border: '1px solid black',
  };

  const inputStyle = {
    width: '100%',
    padding: '5px',
    margin: '5px 0',
  };

  return (
    <div style={formStyle}>
      <h2>Login</h2>

      {/* VIOLATION: No noValidate attribute, relying on browser validation only */}
      <form onSubmit={handleSubmit}>
        {/* VIOLATION: No label associated with input (accessibility issue) */}
        {/* VIOLATION: Uncontrolled input (no value prop, no onChange) */}
        {/* VIOLATION: No aria attributes */}
        <input id="email" type="text" placeholder="Email" style={inputStyle} />

        {/* VIOLATION: Using type="text" for password! */}
        <input id="password" type="text" placeholder="Password" style={inputStyle} />

        {/* VIOLATION: No loading state, no disabled state */}
        {/* VIOLATION: No aria-busy attribute */}
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          Login
        </button>
      </form>

      {/* VIOLATION: No error display area */}
      {/* VIOLATION: No link to registration */}
    </div>
  );
}
