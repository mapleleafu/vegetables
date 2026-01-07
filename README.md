# Language Learning App

A comprehensive interactive platform for learning vocabulary and numbers, featuring native pronunciations and various practice modes. 

> **Note:** This application was originally built for my wife to help her learn. While the system is designed to be language-agnostic, it currently features **Turkish** only.

**Live Website:** [gabsandatakan.com](https://gabsandatakan.com)

![Screenshot](https://gueouuqidyklsnfsyjyz.supabase.co/storage/v1/object/public/assets/images/static/screenshot.png)

## Credits

- **Illustrations**: All vegetable images and artwork were hand-drawn by my wife.
- **Design**: The website's UI/UX and overall design were created by my wife.

## Features

This application is designed to help users improve their vocabulary through interactive exercises and audible feedback.

### Game Modes

- **Category Practice**: Explore words grouped by topics. Users can listen to the correct pronunciation for each word and practice them individually.
- **Number Practice**: A dedicated section to master numbers. This mode helps users master numerical values.
- **Quick Test**: A rapid assessment tool that challenges users with a mix of words from different categories to test their retention and speed.

### Key Functionality

- **Native Pronunciations**: High-quality audio for words to ensure correct learning of intonation and accent.
- **Progress Tracking**: Track your learning journey and see improvements over time.
- **Admin Dashboard**: A management interface for adding new categories and words to the system.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS & Radix UI
- **State Management**: Zustand
- **Animations**: Framer Motion

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env` and configure your database and authentication secrets.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000).
