# PAQET Documentation Hub Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a modern, dark-themed single-page documentation hub for PAQET with sidebar navigation, syntax-highlighted code blocks, and smooth animations.

**Architecture:** Next.js 14 App Router with Tailwind CSS for styling, Framer Motion for animations, and Prism.js for syntax highlighting. Content from the optimization guide is parsed into React components with a sticky sidebar for navigation.

**Tech Stack:** Next.js 14, Tailwind CSS, Framer Motion, Prism.js, Lucide React, TypeScript

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`

**Step 1: Create Next.js project**

Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias`
Select: Yes for all defaults when prompted

Expected: Project initialized with Next.js 14, TypeScript, Tailwind CSS

**Step 2: Install additional dependencies**

Run: `npm install framer-motion prismjs lucide-react @types/prismjs`
Expected: Dependencies installed successfully

**Step 3: Verify installation**

Run: `npm run dev`
Expected: Dev server starts at http://localhost:3000

**Step 4: Stop dev server and commit**

Run: `git add . && git commit -m "chore: initialize Next.js project with dependencies"`

---

## Task 2: Configure Tailwind with Custom Dark Theme

**Files:**
- Modify: `tailwind.config.ts`

**Step 1: Update Tailwind config with custom colors and fonts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        surface: "#12121a",
        primary: "#00d9ff",
        secondary: {
          DEFAULT: "#8b5cf6",
          light: "#a855f7",
        },
        text: {
          DEFAULT: "#e4e4e7",
          muted: "#71717a",
        },
        border: "#27272a",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px #00d9ff, 0 0 10px #00d9ff" },
          "100%": { boxShadow: "0 0 10px #00d9ff, 0 0 20px #00d9ff" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 2: Verify Tailwind config**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 3: Commit**

Run: `git add tailwind.config.ts && git commit -m "chore: configure Tailwind with custom dark theme"`

---

## Task 3: Create Global Styles

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add global styles**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #0a0a0f;
  --foreground: #e4e4e7;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--background);
  color: var(--foreground);
  min-height: 100vh;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #12121a;
}

::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #3f3f46;
}

/* Selection styling */
::selection {
  background: #00d9ff33;
}

/* Code block styling */
pre[class*="language-"] {
  background: #12121a !important;
  border: 1px solid #27272a;
  border-radius: 8px;
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
}

code[class*="language-"] {
  font-family: var(--font-mono), monospace;
  font-size: 0.875rem;
}

/* Table styling */
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #27272a;
}

tr:hover {
  background: #12121a;
}

