/**
 * Authentication System Test Suite
 * Tests all auth endpoints and error handling
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, passed: true, duration: Date.now() - start });
    console.log(`✅ ${name}`);
  } catch (error: any) {
    results.push({
      name,
      passed: false,
      error: error.message,
      duration: Date.now() - start
    });
    console.error(`❌ ${name}: ${error.message}`);
  }
}

export async function runAuthTests() {
  console.log('🧪 Starting Authentication System Tests...\n');

  // Test 1: Sign Up
  await test('Sign Up with email and password', async () => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test User',
        email: `test_${Date.now()}@example.com`,
        password: 'TestPassword123!'
      })
    });

    if (!response.ok) {
      throw new Error(`Sign up failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error('No access token in response');
    }
  });

  // Test 2: Sign In
  await test('Sign In with email and password', async () => {
    const email = `test_${Date.now()}@example.com`;
    
    // First create account
    await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test User',
        email,
        password: 'TestPassword123!'
      })
    });

    // Then login
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'TestPassword123!' })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error('No access token in response');
    }
  });

  // Test 3: Get Current User
  await test('Get current user info', async () => {
    const email = `test_${Date.now()}@example.com`;
    
    // Create and login
    const registerRes = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test User',
        email,
        password: 'TestPassword123!'
      })
    });

    const registerData = await registerRes.json();
    const token = registerData.access_token;

    // Get user info
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Get user failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.email) {
      throw new Error('No email in user response');
    }
  });

  // Test 4: Invalid Login
  await test('Reject invalid credentials', async () => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!'
      })
    });

    if (response.ok) {
      throw new Error('Should have rejected invalid credentials');
    }
  });

  // Test 5: JSON Error Handling
  await test('Handle JSON parsing errors gracefully', async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'test' })
      });

      // Try to parse response
      const data = await response.json();
      // Should not throw JSON parsing error
    } catch (error: any) {
      if (error.message.includes('JSON')) {
        throw new Error('JSON parsing error not handled');
      }
    }
  });

  // Test 6: Google OAuth
  await test('Google OAuth endpoint exists', async () => {
    const response = await fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok && response.status !== 401) {
      throw new Error(`Google endpoint failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.access_token && response.ok) {
      throw new Error('No access token in Google response');
    }
  });

  // Test 7: Logout
  await test('Logout endpoint works', async () => {
    const email = `test_${Date.now()}@example.com`;
    
    // Create and login
    const registerRes = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test User',
        email,
        password: 'TestPassword123!'
      })
    });

    const registerData = await registerRes.json();
    const token = registerData.access_token;

    // Logout
    const response = await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Logout failed: ${response.status}`);
    }
  });

  // Print results
  console.log('\n📊 Test Results:');
  console.log('================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(r => {
    const status = r.passed ? '✅' : '❌';
    console.log(`${status} ${r.name} (${r.duration}ms)`);
    if (r.error) {
      console.log(`   Error: ${r.error}`);
    }
  });

  console.log(`\n📈 Summary: ${passed}/${total} tests passed`);
  
  return {
    passed: passed === total,
    results
  };
}

