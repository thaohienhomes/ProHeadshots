// Verification script to test the performance fixes
// Run this in the browser console on coolpix.me to verify fixes

console.log('🔍 Starting Performance Fixes Verification...\n');

// 1. Check for image preload warnings
let preloadWarnings = 0;
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
  const message = args.join(' ');
  if (message.includes('preloaded using link preload but not used')) {
    preloadWarnings++;
    console.log(`⚠️ Preload warning detected: ${message.substring(0, 100)}...`);
  }
  originalConsoleWarn.apply(console, args);
};

// 2. Check Google Analytics initialization
let gaInitCount = 0;
const originalGtag = window.gtag;
if (window.gtag) {
  console.log('✅ Google Analytics gtag function found');
  gaInitCount = 1;
} else {
  console.log('❌ Google Analytics gtag function not found');
}

// 3. Check for duplicate GA scripts
const gaScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
console.log(`📊 Google Analytics scripts found: ${gaScripts.length}`);
if (gaScripts.length === 1) {
  console.log('✅ Single GA script loaded (good)');
} else if (gaScripts.length > 1) {
  console.log('⚠️ Multiple GA scripts detected');
} else {
  console.log('❌ No GA scripts found');
}

// 4. Check image loading strategy
const images = document.querySelectorAll('img');
let priorityImages = 0;
let lazyImages = 0;

images.forEach(img => {
  if (img.loading === 'eager' || img.getAttribute('priority') === 'true') {
    priorityImages++;
  } else if (img.loading === 'lazy') {
    lazyImages++;
  }
});

console.log(`🖼️ Images found: ${images.length}`);
console.log(`📈 Priority/Eager images: ${priorityImages}`);
console.log(`⏳ Lazy images: ${lazyImages}`);

// 5. Wait for page load and check warnings
setTimeout(() => {
  console.log('\n📋 VERIFICATION RESULTS:');
  console.log('========================');
  console.log(`Preload warnings detected: ${preloadWarnings}`);
  console.log(`Google Analytics scripts: ${gaScripts.length}`);
  console.log(`Priority images: ${priorityImages}`);
  console.log(`Lazy images: ${lazyImages}`);
  
  if (preloadWarnings < 5) {
    console.log('✅ Preload warnings significantly reduced');
  } else {
    console.log('⚠️ Still seeing many preload warnings');
  }
  
  if (gaScripts.length === 1) {
    console.log('✅ Google Analytics properly configured');
  } else {
    console.log('⚠️ Google Analytics configuration needs attention');
  }
  
  console.log('\n🎉 Verification complete!');
}, 5000);

console.log('⏱️ Monitoring for 5 seconds...\n');
