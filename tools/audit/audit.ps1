# ============================================================
# KOLCHI BUSINESS AUDIT LAYER v2
# ============================================================
#
# Purpose:
#   Read-only engineering audit for Kolchi Business
#
# Scope:
#   1. Project structure
#   2. Codebase size
#   3. Git state
#   4. Next.js architecture
#   5. Django architecture
#   6. Django checks / migrations
#   7. Database / Docker
#   8. API route discovery
#   9. API HTTP method mapping
#  10. Runtime API health/read-only checks
#  11. Frontend API usage
#  12. Frontend/API contract hints
#  13. Security static checks
#  14. Test inventory
#  15. Frontend build
#  16. CI/CD readiness
#  17. Monitoring readiness
#  18. Documentation readiness
#  19. Production readiness
#  20. Future workflow readiness
#
# IMPORTANT:
#   This audit is READ-ONLY.
#   It does not:
#     - modify source files
#     - run migrations
#     - create users
#     - create orders
#     - modify cart data
#     - modify database records
#
# ============================================================

$ErrorActionPreference = "Continue"

# ------------------------------------------------------------
# ROOT
# ------------------------------------------------------------

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..\..\")).Path
$ReportDir = Join-Path $PSScriptRoot "reports"
$ReportFile = Join-Path $ReportDir "latest-report.md"

if (!(Test-Path $ReportDir)) {
    New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null
}

$Results = @()

# ------------------------------------------------------------
# HELPERS
# ------------------------------------------------------------

function Add-Result {
    param(
        [string]$Area,
        [string]$Check,
        [ValidateSet("PASS","WARN","FAIL","BLOCKER","INFO")]
        [string]$Status,
        [string]$Message
    )

    $script:Results += [PSCustomObject]@{
        Area    = $Area
        Check   = $Check
        Status  = $Status
        Message = ($Message -replace "\s+", " ").Trim()
    }

    switch ($Status) {
        "PASS" {
            Write-Host "[PASS] $Area $Check" -ForegroundColor Green
        }
        "WARN" {
            Write-Host "[WARN] $Area $Check" -ForegroundColor Yellow
        }
        "FAIL" {
            Write-Host "[FAIL] $Area $Check" -ForegroundColor Red
        }
        "BLOCKER" {
            Write-Host "[BLOCKER] $Area $Check" -ForegroundColor Magenta
        }
        "INFO" {
            Write-Host "[INFO] $Area $Check" -ForegroundColor Cyan
        }
    }

    Write-Host "       $Message"
}

function Exists {
    param([string]$Path)

    return Test-Path (Join-Path $Root $Path)
}

function Get-AbsolutePath {
    param([string]$Path)

    return Join-Path $Root $Path
}

function Section {
    param([string]$Title)

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor DarkCyan
    Write-Host " $Title" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor DarkCyan
}

function Count-Files {
    param([string]$Path)

    if (!(Exists $Path)) {
        return 0
    }

    return @(
        Get-ChildItem (Get-AbsolutePath $Path) -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object {
            $_.FullName -notmatch '\\node_modules\\' -and
            $_.FullName -notmatch '\\.next\\' -and
            $_.FullName -notmatch '\\.git\\' -and
            $_.FullName -notmatch '\\__pycache__\\' -and
            $_.FullName -notmatch '\\.venv\\' -and
            $_.FullName -notmatch '\\reports\\'
        }
    ).Count
}

function Count-Lines {
    param([string]$Path)

    if (!(Exists $Path)) {
        return 0
    }

    $files = @(
        Get-ChildItem (Get-AbsolutePath $Path) -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object {
            $_.FullName -notmatch '\\node_modules\\' -and
            $_.FullName -notmatch '\\.next\\' -and
            $_.FullName -notmatch '\\.git\\' -and
            $_.FullName -notmatch '\\__pycache__\\' -and
            $_.FullName -notmatch '\\.venv\\' -and
            $_.FullName -notmatch '\\reports\\' -and
            $_.Extension -in @(
                ".js",
                ".jsx",
                ".mjs",
                ".cjs",
                ".py",
                ".css",
                ".scss",
                ".html",
                ".json",
                ".yml",
                ".yaml"
            )
        }
    )

    $total = 0

    foreach ($file in $files) {
        try {
            $total += @(Get-Content $file.FullName -ErrorAction SilentlyContinue).Count
        }
        catch {}
    }

    return $total
}

function Has-Text {
    param(
        [string]$Path,
        [string]$Pattern
    )

    if (!(Exists $Path)) {
        return $false
    }

    $result = Select-String `
        -Path (Get-AbsolutePath $Path) `
        -Pattern $Pattern `
        -SimpleMatch `
        -ErrorAction SilentlyContinue

    return $null -ne $result
}

function Has-TextRegex {
    param(
        [string]$Path,
        [string]$Pattern
    )

    if (!(Exists $Path)) {
        return $false
    }

    $result = Select-String `
        -Path (Get-AbsolutePath $Path) `
        -Pattern $Pattern `
        -ErrorAction SilentlyContinue

    return $null -ne $result
}

function Invoke-ReadOnlyHttp {
    param(
        [string]$Url,
        [int]$TimeoutSec = 5
    )

    try {
        return Invoke-WebRequest `
            -Uri $Url `
            -Method GET `
            -TimeoutSec $TimeoutSec `
            -UseBasicParsing `
            -ErrorAction Stop
    }
    catch {
        return $null
    }
}

# ------------------------------------------------------------
# HEADER
# ------------------------------------------------------------

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "              KOLCHI BUSINESS AUDIT LAYER v2" -ForegroundColor Cyan
Write-Host "                    READ-ONLY AUDIT" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Project: $Root"
Write-Host "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

# ============================================================
# 1. PROJECT STRUCTURE
# ============================================================

Section "1. PROJECT STRUCTURE"

$backendExists = Exists "backend"
$frontendExists = Exists "frontend-next"
$oldFrontendExists = Exists "frontend"

if ($backendExists) {
    Add-Result "STRUCTURE" "Backend" "PASS" "backend/ exists"
}
else {
    Add-Result "STRUCTURE" "Backend" "BLOCKER" "backend/ not found"
}

if ($frontendExists) {
    Add-Result "STRUCTURE" "Next.js frontend" "PASS" "frontend-next/ exists"
}
else {
    Add-Result "STRUCTURE" "Next.js frontend" "BLOCKER" "frontend-next/ not found"
}

