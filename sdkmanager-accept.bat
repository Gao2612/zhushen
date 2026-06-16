@echo off
set "JAVA_HOME=%~dp0jdk\jdk-17.0.14+7"
set "ANDROID_HOME=%~dp0android-sdk"
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo y| call "%~dp0android-sdk\cmdline-tools\latest\bin\sdkmanager.bat" %*
