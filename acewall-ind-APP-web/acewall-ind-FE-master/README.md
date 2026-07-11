# Acewall Scholars Learning Online

> Front-end repository for the Acewall Scholars Learning Online platform — a comprehensive Learning Management System (LMS) built with React and Vite.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Local Setup and Execution](#local-setup-and-execution)

---

## Project Overview

**Acewall Scholars** is a full-featured Learning Management System designed to streamline online education for both instructors and students. The front-end application provides two primary user portals — a **Teacher Portal** and a **Student Portal** — each with role-specific workflows for course creation, assessment management, real-time communication, and performance tracking.

The application communicates with a RESTful backend hosted on Railway. During development, API requests are proxied through the Vite dev server, while the production front-end is served as a static build optimized for deployment on platforms like Vercel.

---

## Key Features

### Teacher Portal
- **Course Management** — Create, edit, and organize courses with chapters, quarters, semesters, and lesson cards.
- **Assessment Builder** — Design assessments with configurable question types, due dates, and grading scales.
- **Gradebook & Analytics** — Manage student grades, view performance charts, and analyze assessment results.
- **Real-Time Communication** — Socket.IO-powered chat and discussion forums for course-specific conversations.
- **Video Conferencing** — Integrated Jitsi Meet for live classes and scheduled meetings.
- **Payment Configuration** — Stripe Connect onboarding, payment settings, and coupon management.
- **Social Profiles** — Teacher-facing social profile pages and networking features.
- **Earnings & Withdrawals** — Track earnings, request withdrawals, and view transaction history.
- **Announcements & Discussions** — Post course announcements and moderate discussion boards.
- **Student Management** — Review student profiles, course enrollment, and academic records.

### Student Portal
- **Course Catalog & Enrollment** — Browse available courses, purchase access, and manage enrolled content.
- **Learning Interface** — Access chapters, lessons, and course materials in a structured view.
- **Assessments & Submissions** — Take quizzes and assignments, view results, and track progress.
- **Real-Time Chat** — Socket.IO-powered student discussion threads and live chat.
- **Video Meetings** — Join scheduled Jitsi video sessions for courses with meetings enabled.
- **Gradebook** — View grades, course performance, and academic standing.
- **Payments & Purchases** — Stripe-based course purchases, payment history, and success/cancellation flows.
- **Social Features** — Student social profiles and community interactions.

### Platform-Wide
- **Authentication** — Google OAuth sign-in and OTP-based verification flows.
- **Rich Text Editing** — Tiptap editor for creating formatted course content and announcements.
- **File Management** — Cloudinary-powered image and document uploads.
- **Data Export** — Generate DOCX and PDF documents (e.g., assessments, grade reports) client-side.
- **Spreadsheet Import** — Bulk course and student data import via XLSX parsing.
- **Accessibility** — Shadcn UI components following WAI-ARIA patterns.
- **Responsive Design** — Mobile-first Tailwind CSS layout with theme support.

---

## Prerequisites

Before setting up the project, ensure your development environment meets the following requirements:

- **Node.js** — Version 18.0 or higher (LTS recommended)
- **npm** — Version 9.0 or higher (or an equivalent package manager)
- **Git** — For cloning and version control

You can verify your installations with:

```bash
node --version
npm --version
git --version
```

---

## Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/acewall-ind-FE.git
cd acewall-ind-FE
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required dependencies defined in `package.json`, including React, Vite, Tailwind CSS, Shadcn UI primitives, and third-party SDKs.

---

## System Architecture

### High-Level Design

The application follows a **portal-based single-page application (SPA)** architecture. The root `App.jsx` handles top-level routing, directing users to either the Teacher Portal, Student Portal, or shared authentication/support flows. Each portal is self-contained with its own layout, routing, and context providers.

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                  │
│  ┌───────────────────────────────────────────────┐  │
│  │              React + Vite SPA                  │  │
│  │  ┌─────────────┐  ┌────────────────────────┐  │  │
│  │  │ Teacher     │  │ Student                │  │  │
│  │  │ Portal      │  │ Portal                 │  │  │
│  │  └─────────────┘  └────────────────────────┘  │  │
│  │         ▲                  ▲                   │  │
│  │         │                  │                   │  │
│  │  ┌──────┴──────────────────┴───────────────┐  │  │
│  │  │         Shared Pages & Contexts          │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
│                         │                            │
│          Vite Dev Server Proxy                     │
│          (or Production Static Host)               │
└─────────────────────────┼──────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────┐
│              Backend API (Railway)                   │
│  https://acewall-backend-school-instance...        │
│  /api                                               │
└─────────────────────────────────────────────────────┘
```

### Core Components

#### Page Routing
- Routes are organized under `src/Page/` by user role:
  - **Teacher routes**: `src/Page/teacher/` (dashboard, courses, assessments, analytics, earnings, account)
  - **Student routes**: `src/Page/StudentPortal/` (dashboard, courses, gradebook, meetings, messages)
  - **Shared auth routes**: login, OTP verification, password reset, support
- Route configuration is managed in the application entry point (`src/main.jsx` → `src/App.jsx`).

#### Context-Based State Management
- Application-level state (authentication, theme, socket connection, notifications) is managed via React Context under `src/Context/`.
- Each portal (`teacher/`, `student portal/`) maintains its own local state for domain-specific data (courses, assessments, grades).

#### Component Structure
- UI primitives are sourced from **Shadcn UI** and stored at `src/components/ui/`.
- Reusable, application-specific components live under `src/components/`, `src/CustomComponent/`, and `src/Page/teacher/` / `src/Page/StudentPortal/`.
- Utilities and data helpers are centralized in `src/lib/` and `src/utils/`.

#### API Communication
- All HTTP communication uses **Axios**.
- In development, the Vite dev server proxies `/api` requests to the production Railway backend. This avoids CORS issues and keeps configuration centralized.
- Base API URL is configurable via the `VITE_BASE_URL` environment variable.

#### Real-Time Layer (Socket.IO)
- WebSocket communication is powered by the **Socket.IO client** (`socket.io-client`).
- Configured to connect to the backend via `VITE_SOCKET_URL`.
- Enables live chat, discussion updates, and real-time notifications across both portals.

#### Third-Party Integrations
- **Google OAuth** — Handles sign-in via `@react-oauth/google`.
- **Jitsi Meet** — Embedded video conferencing via `@jitsi/react-sdk`.
- **Stripe** — Payment processing via `@stripe/react-stripe-js` and `@stripe/stripe-js`.
- **Tiptap** — Rich-text editor for content creation (`@tiptap/react`, `@tiptap/starter-kit`).
- **Cloudinary** — Media uploads managed via Cloudinary upload presets.
- **Three.js / React Three Fiber** — 3D graphics and animated backgrounds (`@react-three/fiber`, `@react-three/drei`).
- **Recharts** — Data visualization for analytics dashboards.

### Data Flow

1. **User Interaction** — A user performs an action (e.g., submits an assessment, sends a chat message).
2. **React Component** — The event handler triggers an API call via Axios or emits a Socket.IO event.
3. **Vite Dev Proxy** — In development, the request is forwarded to the Railway backend at `/api`.
4. **Backend Processing** — The backend validates, processes, and persists data.
5. **Response** — The backend returns a JSON response or pushes real-time updates via WebSocket.
6. **UI Update** — React state is updated, triggering a re-render to reflect the new data.

---

## Technology Stack

### Core Framework & Build Tools

| Tool | Version | Purpose |
|------|---------|---------|
| React | `^19.0.0` | UI component library |
| React DOM | `^19.0.0` | DOM rendering for React |
| Vite | `^6.1.0` | Build tool and dev server |
| @vitejs/plugin-react | `^4.3.4` | React fast refresh for Vite |

### Styling & UI

| Tool | Version | Purpose |
|------|---------|---------|
| Tailwind CSS | `^4.0.7` | Utility-first CSS framework |
| @tailwindcss/vite | `^4.0.7` | Tailwind Vite plugin |
| tailwindcss-animate | `^1.0.7` | Animation utilities |
| tailwind-merge | `^3.0.1` | Tailwind class merging |
| Radix UI primitives | Various `^1.x` | Accessible component primitives |
| class-variance-authority | `^0.7.1` | Component variant management |
| clsx | `^2.1.1` | Conditional class name utility |
| Shadcn UI | — | Component system (New York style) |
| lucide-react | `^0.475.0` | Icon library |
| hugeicons-react | `^1.0.5` | Additional icon set |
| next-themes | `^0.4.6` | Theme management |
| vaul | `^1.1.2` | Drawer component |
| cmdk | `^1.0.4` | Command menu component |
| framer-motion | `^12.34.0` | Animation library |
| gsap | `^3.14.2` | Advanced animations |
| react-joyride | `^2.9.3` | Onboarding tour |

### Routing & Forms

| Tool | Version | Purpose |
|------|---------|---------|
| react-router-dom | `^7.3.0` | Client-side routing |
| react-hook-form | `^7.56.3` | Form state management |
| @hookform/resolvers | `^5.0.1` | Form validation resolvers |
| zod | `^3.24.4` | Schema validation |

### Authentication & Payments

| Tool | Version | Purpose |
|------|---------|---------|
| @react-oauth/google | `^0.13.5` | Google OAuth |
| react-google-recaptcha | `^3.1.0` | reCAPTCHA integration |
| @stripe/react-stripe-js | `^3.7.0` | Stripe React components |
| @stripe/stripe-js | `^7.4.0` | Stripe.js loader |

### Real-Time & Communication

| Tool | Version | Purpose |
|------|---------|---------|
| socket.io-client | `^4.8.1` | WebSocket client |

### Video & Media

| Tool | Version | Purpose |
|------|---------|---------|
| @jitsi/react-sdk | `^1.4.4` | Jitsi Meet video SDK |
| html2canvas | `^1.4.1` | DOM-to-image capture |
| jspdf | `^4.0.0` | PDF generation |
| docx | `^9.5.1` | DOCX file generation |
| file-saver | `^2.0.5` | Client-side file downloads |
| jodit-react | `^5.2.15` | Rich text editor |

### Data & Visualization

| Tool | Version | Purpose |
|------|---------|---------|
| axios | `^1.8.4` | HTTP client |
| recharts | `^2.15.4` | Charting library |
| react-datepicker | `^8.2.1` | Date picker |
| react-day-picker | `^9.7.0` | Calendar component |
| date-fns | `^3.6.0` | Date utilities |
| lodash | `^4.17.21` | Utility functions |
| xlsx | `^0.18.5` | Excel file parsing |
| crypto-js | `^4.2.0` | Cryptographic utilities |
| bad-words | `^4.0.0` | Content filtering |

### 3D Graphics

| Tool | Version | Purpose |
|------|---------|---------|
| three | `^0.182.0` | 3D library |
| @react-three/fiber | `^9.5.0` | React renderer for Three.js |
| @react-three/drei | `^10.7.7` | Useful helpers for R3F |

### Linting & Code Quality

| Tool | Version | Purpose |
|------|---------|---------|
| eslint | `^9.19.0` | JavaScript linter |
| @eslint/js | `^9.19.0` | ESLint JS config |
| eslint-plugin-react | `^7.37.4` | React linting rules |
| eslint-plugin-react-hooks | `^5.0.0` | Hooks linting rules |
| eslint-plugin-react-refresh | `^0.4.18` | Fast Refresh compatibility |
| globals | `^15.14.0` | Global variable definitions |

---

## Local Setup and Execution

### Environment Variables

Create a `.env` file in the project root based on the required configuration below.

```bash
# Cloudinary (media uploads)
VITE_CLOUD_NAME=<your-cloud-name>
VITE_UPLOAD_PRESET=<your-upload-preset>

# Stripe (payments)
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Google OAuth (general authentication)
VITE_GOOGLE_CSS_CLIENT_ID=<your-google-client-id>

# Google Drive OAuth
VITE_GOOGLE_DRIVE_CLIENT_ID=<your-google-drive-client-id>
VITE_GOOGLE_DRIVE_APP_ID=<your-google-drive-app-id>
VITE_GOOGLE_DRIVE_API_KEY=<your-google-drive-api-key>

# API Configuration
VITE_BASE_URL=https://api.acewallscholarslearningonline.org/api/
# For local backend development, use:
# VITE_BASE_URL=http://localhost:5050/api/

# Socket.IO
VITE_SOCKET_URL=https://api.acewallscholarslearningonline.org
# For local backend development, use:
# VITE_SOCKET_URL=http://localhost:5050

# Ticketing System (optional)
VITE_TICKETING_SYSTEM_URL=http://your-ticketing-system.com
```

> **Important**: Never commit `.env` to version control. Add it to `.gitignore` if it is not already present.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the Vite development server with HMR |
| `npm run build` | Builds the application for production |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint against the codebase |

### Development Workflow

**Start the development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port). API requests are automatically proxied to the Railway backend via the Vite dev server configuration.

**Run linting:**

```bash
npm run lint
```

**Build for production:**

```bash
npm run build
```

Output is written to the `dist/` directory.

**Preview the production build:**

```bash
npm run preview
```

### Project Structure

```
acewall-ind-FE/
├── .kilo/                  # Kilo configuration and plans
├── public/                 # Static assets served at root
├── src/
│   ├── components/         # Shared UI components
│   ├── CustomComponent/    # Application-specific custom components
│   ├── Context/            # React Context providers
│   ├── lib/                # Core utilities, data helpers, theme config
│   ├── utils/              # Additional utility functions
│   ├── assets/             # Images, fonts, icons
│   ├── Page/
│   │   ├── teacher/        # Teacher portal pages and layouts
│   │   ├── StudentPortal/  # Student portal pages and layouts
│   │   └── *               # Shared auth/support pages
│   ├── App.jsx             # Root application component and routing
│   ├── App.css             # Global styles
│   ├── main.jsx            # React entry point
│   └── index.css           # Tailwind CSS and global CSS
├── index.html              # HTML entry point
├── vite.config.js          # Vite and dev server configuration
├── components.json         # Shadcn UI configuration
├── eslint.config.js        # ESLint flat config
├── jsconfig.json           # JS path aliases for IDE support
├── package.json            # Dependencies and scripts
└── vercel.json             # Vercel deployment configuration
```

---

## Additional Notes

- **Path Aliases**: The project uses the `@` alias pointing to `src/` (configured in `vite.config.js` and `components.json`). Import paths can use `@/components/...` or `@/lib/...`.
- **Backend URL**: The default `VITE_BASE_URL` points to the production Railway instance. For local full-stack development, point this to your locally running backend (commented example shown in `.env`).
- **UI System**: Shadcn UI components follow the New York style variant. New components can be added via the Shadcn CLI.
- **Vercel Deployment**: The `vercel.json` file in the project root contains the deployment configuration for hosting the built application on Vercel.

---

**Acewall Scholars Learning Online** — Empowering education through technology.
