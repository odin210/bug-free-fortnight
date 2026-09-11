@echo off
chcp 65001 >nul
title Golf Tracker - GitHub 동기화
echo ========================================================
echo  ⛳ Golf Tracker - GitHub 저장소 동기화 도구
echo  저장소: https://github.com/odin210/bug-free-fortnight
echo ========================================================
echo.

git add .
git commit -m "feat: 골프 스코어 트래커 최신 업데이트" >nul 2>&1

echo [1/2] GitHub으로 최신 코드를 푸시합니다...
echo.
git push -u origin main --force
echo.

if %errorlevel% equ 0 (
    echo ========================================================
    echo  [성공] 🎉 GitHub 저장소에 최신 버전이 반영되었습니다!
    echo ========================================================
) else (
    echo ========================================================
    echo  [알림] GitHub 로그인 또는 권한 승인이 필요합니다.
    echo ========================================================
    echo.
    echo  선택 1) GitHub Personal Access Token으로 즉시 인증하기
    echo  선택 2) 브라우저에서 index.html 파일 직접 업로드하기 (10초 완료)
    echo.
    set /p token="  - GitHub 토큰이 있으시면 여기에 붙여넣고 엔터를 치세요 (없으면 엔터): "
    if not "%token%"=="" (
        git remote set-url origin https://odin210:%token%@github.com/odin210/bug-free-fortnight.git
        git push -u origin main --force
        if %errorlevel% equ 0 (
            echo.
            echo  🎉 토큰 인증 성공! 최신 코드가 GitHub에 정상 반영되었습니다!
        )
    ) else (
        echo.
        echo  브라우저 저장소 페이지를 엽니다...
        start https://github.com/odin210/bug-free-fortnight/upload/main
        explorer.exe "C:\Users\User\.gemini\antigravity\scratch\golf-score-tracker"
    )
)

echo.
pause