/* Glassmorphism utility */
@layer utilities {
  .glass {
    background: rgba(18, 18, 26, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(39, 39, 42, 0.5);
  }
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #00d9ff 0%, #8b5cf6 50%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glow effect */
.glow-border {
  box-shadow: 0 0 0 1px rgba(0, 217, 255, 0.3),
              0 0 20px rgba(0, 217, 255, 0.1);
}

/* Background grid pattern */
.bg-grid {
  background-image: 
    linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}
```

**Step 2: Verify styles compile**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

Run: `git add src/app/globals.css && git commit -m "style: add global dark theme styles and utilities"`

---

## Task 4: Create Content Data File

**Files:**
- Create: `src/content/optimization-guide.ts`

**Step 1: Create content data structure**

```typescript
export interface Section {
  id: string;
  title: string;
  content: ContentBlock[];
}

export interface ContentBlock {
  type: "heading" | "paragraph" | "code" | "table" | "list" | "diagram";
  level?: number;
  text?: string;
  language?: string;
  code?: string;
  headers?: string[];
  rows?: string[][];
  items?: string[];
}

export const sections: Section[] = [
  {
    id: "architecture-overview",
    title: "Architecture Overview",
    content: [
      {
        type: "paragraph",
        text: "paqet is a packet-level proxy that bypasses the OS TCP/IP stack using raw sockets and libpcap.",
      },
      {
        type: "diagram",
        text: `CLIENT                              SERVER
───────                              ──────

Application ──► SOCKS5/Forward ──► SMUX ──► KCP ──► pcap

                Raw TCP Packets (crafted)
             ◄────────────────────────────────────────►

pcap ◄── KCP ◄── SMUX ◄── SOCKS5/Forward ◄── Application`,
      },
      {
        type: "heading",
        level: 3,
        text: "Key Components:",
      },
      {
        type: "list",
        items: [
          "**pcap**: Captures/injects raw Ethernet frames via libpcap",
          "**Packet Crafting**: Builds TCP packets with forged headers",
          "**KCP**: Reliable UDP protocol with ARQ and congestion control",
          "**SMUX**: Multiplexes multiple streams over one KCP connection",
          "**SOCKS5/Forward**: Application-layer proxy interfaces",
        ],
      },
    ],
  },
  {
    id: "configuration-reference",
    title: "Configuration Reference",
    content: [
      {
        type: "heading",
        level: 3,
        text: "Complete Configuration Structure",
      },
      {
        type: "code",
        language: "yaml",
        code: `role: "client"                    # "client" or "server"

log:
  level: "none"                   # none, debug, info, warn, error, fatal

network:
  interface: "eth0"               # Network interface name
  guid: ""                        # Windows NPF GUID (Windows only)
  ipv4:
    addr: "192.168.1.100:0"       # IP:Port (port 0 = random ephemeral)
    router_mac: "aa:bb:cc:dd:ee:ff"
  ipv6:
    addr: "[2001:db8::1]:0"
    router_mac: "aa:bb:cc:dd:ee:ff"
  pcap:
    sockbuf: 4194304              # Ring buffer size (bytes)
  tcp:
    local_flag: ["PA"]            # TCP flags for outgoing packets
    remote_flag: ["PA"]           # TCP flags for incoming packets

listen:                           # Server only
  addr: "0.0.0.0:9999"            # Listen address

server:                           # Client only
  addr: "10.0.0.1:9999"           # Server address

socks5:                           # Client only
  - listen: "127.0.0.1:1080"
    username: ""                  # Optional auth
    password: ""

forward:                          # Client only
  - listen: "127.0.0.1:8080"
    target: "192.168.2.1:80"
    protocol: "tcp"               # "tcp" or "udp"

transport:
  protocol: "kcp"
  conn: 1                         # Parallel KCP connections (1-256)
  tcpbuf: 8192                    # Application TCP buffer (bytes)
  udpbuf: 4096                    # Application UDP buffer (bytes)
  kcp:
    mode: "fast"                  # normal, fast, fast2, fast3, manual
    nodelay: 0                    # Manual mode only
    interval: 30                  # Manual mode only (ms)
    resend: 2                     # Manual mode only
    nocongestion: 1               # Manual mode only
    wdelay: true                  # Manual mode only
    acknodelay: false             # Manual mode only
    mtu: 1350                     # Max transmission unit (50-1500)
    rcvwnd: 512                   # Receive window (1-32768)
    sndwnd: 512                   # Send window (1-32768)
    dshard: 0                     # FEC data shards (0 = disabled)
    pshard: 0                     # FEC parity shards
    block: "aes"                  # Encryption algorithm
    key: "your-secret-key"        # Encryption key
    smuxbuf: 4194304              # SMUX receive buffer (bytes)
    streambuf: 2097152            # Per-stream buffer (bytes)`,
      },
    ],
  },
  {
    id: "network-layer",
    title: "Network Layer",
    content: [
      {
        type: "heading",
        level: 3,
        text: "Interface Selection (network.interface)",
      },
      {
        type: "code",
        language: "yaml",
        code: `network:
  interface: "eth0"        # Linux
  # interface: "en0"       # macOS
  # interface: "Ethernet"  # Windows (name only, GUID required)
  guid: "\\Device\\NPF_{...}" # Windows NPF GUID`,
      },
      {
        type: "heading",
        level: 4,
        text: "Platform Notes:",
      },
      {
        type: "list",
        items: [
          "**Linux**: Use interface name (eth0, ens33, enp3s0)",
          "**macOS**: Use interface name (en0, en1)",
          "**Windows**: Must provide NPF GUID from paqet iface command",
        ],
      },
      {
        type: "heading",
        level: 4,
        text: "Finding Interface:",
      },
      {
        type: "code",
        language: "bash",
        code: `# Linux/macOS
ip link show                    # or: ifconfig

# Windows
paqet iface                     # Lists interfaces with GUIDs`,
      },
    ],
  },
  {
    id: "kcp-protocol",
    title: "KCP Protocol",
    content: [
      {
        type: "paragraph",
        text: "KCP is a fast and reliable ARQ protocol implemented over UDP.",
      },
      {
        type: "heading",
        level: 3,
        text: "Mode Presets (transport.kcp.mode)",
      },
      {
        type: "code",
        language: "yaml",
        code: `kcp:
  mode: "fast"    # normal, fast, fast2, fast3, manual`,
      },
      {
        type: "heading",
        level: 4,
        text: "Preset Values",
      },
      {
        type: "table",
        headers: ["Mode", "nodelay", "interval", "resend", "nocongestion", "Use Case"],
        rows: [
          ["normal", "0", "40ms", "2", "1", "TCP-like, conservative"],
          ["fast", "0", "30ms", "2", "1", "Balanced (default)"],
          ["fast2", "1", "20ms", "2", "1", "Low latency"],
          ["fast3", "1", "10ms", "2", "1", "Minimal latency"],
          ["manual", "custom", "custom", "custom", "custom", "Full control"],
        ],
      },
    ],
  },
  {
    id: "buffers-memory",
    title: "Buffers & Memory",
    content: [
      {
        type: "heading",
        level: 3,
        text: "Transport Buffers",
      },
      {
        type: "code",
        language: "yaml",
        code: `transport:
  tcpbuf: 8192    # Min: 4096 bytes
  udpbuf: 4096    # Min: 2048 bytes`,
      },
      {
        type: "paragraph",
        text: "Application-layer buffers between proxy and transport.",
      },
      {
        type: "heading",
        level: 3,
        text: "SMUX Buffers",
      },
      {
        type: "code",
        language: "yaml",
        code: `kcp:
  smuxbuf: 4194304      # 4MB default
  streambuf: 2097152    # 2MB default`,
      },
    ],
  },
  {
    id: "encryption",
    title: "Encryption",
    content: [
      {
        type: "heading",
        level: 3,
        text: "Algorithms (transport.kcp.block)",
      },
      {
        type: "code",
        language: "yaml",
        code: `kcp:
  block: "aes"        # Encryption algorithm
  key: "your-key"     # Any length (derived via PBKDF2)`,
      },
      {
        type: "heading",
        level: 4,
        text: "Available Algorithms",
      },
      {
        type: "table",
        headers: ["Algorithm", "Key Size", "Speed", "Notes"],
        rows: [
          ["null", "-", "Fastest", "No encryption, no authentication"],
          ["none", "-", "Fastest", "No encryption, has authentication"],
          ["xor", "32", "Very fast", "Weak, use only for testing"],
          ["aes-128-gcm", "16", "Fast", "Recommended - AEAD"],
          ["aes-128", "16", "Fast", "Hardware accelerated"],
          ["aes / aes-256", "32", "Medium", "Full 256-bit key"],
          ["salsa20", "32", "Fast", "Stream cipher"],
          ["sm4", "16", "Fast", "Chinese standard"],
        ],
      },
    ],
  },
  {
    id: "connection-multiplexing",
    title: "Connection Multiplexing",
    content: [
      {
        type: "heading",
        level: 3,
        text: "Multiple Connections (transport.conn)",
      },
      {
        type: "code",
        language: "yaml",
        code: `transport:
  conn: 1    # 1-256 parallel KCP connections`,
      },
      {
        type: "heading",
        level: 4,
        text: "Benefits:",
      },
      {
        type: "list",
        items: [
          "Better bandwidth utilization",
          "Reduced head-of-line blocking",
          "Load balancing across connections",
        ],
      },
      {
        type: "heading",
        level: 4,
        text: "Guidelines",
      },
      {
        type: "table",
        headers: ["Bandwidth", "Recommended conn"],
        rows: [
          ["<10 Mbps", "1"],
          ["10-50 Mbps", "2-4"],
          ["50-100 Mbps", "4-8"],
          ["100-500 Mbps", "8-16"],
          ["500+ Mbps", "16-32"],
        ],
      },
    ],
  },
  {
    id: "os-tuning",
    title: "OS Tuning",
    content: [
      {
        type: "heading",
        level: 3,
        text: "Linux Kernel Parameters",
      },
      {
        type: "paragraph",
        text: "Critical: You must set both the default and max values. Applications use the default buffer size unless they explicitly request larger buffers.",
      },
      {
        type: "code",
        language: "bash",
        code: `# Socket buffer limits (max values)
sysctl -w net.core.rmem_max=268435456
sysctl -w net.core.wmem_max=268435456

# Socket buffer defaults (IMPORTANT: applications use these!)
sysctl -w net.core.rmem_default=16777216
sysctl -w net.core.wmem_default=16777216

# TCP buffer sizes: min default max
sysctl -w net.ipv4.tcp_rmem="4096 8388608 268435456"
sysctl -w net.ipv4.tcp_wmem="4096 8388608 268435456"

# UDP buffers (critical for KCP)
sysctl -w net.core.netdev_max_backlog=65536`,
      },
    ],
  },
  {
    id: "firewall-setup",
    title: "Firewall Setup",
    content: [
      {
        type: "heading",
        level: 3,
        text: "Required iptables Rules (Server)",
      },
      {
        type: "paragraph",
        text: "Critical: These rules are mandatory for proper operation.",
      },
      {
        type: "code",
        language: "bash",
        code: `#!/bin/bash
PORT=9999

# Bypass connection tracking
iptables -t raw -A PREROUTING -p tcp --dport $PORT -j NOTRACK
iptables -t raw -A OUTPUT -p tcp --sport $PORT -j NOTRACK

# Drop kernel RST packets
iptables -t mangle -A OUTPUT -p tcp --sport $PORT --tcp-flags RST RST -j DROP`,
      },
    ],
  },
  {
    id: "monitoring-debugging",
    title: "Monitoring & Debugging",
    content: [
      {
        type: "heading",
        level: 3,
        text: "Log Levels (log.level)",
      },
      {
        type: "code",
        language: "yaml",
        code: `log:
  level: "none"    # none, debug, info, warn, error, fatal`,
      },
      {
        type: "table",
        headers: ["Level", "Value", "Use Case"],
        rows: [
          ["none", "-1", "Production, best performance"],
          ["debug", "0", "Troubleshooting, verbose"],
          ["info", "1", "Normal operation"],
          ["warn", "2", "Warnings only"],
          ["error", "3", "Errors only"],
          ["fatal", "4", "Fatal errors only"],
        ],
      },
      {
        type: "heading",
        level: 3,
        text: "Diagnostic Commands",
      },
      {
        type: "code",
        language: "bash",
        code: `# Test connectivity
sudo ./paqet ping -c client.yaml

# Packet capture
sudo ./paqet dump -p 9999

# List interfaces
./paqet iface

# Generate key
./paqet secret`,
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    content: [
      {
        type: "heading",
        level: 3,
        text: '"Message too long" Error',
      },
      {
        type: "paragraph",
        text: "Cause: KCP MTU exceeds the path MTU between client and server.",
      },
      {
        type: "code",
        language: "bash",
        code: `# Find your path MTU
ping -M do -s 1472 <server_ip>   # Test 1500 byte path
ping -M do -s 1372 <server_ip>   # Test 1400 byte path`,
      },
      {
        type: "heading",
        level: 3,
        text: 'Connection Timeout / Slow Ramp-up',
      },
      {
        type: "paragraph",
        text: "Cause: nocongestion: 0 enables TCP-like congestion control, which can cause slow connection establishment.",
      },
      {
        type: "paragraph",
        text: "Solution: Use nocongestion: 1 (default) for variable bandwidth environments.",
      },
    ],
  },
  {
    id: "scenario-configurations",
    title: "Scenario Configurations",
    content: [
      {
        type: "paragraph",
        text: "Pre-configured settings for common use cases. Click tabs below to view each configuration.",
      },
    ],
  },
  {
    id: "quick-diagnostic-checklist",
    title: "Quick Diagnostic Checklist",
    content: [
      {
        type: "heading",
        level: 3,
        text: "1. Check for Buffer Errors",
      },
      {
        type: "code",
        language: "bash",
        code: `journalctl -u paqet --since "1 hour ago" | grep -i "buffer"`,
      },
      {
        type: "heading",
        level: 3,
        text: "2. Verify Socket Buffer Sizes",
      },
      {
        type: "code",
        language: "bash",
        code: `ss -tnm | grep -A2 ":443"
# Should show: rb8388608 or larger`,
      },
      {
        type: "heading",
        level: 3,
        text: "Common Issues Summary",
      },
      {
        type: "table",
        headers: ["Symptom", "Likely Cause", "Solution"],
        rows: [
          ['"No buffer space available"', "OS socket buffers too small", "Apply OS tuning, restart services"],
          ["60%+ overhead", "Buffer overflow", "Apply OS tuning with 8MB default"],
          ["Config values not applying", "Wrong YAML keys", "Fix key names"],
          ['"Message too long"', "MTU too large", "Reduce MTU to match path MTU"],
          ["Slow connection ramp-up", "nocongestion: 0", "Use default or mode presets"],
        ],
      },
    ],
  },
];

export const scenarioConfigs = {
  gaming: {
    name: "Gaming (Low Latency)",
    code: `role: "client"
log:
  level: "none"

network:
  interface: "eth0"
  ipv4:
    addr: "192.168.1.100:0"
    router_mac: "aa:bb:cc:dd:ee:ff"
  pcap:
    sockbuf: 4194304

server:
  addr: "10.0.0.1:9999"

transport:
  protocol: "kcp"
  conn: 1
  kcp:
    mode: "fast3"
    mtu: 512
    rcvwnd: 128
    sndwnd: 128
    block: "aes-128-gcm"
    key: "your-key"
    smuxbuf: 1048576
    streambuf: 524288`,
  },
  bulk: {
    name: "Bulk Transfer (High Throughput)",
    code: `role: "client"
log:
  level: "error"

network:
  interface: "eth0"
  ipv4:
    addr: "192.168.1.100:0"
    router_mac: "aa:bb:cc:dd:ee:ff"
  pcap:
    sockbuf: 16777216

server:
  addr: "10.0.0.1:9999"

transport:
  protocol: "kcp"
  conn: 8
  tcpbuf: 32768
  kcp:
    mode: "manual"
    nodelay: 0
    interval: 40
    resend: 2
    nocongestion: 1
    wdelay: true
    acknodelay: false
    mtu: 1472
    rcvwnd: 4096
    sndwnd: 4096
    block: "aes-128"
    key: "your-key"
    smuxbuf: 16777216
    streambuf: 8388608`,
  },
  mobile: {
    name: "Mobile/Lossy Network",
    code: `role: "client"
log:
  level: "warn"

network:
  interface: "wlan0"
  ipv4:
    addr: "192.168.1.100:0"
    router_mac: "aa:bb:cc:dd:ee:ff"
  pcap:
    sockbuf: 8388608

server:
  addr: "10.0.0.1:9999"

transport:
  protocol: "kcp"
  conn: 2
  kcp:
    mode: "manual"
    nodelay: 1
    interval: 20
    resend: 1
    nocongestion: 1
    wdelay: false
    acknodelay: true
    mtu: 1250
    rcvwnd: 512
    sndwnd: 512
    dshard: 10
    pshard: 3
    block: "aes-128-gcm"
    key: "your-key"`,
  },
  satellite: {
    name: "Satellite (High Latency)",
    code: `role: "client"
log:
  level: "error"

network:
  interface: "eth0"
  ipv4:
    addr: "192.168.1.100:0"
    router_mac: "aa:bb:cc:dd:ee:ff"
  pcap:
    sockbuf: 33554432

server:
  addr: "10.0.0.1:9999"

transport:
  protocol: "kcp"
  conn: 1
  kcp:
    mode: "manual"
    nodelay: 0
    interval: 100
    resend: 2
    nocongestion: 1
    wdelay: true
    acknodelay: false
    mtu: 1350
    rcvwnd: 8192
    sndwnd: 8192
    block: "aes-128"
    key: "your-key"
    smuxbuf: 33554432
    streambuf: 16777216`,
  },
  datacenter: {
    name: "Datacenter (Maximum Performance)",
    code: `role: "client"
log:
  level: "none"

network:
  interface: "eth0"
  ipv4:
    addr: "10.0.0.50:0"
    router_mac: "aa:bb:cc:dd:ee:ff"
  pcap:
    sockbuf: 67108864

server:
  addr: "10.0.0.1:9999"

transport:
  protocol: "kcp"
  conn: 16
  tcpbuf: 65536
  udpbuf: 16384
  kcp:
    mode: "manual"
    nodelay: 1
    interval: 10
    resend: 2
    nocongestion: 1
    wdelay: false
    acknodelay: true
    mtu: 1472
    rcvwnd: 8192
    sndwnd: 8192
    block: "null"
    key: ""
    smuxbuf: 67108864
    streambuf: 33554432`,
  },
  vpn: {
    name: "VPN Service (Traffic-Constrained)",
    code: `# Client (Entry Server)
role: "client"
log:
  level: "warn"
forward:
  - listen: "0.0.0.0:443"
    target: "127.0.0.1:443"
    protocol: "tcp"
network:
  interface: "eth0"
  ipv4:
    addr: "192.168.1.100:0"
    router_mac: "aa:bb:cc:dd:ee:ff"
  pcap:
    sockbuf: 4194304
server:
  addr: "10.0.0.1:8888"
transport:
  protocol: "kcp"
  conn: 1
  tcpbuf: 16384
  kcp:
    mode: "normal"
    key: "your-secret-key"
    mtu: 1280
    sndwnd: 1024
    rcvwnd: 1024
    block: "aes-128-gcm"
    smuxbuf: 4194304
    streambuf: 2097152`,
  },
};
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

Run: `git add src/content/optimization-guide.ts && git commit -m "feat: add optimization guide content data"`

---

## Task 5: Create CodeBlock Component

**Files:**
- Create: `src/components/CodeBlock.tsx`

**Step 1: Create CodeBlock component**

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-bash";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "yaml" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current) {
      Prism.highlightElement(preRef.current);
    }
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border bg-surface">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/50">
        <span className="text-xs font-mono text-text-muted uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs text-text-muted hover:text-primary transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre ref={preRef} className="!bg-surface !m-0 overflow-x-auto max-h-[500px]">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
```

**Step 2: Verify component compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

Run: `git add src/components/CodeBlock.tsx && git commit -m "feat: add CodeBlock component with copy functionality"`

---

## Task 6: Create ConfigTable Component

**Files:**
- Create: `src/components/ConfigTable.tsx`

**Step 1: Create ConfigTable component**

```typescript
interface ConfigTableProps {
  headers: string[];
  rows: string[][];
}

export function ConfigTable({ headers, rows }: ConfigTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full">
        <thead>
          <tr className="bg-surface border-b border-border">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-sm font-semibold text-text-muted"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3 text-sm text-text"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Step 2: Commit**

Run: `git add src/components/ConfigTable.tsx && git commit -m "feat: add ConfigTable component"`

---

## Task 7: Create Tabs Component

**Files:**
- Create: `src/components/Tabs.tsx`

**Step 1: Create Tabs component**

```typescript
"use client";

import { useState } from "react";
import { CodeBlock } from "./CodeBlock";
import { scenarioConfigs } from "@/content/optimization-guide";

export function ScenarioTabs() {
  const [activeTab, setActiveTab] = useState<keyof typeof scenarioConfigs>("gaming");

  const tabs = Object.entries(scenarioConfigs) as [keyof typeof scenarioConfigs, { name: string; code: string }][];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map(([key, config]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === key
                ? "bg-primary text-background"
                : "bg-surface text-text-muted hover:text-text hover:bg-surface/80"
            }`}
          >
            {config.name}
          </button>
        ))}
      </div>
      <CodeBlock code={scenarioConfigs[activeTab].code} language="yaml" />
    </div>
  );
}
```

**Step 2: Commit**

Run: `git add src/components/Tabs.tsx && git commit -m "feat: add ScenarioTabs component"`

---

## Task 8: Create Sidebar Component

**Files:**
- Create: `src/components/Sidebar.tsx`

**Step 1: Create Sidebar component**

```typescript
"use client";

