#!/bin/bash

# Script to test the special styling feature

echo "🚀 Testing FitFeed Capa Special Styling Feature"
echo "================================================"
echo ""

# Check if server is running
echo "📡 Checking if server is running..."
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Server is not running!"
    echo "Please start the dev server with: npm run dev"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Test the API
echo "📤 Sending test request to /api/generate..."
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d @test-fitfeed-special-styling.json \
  -w "\n\n📊 HTTP Status: %{http_code}\n" \
  -o response-special-styling.json

echo ""
echo "📥 Response saved to response-special-styling.json"
echo ""

# Check if image was generated
if [ -f "response-special-styling.json" ]; then
    FILENAME=$(cat response-special-styling.json | grep -o '"filename":"[^"]*"' | cut -d'"' -f4)

    if [ ! -z "$FILENAME" ]; then
        echo "✅ Image generated successfully!"
        echo "📸 Filename: $FILENAME"
        echo "🔗 URL: http://localhost:3000/output/$FILENAME"
        echo ""
        echo "🎉 Test completed successfully!"
    else
        echo "❌ Image generation failed"
        echo "Response:"
        cat response-special-styling.json
    fi
else
    echo "❌ No response received"
fi
