# HMS Layout System Documentation

## Overview

The HMS (Hotel Management System) features a modern, responsive layout system built with Mantine UI components. The design follows the color palette and aesthetic established in the login page, providing a cohesive and professional user experience.

## Color Palette

The application uses a consistent color scheme throughout:

- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Secondary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)`
- **Dark Text**: `#2d1b69`
- **Gray Text**: `#374151`
- **Light Gray**: `#6b7280`
- **Borders**: `#e5e7eb`
- **Background**: `linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)`

## Layout Components

### 1. AppShell (`components/layout/AppShell.tsx`)

The main layout wrapper that provides the overall structure:

- Responsive design with mobile-first approach
- Collapsible sidebar for mobile devices
- Fixed header and footer
- Smooth animations and transitions

### 2. Navbar (`components/layout/Navbar.tsx`)

Top navigation bar featuring:

- **Logo**: HMS branding with gradient effect
- **Search Bar**: Global search functionality (desktop only)
- **Action Icons**: Notifications and settings
- **User Menu**: Profile dropdown with logout option
- **Mobile Burger**: Navigation toggle for mobile devices

### 3. Sidebar (`components/layout/Sidebar.tsx`)

Left navigation panel with:

- **Organized Sections**: Main, Analytics, System
- **Interactive Navigation**: Hover effects and active states
- **Responsive Design**: Collapsible on mobile
- **Visual Indicators**: Gradient accents and icons

Navigation sections:

- **Main**: Dashboard, Properties, Bookings, Guests, Staff
- **Analytics**: Analytics, Reports
- **System**: Settings

### 4. Footer (`components/layout/Footer.tsx`)

Bottom footer containing:

- **Copyright Information**: Dynamic year
- **Quick Links**: Privacy Policy, Terms, Support
- **Responsive Layout**: Adapts to screen size

### 5. DashboardLayout (`components/layout/DashboardLayout.tsx`)

Page-specific wrapper that:

- **Page Titles**: Gradient-styled headings
- **Content Container**: Responsive max-width
- **Title Underline**: Brand-colored accent

## Responsive Breakpoints

The layout uses Mantine's responsive system:

```typescript
breakpoints: {
  xs: '30em',    // 480px
  sm: '48em',    // 768px
  md: '64em',    // 1024px
  lg: '74em',    // 1184px
  xl: '90em',    // 1440px
}
```

## Usage Examples

### Basic Page Layout

```tsx
import { DashboardLayout } from '../components/layout';

function MyPage() {
  return (
    <DashboardLayout title="Page Title">
      {/* Your page content here */}
    </DashboardLayout>
  );
}
```

### Using AppShell Directly

```tsx
import { AppShell } from '../components/layout';

function CustomLayout({ children }) {
  return (
    <AppShell>
      {/* Custom content without DashboardLayout wrapper */}
      {children}
    </AppShell>
  );
}
```

## Features

### 🎨 Modern Design

- Glass morphism effects with backdrop blur
- Smooth hover animations
- Gradient accents throughout
- Professional color scheme

### 📱 Mobile-First Responsive

- Collapsible sidebar for mobile
- Touch-friendly navigation
- Responsive grid layouts
- Adaptive typography

### ⚡ Performance Optimized

- Efficient component structure
- Minimal re-renders
- Optimized CSS with custom utilities

### 🔧 Customizable

- Easy color scheme modifications
- Flexible layout options
- Extensible component system

## Custom CSS Utilities

The layout includes custom CSS utilities in `styles/layout.css`:

- **Animation Classes**: `.slide-in`, `.fade-in-up`
- **Glass Effect**: `.glass-card`
- **Gradient Text**: `.gradient-text`
- **Responsive Utils**: `.mobile-hidden`, `.desktop-hidden`
- **Enhanced Buttons**: `.enhanced-button`
- **Loading Effects**: `.shimmer`

## Navigation Structure

The sidebar navigation is organized into logical sections:

```
Main Navigation
├── Dashboard (/)
├── Properties (/properties)
├── Bookings (/bookings)
├── Guests (/guests)
└── Staff (/staff)

Analytics
├── Analytics (/analytics)
└── Reports (/reports)

System
└── Settings (/settings)
```

## Best Practices

### 1. Component Structure

- Use `DashboardLayout` for standard pages
- Implement proper TypeScript interfaces
- Follow the established naming conventions

### 2. Styling

- Use the established color palette
- Apply consistent border radius (`xl` = 12px)
- Maintain proper spacing with Mantine's spacing system

### 3. Responsiveness

- Test on multiple screen sizes
- Use Mantine's responsive props (`visibleFrom`, `hiddenFrom`)
- Implement mobile-specific navigation patterns

### 4. Performance

- Lazy load heavy components
- Optimize images and assets
- Use efficient state management

## Future Enhancements

Planned improvements for the layout system:

- **Dark Mode Support**: Toggle between light and dark themes
- **Theme Customization**: User-selectable color schemes
- **Advanced Navigation**: Breadcrumbs and quick navigation
- **Accessibility**: Enhanced screen reader support
- **Micro-interactions**: Advanced hover and click animations

## File Structure

```
src/
├── components/
│   └── layout/
│       ├── AppShell.tsx
│       ├── DashboardLayout.tsx
│       ├── Footer.tsx
│       ├── MobileNav.tsx
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── index.ts
├── pages/
│   ├── BlankPage.tsx (Example usage)
│   └── PropertiesPage.tsx (Example usage)
└── styles/
    └── layout.css
```

This layout system provides a solid foundation for building a modern, professional hotel management system with consistent design patterns and excellent user experience across all devices.