if ($oldFrontendExists) {
    Add-Result "STRUCTURE" "Legacy frontend" "WARN" "Old frontend/ directory still exists"
}
else {
    Add-Result "STRUCTURE" "Legacy frontend" "PASS" "Old frontend/ directory removed"
}

# ============================================================
# 2. ACTIVE CODEBASE SIZE
# ============================================================

Section "2. ACTIVE CODEBASE SIZE"

$backendFiles = Count-Files "backend"
$frontendFiles = Count-Files "frontend-next"

$backendLines = Count-Lines "backend"
$frontendLines = Count-Lines "frontend-next"

$totalFiles = $backendFiles + $frontendFiles
$totalLines = $backendLines + $frontendLines

Write-Host "Backend files:       $backendFiles"
Write-Host "Backend lines:       $backendLines"
Write-Host ""
Write-Host "Frontend files:      $frontendFiles"
Write-Host "Frontend lines:      $frontendLines"
Write-Host ""
Write-Host "TOTAL ACTIVE FILES:  $totalFiles"
Write-Host "TOTAL ACTIVE LINES:  $totalLines"

Add-Result "SIZE" "Active codebase inventory" "PASS" "$totalFiles active files / $totalLines active lines"

# ============================================================
# 3. GIT
# ============================================================

Section "3. GIT STATUS"

$branch = ""
$commit = ""
$status = @()

try {
    Push-Location $Root

    $branch = (git branch --show-current 2>&1).ToString().Trim()
    $commit = (git log -1 --format="%h %s" 2>&1).ToString().Trim()
    $status = @(git status --short 2>&1)

    Pop-Location
}
catch {
    try { Pop-Location } catch {}
}

if ($branch) {
    Add-Result "GIT" "Branch" "PASS" "$branch"
}
else {
    Add-Result "GIT" "Branch" "FAIL" "Could not determine current Git branch"
}

if ($commit) {
    Add-Result "GIT" "Last commit" "PASS" "$commit"
}
else {
    Add-Result "GIT" "Last commit" "WARN" "Could not determine last commit"
}

if ($status.Count -eq 0) {
    Add-Result "GIT" "Working tree" "PASS" "Working tree clean"
}
else {
    Add-Result "GIT" "Working tree" "WARN" "$($status.Count) uncommitted item(s)"
    $status | ForEach-Object {
        Write-Host "       $_"
    }
}

# ============================================================
# 4. NEXT.JS
# ============================================================

Section "4. NEXT.JS"

$nextPackagePath = Get-AbsolutePath "frontend-next/package.json"
$nextVersion = "NOT FOUND"

if (Test-Path $nextPackagePath) {
    try {
        $pkg = Get-Content $nextPackagePath -Raw | ConvertFrom-Json

        if ($pkg.dependencies.next) {
            $nextVersion = $pkg.dependencies.next
        }
        elseif ($pkg.devDependencies.next) {
            $nextVersion = $pkg.devDependencies.next
        }

        Add-Result "NEXT.JS" "package.json" "PASS" "package.json detected"
    }
    catch {
        Add-Result "NEXT.JS" "package.json" "FAIL" "package.json could not be parsed"
    }
}
else {
    Add-Result "NEXT.JS" "package.json" "BLOCKER" "frontend-next/package.json not found"
}

Write-Host "Next.js version:     $nextVersion"

if (Exists "frontend-next/package-lock.json") {
    Add-Result "NEXT.JS" "package-lock" "PASS" "package-lock.json detected"
}
else {
    Add-Result "NEXT.JS" "package-lock" "WARN" "package-lock.json not found"
}

if (Exists "frontend-next/next.config.mjs") {
    Add-Result "NEXT.JS" "Next config" "PASS" "next.config.mjs detected"
}
else {
    Add-Result "NEXT.JS" "Next config" "WARN" "next.config.mjs not found"
}

if (Exists "frontend-next/jsconfig.json") {
    Add-Result "NEXT.JS" "JavaScript config" "PASS" "jsconfig.json detected"
}
else {
    Add-Result "NEXT.JS" "JavaScript config" "WARN" "jsconfig.json not found"
}

if (Exists "frontend-next/src/pages") {
    Add-Result "NEXT.JS" "Pages Router" "PASS" "src/pages exists"
}
else {
    Add-Result "NEXT.JS" "Pages Router" "WARN" "src/pages not found"
}

if (Exists "frontend-next/src/components") {
    Add-Result "NEXT.JS" "Components" "PASS" "src/components exists"
}
else {
    Add-Result "NEXT.JS" "Components" "FAIL" "src/components not found"
}

if (Exists "frontend-next/src/services") {
    Add-Result "NEXT.JS" "Services" "PASS" "src/services exists"
}
else {
    Add-Result "NEXT.JS" "Services" "FAIL" "src/services not found"
}

if (Exists "frontend-next/src/styles") {
    Add-Result "NEXT.JS" "Styles" "PASS" "src/styles exists"
}
else {
    Add-Result "NEXT.JS" "Styles" "WARN" "src/styles not found"
}

# ============================================================
# 5. DJANGO BACKEND
# ============================================================

Section "5. DJANGO BACKEND"

$managePy = Exists "backend/manage.py"
$settingsPy = Exists "backend/config/settings.py"
$requirements = Exists "backend/requirements.txt"

if ($managePy) {
    Add-Result "DJANGO" "manage.py" "PASS" "backend/manage.py exists"
}
else {
    Add-Result "DJANGO" "manage.py" "BLOCKER" "backend/manage.py not found"
}

if ($settingsPy) {
    Add-Result "DJANGO" "settings.py" "PASS" "backend/config/settings.py exists"
}
else {
    Add-Result "DJANGO" "settings.py" "BLOCKER" "settings.py not found"
}

if ($requirements) {
    Add-Result "DJANGO" "requirements.txt" "PASS" "requirements.txt exists"
}
else {
    Add-Result "DJANGO" "requirements.txt" "WARN" "requirements.txt not found"
}

$djangoApps = @(
    "core",
    "users",
    "catalog",
    "cart",
    "inventory",
    "orders",
    "payments"
)

foreach ($app in $djangoApps) {
    if (Exists "backend/apps/$app") {
        Add-Result "DJANGO" "$app app" "PASS" "backend/apps/$app exists"
    }
    else {
        Add-Result "DJANGO" "$app app" "WARN" "backend/apps/$app not found"
    }
}

