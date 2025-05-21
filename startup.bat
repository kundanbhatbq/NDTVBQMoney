@echo off
REM
cd /d "C:\Users\Administrator\Desktop\NDTVBQMoney"
 
REM
start "Vite Dev Server" cmd /k "npm start"
 
REM
:loop
cls
echo Running NDTVBQMoney...
timeout /t 1 >nul
goto loop
 