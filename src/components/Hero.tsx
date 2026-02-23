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
