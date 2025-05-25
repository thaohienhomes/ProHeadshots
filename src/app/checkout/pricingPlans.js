/**
 * Pricing Plans Configuration
 * 
 * IMPORTANT: The Stripe URLs below are TEST LINKS for development.
 * Make sure to replace these with LIVE PRODUCTION Stripe links before deploying to production!
 */

export const pricingPlans = [
  {
    // Basic tier - entry level option
    "name": "Basic",
    "price": 29,
    "originalPrice": 58,
    "headshots": 10,
    "time": 3, // 3 hours processing time
    "isPopular": false,
    "stripeUrl": "https://buy.stripe.com/dR6dRvdYvfB7akgdQQ" // TEST STRIPE LINK - REPLACE WITH PROD
  },
  {
    // Professional tier - most popular option (highlighted in UI)
    "name": "Professional", 
    "price": 39,
    "originalPrice": 78,
    "headshots": 100,
    "time": 2, // 2 hours processing time (faster than basic)
    "isPopular": true, // This plan will be highlighted as "Most Popular"
    "stripeUrl": "https://buy.stripe.com/eVafZD4nV60xakg289" // TEST STRIPE LINK - REPLACE WITH PROD
  },
  {
    // Executive tier - premium option with fastest processing
    "name": "Executive",
    "price": 59,
    "originalPrice": 118,
    "headshots": 200,
    "time": 1, // 1 hour processing time (fastest option)
    "isPopular": false,
    "stripeUrl": "https://buy.stripe.com/9AQ3cR1bJagN8c8fZ0" // TEST STRIPE LINK - REPLACE WITH PROD
  }
];

// Default export for backward compatibility
export default pricingPlans;
