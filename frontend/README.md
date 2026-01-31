# Virtual Try-On Frontend

A React Native mobile app for AI-powered virtual try-on.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update API URL in `src/api/client.js` to point to your backend server.

3. Start the app:
```bash
npm start
```

4. Open Expo Go on your device or run on simulator.

## Structure

```
src/
├── api/            # API service modules
├── contexts/       # React context providers
├── navigation/     # React Navigation setup
└── screens/        # App screens
    ├── auth/       # Login, Register, ForgotPassword
    ├── main/       # Home, Gallery, TryOn, History, Profile, Settings
    └── admin/      # Dashboard, UserManagement, GarmentManagement
```

## Features

### User Features
- Email/password authentication
- Garment gallery with search and filters
- Virtual try-on with AI processing
- Try-on history
- Profile management with body info
- Favorites list

### Admin Features
- Analytics dashboard
- User management (block/delete)
- Garment CRUD operations
- Activity logs

## Requirements

- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)
