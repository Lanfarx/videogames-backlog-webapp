@echo off
echo.
echo ==============================================
echo   CREAZIONE SCORCIATOIE DESKTOP
echo ==============================================
echo.

REM Ottieni il percorso corrente (cartella windows) e il percorso deployment (parent)
set SCRIPT_PATH=%~dp0
set DEPLOYMENT_PATH=%~dp0..\

REM Ottieni il percorso del desktop dell'utente usando USERPROFILE
set DESKTOP_PATH=%USERPROFILE%\Desktop

REM Verifica che la cartella desktop esista
if not exist "%DESKTOP_PATH%" (
    echo Errore: Cartella Desktop non trovata in %DESKTOP_PATH%
    echo Tentativo alternativo...
    set DESKTOP_PATH=%USERPROFILE%\OneDrive\Desktop
    if not exist "%DESKTOP_PATH%" (
        echo Errore: Impossibile trovare il percorso del desktop
        echo Percorsi tentati:
        echo   - %USERPROFILE%\Desktop
        echo   - %USERPROFILE%\OneDrive\Desktop
        pause
        exit /b 1
    )
)

echo Desktop trovato: %DESKTOP_PATH%
echo Script path: %SCRIPT_PATH%
echo Deployment path: %DEPLOYMENT_PATH%

REM Crea scorciatoia per avviare l'app
echo.
echo Creando scorciatoia "GameBacklog - Avvia"...
powershell -Command ^
"$WshShell = New-Object -comObject WScript.Shell; ^
$Shortcut = $WshShell.CreateShortcut('%DESKTOP_PATH%\GameBacklog - Avvia.lnk'); ^
$Shortcut.TargetPath = '%SCRIPT_PATH%start.bat'; ^
$Shortcut.WorkingDirectory = '%SCRIPT_PATH%'; ^
$Shortcut.Description = 'Avvia l''applicazione GameBacklog'; ^
$Shortcut.IconLocation = 'shell32.dll,137'; ^
$Shortcut.Save()"

REM Crea scorciatoia per fermare l'app
echo Creando scorciatoia "GameBacklog - Ferma"...
powershell -Command ^
"$WshShell = New-Object -comObject WScript.Shell; ^
$Shortcut = $WshShell.CreateShortcut('%DESKTOP_PATH%\GameBacklog - Ferma.lnk'); ^
$Shortcut.TargetPath = '%SCRIPT_PATH%stop.bat'; ^
$Shortcut.WorkingDirectory = '%SCRIPT_PATH%'; ^
$Shortcut.Description = 'Ferma l''applicazione GameBacklog'; ^
$Shortcut.IconLocation = 'shell32.dll,132'; ^
$Shortcut.Save()"
$Shortcut.TargetPath = '%SCRIPT_PATH%stop.bat'; ^
$Shortcut.WorkingDirectory = '%SCRIPT_PATH%'; ^
$Shortcut.Description = 'Ferma l''applicazione Backlog Videoludico'; ^
$Shortcut.IconLocation = 'shell32.dll,132'; ^
$Shortcut.Save()"

echo.
echo ==============================================
echo   SCORCIATOIE CREATE CON SUCCESSO!
echo ==============================================
echo.
echo Le seguenti scorciatoie sono state create sul desktop:
echo   * GameBacklog - Avvia
echo   * GameBacklog - Ferma
echo.
echo ISTRUZIONI:
echo 1. Fai doppio click su "GameBacklog - Avvia" per avviare l'app
echo 2. Attendi che si apra il browser automaticamente
echo 3. Per fermare l'app, fai doppio click su "GameBacklog - Ferma"
echo.
pause
