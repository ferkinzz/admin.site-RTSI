# Security and License Bypass Prevention

This document outlines the security model for **Admin .Site**, focusing on how premium features are protected in a source-available environment like a public GitHub repository.

The guiding philosophy is not to create an unbreakable fortress (which is nearly impossible when source code is visible), but to implement a robust system that makes bypassing the license checks difficult and not worth the effort, thus encouraging legitimate purchases.

## Core Strategy: Server-Side Validation

The cornerstone of the licensing system is **server-side validation**.

- **The "Source of Truth" is Private**: The logic that determines whether a license is valid, active, and corresponds to a specific plan (e.g., `pro` or `ai_pro`) resides exclusively on the private API server (`https://keys.admin.rtsi.site`). It is never exposed in the client-side code.
- **Client-Side Role**: The client application (this Next.js project) is only responsible for:
    1.  Finding its unique license key (`documentId` and `uid`) from Firestore.
    2.  Sending these credentials to the private API server.
    3.  Receiving a simple response (e.g., `{ "plan": "pro", "status": "active" }`).
    4.  Adjusting the UI based on this response.
- **Why This is Secure**: A user who clones the repository can see the *call* to the API in `src/context/LicenseContext.tsx`, but they cannot see or modify the *validation logic* within the API. They cannot "trick" the application into thinking it has a Pro plan because the API will always have the final say.

## Premium Feature Gating

Features are restricted based on the plan received from the server.

### 1. Frontend Gating (UI/UX)

- **How it Works**: The `useLicense()` hook provides the current plan throughout the application. Components use this to conditionally render UI elements. For example, a "Manage Users" button in the sidebar might be disabled or hidden if `plan !== 'pro'`.
- **Inherent Limitation**: A technically savvy user could modify the frontend code to bypass these UI checks (e.g., by hardcoding `plan = 'pro'`). This is why backend gating is essential for critical features.

### 2. Backend Gating (The Strongest Method)

- **How it Works**: This is the ideal model for high-value features. The **AI Proxy API** is a perfect example.
- **The Flow**:
    1.  The user tries to use an AI feature in the app.
    2.  The app checks if the plan is `ai_pro`.
    3.  If so, it sends the `documentId`, `uid`, and the user's `prompt` to *your* AI Proxy endpoint.
    4.  **Your private server** first calls the license verification endpoint.
    5.  If the license is valid for `ai_pro`, *only then* does your server use its own `GEMINI_API_KEY` to process the prompt and return the result.
- **Why This is Secure**: The user's `GEMINI_API_KEY` is never used. They cannot access the AI functionality without going through your server, which enforces the license check. It's impossible for them to bypass this, as they don't have access to your proxy's backend logic or your secret API key.

## Securing the Development and Production Environment

### Environment Variables & Secrets

- Any sensitive keys, especially the `GEMINI_API_KEY` used for the "Pro" plan (where users bring their own key), must **never** be committed to the GitHub repository.
- Follow the instructions in the `README.md` to manage these as secrets within your hosting provider (e.g., Firebase App Hosting Secrets). The `.env` file is for local development only and should be listed in `.gitignore`.

### Removing Debug Tools from Production

- The pages `/dashboard/composer` and `/dashboard/license-verification` are powerful development and debugging tools.
- They are a potential security risk if exposed in a production environment.
- The code has been configured to automatically detect if it's running in a production build (`process.env.NODE_ENV === 'production'`). If so, accessing these pages will result in a "404 Not Found" error, effectively removing them from the final application.

## Conclusion

The security of Admin .Site's premium features relies on a layered approach:

1.  **Server-Side Validation** as the ultimate source of truth for licensing.
2.  **Frontend Gating** for a good user experience and as a first line of defense.
3.  **Backend Gating** for critical, high-value features like the AI Proxy, making them impossible to bypass.
4.  **Best Practices** like secure secret management and removing debug tools from production builds.

This model provides a strong and practical defense against license bypassing in a source-available context.
