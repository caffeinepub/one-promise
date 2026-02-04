# PWA Notification Permission Diagnosis Report

**Date:** February 4, 2026  
**Issue:** Notification permission prompt never appears; app does not appear in iOS Settings → Notifications  
**Platforms Analyzed:** iOS PWA (Add to Home Screen), Android PWA, Desktop browsers

---

## Executive Summary

**Root Cause (Confirmed):** The application **does not contain any notification permission request code** whatsoever. There is no call to `Notification.requestPermission()`, no service worker registration, no push subscription logic, and no notification scheduling implementation anywhere in the codebase.

**Impact:** The notification feature described in the specification (08:30 daily reminder, 20:00 conditional reminder) is **completely unimplemented** at the frontend level. The absence from iOS Settings → Notifications is expected behavior—iOS only lists apps that have explicitly requested notification permission via the Web Notifications API.

---

## Code-Level Analysis

### 1. Entry Points and Initialization Flow

**File: `frontend/src/main.tsx` (lines 1-15)**
- Initializes React Query and Internet Identity providers
- No service worker registration
- No notification initialization
- No PWA manifest link

**File: `frontend/index.html` (lines 1-13)**
- Basic HTML structure
- No `<link rel="manifest">` tag for PWA manifest
- No service worker script reference
- No notification-related meta tags

**File: `frontend/src/App.tsx` (lines 1-31)**
- Handles authentication state and routing
- Routes between `Onboarding` and `Today` screens
- **No notification permission logic**
- **No notification scheduling logic**

### 2. Main Application Screens

**File: `frontend/src/pages/Onboarding.tsx` (lines 1-230)**
- Landing screen and carousel slides
- Handles Internet Identity login
- **No notification permission request**
- **No notification setup on first login**

**File: `frontend/src/pages/Today.tsx` (lines 1-340)**
- Main authenticated screen with 4 states: create, confirm, reflect, rest
- Manages promise creation and reflection
- Uses localStorage for persistence
- **No notification permission request in any state**
- **No notification scheduling when promise is created**
- **No notification scheduling when reflection is completed**

### 3. Missing Code Locations

The following notification-related code is **completely absent** from the codebase:

#### A. Permission Request
