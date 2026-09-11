@echo off
title Golf Score & Stats Tracker
chcp 65001 > nul
echo ========================================================
echo   ⛳ 골프 간편 스코어 & 통계 트래커를 실행합니다...
echo ========================================================
echo.
echo 브라우저에서 index.html을 직접 열거나 로컬 서버를 구동합니다.
echo.

start "" "%~dp0index.html"

echo 실행 완료! 브라우저가 열리지 않으면 폴더의 index.html을 더블클릭하세요.
timeout /t 3 > nul
