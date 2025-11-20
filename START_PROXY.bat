@echo off
echo Installing proxy dependencies...
npm install --prefix . express cors node-fetch@2

echo.
echo Starting CORS Proxy Server...
node proxy-server.cjs

