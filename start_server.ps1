param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 8090
)

$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCommand) {
    throw "Python is required for the local static server."
}

$siteRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$baseUrl = "http://127.0.0.1:$Port"
$example = "$baseUrl/tutorial.html?title=Example%20lesson&md=content/tutorials/example/lesson.md"

Write-Host "Serving the tutorial template from $siteRoot" -ForegroundColor Cyan
Write-Host "Home:    $baseUrl/index.html" -ForegroundColor Cyan
Write-Host "Example: $example" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop." -ForegroundColor Yellow

& $pythonCommand.Source -m http.server $Port --bind 127.0.0.1 --directory $siteRoot
if ($LASTEXITCODE -ne 0) {
    throw "The local server exited with code $LASTEXITCODE."
}
