@echo off
setlocal

REM Always run from this script's own folder, no matter where it's launched
REM from (double-click, Start Menu shortcut, another terminal's cwd, etc.) —
REM this is what was causing "Could not read package.json" earlier.
cd /d "%~dp0"

echo ============================================
echo   News Channel - Dev Server Launcher
echo ============================================
echo Project folder: %cd%
echo.

if not exist package.json (
    echo ERROR: package.json not found here. This .bat must live in the
    echo project root folder. Aborting.
    pause
    exit /b 1
)

if not exist node_modules (
    echo node_modules missing - running npm install first...
    call npm install
)

REM Free up port 3000 if something is still bound to it from a previous run
REM that wasn't shut down cleanly, so we never get bumped to 3001/3002 and
REM then confused about which port to open.
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Port 3000 is already in use by PID %%p - stopping it...
    taskkill /PID %%p /F >nul 2>&1
)

echo Starting dev server in a separate window...
start "News Channel Dev Server" cmd /k "cd /d "%~dp0" && npm run dev"

REM Keeps the feed fresh automatically (re-ingests all sources every 15
REM minutes by default - see INGEST_CRON in scripts/scheduler.ts) so you
REM don't have to remember to run refresh-news.bat by hand. It also prunes
REM anything older than 5 days on every run, so the local DB stays small.
echo Starting the background news scheduler in a separate window...
start "News Channel Scheduler" cmd /k "cd /d "%~dp0" && npm run schedule"

echo Waiting for the server to come up...
timeout /t 8 /nobreak >nul

echo Opening http://localhost:3000 in your browser...
start "" http://localhost:3000

echo.
echo Done. Two windows are now running:
echo   "News Channel Dev Server"  - the web app itself
echo   "News Channel Scheduler"   - re-fetches fresh news every 15 minutes
echo Close either window (or Ctrl+C in it) to stop that part.
echo Re-run this script any time to relaunch cleanly.
pause
endlocal
