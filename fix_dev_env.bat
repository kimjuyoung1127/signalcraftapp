@echo off
echo ==========================================
echo SignalCraft Development Environment Fixer
echo ==========================================

echo 1. Killing ADB Server...
adb kill-server

echo 2. Cleaning Android Build Artifacts...
cd android
if exist app\build rmdir /s /q app\build
if exist app\.cxx rmdir /s /q app\.cxx
if exist .gradle rmdir /s /q .gradle
if exist build rmdir /s /q build
cd ..

echo 3. Cleaning Expo/Metro Cache...
if exist .expo rmdir /s /q .expo
del /q node_modules\.cache\babel-loader\*
del /q %TMP%\metro-*

echo ==========================================
echo Cleanup Complete.
echo Please try running: npx expo run:android
echo ==========================================
echo NOTE: If the emulator still crashes, open Android Studio Device Manager
echo and selects "Wipe Data" for your emulator or create a new one.
echo ==========================================
