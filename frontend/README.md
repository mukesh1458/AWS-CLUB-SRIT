# ☁️ AWS Cloud Club - SRIT Chapter

Welcome to the official web platform for the **AWS Cloud Club at Srinivasa Ramanujan Institute of Technology (SRIT)**. This application serves as the central hub for the inaugural cohort (Est. 2025) to discover events, access cloud resources, and connect with the community.

_"For the students, by the students."_

---

## 🎨 Design & UX
The application is built with an **Ultra-Premium Glassmorphism & Spatial Design** aesthetic. Key UX features include:
*   **Custom Cursor:** A glowing dot cursor that follows mouse movement globally.
*   **Animated Mesh Backgrounds:** Breathing, mesh-gradient glowing backgrounds that react to scroll and z-index layers.
*   **3D Tilt Cards:** Vanilla JavaScript & CSS 3D tilt effects (`appTilt`) on service and team feature cards.
*   **Scroll Reveal:** A custom Angular directive (`appReveal`) for staggered, smooth entrance animations as you scroll.
*   **Glassmorphism:** Frosted UI elements (`backdrop-filter: blur()`) to simulate spatial depth over custom campus backgrounds.

## 🚀 Tech Stack
*   **Framework:** Angular 19+ (Standalone Components)
*   **Styling:** Pure Modern CSS (CSS Variables, Flexbox, Grid, Custom Animations)
*   **Routing:** Angular Router
*   **Icons & Assets:** Inline SVGs and curated assets

## 📖 Key Sections
1.  **Home (`/home`):** Hero section with scrolling cloud banner, animated particles, and quick stats.
2.  **About (`/about`):** Club vision, mission, and core values of the SRIT chapter.
3.  **What We Do (`/services`):** Offerings including Workshops, Certification Prep, Tech Talks, and Project Sprints.
4.  **Events (`/events`):** Tabbed interface showing upcoming schedule and past completed events.
5.  **Our Team (`/team`):** Core members driving the club's initiatives.
6.  **Join Us (`/join`):** Registration form with interactive form validation and success animations.

---

## 💻 Development Server Setup

This project was generated using [Angular CLI](https://github.com/angular/angular-cli).

### Prerequisites
Make sure you have Node.js and Angular CLI installed.
```bash
npm install -g @angular/cli
```

### Running Locally
1. Clone the repository and install dependencies:
```bash
npm install
```
2. Start the development server:
```bash
ng serve
```
3. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## 🛠️ Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

---
**Disclaimer:** This community is affiliated with Amazon Web Services but operates independently at SRIT.
