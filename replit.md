# Red-Green Betting App

## Security Updates
- Hardcoded admin credentials moved to environment variables.
- Admin password should be set via `ADMIN_PASSWORD` secret.

## Features
- UPI Payment Gateway: Users get UPI ID/QR data to pay. Admin confirms manually.
- Game Logic: Red/Green/Yellow betting with 30s rounds.
- Admin Controls:
  - View next round result.
  - Set next round result manually.
  - Confirm deposits and withdrawals.
  - Manage user balances.

## Deployment
- For standalone app, use Expo for building Android/iOS binaries.
- Backend is Express + Drizzle ORM.
