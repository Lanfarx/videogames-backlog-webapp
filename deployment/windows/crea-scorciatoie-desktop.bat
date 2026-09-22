@echo off
setlocal

echo ==============================================
echo   CREATE DESKTOP SHORTCUTS
echo ==============================================
echo.

set SCRIPT_PATH=%~dp0
set DESKTOP_PATH=%USERPROFILE%\Desktop

echo Searching for desktop folder...

if not exist "%DESKTOP_PATH%" (
    set DESKTOP_PATH=%USERPROFILE%\OneDrive\Desktop
    if not exist "%DESKTOP_PATH%" (
        for /d %%i in ("%USERPROFILE%\OneDrive*") do (
            if exist "%%i\Desktop" (
                set DESKTOP_PATH=%%i\Desktop
                goto desktop_found
            )
        )
        if exist "%OneDrive%\Desktop" (
            set DESKTOP_PATH=%OneDrive%\Desktop
        ) else (
            echo [ERROR] Could not find desktop folder.
            pause
            exit /b 1
        )
    )
)

:desktop_found
echo Desktop found: %DESKTOP_PATH%
echo.

echo Creating "GameBacklog - Start"...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP_PATH%\GameBacklog - Start.lnk'); $Shortcut.TargetPath = '%SCRIPT_PATH%start.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_PATH%'; $Shortcut.Description = 'Start Video Games Backlog WebApp'; $Shortcut.IconLocation = 'shell32.dll,25'; $Shortcut.Save()"

echo Creating "GameBacklog - Stop"...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP_PATH%\GameBacklog - Stop.lnk'); $Shortcut.TargetPath = '%SCRIPT_PATH%stop.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_PATH%'; $Shortcut.Description = 'Stop Video Games Backlog WebApp'; $Shortcut.IconLocation = 'shell32.dll,132'; $Shortcut.Save()"

echo.
echo ==============================================
echo   SHORTCUTS CREATED SUCCESSFULLY!
echo ==============================================
echo.
echo The following shortcuts have been created:
echo   * GameBacklog - Start
echo   * GameBacklog - Stop
echo.
echo INSTRUCTIONS:
echo 1. Double click "GameBacklog - Start" to start the app
echo 2. The browser will open automatically
echo 3. Double click "GameBacklog - Stop" to stop the app
echo.
pause