# ============================================================
# 6. DJANGO CHECKS / MIGRATIONS
# ============================================================

Section "6. DJANGO CHECKS / MIGRATIONS"

if ($managePy) {

    Push-Location (Get-AbsolutePath "backend")

    $checkOutput = @(
        & python manage.py check 2>&1
    )

    $checkExit = $LASTEXITCODE

    if ($checkExit -eq 0) {
        Add-Result "DJANGO" "manage.py check" "PASS" "Django system check passed"
    }
    else {
        Add-Result "DJANGO" "manage.py check" "BLOCKER" (($checkOutput -join " ") -replace "\s+"," ")
    }

    # --------------------------------------------------------
    # Migration state
    # --------------------------------------------------------

    $migrationOutput = @(
        & python manage.py showmigrations --plan 2>&1
    )

    $migrationErrors = $migrationOutput | Where-Object {
        $_ -match "InconsistentMigrationHistory|Traceback" -or
        $_ -match "^\s*(ERROR|Exception):"
    }

    $migrationPlan = @(
        & python manage.py migrate --plan 2>&1
    )

    $migrationPlanExit = $LASTEXITCODE

    if ($migrationErrors.Count -gt 0) {
        Add-Result `
            "DJANGO" `
            "Migration state" `
            "BLOCKER" `
            (($migrationErrors -join " ") -replace "\s+"," ")
    }
    elseif ($migrationPlanExit -ne 0) {
        Add-Result `
            "DJANGO" `
            "Migration plan" `
            "BLOCKER" `
            (($migrationPlan | Select-Object -Last 5) -join " " -replace "\s+"," ")
    }
    elseif ($migrationPlan -match "No planned migration operations") {
        Add-Result `
            "DJANGO" `
            "Migration state" `
            "PASS" `
            "All migrations applied; no pending operations"
    }
    else {
        Add-Result `
            "DJANGO" `
            "Migration state" `
            "WARN" `
            "Pending migration operations detected"
    }

    Pop-Location
}

# ============================================================
# 7. DATABASE / DOCKER
# ============================================================

Section "7. DATABASE / DOCKER"

$composeCandidates = @(
    "docker-compose.yml",
    "docker-compose.yaml",
    "backend/docker-compose.yml",
    "backend/docker-compose.yaml"
)

$composeFound = $false
$composeFile = ""

foreach ($file in $composeCandidates) {
    if (Exists $file) {
        $composeFound = $true
        $composeFile = $file
        break
    }
}

if ($composeFound) {
    Add-Result "INFRA" "Docker Compose" "PASS" "$composeFile detected"
}
else {
    Add-Result "INFRA" "Docker Compose" "WARN" "No docker-compose file found"
}

if (Exists "backend/Dockerfile") {
    Add-Result "INFRA" "Backend Dockerfile" "PASS" "backend/Dockerfile exists"
}
else {
    Add-Result "INFRA" "Backend Dockerfile" "WARN" "backend/Dockerfile not found"
}

$postgresConfigured = $false

foreach ($candidate in $composeCandidates) {
    if (Exists $candidate) {
        if (Has-Text $candidate "postgres") {
            $postgresConfigured = $true
            break
        }
    }
}

if ($postgresConfigured) {
    Add-Result "INFRA" "PostgreSQL configuration" "PASS" "PostgreSQL reference detected in Compose"
}
else {
    Add-Result "INFRA" "PostgreSQL configuration" "WARN" "PostgreSQL reference not detected"
}

try {
    $dockerVersion = (docker --version 2>&1).ToString().Trim()

    if ($LASTEXITCODE -eq 0) {
        Add-Result "INFRA" "Docker engine" "PASS" $dockerVersion
    }
    else {
        Add-Result "INFRA" "Docker engine" "WARN" "Docker command unavailable"
    }
}
catch {
    Add-Result "INFRA" "Docker engine" "WARN" "Docker command unavailable"
}

try {
    $postgresContainer = @(
        docker ps --filter "name=kolchi-postgres" --format "{{.Names}}|{{.Status}}" 2>&1
    )

    if ($postgresContainer.Count -gt 0 -and $postgresContainer[0] -match "kolchi-postgres") {
        Add-Result "INFRA" "PostgreSQL container" "PASS" ($postgresContainer -join " ")
    }
    else {
        Add-Result "INFRA" "PostgreSQL container" "WARN" "kolchi-postgres container not currently running"
    }
}
catch {
    Add-Result "INFRA" "PostgreSQL container" "WARN" "Could not inspect Docker containers"
}

# ============================================================
# 8. API DISCOVERY
# ============================================================

Section "8. API DISCOVERY"

$apiRoutes = @()

