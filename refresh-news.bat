@echo off
setlocal

REM Always run from this script's own folder, no matter where it's launched
REM from — same fix as start-dev.bat.
cd /d "%~dp0"

echo ============================================
echo   News Channel - Refresh News Data
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

echo Polling all configured RSS sources and updating the local database...
echo (This can take 20-30 seconds - it's fetching ~30 feeds.)
echo.
call npm run ingest

echo.
echo Done. New articles are saved to prisma\dev.db.
echo If the dev server is already running, just refresh the browser page
echo to see the update - no restart needed.
pause
endlocal