import { useEffect, useState } from "react";
import { sections } from "@/content/optimization-guide";
import { Menu, X } from "lucide-react";

export function Sidebar() {
  const [activeSection, setActiveSection] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-surface border border-border rounded-lg"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-background border-r border-border overflow-y-auto transition-transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-4">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
            Documentation
          </h2>
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeSection === section.id
                      ? "bg-primary/10 text-primary"
                      : "text-text-muted hover:text-text hover:bg-surface"
                  }`}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
```

**Step 2: Commit**

Run: `git add src/components/Sidebar.tsx && git commit -m "feat: add Sidebar component with active section tracking"`

---

## Task 9: Create Section Component

**Files:**
- Create: `src/components/Section.tsx`

**Step 1: Create Section component**

```typescript
import { ContentBlock } from "@/content/optimization-guide";
import { CodeBlock } from "./CodeBlock";
import { ConfigTable } from "./ConfigTable";
import { ScenarioTabs } from "./Tabs";

interface SectionProps {
  id: string;
  title: string;
  content: ContentBlock[];
}

function renderContent(block: ContentBlock, index: number) {
  switch (block.type) {
    case "heading":
      const HeadingTag = `h${block.level || 3}` as keyof JSX.IntrinsicElements;
      const headingClasses = {
        3: "text-xl font-semibold text-text mt-8 mb-4",
        4: "text-lg font-medium text-text mt-6 mb-3",
      };
      return (
        <HeadingTag
          key={index}
          className={headingClasses[block.level as 3 | 4] || headingClasses[3]}
        >
          {block.text}
        </HeadingTag>
      );

    case "paragraph":
      return (
        <p
          key={index}
          className="text-text-muted leading-relaxed mb-4"
          dangerouslySetInnerHTML={{
            __html: block.text?.replace(
              /\*\*(.*?)\*\*/g,
              '<strong class="text-text">$1</strong>'
            ) || "",
          }}
        />
      );

    case "code":
      return (
        <div key={index} className="my-4">
          <CodeBlock code={block.code || ""} language={block.language} />
        </div>
      );

    case "table":
      return (
        <div key={index} className="my-4">
          <ConfigTable headers={block.headers || []} rows={block.rows || []} />
        </div>
      );

    case "list":
      return (
        <ul key={index} className="list-disc list-inside space-y-2 mb-4 text-text-muted">
          {block.items?.map((item, i) => (
            <li
              key={i}
              dangerouslySetInnerHTML={{
                __html: item.replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong class="text-text">$1</strong>'
                ),
              }}
            />
          ))}
        </ul>
      );

    case "diagram":
      return (
        <div key={index} className="my-6 p-4 bg-surface rounded-lg border border-border overflow-x-auto">
          <pre className="text-sm font-mono text-primary whitespace-pre">{block.text}</pre>
        </div>
      );

    default:
      return null;
  }
}

export function Section({ id, title, content }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-2xl font-bold text-text mb-6 pb-2 border-b border-border">
        {title}
      </h2>
      {id === "scenario-configurations" ? (
        <ScenarioTabs />
      ) : (
        content.map((block, index) => renderContent(block, index))
      )}
    </section>
  );
}
```