if ($managePy) {

    $backendPath = Get-AbsolutePath "backend"

    Push-Location $backendPath

    $apiDiscovery = @(
        "from django.urls import get_resolver, URLPattern, URLResolver",
        "",
        "def walk(urlpatterns, prefix=''):",
        "    for p in urlpatterns:",
        "        if isinstance(p, URLPattern):",
        "            callback = p.callback",
        "            view_class = getattr(callback, 'view_class', None)",
        "            if view_class:",
        "                methods = []",
        "                for cls in view_class.__mro__:",
        "                    for method in ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']:",
        "                        if method in cls.__dict__ and method not in methods:",
        "                            methods.append(method)",
        "                print(prefix + str(p.pattern) + '|' + str(p.name) + '|' + view_class.__name__ + '|' + ','.join(m.upper() for m in methods))",
        "            else:",
        "                print(prefix + str(p.pattern) + '|' + str(p.name) + '|function|GET')",
        "        elif isinstance(p, URLResolver):",
        "            walk(p.url_patterns, prefix + str(p.pattern))",
        "",
        "walk(get_resolver().url_patterns)"
    )

    $apiOutput = @(
        & python manage.py shell -c ($apiDiscovery -join "`n") 2>&1
    )

    $apiExit = $LASTEXITCODE

    Pop-Location

    if ($apiExit -ne 0) {
        Add-Result "API" "URL resolver" "FAIL" "Could not resolve Django URL patterns"
    }
    else {

        $apiRoutes = @(
            $apiOutput | Where-Object {
                $_ -match "^api/v1/" -and
                $_ -match "\|"
            }
        )

        if ($apiRoutes.Count -gt 0) {
            Add-Result `
                "API" `
                "Route resolution" `
                "PASS" `
                "$($apiRoutes.Count) API routes resolved from Django URL resolver"
        }
        else {
            Add-Result `
                "API" `
                "Route resolution" `
                "FAIL" `
                "No api/v1 routes resolved"
        }

        # ----------------------------------------------------
        # Required routes
        # ----------------------------------------------------

        $requiredRoutes = @(
            "api/v1/health/",
            "api/v1/categories/",
            "api/v1/products/",
            "api/v1/products/<slug:slug>/",
            "api/v1/auth/register/",
            "api/v1/auth/login/",
            "api/v1/auth/logout/",
            "api/v1/auth/refresh/",
            "api/v1/auth/me/",
            "api/v1/cart/",
            "api/v1/cart/clear/",
            "api/v1/cart/items/",
            "api/v1/cart/items/<int:item_id>/delete/",
            "api/v1/cart/items/<int:item_id>/",
            "api/v1/orders/",
            "api/v1/orders/<int:pk>/"
        )

        foreach ($route in $requiredRoutes) {

            $match = @(
                $apiRoutes | Where-Object {
                    $_ -match [regex]::Escape($route)
                }
            )

            if ($match.Count -gt 0) {
                Add-Result `
                    "API" `
                    $route `
                    "PASS" `
                    ($match -join " ")
            }
            else {
                Add-Result `
                    "API" `
                    $route `
                    "FAIL" `
                    "Required route not resolved"
            }
        }

        # ----------------------------------------------------
        # Future modules
        # ----------------------------------------------------

        $paymentsRoute = @(
            $apiRoutes | Where-Object {
                $_ -match "^api/v1/payments/"
            }
        )

        if ($paymentsRoute.Count -gt 0) {
            Add-Result "API" "Payments routing" "PASS" ($paymentsRoute -join " ")
        }
        else {
            Add-Result "API" "Payments routing" "WARN" "No payments API route currently registered"
        }

        $inventoryRoute = @(
            $apiRoutes | Where-Object {
                $_ -match "^api/v1/inventory/"
            }
        )

        if ($inventoryRoute.Count -gt 0) {
            Add-Result "API" "Inventory routing" "PASS" ($inventoryRoute -join " ")
        }
        else {
            Add-Result "API" "Inventory routing" "WARN" "No inventory API route currently registered"
        }

        # ----------------------------------------------------
        # HTTP method mapping
        # ----------------------------------------------------

        $methodIssues = @()

        foreach ($route in $apiRoutes) {

            $parts = $route -split "\|"

            if ($parts.Count -ge 4) {

                $path = $parts[0]
                $view = $parts[2]
                $methods = $parts[3]

                if ([string]::IsNullOrWhiteSpace($methods)) {
                    $methodIssues += "$path -> $view"
                }
            }
        }

        if ($methodIssues.Count -eq 0) {
            Add-Result `
                "API" `
                "HTTP method mapping" `
                "PASS" `
                "Resolved API views have detected HTTP handlers"
        }
        else {
            Add-Result `
                "API" `
                "HTTP method mapping" `
                "WARN" `
                "$($methodIssues.Count) API routes have no detected HTTP handler"
        }
    }
}

# ============================================================
# 9. API RUNTIME - READ ONLY
# ============================================================

Section "9. API RUNTIME - READ ONLY"

$apiBaseUrl = "http://127.0.0.1:9000/api/v1"

$runtimeEndpoints = @(
    @{
        Name = "Health"
        Path = "/health/"
        Expected = 200
    },
    @{
        Name = "Categories"
        Path = "/categories/"
        Expected = 200
    },
    @{
        Name = "Products"
        Path = "/products/"
        Expected = 200
    }
)

$runtimeAvailable = $false

foreach ($endpoint in $runtimeEndpoints) {

    $url = "$apiBaseUrl$($endpoint.Path)"
    $response = Invoke-ReadOnlyHttp $url

    if ($null -eq $response) {
        Add-Result `
            "RUNTIME" `
            $endpoint.Name `
            "WARN" `
            "Endpoint unavailable or backend is not running: $url"

        continue
    }

    $runtimeAvailable = $true

    if ($response.StatusCode -eq $endpoint.Expected) {

        $size = 0

        try {
            if ($response.Content) {
                $size = $response.Content.Length
            }
        }
        catch {}

        Add-Result `
            "RUNTIME" `
            $endpoint.Name `
            "PASS" `
            "HTTP $($response.StatusCode), response size $size bytes"
    }
    else {
        Add-Result `
            "RUNTIME" `
            $endpoint.Name `
            "FAIL" `
            "Expected HTTP $($endpoint.Expected), received HTTP $($response.StatusCode)"
    }
}

if (!$runtimeAvailable) {
    Add-Result `
        "RUNTIME" `
        "Backend runtime" `
        "INFO" `
        "Runtime checks skipped/unavailable; static audit continues"
}

# ============================================================
# 10. FRONTEND API USAGE
# ============================================================

Section "10. FRONTEND API USAGE"

$frontendServiceFiles = @()

if (Exists "frontend-next/src/services") {

    $frontendServiceFiles = @(
        Get-ChildItem `
            (Get-AbsolutePath "frontend-next/src/services") `
            -Recurse `
            -File `
            -Include *.js,*.jsx,*.mjs `
            -ErrorAction SilentlyContinue
    )
}

if ($frontendServiceFiles.Count -gt 0) {

    Add-Result `
        "FRONTEND" `
        "Service layer" `
        "PASS" `
        "$($frontendServiceFiles.Count) frontend service file(s) detected"
}
else {

    Add-Result `
        "FRONTEND" `
        "Service layer" `
        "WARN" `
        "No frontend service files detected"
}

$fetchFiles = @()
$axiosFiles = @()

if (Exists "frontend-next/src") {

    $sourceFiles = @(
        Get-ChildItem `
            (Get-AbsolutePath "frontend-next/src") `
            -Recurse `
            -File `
            -Include *.js,*.jsx,*.mjs `
            -ErrorAction SilentlyContinue
    )

    foreach ($file in $sourceFiles) {

        $content = Get-Content $file.FullName -ErrorAction SilentlyContinue | Out-String

        if ($content -match "\bfetch\s*\(") {
            $fetchFiles += $file.FullName
        }

        if ($content -match "axios") {
            $axiosFiles += $file.FullName
        }
    }
}

