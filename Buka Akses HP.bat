@echo off
title Buka Akses HP (Firewall)
cd /d "%~dp0"

net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Meminta hak administrator...
  powershell -Command "Start-Process '%~f0' -Verb RunAs"
  exit /b
)

echo Membuka port 5514 di Windows Firewall...
netsh advfirewall firewall delete rule name="PortofolioDosen 5514" >nul 2>&1
netsh advfirewall firewall add rule name="PortofolioDosen 5514" dir=in action=allow protocol=TCP localport=5514

echo.
echo Alamat untuk diakses dari HP (satu jaringan WiFi):
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do echo   http://%%a:5514
echo.
echo Jalankan juga "Jalankan Server.bat".
pause
