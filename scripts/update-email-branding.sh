#!/bin/bash

# Script to update email template branding from ProHeadshots to coolpix

echo "🎨 Updating email template branding..."

# Directory containing email templates
EMAIL_DIR="src/templates/email"

# Check if directory exists
if [ ! -d "$EMAIL_DIR" ]; then
    echo "❌ Email templates directory not found: $EMAIL_DIR"
    exit 1
fi

# Function to update a single file
update_file() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo "📧 Updating $filename..."
    
    # Update ProHeadshots to coolpix in various contexts
    sed -i 's/ProHeadshots/coolpix/g' "$file"
    sed -i 's/The ProHeadshots Team/The coolpix Team/g' "$file"
    sed -i 's/choosing ProHeadshots/choosing coolpix/g' "$file"
    sed -i 's/© 2024 ProHeadshots/© 2024 coolpix/g' "$file"
    
    echo "✅ Updated $filename"
}

# Update all HTML files in the email templates directory
for file in "$EMAIL_DIR"/*.html; do
    if [ -f "$file" ]; then
        update_file "$file"
    fi
done

echo ""
echo "🎉 Email template branding update complete!"
echo ""
echo "📋 Updated files:"
ls -la "$EMAIL_DIR"/*.html | awk '{print "   " $9}'
echo ""
echo "🔍 To verify changes, check the following files:"
echo "   - src/templates/email/welcome.html"
echo "   - src/templates/email/processing-complete.html"
echo "   - src/templates/email/order-confirmation.html"
echo "   - And all other email templates"
echo ""
echo "✨ All email templates now use 'coolpix' branding consistently!"