**Step 2: Commit**

Run: `git add src/components/Section.tsx && git commit -m "feat: add Section component with content rendering"`

---

## Task 10: Create Navbar Component

**Files:**
- Create: `src/components/Navbar.tsx`

**Step 1: Create Navbar component**

```typescript
"use client";

import { useState, useEffect } from "react";
import { Github, ArrowUp } from "lucide-react";

export function Navbar() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="#" className="text-xl font-bold gradient-text">
              PAQET
            </a>
            <div className="hidden md:flex items-center gap-6">
              <span className="text-sm text-text-muted">Documentation</span>
            </div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:text-text transition-colors"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">View on GitHub</span>
          </a>
        </div>
      </nav>

      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 p-3 bg-primary text-background rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
```

**Step 2: Commit**

Run: `git add src/components/Navbar.tsx && git commit -m "feat: add Navbar component with back-to-top button"`

---

## Task 11: Create Hero Component

**Files:**
- Create: `src/components/Hero.tsx`

**Step 1: Create Hero component**

```typescript
"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative pt-32 pb-16 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50" />
      
      <div className="relative max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          <span className="gradient-text">PAQET</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl md:text-2xl text-text-muted mb-4"
        >
          Packet-Level Proxy with KCP Protocol
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-text-muted max-w-2xl mx-auto"
        >
          Bypass the OS TCP/IP stack with raw sockets and libpcap. 
          Optimized for gaming, VPN services, and high-performance networking.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 p-4 bg-surface rounded-lg border border-border max-w-3xl mx-auto overflow-x-auto"
        >
          <pre className="text-sm font-mono text-primary whitespace-pre">{`┌─────────────────────────────────────────────────────────────┐
