@echo off

if exist images/%1 (
echo %1 - %1
) else (
echo %1 - XX.png
)