@echo off
echo ==============================================
echo   CREAZIONE SCORCIATOIE DESKTOP
echo ==============================================

:: Ottieni percorsi
set SCRIPT_PATH=%~dp0
set DESKTOP_PATH=%USERPROFILE%\Desktop

:: Verifica che la cartella desktop esista (prova anche OneDrive)
if not exist "%DESKTOP_PATH%" (
    set DESKTOP_PATH=%USERPROFILE%\OneDrive\Desktop
    if not exist "%DESKTOP_PATH%" (
        echo ERRORE: Impossibile trovare il desktop
        pause
        exit /b 1
    )
)

echo Desktop trovato: %DESKTOP_PATH%

:: Scorciatoia 1: AVVIA WEBAPP
echo Creando "GameBacklog - Avvia"...
powershell -Command ^
"$WshShell = New-Object -comObject WScript.Shell; ^
$Shortcut = $WshShell.CreateShortcut('%DESKTOP_PATH%\GameBacklog - Avvia.lnk'); ^
$Shortcut.TargetPath = '%SCRIPT_PATH%start.bat'; ^
$Shortcut.WorkingDirectory = '%SCRIPT_PATH%'; ^
$Shortcut.Description = 'Avvia la webapp Backlog Videoludico (build automatico se necessario)'; ^
$Shortcut.IconLocation = 'shell32.dll,25'; ^
$Shortcut.Save()"

:: Scorciatoia 2: FERMA WEBAPP  
echo Creando "GameBacklog - Ferma"...
powershell -Command ^
"$WshShell = New-Object -comObject WScript.Shell; ^
$Shortcut = $WshShell.CreateShortcut('%DESKTOP_PATH%\GameBacklog - Ferma.lnk'); ^
$Shortcut.TargetPath = '%SCRIPT_PATH%stop.bat'; ^
$Shortcut.WorkingDirectory = '%SCRIPT_PATH%'; ^
$Shortcut.Description = 'Ferma la webapp Backlog Videoludico'; ^
$Shortcut.IconLocation = 'shell32.dll,132'; ^
$Shortcut.Save()"

echo.
echo ==============================================
echo   SCORCIATOIE CREATE CON SUCCESSO!
echo ==============================================
echo.
echo Le seguenti scorciatoie sono state create:
echo   * GameBacklog - Avvia
echo   * GameBacklog - Ferma
echo.
echo ISTRUZIONI:
echo 1. Fai doppio click su "GameBacklog - Avvia" per avviare l'app
echo 2. Attendi che si apra il browser automaticamente
echo 3. Per fermare l'app, fai doppio click su "GameBacklog - Ferma"
echo.
echo Premi un tasto per continuare...
pause
