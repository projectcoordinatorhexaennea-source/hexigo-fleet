# HEXIGO Fleet Tracking Dashboard

Real-time GPS fleet tracking dashboard powered by the [Flespi](https://flespi.io) REST API.

## Features
- Live vehicle tracking on Leaflet maps
- GPS history playback with truck animation
- Speed, ignition, battery telemetry
- Voice alerts for ignition ON/OFF and overspeed
- Google Street View integration (drag Pegman)
- 3D animated taskbar navigation
- Mobile-responsive PWA

## Deploy
This app is deployed on [Render.com](https://render.com).

## Environment Variables
Set the following in your hosting platform:

| Variable | Description |
|---|---|
| `FLESPI_TOKEN` | Your Flespi API token |
| `FLESPI_BASE` | `https://flespi.io` |
| `PORT` | Port (auto-set by Render) |
| `DASHBOARD_PASSWORD` | Optional login password |

## Local Development
```bash
cp .env.example .env
# Edit .env with your FLESPI_TOKEN
node server.js
```