if ($fetchFiles.Count -gt 0) {
    Add-Result `
        "FRONTEND" `
        "fetch usage" `
        "PASS" `
        "fetch() detected in $($fetchFiles.Count) file(s)"
}
else {
    Add-Result `
        "FRONTEND" `
        "fetch usage" `
        "INFO" `
        "No direct fetch() usage detected"
}

if ($axiosFiles.Count -gt 0) {
    Add-Result `
        "FRONTEND" `
        "Axios usage" `
        "WARN" `
        "Axios detected in $($axiosFiles.Count) file(s)"
}
else {
    Add-Result `
        "FRONTEND" `
        "Axios usage" `
        "PASS" `
        "No Axios usage detected"
}

if (Exists "frontend-next/src/services/api/client.js") {
    Add-Result `
        "FRONTEND" `
        "API client" `
        "PASS" `
        "Central API client detected"
}
else {
    Add-Result `
        "FRONTEND" `
        "API client" `
        "WARN" `
        "Central API client not found"
}

# ============================================================
# 11. FRONTEND / API CONTRACT
# ============================================================

Section "11. FRONTEND / API CONTRACT"

$serviceFilesForContract = @()

if (Exists "frontend-next/src/services") {

    $serviceFilesForContract = @(
        Get-ChildItem `
            (Get-AbsolutePath "frontend-next/src/services") `
            -Recurse `
            -File `
            -Include *.js,*.jsx,*.mjs `
            -ErrorAction SilentlyContinue
    )
}

$contractRoutes = @()

foreach ($file in $serviceFilesForContract) {

    $content = Get-Content $file.FullName -ErrorAction SilentlyContinue | Out-String

    if ($content) {

        $matches = [regex]::Matches(
            $content,
            "['`"](/[^'`"]+?)['`"]"
        )

        foreach ($match in $matches) {

            $value = $match.Groups[1].Value

            if ($value -match "^/(products|categories|auth|cart|orders|payments|inventory)") {
                $contractRoutes += "$($file.Name): $value"
            }
        }
    }
}

$contractRoutes = $contractRoutes | Sort-Object -Unique

if ($contractRoutes.Count -gt 0) {

    Add-Result `
        "CONTRACT" `
        "Frontend endpoint references" `
        "PASS" `
        "$($contractRoutes.Count) endpoint reference(s) detected"

    foreach ($route in $contractRoutes) {
        Write-Host "       $route"
    }
}
else {
    Add-Result `
        "CONTRACT" `
        "Frontend endpoint references" `
        "WARN" `
        "No recognizable frontend API endpoint references detected"
}

# ============================================================
# 12. SECURITY STATIC CHECKS
# ============================================================

Section "12. SECURITY STATIC CHECKS"

$securityPass = 0
$securityChecks = 0

function Security-Check {
    param(
        [string]$Name,
        [bool]$Condition,
        [string]$PassMessage,
        [string]$WarnMessage
    )

    $script:securityChecks++

    if ($Condition) {
        $script:securityPass++
        Add-Result "SECURITY" $Name "PASS" $PassMessage
    }
    else {
        Add-Result "SECURITY" $Name "WARN" $WarnMessage
    }
}

Security-Check `
    "Root gitignore" `
    (Exists ".gitignore") `
    ".gitignore exists" `
    ".gitignore not found"

Security-Check `
    "Backend env ignored" `
    (Has-Text ".gitignore" "backend/.env") `
    "backend/.env is referenced in .gitignore" `
    "backend/.env is not clearly ignored"

Security-Check `
    "Frontend env ignored" `
    (Has-Text ".gitignore" "frontend-next/.env") `
    "frontend-next/.env is referenced in .gitignore" `
    "frontend-next/.env is not clearly ignored"

Security-Check `
    "SECRET_KEY configuration" `
    (Has-Text "backend/config/settings.py" "SECRET_KEY") `
    "SECRET_KEY configuration detected" `
    "SECRET_KEY configuration not detected"

Security-Check `
    "DEBUG configuration" `
    (Has-Text "backend/config/settings.py" "DEBUG") `
    "DEBUG configuration detected" `
    "DEBUG configuration not detected"

Security-Check `
    "ALLOWED_HOSTS" `
    (Has-Text "backend/config/settings.py" "ALLOWED_HOSTS") `
    "ALLOWED_HOSTS configuration detected" `
    "ALLOWED_HOSTS configuration not detected"

Security-Check `
    "CORS configuration" `
    (Has-Text "backend/config/settings.py" "CORS") `
    "CORS configuration detected" `
    "CORS configuration not detected"

Security-Check `
    "CSRF configuration" `
    (Has-Text "backend/config/settings.py" "CSRF") `
    "CSRF configuration detected" `
    "CSRF configuration not detected"

Security-Check `
    "JWT/authentication app" `
    (Exists "backend/apps/users") `
    "Users/authentication module exists" `
    "Users/authentication module not found"

$backendEnvExists = Exists "backend/.env"

if ($backendEnvExists) {
    Add-Result `
        "SECURITY" `
        "Local backend env" `
        "WARN" `
        "backend/.env exists locally; it must remain untracked"
}
else {
    Add-Result `
        "SECURITY" `
        "Local backend env" `
        "INFO" `
        "backend/.env not present in current working tree"
}

$securityPercent = 0

if ($securityChecks -gt 0) {
    $securityPercent = [math]::Round(
        ($securityPass / $securityChecks) * 100
    )
}

Write-Host ""
Write-Host "Security static score: $securityPass / $securityChecks"
Write-Host "Security maturity:     $securityPercent%"

# ============================================================
# 13. TEST INVENTORY
# ============================================================

Section "13. TEST INVENTORY"

$testFiles = @()

$testRoots = @(
    "backend",
    "frontend-next"
)

foreach ($root in $testRoots) {

    if (Exists $root) {

        $found = @(
            Get-ChildItem `
                (Get-AbsolutePath $root) `
                -Recurse `
                -File `
                -Include `
                    *.test.js,
                    *.test.jsx,
                    *.spec.js,
                    *.spec.jsx,
                    test_*.py,
                    *_test.py `
                -ErrorAction SilentlyContinue |
            Where-Object {
                $_.FullName -notmatch '\\node_modules\\' -and
                $_.FullName -notmatch '\\.next\\' -and
                $_.FullName -notmatch '\\__pycache__\\' -and
                $_.FullName -notmatch '\\.venv\\'
            }
        )

        $testFiles += $found
    }
}