│  CLIENT                              SERVER                 │
│  ───────                              ───────               │
│                                                             │
│  Application ──► SOCKS5/Forward ──► SMUX ──► KCP ──► pcap  │
│                                                             │
│              Raw TCP Packets (crafted)                      │
│           ◄────────────────────────────────────────────►    │
│                                                             │
│  pcap ◄── KCP ◄── SMUX ◄── SOCKS5/Forward ◄── Application  │
└─────────────────────────────────────────────────────────────┘`}</pre>
        </motion.div>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

Run: `git add src/components/Hero.tsx && git commit -m "feat: add Hero component with animated architecture diagram"`

---

## Task 12: Create Footer Component

**Files:**
- Create: `src/components/Footer.tsx`

**Step 1: Create Footer component**

```typescript
export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50 py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-text-muted">
          <span className="gradient-text font-semibold">PAQET</span> Documentation
        </div>
        <div className="text-sm text-text-muted">
          Optimized for performance, security, and reliability.
        </div>
      </div>
    </footer>
  );
}
```

**Step 2: Commit**

Run: `git add src/components/Footer.tsx && git commit -m "feat: add Footer component"`

---

## Task 13: Create Main Layout

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Update layout**

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PAQET - Packet-Level Proxy Documentation",
  description: "Optimization guide for PAQET, a packet-level proxy with KCP protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
```

