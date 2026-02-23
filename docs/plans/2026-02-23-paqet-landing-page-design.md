# PAQET Documentation Hub - Landing Page Design

**Date:** 2026-02-23
**Status:** Approved

## Overview

A modern, dark-themed documentation hub for PAQET - a packet-level proxy with KCP protocol. The landing page serves as the primary documentation entry point for VPN/proxy users, featuring the complete optimization guide in a visually appealing, easy-to-navigate format.

## Goals

- Provide comprehensive documentation access in a single-page format
- Create a super modern dark theme aesthetic appealing to VPN/proxy users
- Enable quick navigation through 13 documentation sections
- Support code copying and syntax highlighting for configuration examples

## Target Audience

VPN/proxy users with varying technical backgrounds who need to configure and optimize PAQET for their use cases.

---

## Visual Theme

### Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Background | Deep charcoal | `#0a0a0f` |
| Surface | Slightly lighter | `#12121a` |
| Primary accent | Electric cyan | `#00d9ff` |
| Secondary accent | Purple gradient | `#8b5cf6` → `#a855f7` |
| Text | Off-white | `#e4e4e7` |
| Muted text | Gray | `#71717a` |

### Design Language

- **Glassmorphism:** Semi-transparent cards with backdrop blur effects
- **Background patterns:** Subtle grid/dot patterns for tech aesthetic
- **Glowing borders:** Accent glows on code blocks and interactive elements
- **Animations:** Smooth fade-in and slide animations on scroll
- **Decorative elements:** Network/packet-inspired animated dots and connection lines

---

## Layout Structure

### Page Sections

```
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR (fixed)                                             │
│  Logo | Section Links | "View on GitHub"                    │
├─────────────────────────────────────────────────────────────┤
│  HERO SECTION                                               │
│  PAQET title | Tagline | Architecture diagram (animated)    │
├───────────┬─────────────────────────────────────────────────┤
│  SIDEBAR  │  MAIN CONTENT AREA                              │
│  (sticky) │                                                 │
│           │  [Documentation sections 1-13]                  │
│           │                                                 │
├───────────┴─────────────────────────────────────────────────┤
│  FOOTER                                                     │
└─────────────────────────────────────────────────────────────┘
```

### Sidebar Features

- Sticky positioning on scroll (desktop)
- Active section highlighting as user scrolls
- Collapsible hamburger menu on mobile
- Smooth scroll navigation on click

### Documentation Sections (13 total)

1. Architecture Overview
2. Configuration Reference
3. Network Layer
4. KCP Protocol
5. Buffers & Memory
6. Encryption
7. Connection Multiplexing
8. OS Tuning
9. Firewall Setup
10. Monitoring & Debugging
11. Troubleshooting
12. Scenario Configurations
13. Quick Diagnostic Checklist

---

## Components

### Code Block

```
┌─────────────────────────────────────────────────┐
│ yaml                              [📋]          │
├─────────────────────────────────────────────────┤
│ network:                                        │
│   interface: "eth0"                             │
│   ipv4:                                         │
│     addr: "192.168.1.100:0"                     │
└─────────────────────────────────────────────────┘
```

- Language badge (top-left)
- Copy button with success feedback (top-right)
- Syntax highlighting with custom dark theme
- Maximum height with scroll for long code
- Optional line numbers

### Scenario Tabs

Interactive tabs for switching between configuration presets:
- Gaming (Low Latency)
- Bulk Transfer (High Throughput)
- Mobile/Lossy Network
- Satellite (High Latency)
- Datacenter (Maximum Performance)
- VPN Service (Traffic-Constrained)

### Navigation

- Fixed navbar with section anchor links
- Hero with animated architecture diagram
- "Back to top" floating button (appears after scroll)

### Tables

- Responsive horizontal scroll on mobile
- Row hover highlighting
- Proper contrast for dark theme

---

## Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Mobile (<768px) | Sidebar as slide-out drawer, single column |
| Tablet (768-1024px) | Collapsed sidebar, expand on tap |
| Desktop (>1024px) | Full visible sidebar, wide content |

---

## Technical Stack

### Framework & Libraries

| Purpose | Technology |
|---------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Syntax Highlighting | Prism.js |
| Icons | Lucide React |
| Fonts | Geist or Inter |

### Project Structure

```
/app
  /page.tsx              # Main landing page
  /layout.tsx            # Root layout
  /globals.css           # Tailwind + custom styles
/components
  /Navbar.tsx
  /Sidebar.tsx
  /Hero.tsx
  /CodeBlock.tsx
  /ConfigTable.tsx
  /Section.tsx
  /Tabs.tsx
  /Footer.tsx
/content
  /optimization-guide.ts
/lib
  /parse-content.ts
  /highlight.ts
```

### Performance

- Static generation for fast page loads
- Code splitting per section (lazy load below-fold)
- Optimized font loading
- Minimal JavaScript bundle

### Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Proper heading hierarchy (h1-h6)
- Sufficient color contrast ratios
- ARIA labels for interactive elements

---

## Content Integration

The complete PAQET-OPTIMIZATION-GUIDE.md content will be parsed and rendered as React components:

1. **Headings** → Section anchors with sidebar navigation
2. **Code blocks** → Syntax-highlighted CodeBlock components
3. **Tables** → Responsive ConfigTable components
4. **Lists** → Styled list components
5. **Diagrams** → Animated architecture visualization

---

## Success Criteria

- Fast initial load (<3s on 3G)
- Smooth scroll navigation
- One-click code copying works reliably
- All 13 sections accessible from sidebar
- Mobile-friendly navigation
- Visually striking dark theme