if ($testFiles.Count -gt 0) {

    Add-Result `
        "TESTS" `
        "Test inventory" `
        "PASS" `
        "$($testFiles.Count) test/spec file(s) detected"

    foreach ($test in $testFiles) {
        Write-Host "       $($test.FullName.Replace($Root,''))"
    }
}
else {

    Add-Result `
        "TESTS" `
        "Test inventory" `
        "WARN" `
        "No test/spec files detected"
}

# ============================================================
# 14. FRONTEND BUILD
# ============================================================

Section "14. FRONTEND BUILD"

if (Exists "frontend-next/package.json") {

    Push-Location (Get-AbsolutePath "frontend-next")

    $buildOutput = @(
        npm run build 2>&1
    )

    $buildExit = $LASTEXITCODE

    Pop-Location

    if ($buildExit -eq 0) {

        Add-Result `
            "BUILD" `
            "Next.js production build" `
            "PASS" `
            "npm run build completed successfully"
    }
    else {

        $buildTail = (
            $buildOutput |
            Select-Object -Last 15
        ) -join " "

        Add-Result `
            "BUILD" `
            "Next.js production build" `
            "FAIL" `
            (($buildTail) -replace "\s+"," ")
    }
}
else {

    Add-Result `
        "BUILD" `
        "Next.js production build" `
        "WARN" `
        "package.json not found"
}

# ============================================================
# 15. CI/CD
# ============================================================

Section "15. CI/CD READINESS"

