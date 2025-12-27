# Implementation Issues and Lessons Learned

This document captures notable implementation challenges encountered during development, particularly those related to Expo and React Native's cross-platform compilation.

## Theme Toggle Implementation (December 2024)

### Problem Statement

Adding a light/dark/system theme toggle to the Settings screen. The goal was to allow users to override the system theme preference and have the entire app respond to theme changes.

### Initial Approach

Created a custom `useColorScheme` hook in `hooks/use-color-scheme.ts` that:
1. Read the user's theme preference from `SettingsContext`
2. Returned the appropriate color scheme based on the preference
3. Fell back to system color scheme when set to "system"

All components were updated to import `useColorScheme` from this custom hook instead of directly from `react-native`.

### Issues Encountered

#### Issue 1: Metro Bundler Module Caching

**Symptoms:**
- Changes to `hooks/use-color-scheme.ts` were not being reflected in the running app
- Console.log statements added to the hook file did not appear in the browser console
- The hook consistently returned stale values (always 'dark') regardless of code changes

**Debugging Steps:**
1. Added console.log statements to the hook - they never appeared
2. Tried clearing Metro cache with `npx expo start --clear` - no effect
3. Cleared `.expo` and `node_modules/.cache` directories - no effect
4. Hard refresh in browser, closed and reopened tabs - no effect
5. Verified file changes were saved to disk via `git status` - confirmed changes existed

**Key Insight:**
Console.log statements added to route files (e.g., `app/(tabs)/settings.tsx`) appeared immediately, while changes to the hook file in `hooks/` were ignored. This pointed to a Metro bundler caching issue specific to certain module paths.

#### Issue 2: Debugging Without Console Access

**Symptoms:**
- Console.log was unreliable for debugging the hook module
- Needed an alternative way to see runtime values

**Solution:**
Added a visible debug component directly in the UI:
```tsx
<View style={{ backgroundColor: '#ff6b6b', padding: 12 }}>
  <Text style={{ color: '#fff' }}>colorScheme: {colorScheme}</Text>
  <Text style={{ color: '#fff' }}>settings.theme: {settings.theme}</Text>
</View>
```

This approach bypassed console logging issues and showed real-time values.

#### Issue 3: Confirming the Root Cause

**Test:**
Added inline color scheme computation directly in the component:
```tsx
// In settings.tsx
const computedColorScheme: 'light' | 'dark' =
  settings.theme === 'system' ? (systemScheme ?? 'light') : settings.theme;
```

**Result:**
- `computedColorScheme` (inline): correctly showed 'light' when Light theme selected
- `colorSchemeFromHook`: still showed 'dark' (stale value)

This confirmed the hook module was definitively being cached.

### Solution

Instead of fighting the Metro bundler caching, we restructured the code:

1. **Moved `useColorScheme` into `contexts/settings-context.tsx`**
   - Co-located the hook with the settings context it depends on
   - Metro clearly tracked this file and picked up changes immediately

2. **Updated all imports across the codebase**
   - Changed from: `import { useColorScheme } from '@/hooks/use-color-scheme'`
   - Changed to: `import { useColorScheme } from '@/contexts/settings-context'`

3. **Deleted the problematic hook file**
   - Removed `hooks/use-color-scheme.ts` entirely
   - Also removed unused `contexts/theme-context.tsx`

4. **Added graceful fallback for tests**
   ```tsx
   export function useColorScheme(): 'light' | 'dark' {
     const context = useContext(SettingsContext);
     const systemColorScheme = useSystemColorScheme();

     // If outside provider (e.g., in tests), use system color scheme
     if (!context) {
       return systemColorScheme ?? 'light';
     }
     // ... rest of logic
   }
   ```

### Key Takeaways

1. **Metro bundler can aggressively cache certain modules**
   - Hook files in particular may not update even with cache clearing
   - Route files and context files seem to update more reliably

2. **Co-locate hooks with their primary dependencies**
   - Putting `useColorScheme` in the same file as `SettingsContext` eliminated the caching issue
   - This also makes the code more cohesive

3. **Use visible UI debugging when console.log fails**
   - Adding temporary debug UI components is reliable
   - Shows real-time values without depending on console infrastructure

4. **Inline computation can isolate bundler vs logic issues**
   - If inline code works but a hook doesn't, the issue is likely bundler-related
   - This technique quickly identifies whether the problem is in your logic or the tooling

5. **Standard cache clearing may not be sufficient**
   - `npx expo start --clear`
   - Deleting `.expo` and `node_modules/.cache`
   - Browser hard refresh
   - None of these resolved the stale hook module issue

### Files Affected

- `contexts/settings-context.tsx` - Added `useColorScheme` hook
- `hooks/use-color-scheme.ts` - Deleted
- `contexts/theme-context.tsx` - Deleted (unused)
- `app/_layout.tsx` - Updated import
- `app/(tabs)/settings.tsx` - Updated import
- `app/(tabs)/index.tsx` - Updated import
- `app/(tabs)/_layout.tsx` - Updated import
- `components/todo-item.tsx` - Updated import
- `components/add-todo.tsx` - Updated import
- `components/sync-status.tsx` - Updated import
- `components/sync-notification.tsx` - Updated import
- `components/server-status-indicator.tsx` - Updated import
- `hooks/use-theme-color.ts` - Updated import

### Environment

- Expo SDK 54
- React Native 0.81
- React 19
- Platform: Web (issue observed on web, may or may not affect native)
- Metro bundler (default Expo configuration)
