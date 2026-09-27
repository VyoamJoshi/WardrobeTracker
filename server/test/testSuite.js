/**
 * Comprehensive Automated End-to-End Verification Test Suite
 * Tests all requirements from Section 38 & Core Product Specifications
 */

// Global native fetch is built into Node.js 24

const BASE_URL = 'http://localhost:5000/api';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 Starting Personal Wardrobe Tracker Complete Test Suite');
  console.log('🧪 ========================================================\n');

  try {
    // 1. Health Check
    console.log('📋 Test 1: Server Health Check');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'healthy', 'Health check responds with healthy status');

    // 2. User Registration
    console.log('\n📋 Test 2: User Registration');
    const uniqueEmail = `tester_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Lee',
        email: uniqueEmail,
        password: 'password123',
        confirmPassword: 'password123',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.token, 'User successfully registered with JWT token');
    const userAToken = regData.token;
    const userAHeaders = {
      Authorization: `Bearer ${userAToken}`,
      'Content-Type': 'application/json',
    };

    // 3. User Login
    console.log('\n📋 Test 3: User Login');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.token, 'User login succeeds and returns valid session token');

    // 4. Initial Wardrobe State (Empty State)
    console.log('\n📋 Test 4: Initial Wardrobe Verification');
    const initialClothesRes = await fetch(`${BASE_URL}/clothes`, { headers: userAHeaders });
    const initialClothes = await initialClothesRes.json();
    assert(initialClothes.count === 0, 'New user wardrobe is initially empty (proper user isolation)');

    // 5. Add Clothing Item 1 (T-Shirt with threshold 2)
    console.log('\n📋 Test 5: Add Clothing Item');
    const addRes1 = await fetch(`${BASE_URL}/clothes`, {
      method: 'POST',
      headers: userAHeaders,
      body: JSON.stringify({
        name: 'Vintage Black Tee',
        category: 'T-Shirts',
        color: 'Black',
        style: 'Oversized Boxy',
        material: '100% Organic Cotton',
        wash_threshold: 2,
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
      }),
    });
    const addedItem1 = await addRes1.json();
    assert(addRes1.status === 201 && addedItem1.data.name === 'Vintage Black Tee', 'Item 1 created successfully');
    const item1Id = addedItem1.data.clothing_id;
    assert(addedItem1.data.status === 'Clean', 'Initial status is Clean');
    assert(addedItem1.data.current_wear_count === 0, 'Initial current wear count is 0');

    // 6. Add Clothing Item 2 (Jeans with threshold 4)
    const addRes2 = await fetch(`${BASE_URL}/clothes`, {
      method: 'POST',
      headers: userAHeaders,
      body: JSON.stringify({
        name: 'Selvedge Indigo Jeans',
        category: 'Jeans',
        color: 'Indigo Blue',
        style: 'Straight Fit',
        material: '14oz Raw Denim',
        wash_threshold: 4,
        image_url: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800',
      }),
    });
    const addedItem2 = await addRes2.json();
    const item2Id = addedItem2.data.clothing_id;

    // 7. Verify List and Search
    console.log('\n📋 Test 6: Search & Filter Verification');
    const searchRes = await fetch(`${BASE_URL}/clothes?search=Black`, { headers: userAHeaders });
    const searchData = await searchRes.json();
    assert(searchData.count === 1 && searchData.data[0].name === 'Vintage Black Tee', 'Search by color "Black" returns correct item');

    const catFilterRes = await fetch(`${BASE_URL}/clothes?category=Jeans`, { headers: userAHeaders });
    const catFilterData = await catFilterRes.json();
    assert(catFilterData.count === 1 && catFilterData.data[0].name === 'Selvedge Indigo Jeans', 'Category filter "Jeans" works correctly');

    // 8. Test Wear Tracking ("I WORE THIS") on item 1 (threshold 2)
    console.log('\n📋 Test 7: Wear Tracking ("I WORE THIS")');
    const wear1Res = await fetch(`${BASE_URL}/clothes/${item1Id}/wear`, {
      method: 'POST',
      headers: userAHeaders,
    });
    const wear1Data = await wear1Res.json();
    assert(wear1Data.data.current_wear_count === 1, 'Current wear count incremented from 0 to 1');
    assert(wear1Data.data.lifetime_wear_count === 1, 'Lifetime wear count incremented from 0 to 1');
    assert(wear1Data.data.status === 'Clean', 'Status is Clean (1 < 2 * 0.75)');

    // Wear Item 2 (threshold 4) up to 3 wears (3 >= 4 * 0.75 -> Wash Soon)
    await fetch(`${BASE_URL}/clothes/${item2Id}/wear`, { method: 'POST', headers: userAHeaders });
    await fetch(`${BASE_URL}/clothes/${item2Id}/wear`, { method: 'POST', headers: userAHeaders });
    const wearItem2Third = await fetch(`${BASE_URL}/clothes/${item2Id}/wear`, { method: 'POST', headers: userAHeaders });
    const wearItem2Data = await wearItem2Third.json();
    assert(wearItem2Data.data.status === 'Wash Soon', 'Status updated to "Wash Soon" on Item 2 (3 wears >= 4 * 0.75)');

    // 9. Test Wear Tracking ("I WORE THIS") - 2nd Wear on Item 1 (Reaching threshold 2)
    const wear2Res = await fetch(`${BASE_URL}/clothes/${item1Id}/wear`, {
      method: 'POST',
      headers: userAHeaders,
    });
    const wear2Data = await wear2Res.json();
    assert(wear2Data.data.current_wear_count === 2, 'Current wear count incremented to 2');
    assert(wear2Data.data.lifetime_wear_count === 2, 'Lifetime wear count incremented to 2');
    assert(wear2Data.data.status === 'Wash Required', 'Status updated to "Wash Required" (2 wears >= threshold 2)');
    assert(wear2Data.data.wearHistory.length === 2, 'Wear history records 2 events');

    // 10. Test Washing Tracking ("MARK AS WASHED")
    console.log('\n📋 Test 8: Wash Tracking ("MARK AS WASHED")');
    const washRes = await fetch(`${BASE_URL}/clothes/${item1Id}/wash`, {
      method: 'POST',
      headers: userAHeaders,
    });
    const washData = await washRes.json();
    assert(washData.data.current_wear_count === 0, 'Current wear count resets to 0 upon wash');
    assert(washData.data.lifetime_wear_count === 2, 'Lifetime wear count remains unchanged at 2');
    assert(washData.data.status === 'Clean', 'Status returns to Clean');
    assert(washData.data.washHistory.length === 1, 'Wash history records the wash event');

    // 11. Test Edit Clothing
    console.log('\n📋 Test 9: Edit Clothing');
    const editRes = await fetch(`${BASE_URL}/clothes/${item1Id}`, {
      method: 'PUT',
      headers: userAHeaders,
      body: JSON.stringify({
        name: 'Vintage Faded Black Tee',
        wash_threshold: 3,
      }),
    });
    const editData = await editRes.json();
    assert(editData.data.name === 'Vintage Faded Black Tee', 'Item name updated without resetting histories');
    assert(editData.data.lifetime_wear_count === 2, 'Lifetime wears preserved after edit');

    // 12. Test Dashboard API
    console.log('\n📋 Test 10: Dashboard API Verification');
    // Wear item 2 one more time to reach wash threshold (3 + 1 = 4)
    await fetch(`${BASE_URL}/clothes/${item2Id}/wear`, { method: 'POST', headers: userAHeaders });

    const dashRes = await fetch(`${BASE_URL}/dashboard`, { headers: userAHeaders });
    const dashData = await dashRes.json();
    assert(dashData.data.stats.totalItems === 2, 'Dashboard reports accurate total items (2)');
    assert(dashData.data.stats.washRequiredCount === 1, 'Dashboard reports 1 item requiring wash');
    assert(dashData.data.laundryReminders.length === 1, 'Dashboard lists 1 laundry reminder');

    // 13. Test Analytics API
    console.log('\n📋 Test 11: Analytics API Verification');
    const analyticsRes = await fetch(`${BASE_URL}/analytics`, { headers: userAHeaders });
    const analyticsData = await analyticsRes.json();
    assert(analyticsData.data.overview.totalItems === 2, 'Analytics overview total items is 2');
    assert(analyticsData.data.overview.totalLifetimeWears === 6, 'Analytics lifetime wears accurate (2 + 4 = 6)');
    assert(analyticsData.data.overview.totalWashes === 1, 'Analytics total washes accurate (1)');
    assert(analyticsData.data.categoryDistribution.length === 2, 'Category distribution contains 2 categories');

    // 14. Test User Isolation (Security)
    console.log('\n📋 Test 12: Security & User Isolation');
    const userBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Taylor Smith',
        email: `taylor_${Date.now()}@example.com`,
        password: 'password123',
        confirmPassword: 'password123',
      }),
    });
    const userBData = await userBRes.json();
    const userBHeaders = {
      Authorization: `Bearer ${userBData.token}`,
      'Content-Type': 'application/json',
    };

    // User B tries to view User A's clothing item
    const unauthorizedGet = await fetch(`${BASE_URL}/clothes/${item1Id}`, { headers: userBHeaders });
    assert(unauthorizedGet.status === 404, 'User B cannot view User A item (isolated with 404)');

    // User B tries to wear User A's clothing item
    const unauthorizedWear = await fetch(`${BASE_URL}/clothes/${item1Id}/wear`, {
      method: 'POST',
      headers: userBHeaders,
    });
    assert(unauthorizedWear.status === 404, 'User B cannot wear User A item');

    // User B tries to delete User A's clothing item
    const unauthorizedDel = await fetch(`${BASE_URL}/clothes/${item1Id}`, {
      method: 'DELETE',
      headers: userBHeaders,
    });
    assert(unauthorizedDel.status === 404, 'User B cannot delete User A item');

    // 15. Test Delete Clothing
    console.log('\n📋 Test 13: Delete Clothing Item');
    const deleteRes = await fetch(`${BASE_URL}/clothes/${item1Id}`, {
      method: 'DELETE',
      headers: userAHeaders,
    });
    assert(deleteRes.status === 200, 'User A can delete their own item');

    const verifyDeleted = await fetch(`${BASE_URL}/clothes/${item1Id}`, { headers: userAHeaders });
    assert(verifyDeleted.status === 404, 'Deleted item is no longer accessible');

    console.log('\n🏁 ========================================================');
    console.log(`🏁 Test Results: ${testsPassed} Passed, ${testsFailed} Failed`);
    console.log('🏁 ========================================================');

    if (testsFailed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
