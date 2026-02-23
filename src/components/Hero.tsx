"use client";

export function Hero() {
  return (
    <section className="relative pt-32 pb-16 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50" />
      
      <div className="relative max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
          <span className="gradient-text">PAQET</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-text-muted mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Packet-Level Proxy with KCP Protocol
        </p>
        
        <p className="text-text-muted max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Bypass the OS TCP/IP stack with raw sockets and libpcap. 
          Optimized for gaming, VPN services, and high-performance networking.
        </p>

        <div className="mt-8 p-4 bg-surface rounded-lg border border-border max-w-3xl mx-auto overflow-x-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
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
        </div>
      </div>
    </section>
  );
}
