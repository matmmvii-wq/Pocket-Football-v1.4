@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Please install Node.js 22 or newer, then run this file again.
 pause
 exit /b 1
)
echo Pocket Cup - v1.28 - custom character creator
echo Open http://localhost:3000 in your browser.
echo Keep this window open while playing.
echo If port 3000 is in use, stop your old game server first.
if not exist "%~dp0dist\server.mjs" (
 echo Extract the entire ZIP first, then run START-GAME.cmd from that folder.
 pause
 exit /b 1
)
node "%~dp0dist\server.mjs"
pause
