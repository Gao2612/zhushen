@echo off
set "ROOT=%~dp0"
set "JAVA_HOME=%ROOT%jdk\jdk-17.0.14+7"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo Creating debug keystore...
"%JAVA_HOME%\bin\keytool.exe" -genkey -v -keystore "%ROOT%debug.keystore" -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US" 2>&1
echo Done.
