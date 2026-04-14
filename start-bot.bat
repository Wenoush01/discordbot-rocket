@echo off

REM 1) Start Lavalink
start "Lavalink Server" cmd /k "cd /d C:\Users\vacla\rocketbot\LavaLinkServer && java -jar Lavalink.jar"

REM 2) Wait a few seconds so Lavalink can boot
timeout /t 15 /nobreak >nul

REM 3) Start the Discord bot
start "RocketBot Backend" cmd /k "cd /d C:\Users\vacla\rocketbot\discordbot-rocket-v3 && npm start"

REM 4) Optional: start the frontend dashboard too
start "RocketBot Frontend" cmd /k "cd /d C:\Users\vacla\rocketbot\discordbot-rocket-v3 && npm run web:dev"

pause