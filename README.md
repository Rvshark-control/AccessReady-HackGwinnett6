AccessReady 🏥✨
"AccessReady bridges patient needs and medical accessibility by instantly matching individuals with facilities equipped for their precise accommodations—making healthcare simple, transparent, and barrier-free."

AccessReady is a modern, accessible web application built with Next.js that connects patients to healthcare providers equipped with the specific physical, sensory, and technical accommodations they require.

🎃 Visual Theme & Design System
AccessReady features a custom Halloween-inspired Dark Mode Liquid Glass (Glassmorphism) aesthetic designed for high legibility, accessible contrast, and smooth interactions:

Midnight Charcoal (#0D0D12 / #121218): Deep dark canvas background.

Electric Pumpkin Orange (#FF6B00 / #FF7A00): Focal buttons, primary highlights, and CTAs.

Neon Toxic Purple (#9D4EDD / #A855F7): Secondary accents, subtle borders, and glow effects.

Eerie Slime Green (#22C55E): Positive status indicators (e.g., Verified Accommodation).

Phantom Light Off-White (#F3F4F6): High-contrast typography for full readability.

Liquid Glass Containers: Frosted cards (backdrop-blur-md), ambient glow borders, and fluid transitions with scroll-behavior: smooth.

🛠️ Tech Stack
Framework: Next.js 16.4.3 (App Router, Turbopack)

Language: TypeScript / JavaScript

Styling: Tailwind CSS with custom Glassmorphism components

Icons & Assets: Lucide React / SVG components

Version Control: Git & GitHub (Multi-branch workspace setup)

🚀 Getting Started
Follow these steps to set up and run the project locally.

1. Prerequisites
Ensure you have Node.js (v18 or higher recommended) and npm installed.

node -v
npm -v
2. Clone the Repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
3. Install Dependencies
npm install
4. Run the Development Server
Start the local server using Next.js with Turbopack:

npm run dev
Open http://localhost:3000 in your browser to view the application.

🌿 Workspace & Branch Management
To maintain parallel development between frontend UI design and backend logic, this repository follows a clean branch structure:

main: Stable, production-ready codebase.

claude-frontend-ui: Active development branch for Next.js layout, liquid glass components, and Tailwind styling.

codex-backend: Active development branch for matching algorithms, API routes, and facility data models.

Switching Branches
# Frontend Work
git checkout claude-frontend-ui

# Backend Work
git checkout codex-backend
Merging Strategy
Always push updates to your respective branch (claude-frontend-ui or codex-backend).

Open a Pull Request on GitHub targeting main.

Resolve any document conflicts directly via the GitHub PR editor before merging.

📖 Hackathon Overview
Inspiration
Navigating healthcare is already challenging, but for individuals with specialized physical, sensory, or mobility needs, finding a facility that actually accommodates them is a constant hurdle. AccessReady eliminates the guessing game by providing transparent accessibility matching before patients set foot in a clinic.

What It Does
Dynamic Accessibility Matching: Calculates compatibility scores based on mobility access, sensory accommodations, and specialized medical equipment.

Verified Facility Cards: Visual indicators highlighting accessible parking, ramp/elevator access, low-sensory rooms, and adult changing tables.

Barrier Detection Alerts: Real-time feedback alerting patients to potential access obstacles.

Interactive Filtering: Quick toggles for specific accommodation needs.

What's Next for AccessReady
Live elevator maintenance and accessibility outage alerts.

Community-driven accommodation verifications and reviews.

Multi-language voice navigation support.

Direct appointment booking integrations with accessible clinic schedules.

📜 License
Built for hackathon demonstration. All rights reserved.