if (Exists ".github/workflows") {

    $workflowFiles = @(
        Get-ChildItem `
            (Get-AbsolutePath ".github/workflows") `
            -Recurse `
            -File `
            -Include *.yml,*.yaml `
            -ErrorAction SilentlyContinue
    )

    if ($workflowFiles.Count -gt 0) {

        Add-Result `
            "CI/CD" `
            "GitHub Actions" `
            "PASS" `
            "$($workflowFiles.Count) workflow file(s) detected"
    }
    else {

        Add-Result `
            "CI/CD" `
            "GitHub Actions" `
            "WARN" `
            ".github/workflows exists but no workflow files detected"
    }
}
else {

    Add-Result `
        "CI/CD" `
        "GitHub Actions" `
        "WARN" `
        ".github/workflows not found"
}

# ============================================================
# 16. MONITORING
# ============================================================

Section "16. MONITORING READINESS"

if (Exists "monitoring") {

    Add-Result `
        "MONITORING" `
        "Monitoring directory" `
        "PASS" `
        "monitoring/ exists"
}
else {

    Add-Result `
        "MONITORING" `
        "Monitoring directory" `
        "WARN" `
        "monitoring/ not found"
}

$observabilityFiles = @(
    "backend/apps/core/health.py",
    "backend/apps/core/views.py",
    "backend/apps/core/urls.py"
)

$healthDetected = $false

foreach ($file in $observabilityFiles) {
    if (Exists $file) {
        if (
            (Has-Text $file "health") -or
            (Has-Text $file "health_check")
        ) {
            $healthDetected = $true
        }
    }
}

if ($healthDetected) {

    Add-Result `
        "MONITORING" `
        "Health endpoint implementation" `
        "PASS" `
        "Health-check implementation detected"
}
else {

    Add-Result `
        "MONITORING" `
        "Health endpoint implementation" `
        "WARN" `
        "Health-check implementation not statically detected"
}

# ============================================================
# 17. DOCUMENTATION
# ============================================================

Section "17. DOCUMENTATION READINESS"

$documentationScore = 0

if (Exists "README.md") {
    $documentationScore += 1
    Add-Result "DOCS" "Root README" "PASS" "README.md exists"
}
else {
    Add-Result "DOCS" "Root README" "WARN" "Root README.md not found"
}

if (Exists "frontend-next/README.md") {
    $documentationScore += 1
    Add-Result "DOCS" "Frontend README" "PASS" "frontend-next/README.md exists"
}
else {
    Add-Result "DOCS" "Frontend README" "INFO" "Frontend README not found"
}

if (Exists "docs") {
    $documentationScore += 1
    Add-Result "DOCS" "Documentation directory" "PASS" "docs/ exists"
}
else {
    Add-Result "DOCS" "Documentation directory" "WARN" "docs/ not found"
}

# ============================================================
# 18. PRODUCTION FEATURE MATRIX
# ============================================================

Section "18. PRODUCTION FEATURE MATRIX"

$features = [ordered]@{
    "Authentication" = (Exists "backend/apps/users")
    "Catalog"        = (Exists "backend/apps/catalog")
    "Cart"           = (Exists "backend/apps/cart")
    "Inventory"      = (Exists "backend/apps/inventory")
    "Orders"         = (Exists "backend/apps/orders")
    "Payments"       = (Exists "backend/apps/payments")
    "Docker"         = $composeFound
    "CI/CD"          = (Exists ".github/workflows")
    "Tests"          = ($testFiles.Count -gt 0)
    "API"            = ($apiRoutes.Count -gt 0)
    "Monitoring"     = (Exists "monitoring")
    "Documentation"  = (Exists "docs" -or Exists "README.md")
}

$featureDone = 0

foreach ($item in $features.GetEnumerator()) {

    if ($item.Value) {

        $featureDone++

        Write-Host `
            ("{0,-18} YES" -f $item.Key) `
            -ForegroundColor Green
    }
    else {

        Write-Host `
            ("{0,-18} NO" -f $item.Key) `
            -ForegroundColor DarkYellow
    }
}

$featurePercent = 0

if ($features.Count -gt 0) {
    $featurePercent = [math]::Round(
        ($featureDone / $features.Count) * 100
    )
}

Write-Host ""
Write-Host "Production feature coverage: $featurePercent%"

# ============================================================
# 19. ARCHITECTURE SCORE
# ============================================================

Section "19. ARCHITECTURE SCORE"

$architectureScore = 0
$architectureMax = 100

if ($backendExists) {
    $architectureScore += 10
}

if ($frontendExists) {
    $architectureScore += 10
}

if (Exists "backend/apps") {
    $architectureScore += 10
}

if (Exists "frontend-next/src/components") {
    $architectureScore += 10
}

if (Exists "frontend-next/src/services") {
    $architectureScore += 10
}

if (Exists "backend/apps/catalog") {
    $architectureScore += 10
}

if (Exists "backend/apps/users") {
    $architectureScore += 5
}

if (Exists "backend/apps/cart") {
    $architectureScore += 5
}

if (Exists "backend/apps/orders") {
    $architectureScore += 5
}

if ($composeFound) {
    $architectureScore += 10
}

if (Exists ".github/workflows") {
    $architectureScore += 5
}

if (Exists "docs") {
    $architectureScore += 5
}

Write-Host "Architecture score: $architectureScore / $architectureMax"

# ============================================================
# 20. PERFORMANCE READINESS
# ============================================================

Section "20. PERFORMANCE READINESS"

$performanceScore = 0
$performanceMax = 100

if ($frontendExists) {
    $performanceScore += 15
}

if (Exists "frontend-next/next.config.mjs") {
    $performanceScore += 10
}

if (Exists "frontend-next/package-lock.json") {
    $performanceScore += 10
}

if (Exists "frontend-next/src/components") {
    $performanceScore += 10
}

if (Exists "frontend-next/src/services") {
    $performanceScore += 10
}

if (Exists "frontend-next/src/pages") {
    $performanceScore += 10
}

if ($fetchFiles.Count -le 3) {
    $performanceScore += 10
}

if (Exists "frontend-next/public") {
    $performanceScore += 5
}

if (Exists "frontend-next/next.config.mjs") {
    if (Has-Text "frontend-next/next.config.mjs" "images") {
        $performanceScore += 5
    }
}

Write-Host "Static performance readiness: $performanceScore / $performanceMax"
Write-Host "NOTE: Lighthouse/Core Web Vitals remain future runtime checks."

# ============================================================
# 21. FUTURE SECURITY HARDENING MATRIX
# ============================================================

Section "21. FUTURE SECURITY HARDENING MATRIX"

$hardeningItems = [ordered]@{
    "Env secrets"       = (
        (Has-Text ".gitignore" "backend/.env") -and
        (Has-Text ".gitignore" "frontend-next/.env")
    )

    "DEBUG config"      = (Has-Text "backend/config/settings.py" "DEBUG")

    "Allowed hosts"     = (Has-Text "backend/config/settings.py" "ALLOWED_HOSTS")

    "CORS"              = (Has-Text "backend/config/settings.py" "CORS")

    "CSRF"              = (Has-Text "backend/config/settings.py" "CSRF")

    "JWT/Auth"          = (Exists "backend/apps/users")

    "Production config" = (
        (Has-Text "backend/config/settings.py" "SECRET_KEY") -and
        (Has-Text "backend/config/settings.py" "DEBUG")
    )

    "Rate limiting"     = (
        (Has-Text "backend/config/settings.py" "THROTTLE") -or
        (Has-Text "backend/config/settings.py" "DEFAULT_THROTTLE")
    )

    "Security headers"  = (
        (Has-Text "backend/config/settings.py" "SECURE_SSL_REDIRECT") -or
        (Has-Text "backend/config/settings.py" "SECURE_HSTS")
    )
}

$hardeningDone = 0

foreach ($item in $hardeningItems.GetEnumerator()) {

    if ($item.Value) {

        $hardeningDone++

        Add-Result `
            "HARDENING" `
            $item.Key `
            "PASS" `
            "Static indicator detected"
    }
    else {

        Add-Result `
            "HARDENING" `
            $item.Key `
            "WARN" `
            "Production hardening indicator not detected"
    }
}

$hardeningPercent = [math]::Round(
    ($hardeningDone / $hardeningItems.Count) * 100
)

Write-Host ""
Write-Host "Security hardening readiness: $hardeningPercent%"

# ============================================================
# 22. FUTURE WORKFLOW READINESS
# ============================================================

Section "22. FUTURE WORKFLOW READINESS"

$workflowChecks = [ordered]@{

    "Catalog" = (
        ($apiRoutes -match "api/v1/categories/") -and
        ($apiRoutes -match "api/v1/products/")
    )

    "Authentication" = (
        ($apiRoutes -match "api/v1/auth/register/") -and
        ($apiRoutes -match "api/v1/auth/login/") -and
        ($apiRoutes -match "api/v1/auth/refresh/")
    )

    "Cart" = (
        ($apiRoutes -match "api/v1/cart/") -and
        ($apiRoutes -match "api/v1/cart/items/")
    )

    "Orders" = (
        ($apiRoutes -match "api/v1/orders/")
    )

    "Payments" = (
        ($apiRoutes -match "api/v1/payments/")
    )
}

foreach ($item in $workflowChecks.GetEnumerator()) {

    if ($item.Value) {

        Add-Result `
            "WORKFLOW" `
            $item.Key `
            "PASS" `
            "Required API surface detected"
    }
    else {

        if ($item.Key -eq "Payments") {

            Add-Result `
                "WORKFLOW" `
                $item.Key `
                "WARN" `
                "Payment workflow is not yet exposed through API routing"
        }
        else {

            Add-Result `
                "WORKFLOW" `
                $item.Key `
                "WARN" `
                "Required API surface not fully detected"
        }
    }
}

# ============================================================
# 23. PRODUCTION READINESS MODEL
# ============================================================

Section "23. PRODUCTION READINESS"

# Weighted model:
#
# Architecture       20%
# Security           20%
# Features           20%
# Infrastructure     15%
# Testing            10%
# Performance        10%
# Documentation       5%
#
# Total              100%

$architectureWeight = $architectureScore * 0.20
$securityWeight = $securityPercent * 0.20
$featureWeight = $featurePercent * 0.20

$infraScore = 0

if ($composeFound) {
    $infraScore += 50
}

if (Exists "backend/Dockerfile") {
    $infraScore += 20
}

if (Exists ".github/workflows") {
    $infraScore += 30
}

$infraWeight = $infraScore * 0.15

$testScore = 0

if ($testFiles.Count -gt 0) {
    $testScore = 100
}

$testWeight = $testScore * 0.10

$performanceWeight = $performanceScore * 0.10

$docsScore = 0

if (Exists "README.md") {
    $docsScore += 50
}

if (Exists "docs") {
    $docsScore += 50
}

$docsWeight = $docsScore * 0.05

$productionPercent = [math]::Round(
    $architectureWeight +
    $securityWeight +
    $featureWeight +
    $infraWeight +
    $testWeight +
    $performanceWeight +
    $docsWeight
)

Write-Host ""
Write-Host "Production readiness: $productionPercent%" -ForegroundColor Cyan

# ============================================================
# 24. FINAL RESULT COUNTS
# ============================================================

Section "24. AUDIT SUMMARY"

$passCount = @(
    $Results | Where-Object { $_.Status -eq "PASS" }
).Count

$warnCount = @(
    $Results | Where-Object { $_.Status -eq "WARN" }
).Count

$failCount = @(
    $Results | Where-Object { $_.Status -eq "FAIL" }
).Count

$blockerCount = @(
    $Results | Where-Object { $_.Status -eq "BLOCKER" }
).Count

$infoCount = @(
    $Results | Where-Object { $_.Status -eq "INFO" }
).Count

$totalChecks = $Results.Count

if ($totalChecks -gt 0) {

    $verifiedScore = [math]::Round(
        ($passCount / $totalChecks) * 100
    )
}
else {
    $verifiedScore = 0
}

Write-Host ""
Write-Host "PASS:       $passCount" -ForegroundColor Green
Write-Host "WARN:       $warnCount" -ForegroundColor Yellow
Write-Host "FAIL:       $failCount" -ForegroundColor Red
Write-Host "BLOCKER:    $blockerCount" -ForegroundColor Magenta
Write-Host "INFO:       $infoCount" -ForegroundColor Cyan
Write-Host "TOTAL:      $totalChecks"
Write-Host ""
Write-Host "VERIFIED AUDIT SCORE: $verifiedScore%" -ForegroundColor Cyan
Write-Host "PRODUCTION READINESS: $productionPercent%" -ForegroundColor Cyan

# ============================================================
# 25. BLOCKER / FAIL SUMMARY
# ============================================================

Section "25. ACTION REQUIRED"

$criticalItems = @(
    $Results |
    Where-Object {
        $_.Status -eq "BLOCKER" -or
        $_.Status -eq "FAIL"
    }
)

if ($criticalItems.Count -eq 0) {

    Add-Result `
        "FINAL" `
        "Critical issues" `
        "PASS" `
        "No BLOCKER or FAIL result detected"
}
else {

    Add-Result `
        "FINAL" `
        "Critical issues" `
        "BLOCKER" `
        "$($criticalItems.Count) critical item(s) require attention"

    foreach ($item in $criticalItems) {
        Write-Host ""
        Write-Host "       [$($item.Status)] $($item.Area) / $($item.Check)" -ForegroundColor Red
        Write-Host "       $($item.Message)"
    }
}

# ============================================================
# 26. WARN SUMMARY
# ============================================================

Section "26. WARNINGS"

$warnings = @(
    $Results |
    Where-Object {
        $_.Status -eq "WARN"
    }
)

if ($warnings.Count -eq 0) {

    Write-Host "No warnings."
}
else {

    foreach ($item in $warnings) {

        Write-Host ""
        Write-Host "       [WARN] $($item.Area) / $($item.Check)" -ForegroundColor Yellow
        Write-Host "       $($item.Message)"
    }
}

# ============================================================
# 27. MARKDOWN REPORT
# ============================================================

Section "27. MARKDOWN REPORT"

$reportLines = @()

$reportLines += "# Kolchi Business Audit Report"
$reportLines += ""
$reportLines += "- Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$reportLines += "- Root: $Root"
$reportLines += "- Branch: $branch"
$reportLines += "- Last commit: $commit"
$reportLines += ""
$reportLines += "## Summary"
$reportLines += ""
$reportLines += "| Metric | Value |"
$reportLines += "|---|---:|"
$reportLines += "| PASS | $passCount |"
$reportLines += "| WARN | $warnCount |"
$reportLines += "| FAIL | $failCount |"
$reportLines += "| BLOCKER | $blockerCount |"
$reportLines += "| INFO | $infoCount |"
$reportLines += "| TOTAL | $totalChecks |"
$reportLines += "| Verified Audit Score | $verifiedScore% |"
$reportLines += "| Production Readiness | $productionPercent% |"
$reportLines += ""
$reportLines += "## Codebase"
$reportLines += ""
$reportLines += "- Backend files: $backendFiles"
$reportLines += "- Backend lines: $backendLines"
$reportLines += "- Frontend files: $frontendFiles"
$reportLines += "- Frontend lines: $frontendLines"
$reportLines += "- Total active files: $totalFiles"
$reportLines += "- Total active lines: $totalLines"
$reportLines += ""
$reportLines += "## Security"
$reportLines += ""
$reportLines += "- Static security maturity: $securityPercent%"
$reportLines += "- Hardening readiness: $hardeningPercent%"
$reportLines += ""
$reportLines += "## Features"
$reportLines += ""
$reportLines += "- Feature coverage: $featurePercent%"
$reportLines += ""
$reportLines += "## Results"
$reportLines += ""
$reportLines += "| Area | Check | Status | Message |"
$reportLines += "|---|---|---|---|"

foreach ($result in $Results) {

    $safeMessage = $result.Message.Replace("|", "\|")

    $reportLines += `
        "| $($result.Area) | $($result.Check) | $($result.Status) | $safeMessage |"
}

try {

    Set-Content `
        -Path $ReportFile `
        -Value ($reportLines -join "`r`n") `
        -Encoding UTF8

    Add-Result `
        "REPORT" `
        "Markdown report" `
        "PASS" `
        "Report written to tools/audit/reports/latest-report.md"
}
catch {

    Add-Result `
        "REPORT" `
        "Markdown report" `
        "WARN" `
        "Could not write Markdown report"
}

# ============================================================
# FINAL
# ============================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "                    AUDIT COMPLETE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Project:                 $Root"
Write-Host "Active files:            $totalFiles"
Write-Host "Active lines:            $totalLines"
Write-Host ""
Write-Host "PASS:                    $passCount"
Write-Host "WARN:                    $warnCount"
Write-Host "FAIL:                    $failCount"
Write-Host "BLOCKER:                 $blockerCount"
Write-Host "INFO:                    $infoCount"
Write-Host ""
Write-Host "VERIFIED AUDIT SCORE:    $verifiedScore%"
Write-Host "PRODUCTION READINESS:    $productionPercent%"
Write-Host ""
Write-Host "Report:"
Write-Host "tools/audit/reports/latest-report.md"
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
