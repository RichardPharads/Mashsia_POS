# @mashsia/ui

Shared UI component library built with [shadcn/ui](https://ui.shadcn.com/) and Tailwind CSS for the Mashsia POS monorepo.

## Overview

This package provides a centralized location for reusable React components used across the Mashsia POS applications (Dashboard, POS Terminal, etc.).

## Features

- 🎨 Pre-configured with shadcn/ui components
- 🎯 Tailwind CSS v4 with custom theme
- 📦 Works seamlessly in monorepo workspace
- 🔄 Shared across multiple applications
- 📱 Responsive design out of the box
- 🌓 Dark mode ready

## Getting Started

### Adding Components with shadcn/ui

This package is pre-configured for shadcn/ui. To add components:

#### Option 1: Using shadcn/ui CLI (Recommended)

```bash
cd packages/ui
npx shadcn-ui@latest add [component-name]
```

Popular components:
- `button`
- `card`
- `dialog`
- `dropdown-menu`
- `form`
- `input`
- `label`
- `select`
- `tabs`
- `tooltip`

#### Option 2: Manual Copy

Copy component files from [shadcn/ui component library](https://ui.shadcn.com/docs/components) directly into `src/components/ui/`.

### Using Components in Your App

#### In Next.js (Dashboard)

```tsx
import { Button } from '@mashsia/ui/components/button';

export default function Page() {
  return <Button>Click me</Button>;
}
```

#### In Vite + React (POS Terminal)

```tsx
import { Button } from '@mashsia/ui/components/button';

export default function App() {
  return <Button>Click me</Button>;
}
```

### Tailwind CSS Configuration

Each consuming app (dashboard, pos-terminal) should include the UI package's styles in their Tailwind config:

```ts
// tailwind.config.ts
export default {
  content: [
    // ... existing content paths
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  // ... rest of config
};
```

## Project Structure

```
packages/ui/
├── src/
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   ├── index.ts         # Main export file
│   └── index.css        # Global styles & CSS variables
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── package.json
```

## Dependencies

### Peer Dependencies
- React 19+
- React DOM 19+
- Tailwind CSS 4+

### Included Dependencies
- All Radix UI primitives used by shadcn/ui
- `class-variance-authority` - CVA for component styles
- `clsx` - Utility for className combining
- `tailwind-merge` - Merge Tailwind classes
- `tailwindcss-animate` - Animation utilities
- `cmdk` - Command palette component

## Theming

The package includes CSS variables for a light and dark theme. Customize colors in `src/index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.6%;
  /* ... more variables */
}

.dark {
  --background: 0 0% 3.6%;
  --foreground: 0 0% 98.2%;
  /* ... more variables */
}
```

## Building

```bash
# Build the library
npm run build

# Watch mode for development
npm run dev

# Type checking
npm run type-check

# Clean build artifacts
npm run clean
```

## Best Practices

1. **Keep it shared**: Only add components here that are used across multiple apps
2. **Follow shadcn patterns**: Maintain consistency with shadcn/ui conventions
3. **Update exports**: Always update `src/index.ts` with new component exports
4. **Test thoroughly**: Test components in each consuming app
5. **Document props**: Use TypeScript for self-documenting components

## Adding New Components

Example workflow:

```bash
# 1. Navigate to UI package
cd packages/ui

# 2. Add component with shadcn CLI
npx shadcn-ui@latest add button

# 3. Update exports in src/index.ts
export { Button } from './components/ui/button'

# 4. Build the package
npm run build

# 5. Use in consuming app (no version bump needed with workspace:*)
import { Button } from '@mashsia/ui'
```

## Troubleshooting

### Styles not applying in consuming app

Make sure the consuming app's `tailwind.config.ts` includes:
```ts
content: [
  "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  // ... other paths
]
```

### Components not found

Ensure components are:
1. Added to `packages/ui/src/components/ui/`
2. Exported in `packages/ui/src/index.ts`
3. Package is built (`npm run build`)

### Tailwind conflicts

Use `tailwind-merge` for combining classes:
```tsx
import { cn } from '@mashsia/ui/utils'

export const MyComponent = ({ className }) => (
  <div className={cn("flex gap-2", className)}>
    {/* ... */}
  </div>
)
```

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Class Variance Authority](https://cva.style/)

## License

ISC
