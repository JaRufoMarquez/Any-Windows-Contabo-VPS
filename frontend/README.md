# Frontend - Windows Installer UI

React + Vite + Tailwind CSS frontend for the Windows installer web application.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

The UI will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

## Components

- `App.jsx` - Main application component
- `ConnectionForm.jsx` - VPS connection form
- `WorkflowProgress.jsx` - Installation progress display
- `PromptDialog.jsx` - Interactive user prompts

## Features

- Modern, responsive UI with Tailwind CSS
- Real-time progress tracking
- Interactive prompts for user decisions
- Error handling and display
- Visual step indicators
- Polling-based status updates
