#!/bin/bash

# Install dependencies
npm install

# Install additional UI dependencies
npm install @radix-ui/react-dialog @radix-ui/react-checkbox @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-switch @radix-ui/react-avatar

# Install tailwind and styling dependencies
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge

# Install Next.js dependencies
npm install next-themes sonner framer-motion

# Install zustand for state management
npm install zustand

# Install lucide icons
npm install lucide-react

# Make sure all dev dependencies are installed
npm install -D typescript @types/react @types/node @types/react-dom autoprefixer postcss tailwindcss

# Run Tailwind init if config doesn't exist
npx tailwindcss init -p
