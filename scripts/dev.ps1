$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$infra = Join-Path $repo "infra"
$web   = Join-Path $repo "apps\web"

Write-Host "▶ Starting Supabase..." -ForegroundColor Cyan
Push-Location $infra
supabase start
Pop-Location

Write-Host "▶ Starting web server (Vite)..." -ForegroundColor Cyan
Push-Location $web
if (!(Test-Path package.json)) {
  npm init -y | Out-Null
  npm i -D vite
  # add scripts if missing
  (Get-Content package.json) -replace '"test": ".*"', '"dev":"vite","preview":"vite preview"' | Set-Content package.json
}
npm run dev -- --host --port 5173
Pop-Location