**Step 2: Commit**

Run: `git add src/app/layout.tsx && git commit -m "feat: update root layout with metadata and fonts"`

---

## Task 14: Create Main Page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Create main page**

```typescript
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Sidebar } from "@/components/Sidebar";
import { Section } from "@/components/Section";
import { Footer } from "@/components/Footer";
import { sections } from "@/content/optimization-guide";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:ml-64 px-4 lg:px-8 py-8 max-w-4xl">
          {sections.map((section) => (
            <Section
              key={section.id}
              id={section.id}
              title={section.title}
              content={section.content}
            />
          ))}
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
```

**Step 2: Commit**

Run: `git add src/app/page.tsx && git commit -m "feat: create main page with all components"`

---

## Task 15: Add Prism.js Dark Theme

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add Prism theme styles**

Append to `src/app/globals.css`:

```css
/* Prism.js Dark Theme */
.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #71717a;
}

.token.punctuation {
  color: #e4e4e7;
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
  color: #f472b6;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #a5f3fc;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: #00d9ff;
}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: #c084fc;
}

.token.function,
.token.class-name {
  color: #fbbf24;
}

.token.regex,
.token.important,
.token.variable {
  color: #fb923c;
}
```

**Step 2: Commit**

Run: `git add src/app/globals.css && git commit -m "style: add custom Prism.js dark theme"`

---

## Task 16: Build and Test

**Step 1: Run build**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 2: Run dev server and manually test**

Run: `npm run dev`
Test: Open http://localhost:3000
- Verify navbar is fixed and visible
- Verify sidebar shows all sections
- Verify clicking sidebar items scrolls to sections
- Verify code blocks have copy functionality
- Verify scenario tabs switch between configs
- Verify back-to-top button appears after scrolling
- Verify responsive layout on mobile (sidebar drawer)

**Step 3: Final commit**

Run: `git add . && git commit -m "feat: complete PAQET documentation hub landing page"`

---

## Summary

This plan creates a complete Next.js 14 documentation hub with:
- Modern dark theme with glassmorphism effects
- Sticky sidebar with active section tracking
- Syntax-highlighted code blocks with copy functionality
- Interactive scenario configuration tabs
- Smooth scroll animations
- Responsive design for all screen sizes
- 13 documentation sections from the optimization guide

Total estimated time: 2-3 hours for full implementation.
