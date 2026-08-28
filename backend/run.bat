@echo off
REM BiteWise backend launcher for Windows.
REM Loading .env is optional now (BiteWiseApplication reads it automatically),
REM this script is kept for parity with run.sh and for explicit local overrides.

mvn spring-boot:run
