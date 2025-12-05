@echo off
echo.
echo Testing FitFeed Capa Special Styling Feature
echo ================================================
echo.

echo Checking if server is running...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo Server is not running!
    echo Please start the dev server with: npm run dev
    exit /b 1
)

echo Server is running
echo.

echo Sending test request to /api/generate...
curl -X POST http://localhost:3000/api/generate ^
  -H "Content-Type: application/json" ^
  -d @test-fitfeed-special-styling.json ^
  -o response-special-styling.json

echo.
echo Response saved to response-special-styling.json
echo.

if exist response-special-styling.json (
    echo Image generation request completed!
    echo Check response-special-styling.json for the result
    echo.
    type response-special-styling.json
) else (
    echo No response received
)

echo.
pause
