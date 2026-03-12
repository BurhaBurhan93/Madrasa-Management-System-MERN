// Test this in your browser console or use Postman

// Test 1: Check if server is running
fetch('http://localhost:5000/')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);

// Test 2: Get all users
fetch('http://localhost:5000/api/users')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test 3: Create a user
fetch('http://localhost:5000/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@test.com',
    password: 'test1234',
    role: 'student',
    status: 'active'
  })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
