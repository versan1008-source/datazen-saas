# DataZen CLI - PowerShell Interface for DataZen SaaS Scraper
# Usage: .\DataZenCLI.ps1 -Command <command> -Arguments <args>

param(
    [Parameter(Mandatory=$true)]
    [string]$Command,
    
    [Parameter(Mandatory=$false)]
    [hashtable]$Arguments = @{}
)

# Configuration
$API_BASE_URL = $env:DATAZEN_API_URL ?? "http://localhost:8000/api"
$CONFIG_FILE = "$env:APPDATA\DataZen\config.json"
$CONFIG_DIR = "$env:APPDATA\DataZen"

# Ensure config directory exists
if (-not (Test-Path $CONFIG_DIR)) {
    New-Item -ItemType Directory -Path $CONFIG_DIR -Force | Out-Null
}

# Load configuration
function Load-Config {
    if (Test-Path $CONFIG_FILE) {
        return Get-Content $CONFIG_FILE | ConvertFrom-Json
    }
    return @{}
}

# Save configuration
function Save-Config {
    param([hashtable]$Config)
    $Config | ConvertTo-Json | Set-Content $CONFIG_FILE
}

# Get stored token
function Get-Token {
    $config = Load-Config
    return $config.token
}

# Save token
function Set-Token {
    param([string]$Token)
    $config = Load-Config
    $config.token = $Token
    Save-Config $config
}

# Make API request
function Invoke-DataZenAPI {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [hashtable]$Body = @{}
    )
    
    $url = "$API_BASE_URL$Endpoint"
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $token = Get-Token
    if ($token) {
        $headers["Authorization"] = "Bearer $token"
    }
    
    try {
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $headers
        }
        
        if ($Body.Count -gt 0 -and $Method -ne "GET") {
            $params["Body"] = $Body | ConvertTo-Json
        }
        
        $response = Invoke-RestMethod @params
        return @{
            success = $true
            data = $response
        }
    }
    catch {
        return @{
            success = $false
            error = $_.Exception.Message
        }
    }
}

# Register command
function Register {
    param(
        [string]$Email,
        [string]$Password,
        [string]$FullName = ""
    )
    
    if (-not $Email -or -not $Password) {
        Write-Host "Error: Email and password are required" -ForegroundColor Red
        return
    }
    
    $body = @{
        email = $Email
        password = $Password
        full_name = $FullName
    }
    
    $result = Invoke-DataZenAPI -Endpoint "/auth/register" -Method "POST" -Body $body
    
    if ($result.success) {
        $token = $result.data.access_token
        Set-Token $token
        Write-Host "✓ Registration successful!" -ForegroundColor Green
        Write-Host "Token saved. You can now use DataZen CLI." -ForegroundColor Green
    }
    else {
        Write-Host "✗ Registration failed: $($result.error)" -ForegroundColor Red
    }
}

# Login command
function Login {
    param(
        [string]$Email,
        [string]$Password
    )
    
    if (-not $Email -or -not $Password) {
        Write-Host "Error: Email and password are required" -ForegroundColor Red
        return
    }
    
    $body = @{
        email = $Email
        password = $Password
    }
    
    $result = Invoke-DataZenAPI -Endpoint "/auth/login" -Method "POST" -Body $body
    
    if ($result.success) {
        $token = $result.data.access_token
        Set-Token $token
        Write-Host "✓ Login successful!" -ForegroundColor Green
        Write-Host "Token saved. You can now use DataZen CLI." -ForegroundColor Green
    }
    else {
        Write-Host "✗ Login failed: $($result.error)" -ForegroundColor Red
    }
}

# Get current user
function GetMe {
    $result = Invoke-DataZenAPI -Endpoint "/auth/me"
    
    if ($result.success) {
        $user = $result.data
        Write-Host "User Information:" -ForegroundColor Cyan
        Write-Host "  Email: $($user.email)"
        Write-Host "  Name: $($user.full_name)"
        Write-Host "  Plan: $($user.plan_id)"
        Write-Host "  Quota Used: $($user.quota_used)"
        Write-Host "  API Key: $($user.api_key)"
    }
    else {
        Write-Host "✗ Failed to get user info: $($result.error)" -ForegroundColor Red
    }
}

