# Unit Testing Guide for Subscription Tracker

## What is Unit Testing?
Unit testing checks individual parts of your code to ensure they work correctly. Each test verifies one specific behavior - either it succeeds (test passes ✓) or fails (test fails ✗).

## Running Tests

### Run all tests:
```bash
npm test
```

### Run tests in watch mode (re-runs when files change):
```bash
npm run test:watch
```

### Run tests with coverage report:
```bash
npm run test:coverage
```

---

## Understanding the Test Files

### Test Structure
Each test follows this pattern:

```javascript
describe('Group name', () => {
  test('should do something', async () => {
    // Arrange: Set up test data
    const userData = { email: 'test@example.com', password: 'pass123' };
    
    // Act: Perform the action
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(userData);
    
    // Assert: Check if result matches expectations
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
  });
});
```

### Key Concepts

1. **describe()** - Groups related tests together
2. **test()** - Individual test case
3. **expect()** - Assertion that checks if something is true
4. **async/await** - Used for API testing

---

## Common Assertions

```javascript
// Check exact value
expect(value).toBe('expected');

// Check if object has property
expect(object).toHaveProperty('propertyName');

// Check array length
expect(array).toHaveLength(3);

// Check if value includes something
expect(message).toMatch(/word/i);

// Check if array includes value
expect(array).toContain('value');

// Check if it's null/undefined
expect(value).toBeNull();
expect(value).toBeUndefined();

// Check boolean
expect(value).toBe(true);
```

---

## HTTP Status Codes You'll Test

- **200** - OK (success)
- **201** - Created (new resource created)
- **400** - Bad Request (missing/invalid data)
- **401** - Unauthorized (not authenticated)
- **404** - Not Found (resource doesn't exist)
- **500** - Server Error

---

## Example: Testing Your Auth Routes

### What Gets Tested (Success Cases):
✓ User can register with valid email and password
✓ User can login with correct credentials
✓ User receives authentication token on login

### What Gets Tested (Failure Cases):
✗ Cannot register with duplicate email
✗ Cannot register with weak password
✗ Cannot login with wrong password
✗ Cannot login if user doesn't exist
✗ Cannot access protected routes without token

---

## How to Write Your Own Tests

### 1. Create a new test file:
```
__tests__/yourfeature.test.js
```

### 2. Import necessary modules:
```javascript
import request from 'supertest';
import app from '../app.js';
```

### 3. Write describe and test blocks:
```javascript
describe('Feature Name', () => {
  test('should do something', async () => {
    const response = await request(app)
      .post('/your/endpoint')
      .send({ data: 'value' })
      .expect(200);
    
    expect(response.body).toHaveProperty('expectedField');
  });
});
```

---

## Tips for Writing Good Tests

1. **One test = one behavior** - Each test should verify one thing
2. **Descriptive names** - Test names should explain what they test
3. **Test both success AND failure** - Test happy path and error cases
4. **Use .expect()** - This provides clear status code expectations
5. **Clean test data** - Use realistic but obviously test data (test@example.com)
6. **Test edge cases** - Empty inputs, invalid formats, missing fields

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Tests timeout | Increase jest timeout: `jest.setTimeout(10000)` |
| Database not connecting | Mock the database in tests, don't use real DB |
| Auth token not working | Use test token or mock authentication |
| Tests run in wrong order | Jest runs tests randomly; make them independent |

---

## Next Steps

1. **Customize the example tests** - Update endpoints/data to match your actual code
2. **Add more tests** - Test edge cases and error scenarios
3. **Test utility functions** - Create tests for your helper functions in `/utils`
4. **Aim for coverage** - Run `npm run test:coverage` to see what's tested

---

## Resources

- Jest Docs: https://jestjs.io/
- Supertest: https://github.com/visionmedia/supertest
- API Testing Best Practices: https://jestjs.io/docs/api-testing
