export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'code' | 'table' | 'list' | 'diagram';
  level?: number;
  text?: string;
  code?: string;
  language?: string;
  headers?: string[];
  rows?: string[][];
  items?: string[];
}

export interface Section {
  id: string;
  title: string;
  content: ContentBlock[];
}

export interface ScenarioConfig {
  name: string;
  description: string;
  code?: string;
  clientCode?: string;
  serverCode?: string;
  notes?: string;
}

export const sections: Section[] = [
  {
    id: 'architecture-overview',
    title: 'Architecture Overview',
    content: [
      {
        type: 'paragraph',
        text: 'paqet is a packet-level proxy that bypasses the OS TCP/IP stack using raw sockets and libpcap.'
      },
      {
        type: 'diagram',
        text: `┌─────────────────────────────────────────────────────────────────┐
│  CLIENT                              SERVER                      │
│  ───────                              ───────                    │
│                                                                   │
│  Application ──► SOCKS5/Forward ──► SMUX ──► KCP ──► pcap      │
│                                                                   │
│                       Raw TCP Packets (crafted)                  │
│                    ◄────────────────────────────────────────►   │
│                                                                   │
│  pcap ◄── KCP ◄── SMUX ◄── SOCKS5/Forward ◄── Application      │
└─────────────────────────────────────────────────────────────────┘`
      },
      {
        type: 'heading',
        level: 3,
        text: 'Key Components'
      },
      {
        type: 'list',
        items: [
          'pcap: Captures/injects raw Ethernet frames via libpcap',
          'Packet Crafting: Builds TCP packets with forged headers',
          'KCP: Reliable UDP protocol with ARQ and congestion control',
          'SMUX: Multiplexes multiple streams over one KCP connection',
          'SOCKS5/Forward: Application-layer proxy interfaces'
        ]
      }
    ]
  },
  {
    id: 'configuration-reference',
    title: 'Configuration Reference',
    content: [
      {
        type: 'heading',
        level: 3,
        text: 'Complete Configuration Structure'
      },
      {
        type: 'code',
        language: 'yaml',
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
    streambuf: 2097152            # Per-stream buffer (bytes)`
      }
    ]
  },
  {
    id: 'network-layer',
    title: 'Network Layer',
    content: [
      {
        type: 'heading',
        level: 3,
        text: 'Interface Selection (network.interface)'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `network:
  interface: "eth0"        # Linux
  # interface: "en0"       # macOS
  # interface: "Ethernet"  # Windows (name only, GUID required)
  guid: "\\\\Device\\\\NPF_{...}" # Windows NPF GUID`
      },
      {
        type: 'heading',
        level: 4,
        text: 'Platform Notes'
      },
      {
        type: 'list',
        items: [
          'Linux: Use interface name (eth0, ens33, enp3s0)',
          'macOS: Use interface name (en0, en1)',
          'Windows: Must provide NPF GUID from paqet iface command'
        ]
      },
      {
        type: 'heading',
        level: 4,
        text: 'Finding Interface'
      },
      {
        type: 'code',
        language: 'bash',
        code: `# Linux/macOS
ip link show                    # or: ifconfig

# Windows
paqet iface                     # Lists interfaces with GUIDs`
      },
      {
        type: 'heading',
        level: 3,
        text: 'IP Address Configuration'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `ipv4:
  addr: "192.168.1.100:0"        # IP:Port
  router_mac: "aa:bb:cc:dd:ee:ff" # Gateway MAC`
      },
      {
        type: 'heading',
        level: 4,
        text: 'Router MAC Address'
      },
      {
        type: 'paragraph',
        text: 'Required for packet crafting. Packets are injected directly to the gateway.'
      },
      {
        type: 'code',
        language: 'bash',
        code: `# Linux
ip neigh show | grep $(ip route | grep default | awk '{print $3}')

# macOS
arp -a $(netstat -rn | grep default | head -1 | awk '{print $2}')

# Windows
arp -a <gateway_ip>`
      },
      {
        type: 'heading',
        level: 3,
        text: 'TCP Flags (network.tcp)'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `tcp:
  local_flag: ["PA"]    # Flags for client→server packets
  remote_flag: ["PA"]   # Flags for server→client packets`
      },
      {
        type: 'heading',
        level: 4,
        text: 'Available Flags'
      },
      {
        type: 'table',
        headers: ['Flag', 'Name', 'Description'],
        rows: [
          ['S', 'SYN', 'Connection setup'],
          ['A', 'ACK', 'Acknowledgment'],
          ['P', 'PSH', 'Push (deliver immediately)'],
          ['F', 'FIN', 'Connection finish'],
          ['R', 'RST', 'Connection reset'],
          ['U', 'URG', 'Urgent data'],
          ['E', 'ECE', 'ECN echo'],
          ['C', 'CWR', 'Congestion window reduced'],
          ['N', 'NS', 'ECN nonce']
        ]
      },
      {
        type: 'heading',
        level: 4,
        text: 'Common Combinations'
      },
      {
        type: 'list',
        items: [
          '["PA"] - Push+Ack (standard data, default)',
          '["A"] - Ack only (lower overhead)',
          '["SA"] - SYN+Ack (mimic handshake response)',
          '["PA", "A", "PA"] - Cycle through patterns (evasion)'
        ]
      },
      {
        type: 'heading',
        level: 3,
        text: 'PCAP Buffer (network.pcap.sockbuf)'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `pcap:
  sockbuf: 4194304    # 4MB (client default)
  # sockbuf: 8388608  # 8MB (server default)`
      },
      {
        type: 'heading',
        level: 4,
        text: 'Sizing Guide'
      },
      {
        type: 'table',
        headers: ['Throughput', 'Recommended Size'],
        rows: [
          ['<10 Mbps', '4 MB'],
          ['10-50 Mbps', '8 MB'],
          ['50-100 Mbps', '16 MB'],
          ['100+ Mbps', '32-64 MB']
        ]
      }
    ]
  },
  {
    id: 'kcp-protocol',
    title: 'KCP Protocol',
    content: [
      {
        type: 'paragraph',
        text: 'KCP is a fast and reliable ARQ protocol implemented over UDP.'
      },
      {
        type: 'heading',
        level: 3,
        text: 'Mode Presets (transport.kcp.mode)'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `kcp:
  mode: "fast"    # normal, fast, fast2, fast3, manual`
      },
      {
        type: 'heading',
        level: 4,
        text: 'Preset Values'
      },
      {
        type: 'table',
        headers: ['Mode', 'nodelay', 'interval', 'resend', 'nocongestion', 'wdelay', 'acknodelay', 'Use Case'],
        rows: [
          ['normal', '0', '40ms', '2', '1', 'true', 'false', 'TCP-like, conservative'],
          ['fast', '0', '30ms', '2', '1', 'true', 'false', 'Balanced (default)'],
          ['fast2', '1', '20ms', '2', '1', 'false', 'true', 'Low latency'],
          ['fast3', '1', '10ms', '2', '1', 'false', 'true', 'Minimal latency'],
          ['manual', 'custom', 'custom', 'custom', 'custom', 'custom', 'custom', 'Full control']
        ]
      },
      {
        type: 'paragraph',
        text: 'Important: When using mode presets (normal, fast, fast2, fast3), all manual mode parameters are ignored. Only use mode: "manual" when you need custom values.'
      },
      {
        type: 'heading',
        level: 3,
        text: 'Manual Mode Parameters'
      },
      {
        type: 'heading',
        level: 4,
        text: 'nodelay'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `nodelay: 1    # 0 or 1`
      },
      {
        type: 'list',
        items: [
          '0: Conservative, TCP-like retransmission behavior',
          '1: Aggressive, immediate retransmission on loss detection'
        ]
      },
      {
        type: 'heading',
        level: 4,
        text: 'interval'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `interval: 10    # 10-5000 milliseconds`
      },
      {
        type: 'paragraph',
        text: "KCP's internal update interval. Controls ACK generation and loss detection frequency. Rule of thumb: interval ≈ RTT / 2"
      },
      {
        type: 'heading',
        level: 4,
        text: 'resend'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `resend: 2    # 0, 1, or 2`
      },
      {
        type: 'list',
        items: [
          '0: Disable fast retransmit, wait for timeout',
          '1: Retransmit after 1 duplicate ACK (very aggressive)',
          '2: Retransmit after 2 duplicate ACKs (balanced)'
        ]
      },
      {
        type: 'heading',
        level: 4,
        text: 'nocongestion'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `nocongestion: 1    # 0 or 1`
      },
      {
        type: 'list',
        items: [
          '0: Enable congestion control (fair sharing, slower ramp-up)',
          '1: Disable congestion control (max throughput, may cause loss)'
        ]
      },
      {
        type: 'heading',
        level: 4,
        text: 'wdelay'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `wdelay: false    # true or false`
      },
      {
        type: 'list',
        items: [
          'false: Flush immediately when data available (lower latency, more syscalls)',
          'true: Batch writes until next interval tick (higher throughput, added latency)'
        ]
      },
      {
        type: 'heading',
        level: 4,
        text: 'acknodelay'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `acknodelay: true    # true or false`
      },
      {
        type: 'list',
        items: [
          'true: Send ACK immediately on receive (faster loss detection)',
          'false: Batch ACKs with data (bandwidth efficient)'
        ]
      },
      {
        type: 'heading',
        level: 3,
        text: 'MTU (transport.kcp.mtu)'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `mtu: 1350    # 50-1500 bytes`
      },
      {
        type: 'heading',
        level: 4,
        text: 'Common Values'
      },
      {
        type: 'table',
        headers: ['Value', 'Description'],
        rows: [
          ['1472', 'Maximum safe UDP over Ethernet (1500 - 20 IP - 8 UDP)'],
          ['1400', 'Safe for most internet paths'],
          ['1350', 'Default, accounts for encryption overhead'],
          ['1250', 'Conservative, works with VPN overhead'],
          ['512', 'Maximum compatibility, gaming']
        ]
      },
      {
        type: 'heading',
        level: 3,
        text: 'Window Sizes (rcvwnd, sndwnd)'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `rcvwnd: 512    # 1-32768
sndwnd: 512    # 1-32768`
      },
      {
        type: 'heading',
        level: 4,
        text: 'Bandwidth-Delay Product'
      },
      {
        type: 'table',
        headers: ['Bandwidth', 'RTT', 'Min Window'],
        rows: [
          ['10 Mbps', '50ms', '~47'],
          ['100 Mbps', '50ms', '~463'],
          ['1 Gbps', '10ms', '~926']
        ]
      },
      {
        type: 'heading',
        level: 3,
        text: 'Forward Error Correction (dshard, pshard)'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `dshard: 0    # Data shards (0 = disabled, default)
pshard: 0    # Parity shards`
      },
      {
        type: 'paragraph',
        text: 'When enabled, uses Reed-Solomon erasure coding. FEC is disabled by default.'
      },
      {
        type: 'heading',
        level: 4,
        text: 'When to use'
      },
      {
        type: 'list',
        items: [
          'Lossy networks (>5% packet loss)',
          'High-latency links where retransmission is expensive',
          'Real-time applications (gaming, VoIP)'
        ]
      }
    ]
  },
  {
    id: 'buffers-memory',
    title: 'Buffers & Memory',
    content: [
      {
        type: 'heading',
        level: 3,
        text: 'Transport Buffers'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `transport:
  tcpbuf: 8192    # Min: 4096 bytes
  udpbuf: 4096    # Min: 2048 bytes`
      },
      {
        type: 'heading',
        level: 3,
        text: 'SMUX Buffers'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `kcp:
  smuxbuf: 4194304      # 4MB default
  streambuf: 2097152    # 2MB default`
      },
      {
        type: 'paragraph',
        text: 'smuxbuf: Total buffer for all streams in a session. Minimum: 1024 bytes. streambuf: Per-stream buffer. Minimum: 1024 bytes.'
      },
      {
        type: 'heading',
        level: 3,
        text: 'Memory Calculation'
      },
      {
        type: 'paragraph',
        text: 'Per connection (approximate): Total = pcap_sockbuf + smuxbuf + (streambuf × concurrent_streams)'
      },
      {
        type: 'code',
        language: 'text',
        code: `Example server (100 connections, 10 streams each):
PCAP: 8MB
SMUX: 4MB × 100 = 400MB
Streams: 2MB × 10 × 100 = 2GB
Total: ~2.4GB`
      }
    ]
  },
  {
    id: 'encryption',
    title: 'Encryption',
    content: [
      {
        type: 'heading',
        level: 3,
        text: 'Algorithms (transport.kcp.block)'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `kcp:
  block: "aes"        # Encryption algorithm
  key: "your-key"     # Any length (derived via PBKDF2)`
      },
      {
        type: 'heading',
        level: 4,
        text: 'Available Algorithms'
      },
      {
        type: 'table',
        headers: ['Algorithm', 'Key Size', 'Speed', 'Notes'],
        rows: [
          ['null', '-', 'Fastest', 'No encryption, no authentication'],
          ['none', '-', 'Fastest', 'No encryption, has authentication'],
          ['xor', '32', 'Very fast', 'Weak, use only for testing'],
          ['aes-128-gcm', '16', 'Fast', 'Recommended - AEAD'],
          ['aes-128', '16', 'Fast', 'Hardware accelerated'],
          ['aes / aes-256', '32', 'Medium', 'Full 256-bit key'],
          ['aes-192', '24', 'Medium', '-'],
          ['salsa20', '32', 'Fast', 'Stream cipher'],
          ['sm4', '16', 'Fast', 'Chinese standard'],
          ['blowfish', '32', 'Medium', 'Legacy'],
          ['twofish', '32', 'Medium', 'AES alternative'],
          ['cast5', '16', 'Medium', 'Legacy'],
          ['3des', '24', 'Slow', 'Avoid'],
          ['tea', '16', 'Fast', 'Weak'],
          ['xtea', '16', 'Fast', 'Improved TEA']
        ]
      },
      {
        type: 'heading',
        level: 3,
        text: 'Key Derivation'
      },
      {
        type: 'paragraph',
        text: 'Keys are derived using PBKDF2 with salt "paqet" and 100,000 iterations. Recommendation: Use aes-128-gcm for best security/performance balance.'
      },
      {
        type: 'heading',
        level: 3,
        text: 'Key Generation'
      },
      {
        type: 'code',
        language: 'bash',
        code: `./paqet secret`
      }
    ]
  },
  {
    id: 'connection-multiplexing',
    title: 'Connection Multiplexing',
    content: [
      {
        type: 'heading',
        level: 3,
        text: 'Multiple Connections (transport.conn)'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `transport:
  conn: 1    # 1-256 parallel KCP connections`
      },
      {
        type: 'heading',
        level: 4,
        text: 'Benefits'
      },
      {
        type: 'list',
        items: [
          'Better bandwidth utilization',
          'Reduced head-of-line blocking',
          'Load balancing across connections'
        ]
      },
      {
        type: 'heading',
        level: 4,
        text: 'Guidelines'
      },
      {
        type: 'table',
        headers: ['Bandwidth', 'Recommended conn'],
        rows: [
          ['<10 Mbps', '1'],
          ['10-50 Mbps', '2-4'],
          ['50-100 Mbps', '4-8'],
          ['100-500 Mbps', '8-16'],
          ['500+ Mbps', '16-32']
        ]
      }
    ]
  },
  {
    id: 'os-tuning',
    title: 'OS Tuning',
    content: [
      {
        type: 'heading',
        level: 3,
        text: 'Linux Kernel Parameters'
      },
      {
        type: 'paragraph',
        text: 'Critical: You must set both the default and max values. Applications use the default buffer size unless they explicitly request larger buffers.'
      },
      {
        type: 'code',
        language: 'bash',
        code: `# Socket buffer limits (max values)
sysctl -w net.core.rmem_max=268435456
sysctl -w net.core.wmem_max=268435456

# Socket buffer defaults (IMPORTANT: applications use these!)
sysctl -w net.core.rmem_default=16777216
sysctl -w net.core.wmem_default=16777216

# TCP buffer sizes: min default max
# The middle value is the DEFAULT - must be large enough!
sysctl -w net.ipv4.tcp_rmem="4096 8388608 268435456"
sysctl -w net.ipv4.tcp_wmem="4096 8388608 268435456"

# UDP buffers (critical for KCP)
sysctl -w net.core.netdev_max_backlog=65536

# Connection tracking (if using iptables)
sysctl -w net.netfilter.nf_conntrack_max=1000000`
      },
      {
        type: 'heading',
        level: 4,
        text: 'Make persistent across reboots'
      },
      {
        type: 'code',
        language: 'bash',
        code: `cat >> /etc/sysctl.conf << 'EOF'
net.core.rmem_max=268435456
net.core.wmem_max=268435456
net.core.rmem_default=16777216
net.core.wmem_default=16777216
net.ipv4.tcp_rmem=4096 8388608 268435456
net.ipv4.tcp_wmem=4096 8388608 268435456
net.core.netdev_max_backlog=65536
EOF

sysctl -p`
      },
      {
        type: 'heading',
        level: 3,
        text: 'NIC Optimization'
      },
      {
        type: 'code',
        language: 'bash',
        code: `# Enable offloading
ethtool -K eth0 tso on gso on gro on

# Ring buffers
ethtool -G eth0 rx 4096 tx 4096`
      },
      {
        type: 'heading',
        level: 3,
        text: 'File Descriptors'
      },
      {
        type: 'code',
        language: 'bash',
        code: `ulimit -n 65535`
      },
      {
        type: 'heading',
        level: 3,
        text: 'CPU Affinity'
      },
      {
        type: 'code',
        language: 'bash',
        code: `# Pin to specific cores
sudo taskset -c 0,1 ./paqet run -c config.yaml

# NUMA binding
sudo numactl --cpunodebind=0 --membind=0 ./paqet run -c config.yaml`
      }
    ]
  },
  {
    id: 'firewall-setup',
    title: 'Firewall Setup',
    content: [
      {
        type: 'heading',
        level: 3,
        text: 'Required iptables Rules (Server)'
      },
      {
        type: 'paragraph',
        text: 'Critical: These rules are mandatory for proper operation.'
      },
      {
        type: 'code',
        language: 'bash',
        code: `#!/bin/bash
PORT=9999

# Bypass connection tracking
iptables -t raw -A PREROUTING -p tcp --dport $PORT -j NOTRACK
iptables -t raw -A OUTPUT -p tcp --sport $PORT -j NOTRACK

# Drop kernel RST packets (kernel sends RST for packets it doesn't recognize)
iptables -t mangle -A OUTPUT -p tcp --sport $PORT --tcp-flags RST RST -j DROP`
      },
      {
        type: 'heading',
        level: 4,
        text: 'Why needed'
      },
      {
        type: 'list',
        items: [
          'NOTRACK: Prevents conntrack from interfering with raw packets',
          'DROP RST: Kernel sends RST for TCP packets it didn\'t initiate; without this, connections die'
        ]
      },
      {
        type: 'heading',
        level: 3,
        text: 'nftables Alternative'
      },
      {
        type: 'code',
        language: 'bash',
        code: `#!/usr/sbin/nft -f

table inet paqet {
    chain prerouting {
        type filter hook prerouting priority raw; policy accept;
        tcp dport 9999 notrack
    }
    chain output {
        type filter hook output priority mangle; policy accept;
        tcp sport 9999 tcp flags rst drop
    }
}`
      }
    ]
  },
  {
    id: 'monitoring-debugging',
    title: 'Monitoring & Debugging',
    content: [
      {
        type: 'heading',
        level: 3,
        text: 'Log Levels (log.level)'
      },
      {
        type: 'code',
        language: 'yaml',
        code: `log:
  level: "none"    # none, debug, info, warn, error, fatal`
      },
      {
        type: 'table',
        headers: ['Level', 'Value', 'Use Case'],
        rows: [
          ['none', '-1', 'Production, best performance'],
          ['debug', '0', 'Troubleshooting, verbose'],
          ['info', '1', 'Normal operation'],
          ['warn', '2', 'Warnings only'],
          ['error', '3', 'Errors only'],
          ['fatal', '4', 'Fatal errors only']
        ]
      },
      {
        type: 'paragraph',
        text: 'Performance Impact: Debug logging can reduce throughput 10-20%. Use none in production.'
      },
      {
        type: 'heading',
        level: 3,
        text: 'Diagnostic Commands'
      },
      {
        type: 'heading',
        level: 4,
        text: 'ping - Test Connectivity'
      },
      {
        type: 'code',
        language: 'bash',
        code: `sudo ./paqet ping -c client.yaml`
      },
      {
        type: 'paragraph',
        text: 'Tests: Network reachability, KCP handshake, encryption/decryption, round-trip time.'
      },
      {
        type: 'heading',
        level: 4,
        text: 'dump - Packet Capture'
      },
      {
        type: 'code',
        language: 'bash',
        code: `sudo ./paqet dump -p 9999           # Capture on port
sudo ./paqet dump -i eth0 -p 9999   # Specific interface
sudo ./paqet dump -p 9999 -v        # Verbose`
      },
      {
        type: 'heading',
        level: 4,
        text: 'iface - List Interfaces'
      },
      {
        type: 'code',
        language: 'bash',
        code: `./paqet iface    # Lists interfaces with GUIDs (Windows)`
      },
      {
        type: 'heading',
        level: 4,
        text: 'secret - Generate Key'
      },
      {
        type: 'code',
        language: 'bash',
        code: `./paqet secret    # Generates secure random key`
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    content: [
      {
        type: 'heading',
        level: 3,
        text: '"Message too long" Error'
      },
      {
        type: 'paragraph',
        text: 'Cause: KCP MTU exceeds the path MTU between client and server.'
      },
      {
        type: 'code',
        language: 'bash',
        code: `# Test different sizes until one works
ping -M do -s 1472 <server_ip>   # Test 1500 byte path
ping -M do -s 1372 <server_ip>   # Test 1400 byte path`
      },
      {
        type: 'paragraph',
        text: 'Solution: Set KCP MTU to path_mtu - 100 (safe margin for encryption overhead). Both client and server must use the same MTU.'
      },
      {
        type: 'heading',
        level: 3,
        text: 'Connection Timeout / Slow Ramp-up'
      },
      {
        type: 'paragraph',
        text: 'Cause: nocongestion: 0 enables TCP-like congestion control, which can cause slow connection establishment on variable bandwidth links.'
      },
      {
        type: 'paragraph',
        text: 'Solution: Use nocongestion: 1 (default) for variable bandwidth environments.'
      },
      {
        type: 'heading',
        level: 3,
        text: 'Config Not Applying'
      },
      {
        type: 'paragraph',
        text: 'Cause: Wrong YAML key names. Invalid keys are silently ignored.'
      },
      {
        type: 'table',
        headers: ['Wrong Key', 'Correct Key'],
        rows: [
          ['snd_wnd', 'sndwnd'],
          ['rcv_wnd', 'rcvwnd'],
          ['nc', 'nocongestion'],
          ['data_shard', 'dshard'],
          ['parity_shard', 'pshard']
        ]
      },
      {
        type: 'heading',
        level: 3,
        text: '"No buffer space available" Error'
      },
      {
        type: 'paragraph',
        text: 'Cause: OS socket buffer limits are too small, causing packet loss when paqet tries to write to local services.'
      },
      {
        type: 'code',
        language: 'bash',
        code: `# Check current socket buffer sizes
ss -tnm | grep -A2 ":443" | head -10

# Look for rbXXXXX (receive buffer) - if it's small (e.g., rb87380 = 87KB), that's the problem
# Should be rb8388608 (8MB) or larger`
      },
      {
        type: 'paragraph',
        text: 'Solution: Apply the OS tuning settings and restart paqet AND the local service to create new sockets with larger buffers.'
      }
    ]
  },
  {
    id: 'scenario-configurations',
    title: 'Scenario Configurations',
    content: [
      {
        type: 'paragraph',
        text: 'Pre-configured optimization profiles for common use cases. See the scenarioConfigs object below for detailed configurations.'
      }
    ]
  },
  {
    id: 'quick-diagnostic-checklist',
    title: 'Quick Diagnostic Checklist',
    content: [
      {
        type: 'heading',
        level: 3,
        text: '1. Check for Buffer Errors'
      },
      {
        type: 'code',
        language: 'bash',
        code: `journalctl -u paqet --since "1 hour ago" | grep -i "buffer"
# If output shows "No buffer space available" → Apply OS tuning`
      },
      {
        type: 'heading',
        level: 3,
        text: '2. Verify Socket Buffer Sizes'
      },
      {
        type: 'code',
        language: 'bash',
        code: `ss -tnm | grep -A2 ":443"
# Should show: rb8388608 or larger`
      },
      {
        type: 'heading',
        level: 3,
        text: '3. Check Retransmissions'
      },
      {
        type: 'code',
        language: 'bash',
        code: `cat /proc/net/snmp | grep Tcp
# RetransSegs should be much smaller than OutSegs`
      },
      {
        type: 'heading',
        level: 3,
        text: '4. Verify Config Keys'
      },
      {
        type: 'code',
        language: 'bash',
        code: `grep -E "snd_wnd|rcv_wnd|data_shard|parity_shard|^nc:" /opt/paqet/config.yaml
# If any match → fix the key names`
      },
      {
        type: 'heading',
        level: 3,
        text: '5. Check MTU'
      },
      {
        type: 'code',
        language: 'bash',
        code: `# Find path MTU
ping -M do -s 1372 <server_ip>  # Test 1400 byte path

# Verify both configs use same MTU
grep "mtu:" /opt/paqet/config.yaml`
      },
      {
        type: 'heading',
        level: 3,
        text: 'Common Issues Summary'
      },
      {
        type: 'table',
        headers: ['Symptom', 'Likely Cause', 'Solution'],
        rows: [
          ['"No buffer space available" errors', 'OS socket buffers too small', 'Apply OS tuning, restart services'],
          ['60%+ overhead', 'Buffer overflow causing retransmissions', 'Apply OS tuning with 8MB default'],
          ['Config values not applying', 'Wrong YAML keys', 'Fix key names (see Troubleshooting)'],
          ['"Message too long" errors', 'MTU too large', 'Reduce MTU to match path MTU'],
          ['Slow connection ramp-up', 'nocongestion: 0 on variable BW', 'Use default or mode presets']
        ]
      }
    ]
  }
];

export const scenarioConfigs: Record<string, ScenarioConfig> = {
  gaming: {
    name: 'Gaming (Low Latency)',
    description: 'Optimized for minimal latency in real-time gaming applications.',
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
    streambuf: 524288`
  },
  bulk: {
    name: 'Bulk Transfer (High Throughput)',
    description: 'Optimized for maximum throughput in file transfers and backups.',
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
    streambuf: 8388608`
  },
  mobile: {
    name: 'Mobile/Lossy Network',
    description: 'Optimized for mobile networks with high packet loss and variable latency.',
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
    key: "your-key"`
  },
  satellite: {
    name: 'Satellite (High Latency)',
    description: 'Optimized for satellite links with very high latency.',
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
    streambuf: 16777216`
  },
  datacenter: {
    name: 'Datacenter (Maximum Performance)',
    description: 'Optimized for datacenter environments with high bandwidth and low latency.',
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
    streambuf: 33554432`
  },
  vpn: {
    name: 'VPN Service (Traffic-Constrained)',
    description: 'Optimized for VPN providers with traffic-limited entry servers. Prioritizes low bandwidth overhead.',
    clientCode: `role: "client"
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
  tcp:
    local_flag: ["PA"]
    remote_flag: ["PA"]
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
    serverCode: `role: "server"
log:
  level: "warn"
listen:
  addr: ":8888"
network:
  interface: "eth0"
  ipv4:
    addr: "10.0.0.1:8888"
    router_mac: "aa:bb:cc:dd:ee:ff"
  tcp:
    local_flag: ["PA"]
  pcap:
    sockbuf: 8388608
transport:
  protocol: "kcp"
  conn: 1
  tcpbuf: 32768
  kcp:
    mode: "normal"
    key: "your-secret-key"
    mtu: 1280
    sndwnd: 2048
    rcvwnd: 2048
    block: "aes-128-gcm"
    smuxbuf: 8388608
    streambuf: 4194304`,
    notes: `Key Optimizations:
| Setting | Value | Reason |
|---------|-------|--------|
| mode | normal | Conservative, ~10-15% overhead |
| conn | 1 | Single connection, minimal overhead |
| mtu | 1280 | Safe for most path MTUs |
| block | aes-128-gcm | Efficient authenticated encryption |

Expected Performance:
- Overhead: ~10-15% (vs 40-60% with aggressive modes)
- Suitable for: Browsing, streaming, messaging
- Not ideal for: Gaming, real-time voice/video`
  }
};

export const quickReference = {
  kcpModes: {
    headers: ['Mode', 'Latency', 'Throughput', 'CPU', 'Use Case'],
    rows: [
      ['normal', 'High', 'Medium', 'Low', 'Conservative, TCP-like'],
      ['fast', 'Medium', 'Good', 'Medium', 'Default, balanced'],
      ['fast2', 'Low', 'Good', 'Higher', 'Real-time apps'],
      ['fast3', 'Lowest', 'Good', 'Highest', 'Gaming, VoIP'],
      ['manual', 'Custom', 'Custom', 'Custom', 'Full control']
    ]
  },
  bufferSizing: {
    headers: ['Bandwidth', 'PCAP', 'SMUX', 'Stream', 'Window'],
    rows: [
      ['<10 Mbps', '4MB', '4MB', '2MB', '512'],
      ['10-50 Mbps', '8MB', '4MB', '2MB', '1024'],
      ['50-100 Mbps', '16MB', '8MB', '4MB', '2048'],
      ['100-500 Mbps', '32MB', '16MB', '8MB', '4096'],
      ['500+ Mbps', '64MB', '32MB', '16MB', '8192']
    ]
  },
  encryptionPerformance: 'null/none > xor > aes-128-gcm > aes-128 > salsa20 > aes > sm4 > twofish > 3des'
};
