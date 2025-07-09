# Admin .Site: App and Plans Documentation

Welcome to **Admin .Site**, your headless Content Management System (CMS) designed to be the robust and scalable backend for your content empire. This document provides an overview of the application's features and details what each subscription plan offers.

## Core Functionality

Admin .Site is built to streamline your content creation workflow. The core features available on all plans include:

*   **Content Creation**: A powerful Markdown-based editor to write and manage articles, blog posts, resources, videos, and other content types.
*   **Asset Management**: Easily upload a featured image, additional images, and file attachments for each article.
*   **Author Profiles**: Manage your public author profile, including your name, bio, website, and photo.
*   **Secure Authentication**: A robust login system powered by Firebase, with a unique setup flow for the first administrator.
*   **Site Configuration**: Basic settings to manage your site's name and URL for link generation.

## Subscription Plans

To cater to different needs, Admin .Site offers three distinct plans: **Community**, **Pro**, and **AI Pro**.

### Feature Comparison

| Feature                                | Community | Pro | AI Pro |
| -------------------------------------- | :-------: | :-: | :----: |
| **Core Content Management**            |     ✅     | ✅  |   ✅   |
| **User & Role Management**             |     ❌     | ✅  |   ✅   |
| **Advanced Dashboard Analytics**       |     ❌     | ✅  |   ✅   |
| **Productivity Tools**                 |     ❌     | ✅  |   ✅   |
| **AI Writing Assistance (Bring Your Own Key)** |     ❌     | ✅  |   ✅   |
| **AI Writing Assistance (Managed Proxy)** |     ❌     | ❌  |   ✅   |

---

### Plan Details

#### Community Plan (Free)

The ideal starting point for individual creators and small projects.

*   Includes all **Core Functionality**.
*   Full content creation and management for a single user.
*   Basic dashboard with an overview of content types and quantities.

#### Pro Plan

For professional teams and businesses that need advanced collaboration and productivity tools.

*   Includes all **Community** features, plus:
*   **User & Role Management**: Invite team members and assign roles (Admin, Editor, Jr. Editor) to control who can create, edit, and publish content.
*   **Advanced Dashboard**: Get deeper insights with a view of your most recently updated articles.
*   **Productivity Tools**: Access a suite of tools to supercharge your workflow:
    *   **Image Optimizers (Single & Batch)**: Reduce image file sizes for faster-loading pages.
    *   **QR & vCard Generators**: Create QR codes and digital contact cards.
    *   **Chat Link Generator**: Build direct links to WhatsApp and Telegram.
*   **AI Writing Assistance**: Use the power of AI to suggest better titles, generate article bodies, improve existing text, and format Markdown. **This plan requires you to provide your own Google AI (Gemini) API key in the environment variables.**

#### AI Pro Plan

The ultimate plan for power users and agencies who want the full, managed AI experience without the hassle of managing API keys.

*   Includes all **Pro** features, plus:
*   **Managed AI Proxy**: All AI-powered features are routed through our secure proxy. This means you get all the benefits of the AI writing assistance **without needing to provide your own Gemini API key**. We handle the API calls for you, offering a seamless and secure "plug-and-play" AI experience.

This plan is perfect for those who want the most powerful features with the least amount of technical configuration.