# Scrape command
function Scrape {
    param(
        [string]$Url,
        [string]$DataType = "text"
    )
    
    if (-not $Url) {
        Write-Host "Error: URL is required" -ForegroundColor Red
        return
    }
    
    # Check quota first
    $quotaResult = Invoke-DataZenAPI -Endpoint "/billing/check-quota" -Method "POST"
    if (-not $quotaResult.success) {
        Write-Host "✗ Quota check failed: $($quotaResult.error)" -ForegroundColor Red
        return
    }
    
    $body = @{
        url = $Url
        data_type = $DataType
        ai_mode = $false
    }
    
    Write-Host "Scraping $Url..." -ForegroundColor Yellow
    $result = Invoke-DataZenAPI -Endpoint "/scrape" -Method "POST" -Body $body
    
    if ($result.success) {
        $data = $result.data
        Write-Host "✓ Scraping successful!" -ForegroundColor Green
        Write-Host "  Items found: $($data.count)"
        Write-Host "  Processing time: $($data.processing_time_seconds)s"
        Write-Host ""
        Write-Host "Data:" -ForegroundColor Cyan
        $data.data | ForEach-Object { Write-Host "  - $_" }
    }
    else {
        Write-Host "✗ Scraping failed: $($result.error)" -ForegroundColor Red
    }
}

# Get quota status
function QuotaStatus {
    $result = Invoke-DataZenAPI -Endpoint "/billing/quota-status"
    
    if ($result.success) {
        $quota = $result.data
        Write-Host "Quota Status:" -ForegroundColor Cyan
        Write-Host "  Used: $($quota.quota_used) / $($quota.quota_limit)"
        Write-Host "  Remaining: $($quota.quota_remaining)"
        Write-Host "  Percentage: $($quota.quota_percentage)%"
        Write-Host "  Status: $($quota.status)"
    }
    else {
        Write-Host "✗ Failed to get quota status: $($result.error)" -ForegroundColor Red
    }
}

# Get usage stats
function UsageStats {
    param([int]$Days = 30)
    
    $result = Invoke-DataZenAPI -Endpoint "/billing/usage/stats?days=$Days"
    
    if ($result.success) {
        $stats = $result.data
        Write-Host "Usage Statistics (Last $Days days):" -ForegroundColor Cyan
        Write-Host "  Total Pages: $($stats.total_pages_scraped)"
        Write-Host "  Successful: $($stats.successful_scrapes)"
        Write-Host "  Failed: $($stats.failed_scrapes)"
        Write-Host "  Avg Time: $($stats.avg_processing_time_seconds)s"
        Write-Host ""
        Write-Host "By Source:" -ForegroundColor Yellow
        $stats.source_breakdown | ForEach-Object { 
            $_.GetEnumerator() | ForEach-Object { Write-Host "  $($_.Key): $($_.Value)" }
        }
    }
    else {
        Write-Host "✗ Failed to get usage stats: $($result.error)" -ForegroundColor Red
    }
}

# Show help
function Show-Help {
    Write-Host "DataZen CLI - Web Scraper SaaS" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  register -Email <email> -Password <pwd> [-FullName <name>]"
    Write-Host "    Register a new account"
    Write-Host ""
    Write-Host "  login -Email <email> -Password <pwd>"
    Write-Host "    Login to your account"
    Write-Host ""
    Write-Host "  me"
    Write-Host "    Show current user information"
    Write-Host ""
    Write-Host "  scrape -Url <url> [-DataType <type>]"
    Write-Host "    Scrape a website (text, images, links, emails)"
    Write-Host ""
    Write-Host "  quota"
    Write-Host "    Show current quota status"
    Write-Host ""
    Write-Host "  stats [-Days <days>]"
    Write-Host "    Show usage statistics"
    Write-Host ""
    Write-Host "  help"
    Write-Host "    Show this help message"
}

# Main command dispatcher
switch ($Command.ToLower()) {
    "register" {
        Register -Email $Arguments.Email -Password $Arguments.Password -FullName $Arguments.FullName
    }
    "login" {
        Login -Email $Arguments.Email -Password $Arguments.Password
    }
    "me" {
        GetMe
    }
    "scrape" {
        Scrape -Url $Arguments.Url -DataType $Arguments.DataType
    }
    "quota" {
        QuotaStatus
    }
    "stats" {
        UsageStats -Days $Arguments.Days
    }
    "help" {
        Show-Help
    }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Show-Help
    }
}

