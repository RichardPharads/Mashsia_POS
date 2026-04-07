# Testing Guide for Mashsia POS Monorepo

## 1. Verify Workspace Structure ✅

### Check pnpm recognizes all workspaces:
```bash
pnpm list --depth 0
```

Expected output should show all workspaces:
```
Packages in the workspace:

@mashsia/api 1.0.0
@mashsia/dashboard 0.1.0
@mashsia/pos-terminal 0.1.0
@mashsia/ui 1.0.0
```

## 2. Install & Verify Dependencies ✅

### Step 1: Install all dependencies
```bash
pnpm install
```

**What to check:**
- ✅ No errors during installation
- ✅ `pnpm-lock.yaml` updated in root
- ✅ All `node_modules` folders created

### Step 2: Verify workspace linking
```bash
# Check if UI package is properly linked
cd apps/dashboard
cat package-lock.json | grep @mashsia/ui
# OR
ls -la node_modules/@mashsia/  # Should show symlink
```

## 3. Type Checking ✅

### Test TypeScript compilation:
```bash
# Test all packages
pnpm type-check --recursive

# OR individually
cd packages/ui && pnpm type-check
cd apps/dashboard && pnpm type-check
cd apps/pos-terminal && pnpm type-check
cd apps/api && pnpm type-check
```

**Expected:** Zero type errors

## 4. Build Tests ✅

### Build the UI library:
```bash
cd packages/ui
pnpm build
```

**Expected output:**
```bash
✓ Successfully compiled
✓ dist/ folder created with:
  - index.js (main export)
  - index.d.ts (TypeScript definitions)
  - lib/utils.d.ts
```

**Verify build output:**
```bash
ls -la packages/ui/dist/
# Should show:
# - dist/index.d.ts
# - dist/index.js
# - dist/lib/
```

### Build individual apps:
```bash
# Dashboard
cd apps/dashboard && pnpm build

# POS Terminal (if Tauri is set up)
cd apps/pos-terminal && pnpm build

# API
cd apps/api && pnpm build
```

## 5. Test Component Import ✅

### Test that Dashboard can import from UI package:

Create a test file in `apps/dashboard/src/test-import.tsx`:
```tsx
// Test importing utilities from UI package
import { cn } from '@mashsia/ui'

// Test that it works
console.log(cn('px-2', 'py-3'))  // Should output: px-2 py-3

export function TestImport() {
  return <div className={cn('flex', 'gap-4')}>Import test</div>
}
```

Run type check:
```bash
cd apps/dashboard
pnpm type-check
```

**Expected:** No type errors

### Test that POS Terminal can import from UI package:

Create a test file in `apps/pos-terminal/src/TestImport.tsx`:
```tsx
import { cn } from '@mashsia/ui'

export function TestImport() {
  return <div className={cn('flex', 'gap-4')}>Import test</div>
}
```

Run type check:
```bash
cd apps/pos-terminal
pnpm type-check
```

**Expected:** No type errors

## 6. Development Server Tests ✅

### Test API Server:
```bash
cd apps/api

# Check if server starts
pnpm dev
```

**Expected output:**
```bash
Listening on port 3000
```

**Test it:**
```bash
# In another terminal
curl http://localhost:3000/health  # Or your health check endpoint
```

### Test Dashboard:
```bash
cd apps/dashboard
pnpm dev
```

**Expected output:**
```bash
▲ Next.js 16.1.7
- Local: http://localhost:3001
```

**Test it:** Open browser → http://localhost:3001

### Test POS Terminal:
```bash
cd apps/pos-terminal
pnpm dev
```

**Expected output:**
```bash
VITE v7.0.4 ready in 123 ms

Local: http://localhost:1420
```

**Test it:** Open browser → http://localhost:1420

## 7. Add First shadcn Component ✅

### Initialize shadcn/ui:
```bash
cd packages/ui
npx shadcn-ui@latest init
```

**Prompts to expect:**
```
✔ Which style would you like to use? › New York
✔ Which color would you like as the base color? › Slate
✔ Would you like to use CSS variables for colors? › yes
```

### Add Button component:
```bash
npx shadcn-ui@latest add button
```

**Expected:**
```bash
✔ Done. Created: src/components/ui/button.tsx
```

### Verify it was created:
```bash
ls -la packages/ui/src/components/ui/
# Should show: button.tsx
```

## 8. Test Component in Apps ✅

### Update Dashboard to use Button:

