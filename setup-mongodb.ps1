# MongoDB Setup Helper Script

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   MongoDB Setup Helper" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "Checking MongoDB installation..." -ForegroundColor Yellow

# Check if MongoDB is installed
$mongoInstalled = Get-Command mongod -ErrorAction SilentlyContinue

if ($mongoInstalled) {
    Write-Host "SUCCESS: MongoDB is installed!`n" -ForegroundColor Green
    
    # Check if MongoDB service is running
    $mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
    
    if ($mongoService) {
        if ($mongoService.Status -eq "Running") {
            Write-Host "SUCCESS: MongoDB service is running`n" -ForegroundColor Green
            Write-Host "Update your .env file with:" -ForegroundColor Yellow
            Write-Host "MONGO_URI=mongodb://localhost:27017/sfo-meeting-suite`n" -ForegroundColor White
        }
        else {
            Write-Host "WARNING: MongoDB service is stopped" -ForegroundColor Yellow
            Write-Host "Starting MongoDB service...`n" -ForegroundColor Cyan
            Start-Service -Name MongoDB -ErrorAction SilentlyContinue
            Write-Host "MongoDB service started!`n" -ForegroundColor Green
        }
    }
}
else {
    Write-Host "MongoDB is NOT installed`n" -ForegroundColor Red
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "   OPTION 1: MongoDB Atlas (RECOMMENDED)" -ForegroundColor Green
    Write-Host "============================================`n" -ForegroundColor Cyan
    
    Write-Host "FREE cloud database - No installation needed!`n" -ForegroundColor Yellow
    Write-Host "Steps:" -ForegroundColor Cyan
    Write-Host "1. Visit: https://www.mongodb.com/cloud/atlas/register"
    Write-Host "2. Create free account and cluster"
    Write-Host "3. Get connection string"
    Write-Host "4. Update .env file`n"
    
    Write-Host "See MONGODB_SETUP.md for detailed instructions`n" -ForegroundColor Yellow
    
    Write-Host "Opening MongoDB Atlas signup page..." -ForegroundColor Cyan
    Start-Process "https://www.mongodb.com/cloud/atlas/register"
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. Update .env file with MONGO_URI"
Write-Host "2. Run: npm run seed"
Write-Host "3. Run: npm start"
Write-Host "============================================`n" -ForegroundColor Cyan
