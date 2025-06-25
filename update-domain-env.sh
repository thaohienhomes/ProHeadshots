#!/bin/bash

echo "🌐 Updating Environment Variables for Custom Domain"
echo ""

# Function to update site URL
update_site_url() {
    echo "🔧 Updating NEXT_PUBLIC_SITE_URL..."
    
    # Remove existing site URL
    echo "Removing existing NEXT_PUBLIC_SITE_URL..."
    vercel env rm NEXT_PUBLIC_SITE_URL production 2>/dev/null || echo "No existing NEXT_PUBLIC_SITE_URL found"
    
    # Add new site URL
    echo "Adding new site URL: https://coolpix.me"
    echo "https://coolpix.me" | vercel env add NEXT_PUBLIC_SITE_URL production
    
    echo "✅ Site URL updated!"
    echo ""
}

# Function to update monitoring URLs
update_monitoring_urls() {
    echo "📊 Updating monitoring endpoint URLs..."
    
    # Update uptime monitoring main site
    echo "Updating UPTIME_CHECK_MAIN_SITE..."
    vercel env rm UPTIME_CHECK_MAIN_SITE production 2>/dev/null || echo "No existing UPTIME_CHECK_MAIN_SITE found"
    echo "https://coolpix.me" | vercel env add UPTIME_CHECK_MAIN_SITE production
    
    # Update uptime monitoring health API
    echo "Updating UPTIME_CHECK_API_HEALTH..."
    vercel env rm UPTIME_CHECK_API_HEALTH production 2>/dev/null || echo "No existing UPTIME_CHECK_API_HEALTH found"
    echo "https://coolpix.me/api/monitoring/health" | vercel env add UPTIME_CHECK_API_HEALTH production
    
    echo "✅ Monitoring URLs updated!"
    echo ""
}

# Function to update external services
update_external_services() {
    echo "🔗 Updating external service configurations..."
    
    echo "📊 Google Analytics:"
    echo "   - Go to: https://analytics.google.com"
    echo "   - Navigate to your ProHeadshots property"
    echo "   - Go to: Data Streams → Web Stream"
    echo "   - Update website URL to: https://coolpix.me"
    echo ""
    
    echo "🔍 Sentry:"
    echo "   - Go to: https://sentry.io"
    echo "   - Navigate to your ProHeadshots project"
    echo "   - Go to: Settings → General"
    echo "   - Update project URL to: https://coolpix.me"
    echo ""
}

# Function to deploy with new configuration
deploy_with_domain() {
    echo "🚀 Deploying with custom domain configuration..."
    echo ""
    
    echo "This will deploy your application with:"
    echo "✅ Custom domain: https://coolpix.me"
    echo "✅ Updated monitoring URLs"
    echo "✅ Updated site configuration"
    echo ""
    
    read -p "Proceed with deployment? (y/N): " confirm
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        echo "Deploying to production..."
        vercel --prod
        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "🔍 Test your custom domain:"
        echo "curl -I https://coolpix.me"
        echo "curl https://coolpix.me/api/monitoring/health"
    else
        echo "Deployment cancelled."
    fi
}

# Function to test domain
test_domain() {
    echo "🧪 Testing custom domain..."
    echo ""
    
    # Test main domain
    echo "Testing https://coolpix.me..."
    if curl -I https://coolpix.me 2>/dev/null | head -1 | grep -q "200\|301\|302"; then
        echo "✅ Main domain is accessible"
    else
        echo "⚠️  Main domain not ready yet (DNS may still be propagating)"
    fi
    
    # Test www subdomain
    echo "Testing https://www.coolpix.me..."
    if curl -I https://www.coolpix.me 2>/dev/null | head -1 | grep -q "200\|301\|302"; then
        echo "✅ www subdomain is accessible"
    else
        echo "⚠️  www subdomain not ready yet (DNS may still be propagating)"
    fi
    
    # Test health API
    echo "Testing health API..."
    if curl -s https://coolpix.me/api/monitoring/health 2>/dev/null | grep -q "status\|health"; then
        echo "✅ Health API is working"
    else
        echo "⚠️  Health API not ready yet"
    fi
    
    echo ""
}

# Main menu
main_menu() {
    echo "🎯 Custom Domain Configuration"
    echo ""
    echo "Choose an option:"
    echo "1. Update Site URL Environment Variable"
    echo "2. Update Monitoring URLs"
    echo "3. Show External Service Update Instructions"
    echo "4. Deploy with Custom Domain"
    echo "5. Test Domain Configuration"
    echo "6. Update All & Deploy"
    echo "7. Exit"
    echo ""
    
    read -p "Enter your choice (1-7): " choice
    
    case $choice in
        1)
            update_site_url
            main_menu
            ;;
        2)
            update_monitoring_urls
            main_menu
            ;;
        3)
            update_external_services
            main_menu
            ;;
        4)
            deploy_with_domain
            main_menu
            ;;
        5)
            test_domain
            main_menu
            ;;
        6)
            update_site_url
            update_monitoring_urls
            update_external_services
            deploy_with_domain
            ;;
        7)
            echo "👋 Custom domain setup complete!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please choose 1-7."
            main_menu
            ;;
    esac
}

# Check if domain is ready
check_domain_status() {
    echo "🔍 Checking domain status..."
    echo ""
    
    # Check if domain resolves
    if nslookup coolpix.me >/dev/null 2>&1; then
        echo "✅ Domain DNS is configured"
        return 0
    else
        echo "⚠️  Domain DNS not configured yet"
        echo ""
        echo "📋 Please configure DNS first:"
        echo "1. Login to your domain registrar"
        echo "2. Add A record: @ → 76.76.19.61"
        echo "3. Add CNAME record: www → cname.vercel-dns.com"
        echo "4. Wait for DNS propagation (1-24 hours)"
        echo ""
        echo "💡 You can still update environment variables now and deploy later"
        echo ""
        return 1
    fi
}

# Start the setup
echo "🚀 Welcome to Custom Domain Setup for coolpix.me!"
echo ""
echo "Current status:"
echo "✅ Domain added to Vercel project"
echo "✅ Both coolpix.me and www.coolpix.me configured"
echo ""

check_domain_status
main_menu
