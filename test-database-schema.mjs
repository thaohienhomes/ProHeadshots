// Test database schema and connection
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
function loadEnvVars() {
  try {
    const envPath = join(__dirname, '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Error loading .env.local:', error.message);
    return {};
  }
}

const env = loadEnvVars();

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Database Connection...');
  
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials');
    return false;
  }
  
  try {
    // Test basic connection
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ Supabase connection successful');
      return true;
    } else {
      console.error('❌ Supabase connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
    return false;
  }
}

async function testUserTableSchema() {
  console.log('\n🧪 Testing userTable Schema...');
  
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  
  try {
    // Check if userTable exists and get its structure
    const response = await fetch(`${supabaseUrl}/rest/v1/userTable?select=*&limit=1`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ userTable exists and is accessible');
      
      // Test required columns by attempting to select them
      const testResponse = await fetch(`${supabaseUrl}/rest/v1/userTable?select=id,email,paymentStatus,workStatus,promptsResult&limit=1`, {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (testResponse.ok) {
        console.log('✅ Required columns exist: id, email, paymentStatus, workStatus, promptsResult');
        return true;
      } else {
        console.error('❌ Some required columns are missing');
        return false;
      }
    } else {
      console.error('❌ userTable not accessible:', response.status);
      const errorText = await response.text();
      console.error('   Error details:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing userTable:', error.message);
    return false;
  }
}

async function testOptionalTables() {
  console.log('\n🧪 Testing Optional Tables...');
  
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  
  const optionalTables = [
    'credit_transactions',
    'promo_codes',
    'referral_codes',
    'security_events'
  ];
  
  const results = {};
  
  for (const table of optionalTables) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=1`, {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log(`✅ ${table} table exists`);
        results[table] = true;
      } else {
        console.log(`⚠️  ${table} table not found (optional)`);
        results[table] = false;
      }
    } catch (error) {
      console.log(`⚠️  ${table} table check failed (optional)`);
      results[table] = false;
    }
  }
  
  return results;
}

async function runDatabaseTests() {
  console.log('🚀 Starting Database Schema Tests\n');
  
  const results = {
    connection: await testSupabaseConnection(),
    userTable: await testUserTableSchema(),
    optionalTables: await testOptionalTables(),
  };
  
  console.log('\n📊 Database Test Results:');
  console.log(`   Supabase Connection: ${results.connection ? '✅' : '❌'}`);
  console.log(`   userTable Schema: ${results.userTable ? '✅' : '❌'}`);
  
  const optionalTablesCount = Object.values(results.optionalTables).filter(Boolean).length;
  console.log(`   Optional Tables: ${optionalTablesCount}/4 found`);
  
  const criticalPassed = results.connection && results.userTable;
  
  if (criticalPassed) {
    console.log('\n🎉 Critical database requirements met! Ready for production.');
    if (optionalTablesCount < 4) {
      console.log('💡 Consider setting up optional tables for enhanced features.');
    }
  } else {
    console.log('\n⚠️  Critical database issues found. Please address before deploying.');
  }
  
  return criticalPassed;
}

// Run the tests
runDatabaseTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Database test execution failed:', error);
    process.exit(1);
  });
