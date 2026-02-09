# PR Description: Graceful Shutdown & CPU Spike Fix

## Description
This PR addresses two critical stability issues in the `api-gateway` service:
1.  **CPU Spike Risk**: Fixed a potential tight-loop issue in the SQS polling mechanism where database or queue errors could cause 100% CPU usage.
2.  **Graceful Shutdown**: implemented signal handlers (`SIGTERM`, `SIGINT`) to ensure the server, database connections, and background jobs close cleanly.

## Changes
- **`api-gateway/src/index.ts`**:
    - **CPU Spike Fix**: Added a 5-second backoff delay in the `pollLoop` when an error occurs.
    - **Graceful Shutdown**:
        - Implemented shutdown handlers for `SIGTERM` and `SIGINT`.
        - Moved handler registration **before** database connection to cover startup/retry phases.
        - Logic to stops the HTTP server and polling loop before disconnecting the DB.
- **`api-gateway/src/db/index.ts`**:
    - Verified `disconnectDB` export is available (already present).

## Related Issue
- Fixes high CPU usage scenarios during partial outages.
- Fixes unclean shutdowns leading to "address in use" errors or dangling connections.
- Addresses: `[Bug] CPU Spike on Polling Error` & `[Enhancement] Graceful Shutdown`

## How to Test
1.  **CPU Spike Fix**:
    - Disconnect network or provide invalid SQS/DB credentials.
    - Observe logs: You should see "Polling error" followed by a 5-second pause (no rapid log flooding).
2.  **Graceful Shutdown**:
    - Start the service: `npm run dev`.
    - Press `Ctrl+C`.
    - Observe logs: "SIGINT received", "HTTP server closed", "Stopped SQS polling", and "Disconnected from mongodb".
    - Process exits with code 0.

## Checklist
- [x] Code compiles correctly
- [x] Graceful shutdown logic implemented
- [x] CPU spike prevention (backoff) implemented
- [x] Verified build and basic execution
