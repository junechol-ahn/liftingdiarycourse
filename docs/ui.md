# UI Coding Standards

## Component Library

This project uses **shadcn/ui** as the exclusive component library.

### Rules

1. **ONLY use shadcn/ui components** - All UI elements must come from shadcn/ui
2. **NO custom components** - Do not create custom UI components; use shadcn/ui primitives and compose them as needed
3. **Install components as needed** - Use `npx shadcn@latest add <component>` to add new components

### Available Components

Components are installed to `@/components/ui/`. To add a new component:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add calendar
# etc.
```

See the full list at: https://ui.shadcn.com/docs/components

## Date Formatting

Use **date-fns** for all date formatting.

### Standard Date Format

Dates should be displayed with ordinal day, abbreviated month, and full year:

```
1st Sep 2025
2nd Aug 2025
5th Jan 2026
```

### Implementation

```typescript
import { format } from "date-fns";

// Use "do MMM yyyy" format
format(new Date(), "do MMM yyyy"); // "1st Sep 2025"
```

### Format Reference

| Token | Description | Example |
|-------|-------------|---------|
| `do` | Day of month (ordinal) | 1st, 2nd, 3rd |
| `MMM` | Month (abbreviated) | Jan, Feb, Sep |
| `yyyy` | Year (4 digits) | 2025, 2026 |
