// Database Integration Test Suite
// Tests payment data storage in Supabase userTable with proper plan updates

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Generate a valid UUID for testing
function generateTestUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Test configuration
const TEST_CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  testUserId: generateTestUUID(),
  testEmail: 'test@coolpix.me'
};

// Initialize Supabase client
const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseServiceKey);

console.log('🧪 Starting Database Integration Tests...\n');

async function runDatabaseTests() {
  try {
    // Test 1: Create test user
    await testCreateUser();
    
    // Test 2: Test payment data storage
    await testPaymentDataStorage();
    
    // Test 3: Test plan updates
    await testPlanUpdates();
    
    // Test 4: Test Polar payment integration
    await testPolarPaymentIntegration();
    
    // Test 5: Test work status updates
    await testWorkStatusUpdates();
    
    // Test 6: Test data integrity
    await testDataIntegrity();
    
    // Cleanup
    await cleanup();
    
    console.log('✅ All database integration tests passed!\n');
    
  } catch (error) {
    console.error('❌ Database integration tests failed:', error);
    await cleanup();
    process.exit(1);
  }
}

async function testCreateUser() {
  console.log('📝 Test 1: Creating test user...');
  
  const { data, error } = await supabase
    .from('userTable')
    .insert({
      id: TEST_CONFIG.testUserId,
      email: TEST_CONFIG.testEmail,
      name: 'Test User',
      created_at: new Date().toISOString()
    })
    .select();
  
  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }
  
  console.log('✅ Test user created successfully');
  console.log('   User ID:', TEST_CONFIG.testUserId);
  console.log('   Email:', TEST_CONFIG.testEmail);
}

async function testPaymentDataStorage() {
  console.log('\n💳 Test 2: Testing payment data storage...');
  
  const paymentData = {
    paymentStatus: 'paid',
    amount: 2999, // $29.99
    planType: 'professional',
    paid_at: new Date().toISOString(),
    polarOrderId: 'test-order-123',
    polarCheckoutId: 'test-checkout-456'
  };
  
  const { data, error } = await supabase
    .from('userTable')
    .update(paymentData)
    .eq('id', TEST_CONFIG.testUserId)
    .select();
  
  if (error) {
    throw new Error(`Failed to store payment data: ${error.message}`);
  }
  
  // Verify data was stored correctly
  const storedData = data[0];
  if (storedData.paymentStatus !== 'paid') {
    throw new Error('Payment status not stored correctly');
  }
  if (storedData.amount !== 2999) {
    throw new Error('Payment amount not stored correctly');
  }
  if (storedData.planType !== 'professional') {
    throw new Error('Plan type not stored correctly');
  }
  
  console.log('✅ Payment data stored successfully');
  console.log('   Payment Status:', storedData.paymentStatus);
  console.log('   Amount:', storedData.amount);
  console.log('   Plan Type:', storedData.planType);
  console.log('   Polar Order ID:', storedData.polarOrderId);
}

async function testPlanUpdates() {
  console.log('\n📊 Test 3: Testing plan updates...');
  
  // Test upgrading from professional to premium
  const upgradeData = {
    planType: 'premium',
    amount: 4999, // $49.99
    paid_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('userTable')
    .update(upgradeData)
    .eq('id', TEST_CONFIG.testUserId)
    .select();
  
  if (error) {
    throw new Error(`Failed to update plan: ${error.message}`);
  }
  
  const updatedData = data[0];
  if (updatedData.planType !== 'premium') {
    throw new Error('Plan type not updated correctly');
  }
  if (updatedData.amount !== 4999) {
    throw new Error('Plan amount not updated correctly');
  }
  
  console.log('✅ Plan updated successfully');
  console.log('   New Plan Type:', updatedData.planType);
  console.log('   New Amount:', updatedData.amount);
}

async function testPolarPaymentIntegration() {
  console.log('\n🔵 Test 4: Testing Polar payment integration...');
  
  const polarData = {
    polarCustomerId: 'cus_test_123',
    polarSubscriptionId: 'sub_test_456',
    polarCheckoutId: 'checkout_test_789',
    polarOrderId: 'order_test_101112'
  };
  
  const { data, error } = await supabase
    .from('userTable')
    .update(polarData)
    .eq('id', TEST_CONFIG.testUserId)
    .select();
  
  if (error) {
    throw new Error(`Failed to store Polar data: ${error.message}`);
  }
  
  const storedData = data[0];
  if (!storedData.polarCustomerId || !storedData.polarOrderId) {
    throw new Error('Polar payment data not stored correctly');
  }
  
  console.log('✅ Polar payment data stored successfully');
  console.log('   Customer ID:', storedData.polarCustomerId);
  console.log('   Order ID:', storedData.polarOrderId);
  console.log('   Checkout ID:', storedData.polarCheckoutId);
}

async function testWorkStatusUpdates() {
  console.log('\n⚙️ Test 5: Testing work status updates...');
  
  // Test progression: pending -> ongoing -> complete
  const statuses = ['pending', 'ongoing', 'complete'];
  
  for (const status of statuses) {
    const { data, error } = await supabase
      .from('userTable')
      .update({ 
        workStatus: status,
        submissionDate: status === 'ongoing' ? new Date().toISOString() : null
      })
      .eq('id', TEST_CONFIG.testUserId)
      .select();
    
    if (error) {
      throw new Error(`Failed to update work status to ${status}: ${error.message}`);
    }
    
    if (data[0].workStatus !== status) {
      throw new Error(`Work status not updated to ${status} correctly`);
    }
    
    console.log(`   ✅ Work status updated to: ${status}`);
  }
}

async function testDataIntegrity() {
  console.log('\n🔍 Test 6: Testing data integrity...');
  
  // Fetch final user data
  const { data, error } = await supabase
    .from('userTable')
    .select('*')
    .eq('id', TEST_CONFIG.testUserId)
    .single();
  
  if (error) {
    throw new Error(`Failed to fetch user data: ${error.message}`);
  }
  
  // Verify all required fields are present
  const requiredFields = [
    'id', 'email', 'paymentStatus', 'amount', 'planType', 
    'paid_at', 'polarOrderId', 'polarCheckoutId', 'workStatus'
  ];
  
  for (const field of requiredFields) {
    if (!data[field] && data[field] !== 0) {
      throw new Error(`Required field ${field} is missing or null`);
    }
  }
  
  // Verify data types and constraints
  if (typeof data.amount !== 'number') {
    throw new Error('Amount should be a number');
  }
  if (!['basic', 'professional', 'premium'].includes(data.planType)) {
    throw new Error('Invalid plan type');
  }
  if (!['pending', 'ongoing', 'complete'].includes(data.workStatus)) {
    throw new Error('Invalid work status');
  }
  
  console.log('✅ Data integrity verified');
  console.log('   All required fields present');
  console.log('   Data types correct');
  console.log('   Constraints satisfied');
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  const { error } = await supabase
    .from('userTable')
    .delete()
    .eq('id', TEST_CONFIG.testUserId);
  
  if (error) {
    console.warn('⚠️ Failed to cleanup test data:', error.message);
  } else {
    console.log('✅ Test data cleaned up successfully');
  }
}

// Run tests if this file is executed directly
runDatabaseTests();