Edit `apps/dashboard/src/app/page.tsx`:
```tsx
import { Button } from '@mashsia/ui/components/button'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1>Shadcn/UI Test</h1>
      <Button>Click me!</Button>
    </main>
  )
}
```

Start dashboard:
```bash
cd apps/dashboard
pnpm dev
```

Open http://localhost:3001 → Should see styled button ✅

### Update POS Terminal to use Button:

Edit `apps/pos-terminal/src/App.tsx`:
```tsx
import { Button } from '@mashsia/ui/components/button'

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>POS Terminal - Shadcn/UI Test</h1>
      <Button>Press me!</Button>
    </div>
  )
}

export default App
```

Start terminal:
```bash
cd apps/pos-terminal
pnpm dev
```

Open http://localhost:1420 → Should see styled button ✅

## 9. Database Tests ✅ (API only)

### Check database connection:
```bash
# Start PostgreSQL (ensure docker-compose is running)
docker-compose up -d

# Generate migrations
cd apps/api
pnpm db:generate

# Apply migrations
pnpm db:push

# Seed data
pnpm db:seed
```

**Expected:**
```bash
✔ Done
```

## 10. Quick Sanity Tests ✅

### Test root scripts:
```bash
# From root directory
pnpm build              # Should build all packages
pnpm type-check         # Should type-check all packages
pnpm db:studio          # Should open Drizzle Studio (API running)
```

### Test workspace filtering:
```bash
# Run commands on specific package
pnpm --filter @mashsia/ui build
pnpm --filter @mashsia/dashboard dev
```

### Test adding dependencies to UI package:
```bash
pnpm add lodash --filter @mashsia/ui
```

**Verify:**
```bash
cat packages/ui/package.json | grep lodash
```

## 11. Dependency Verification ✅

### Check for duplicate dependencies:
```bash
pnpm ls react
pnpm ls react-dom
pnpm ls typescript
pnpm ls tailwindcss
```

**Expected:** All from same version (no duplicates)

### Check workspace catalog:
```bash
pnpm config list | grep catalog
```

## 12. Test Tailwind Integration ✅

### Test Tailwind in Dashboard:
```bash
cd apps/dashboard/src/app
cat globals.css  # Should have Tailwind directives
```

Add test class:
```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Tailwind Test
</div>
```

Start dev server and verify styling ✅

### Test Tailwind in POS Terminal:
Similar test with Vite app ✅

## Troubleshooting Tests

### If pnpm install fails:
```bash
# Clear cache and retry
rm -rf node_modules pnpm-lock.yaml
pnpm install --no-frozen-lockfile
```

### If imports don't resolve:
```bash
# Rebuild UI package
cd packages/ui
pnpm build

# Check tsconfig paths
cat tsconfig.json | grep paths
```

### If styles don't apply:
```bash
# Verify tailwind.config.ts content paths
cat apps/dashboard/tailwind.config.ts
# Should include: "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
```

### If port conflicts:
- API: Change `API_PORT` in `.env`
- Dashboard: Use `PORT=3002 pnpm dev`
- POS: Uses Tauri, port 1420 (can be changed in tauri.conf.json)

## Full Integration Test Checklist

- [ ] `pnpm install` completes successfully
- [ ] `pnpm list --depth 0` shows all workspaces
- [ ] `pnpm type-check --recursive` passes
- [ ] `pnpm build --recursive` completes
- [ ] `cd packages/ui && npm run build` creates dist/
- [ ] Dashboard can import from @mashsia/ui
- [ ] POS Terminal can import from @mashsia/ui
- [ ] Dashboard dev server starts (localhost:3001)
- [ ] POS Terminal dev server starts (localhost:1420)
- [ ] API dev server starts (localhost:3000)
- [ ] First Button component renders with styles
- [ ] Database migrations run successfully
- [ ] No Tailwind conflicts between UI and apps

## Performance Checks

```bash
# Check build times
time pnpm build --recursive

# Check dependency count
pnpm ls | wc -l  # Total dependencies

# Check workspace size
du -sh .  # Total size
du -sh node_modules/  # node_modules size
du -sh packages/ui/dist/  # Built UI package size
```

## Next Steps After Testing

✅ Once all tests pass:
1. Add more shadcn/ui components
2. Create custom components in @mashsia/ui
3. Build out Dashboard features
4. Build out POS Terminal features
5. Connect to API endpoints

---

**Run these tests in order for best results!**
