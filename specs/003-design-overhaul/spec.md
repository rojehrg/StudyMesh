# Spec 003: Complete Design System Overhaul

**Status**: In Progress  
**Author**: AI Assistant  
**Created**: 2025-12-03  
**Last Updated**: 2025-12-03

---

## 📋 Overview

Complete redesign of Attunly's visual identity and user interface, moving away from the current indigo/purple color scheme to a unique, modern B2B SaaS aesthetic. The new design will emphasize smooth animations, rounded corners, and a cohesive color system while avoiding gradients.

## 🎯 Goals

1. **Fix Critical Bug**: Resolve notifications page issue (black screen/Reflex remnants)
2. **New Color System**: Replace indigo-based palette with a unique, professional color scheme
3. **Typography Update**: Migrate from Inter to Roboto font family
4. **Component Redesign**: Update all UI components with:
   - Rounded corners throughout
   - Smooth Framer Motion animations
   - No gradients
   - Cohesive spacing and padding
5. **Landing Page Overhaul**: Complete redesign with new color scheme and modern B2B SaaS patterns
6. **Dashboard Experience**: Make the app feel "alive and cool" with interactive elements

---

## 🎨 Design System

### Color Palette

**Primary Colors** (replacing Indigo):
- **Primary**: `#0A8A7B` (Teal) - Actions, CTAs, active states
- **Primary Dark**: `#076B5F` - Hover states
- **Primary Light**: `#E0F5F3` - Backgrounds, accents

**Neutral Colors**:
- **Gray 950**: `#0A0F14` - Headings
- **Gray 700**: `#374151` - Body text
- **Gray 500**: `#6B7280` - Secondary text
- **Gray 200**: `#E5E7EB` - Borders
- **Gray 50**: `#F9FAFB` - Background
- **White**: `#FFFFFF` - Cards, surfaces

**Semantic Colors**:
- **Success**: `#10B981` (Emerald) - Confirmations, success states
- **Warning**: `#F59E0B` (Amber) - Warnings
- **Error**: `#EF4444` (Red) - Errors, destructive actions
- **Info**: `#3B82F6` (Blue) - Info messages

### Typography

**Font Family**: Roboto
- **Headings**: Roboto, weight 700 (bold)
- **Body**: Roboto, weight 400 (regular)
- **UI Elements**: Roboto, weight 500 (medium)
- **Small Text**: Roboto, weight 400 (regular)

**Font Sizes**:
- **Hero**: 3rem (48px)
- **H1**: 2rem (32px)
- **H2**: 1.5rem (24px)
- **H3**: 1.25rem (20px)
- **Body**: 1rem (16px)
- **Small**: 0.875rem (14px)
- **Tiny**: 0.75rem (12px)

### Spacing & Layout

**Border Radius**:
- **Small**: `0.5rem` (8px) - Buttons, badges
- **Medium**: `0.75rem` (12px) - Cards, inputs
- **Large**: `1rem` (16px) - Large cards, sections
- **Full**: `9999px` - Pills, avatars

**Shadows**:
- **sm**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **md**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- **lg**: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`

### Animation Principles

- **Duration**: 200-300ms for micro-interactions, 400-500ms for page transitions
- **Easing**: `ease-in-out` for most, `spring` for playful interactions
- **Triggers**: Hover, focus, page load, data updates
- **Types**:
  - Fade in/out (opacity)
  - Slide in/out (translateX/Y)
  - Scale (transform: scale)
  - Rotate (subtle, for loading states)

---

## 🏗️ Implementation Plan

### Phase 1: Foundation (Critical Fixes & Setup)
**Status**: ✅ In Progress

1. ✅ **Fix Notifications Bug**
   - Create `/notifications` page
   - Remove mock badge from sidebar
   - Implement empty state UI

2. **Update Tailwind Config**
   - Add Roboto font via Next.js font loader
   - Define new color palette in `tailwind.config.ts`
   - Set default border radius values

3. **Update Global Styles**
   - Apply Roboto as default font
   - Remove all gradient utilities
   - Add custom animation keyframes

### Phase 2: Component Library Update
**Status**: Pending

1. **Update Shadcn Components**
   - Button: New colors, rounded corners
   - Card: Softer shadows, rounded corners
   - Input: New focus states, rounded corners
   - Badge: New semantic colors
   - Avatar: Ensure full rounded
   - Tabs: New active states
   - Dialog/Sheet: Updated animations

2. **Dashboard Layout**
   - Sidebar: New hover states, animations
   - Navigation: Active state indicators
   - User profile section: Enhanced visuals

### Phase 3: Landing Page Redesign
**Status**: Pending

1. **Hero Section**
   - New color scheme
   - Animated background (no gradients, use patterns/shapes)
   - Updated CTA buttons

2. **Features Section**
   - New card design with hover animations
   - Icon updates to match new palette
   - Improved spacing

3. **Social Proof/Stats**
   - Add animated counters
   - New visual treatment

### Phase 4: Dashboard Pages
**Status**: Pending

1. **Main Dashboard**
   - Empty state redesign
   - Pod cards with new styles
   - Animated loading states

2. **Onboarding Flow**
   - Update progress bar colors
   - Smooth step transitions
   - Badge styling for skills

3. **Settings Page** (To be created)
   - Form redesign with new inputs
   - Save button with loading animation

4. **Pods/Classes Pages** (To be created)
   - List views with hover effects
   - Create/Join flows

---

## 📦 Deliverables

- [ ] Updated `tailwind.config.ts` with new color system and Roboto font
- [ ] Updated `globals.css` with custom animations
- [ ] Redesigned Landing Page (`src/app/page.tsx`)
- [ ] Updated Dashboard Layout (`src/components/dashboard-layout.tsx`)
- [ ] New Notifications Page (`src/app/(dashboard)/notifications/page.tsx`)
- [ ] Updated Shadcn UI components in `src/components/ui/`
- [ ] Redesigned Onboarding Flow (`src/app/(onboarding)/onboarding/page.tsx`)
- [ ] Updated Dashboard Page (`src/app/(dashboard)/dashboard/page.tsx`)
- [ ] Style guide documentation (this spec)

---

## 🧪 Testing Checklist

- [ ] All pages load without errors
- [ ] Animations are smooth (60fps)
- [ ] Color contrast meets WCAG AA standards
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] No gradients used anywhere
- [ ] All corners are rounded appropriately
- [ ] Roboto font loads correctly
- [ ] Hover states are consistent across components
- [ ] Loading states are clear and animated
- [ ] Dark mode is NOT implemented (removed)

---

## 🚀 Success Metrics

1. **Visual Consistency**: All components use the new color system
2. **Performance**: No animation jank, smooth 60fps
3. **User Delight**: Interactive elements feel responsive and polished
4. **Brand Identity**: Unique color scheme distinguishes Attunly from competitors
5. **Accessibility**: All text meets contrast ratios, animations can be reduced via `prefers-reduced-motion`

---

## 📚 References

- [Tailwind CSS v3 Documentation](https://v3.tailwindcss.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Roboto Font](https://fonts.google.com/specimen/Roboto)
- [Shadcn UI](https://ui.shadcn.com/)
- [B2B SaaS Design Patterns](https://www.saasframe.io/)

---

## 🔄 Revision History

| Version | Date       | Changes                                      |
|---------|------------|----------------------------------------------|
| 0.1     | 2025-12-03 | Initial spec created, notifications bug fix |

