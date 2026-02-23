# paqet Optimization Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Configuration Reference](#configuration-reference)
3. [Network Layer](#network-layer)
4. [KCP Protocol](#kcp-protocol)
5. [Buffers & Memory](#buffers--memory)
6. [Encryption](#encryption)
7. [Connection Multiplexing](#connection-multiplexing)
8. [OS Tuning](#os-tuning)
9. [Firewall Setup](#firewall-setup)
10. [Monitoring & Debugging](#monitoring--debugging)
11. [Troubleshooting](#troubleshooting)
12. [Scenario Configurations](#scenario-configurations)
13. [Quick Diagnostic Checklist](#quick-diagnostic-checklist)

---

## Architecture Overview

paqet is a packet-level proxy that bypasses the OS TCP/IP stack using raw sockets and libpcap.

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENT                              SERVER                      │
│  ───────                              ───────                    │
│                                                                   │
│  Application ──► SOCKS5/Forward ──► SMUX ──► KCP ──► pcap      │
│                                                                   │
│                       Raw TCP Packets (crafted)                  │
│                    ◄────────────────────────────────────────►   │
│                                                                   │
│  pcap ◄── KCP ◄── SMUX ◄── SOCKS5/Forward ◄── Application      │
└─────────────────────────────────────────────────────────────────┘
```

**Key Components:**
- **pcap**: Captures/injects raw Ethernet frames via libpcap
- **Packet Crafting**: Builds TCP packets with forged headers
- **KCP**: Reliable UDP protocol with ARQ and congestion control
- **SMUX**: Multiplexes multiple streams over one KCP connection
- **SOCKS5/Forward**: Application-layer proxy interfaces

---

## Configuration Reference

### Complete Configuration Structure

```yaml
role: "client"                    # "client" or "server"

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
    streambuf: 2097152            # Per-stream buffer (bytes)
```

---

## Network Layer

### Interface Selection (`network.interface`)

```yaml
network:
  interface: "eth0"        # Linux
  # interface: "en0"       # macOS
  # interface: "Ethernet"  # Windows (name only, GUID required)
  guid: "\Device\NPF_{...}" # Windows NPF GUID
```

**Platform Notes:**
- **Linux**: Use interface name (`eth0`, `ens33`, `enp3s0`)
- **macOS**: Use interface name (`en0`, `en1`)
- **Windows**: Must provide NPF GUID from `paqet iface` command

**Finding Interface:**
```bash
# Linux/macOS
ip link show                    # or: ifconfig

# Windows
paqet iface                     # Lists interfaces with GUIDs
```

### IP Address Configuration

```yaml
ipv4:
  addr: "192.168.1.100:0"        # IP:Port
  router_mac: "aa:bb:cc:dd:ee:ff" # Gateway MAC
```

**Port Behavior:**
- **Client**: Port `0` = random ephemeral port (recommended)
- **Server**: Port must match `listen.addr` port exactly

**Router MAC Address:**

Required for packet crafting. Packets are injected directly to the gateway.

```bash
# Linux
ip neigh show | grep $(ip route | grep default | awk '{print $3}')

# macOS
arp -a $(netstat -rn | grep default | head -1 | awk '{print $2}')

# Windows
arp -a <gateway_ip>
```

### TCP Flags (`network.tcp`)

```yaml
tcp:
  local_flag: ["PA"]    # Flags for client→server packets
  remote_flag: ["PA"]   # Flags for server→client packets
```

**Available Flags:**
| Flag | Name | Description |
|------|------|-------------|
| `S` | SYN | Connection setup |
| `A` | ACK | Acknowledgment |
| `P` | PSH | Push (deliver immediately) |
| `F` | FIN | Connection finish |
| `R` | RST | Connection reset |
| `U` | URG | Urgent data |
| `E` | ECE | ECN echo |
| `C` | CWR | Congestion window reduced |
| `N` | NS | ECN nonce |

**Common Combinations:**
- `["PA"]` - Push+Ack (standard data, default)
- `["A"]` - Ack only (lower overhead)
- `["SA"]` - SYN+Ack (mimic handshake response)
- `["PA", "A", "PA"]` - Cycle through patterns (evasion)

### PCAP Buffer (`network.pcap.sockbuf`)

```yaml
pcap:
  sockbuf: 4194304    # 4MB (client default)
  # sockbuf: 8388608  # 8MB (server default)
```

Kernel ring buffer for packet capture.

**Sizing Guide:**
| Throughput | Recommended Size |
|------------|------------------|
| <10 Mbps | 4 MB |
| 10-50 Mbps | 8 MB |
| 50-100 Mbps | 16 MB |
| 100+ Mbps | 32-64 MB |

**Constraints:**
- Minimum: 1 KB
- Maximum: 100 MB
- Should be power of 2 for optimal performance (warning logged if not)

---

## KCP Protocol

KCP is a fast and reliable ARQ protocol implemented over UDP.

### Mode Presets (`transport.kcp.mode`)

```yaml
kcp:
  mode: "fast"    # normal, fast, fast2, fast3, manual
```

**Preset Values (from `internal/tnet/kcp/kcp.go`):**

| Mode | nodelay | interval | resend | nocongestion | wdelay | acknodelay | Use Case |
|------|---------|----------|--------|--------------|--------|------------|----------|
| normal | 0 | 40ms | 2 | 1 | true | false | TCP-like, conservative |
| fast | 0 | 30ms | 2 | 1 | true | false | Balanced (default) |
| fast2 | 1 | 20ms | 2 | 1 | false | true | Low latency |
| fast3 | 1 | 10ms | 2 | 1 | false | true | Minimal latency |
| manual | custom | custom | custom | custom | custom | custom | Full control |

**Note:** `normal` and `fast` use `wdelay: true` (batch writes). `fast2` and `fast3` use `wdelay: false` (immediate writes).

**Important:** When using mode presets (normal, fast, fast2, fast3), all manual mode parameters (`nodelay`, `interval`, `resend`, `wdelay`, `acknodelay`, `nocongestion`) are **ignored**. The preset values in the table above are applied instead. Only use `mode: "manual"` when you need custom values.

### Manual Mode Parameters

When `mode: "manual"`, these parameters are used directly:

#### nodelay
```yaml
nodelay: 1    # 0 or 1
```

- `0`: Conservative, TCP-like retransmission behavior
- `1`: Aggressive, immediate retransmission on loss detection

**Recommendation:** Use `1` for real-time applications, `0` for bulk transfers on congested networks.

#### interval
```yaml
interval: 10    # 10-5000 milliseconds
```

KCP's internal update interval. Controls ACK generation and loss detection frequency.

- **Lower (10-20ms)**: Faster response, higher CPU usage
- **Higher (40-100ms)**: Lower CPU, slower reaction

**Rule of thumb:** `interval ≈ RTT / 2`

#### resend
```yaml
resend: 2    # 0, 1, or 2
```

Fast retransmit trigger (duplicate ACK count).

- `0`: Disable fast retransmit, wait for timeout
- `1`: Retransmit after 1 duplicate ACK (very aggressive)
- `2`: Retransmit after 2 duplicate ACKs (balanced)

**Recommendation:** Use `1` for lossy networks, `2` for normal conditions.

#### nocongestion
```yaml
nocongestion: 1    # 0 or 1
```

- `0`: Enable congestion control (fair sharing, slower ramp-up)
- `1`: Disable congestion control (max throughput, may cause loss)

**Recommendation:** Use `1` for dedicated links, `0` for shared/congested networks.

**Warning:** Setting `nocongestion: 0` on variable bandwidth links (e.g., VPS with fluctuating bandwidth) can cause slow connection ramp-up and timeouts. For VPN services or environments with unpredictable bandwidth, keep `nocongestion: 1` (default).

#### wdelay
```yaml
wdelay: false    # true or false
```

Write delay/batching.

- `false`: Flush immediately when data available (lower latency, more syscalls)
- `true`: Batch writes until next interval tick (higher throughput, added latency)

**Recommendation:** `false` for gaming/VoIP, `true` for file transfers.

#### acknodelay
```yaml
acknodelay: true    # true or false
```

- `true`: Send ACK immediately on receive (faster loss detection)
- `false`: Batch ACKs with data (bandwidth efficient)

### MTU (`transport.kcp.mtu`)

```yaml
mtu: 1350    # 50-1500 bytes
```

Maximum KCP packet size.

**Common Values:**
| Value | Description |
|-------|-------------|
| 1472 | Maximum safe UDP over Ethernet (1500 - 20 IP - 8 UDP) |
| 1400 | Safe for most internet paths |
| 1350 | Default, accounts for encryption overhead |
| 1250 | Conservative, works with VPN overhead |
| 512 | Maximum compatibility, gaming |

**Formula:** `MTU ≤ path_mtu - 28 (IP+UDP) - encryption_overhead`

### Window Sizes (`rcvwnd`, `sndwnd`)

```yaml
rcvwnd: 512    # 1-32768
sndwnd: 512    # 1-32768
```

**Defaults:**
- Client: 512 for both
- Server: 1024 for both

**Bandwidth-Delay Product (BDP):**
```
BDP = bandwidth (bytes/sec) × RTT (seconds)
Window ≥ BDP / MTU
```

| Bandwidth | RTT | Min Window |
|-----------|-----|------------|
| 10 Mbps | 50ms | ~47 |
| 100 Mbps | 50ms | ~463 |
| 1 Gbps | 10ms | ~926 |

### Forward Error Correction (`dshard`, `pshard`)

```yaml
dshard: 0    # Data shards (0 = disabled, default)
pshard: 0    # Parity shards
```

**Important:** FEC is **disabled by default**. Must be explicitly configured.

When enabled, uses Reed-Solomon erasure coding:
- For every `dshard` data packets, sends `pshard` parity packets
- Can recover from up to `pshard` lost packets per group
- Overhead: `pshard / dshard` ratio

**Example (10:3):**
```yaml
dshard: 10
pshard: 3    # 30% overhead, recovers up to 3 losses per 13 packets
```

**When to use:**
- Lossy networks (>5% packet loss)
- High-latency links where retransmission is expensive
- Real-time applications (gaming, VoIP)

**When NOT to use:**
- Clean networks (wastes bandwidth)
- Bandwidth-constrained links

### DSCP Marking

paqet automatically sets DSCP to 46 (Expedited Forwarding) for QoS:
```go
conn.SetDSCP(46)    // In internal/tnet/kcp/kcp.go
```

This marks packets for priority queuing on networks that respect DSCP.

---

## Buffers & Memory

### Transport Buffers

```yaml
transport:
  tcpbuf: 8192    # Min: 4096 bytes
  udpbuf: 4096    # Min: 2048 bytes
```

Application-layer buffers between proxy and transport.

### SMUX Buffers

```yaml
kcp:
  smuxbuf: 4194304      # 4MB default
  streambuf: 2097152    # 2MB default
```

**smuxbuf:** Total buffer for all streams in a session. Minimum: 1024 bytes.

**streambuf:** Per-stream buffer. Minimum: 1024 bytes.

**SMUX Keepalive (hardcoded):**
```go
sconf.KeepAliveInterval = 2 * time.Second
sconf.KeepAliveTimeout = 8 * time.Second
```

### Memory Calculation

Per connection (approximate):
```
Total = pcap_sockbuf + smuxbuf + (streambuf × concurrent_streams)
```

**Example server (100 connections, 10 streams each):**
```
PCAP: 8MB
SMUX: 4MB × 100 = 400MB
Streams: 2MB × 10 × 100 = 2GB
Total: ~2.4GB
```

---

## Encryption

### Algorithms (`transport.kcp.block`)

```yaml
kcp:
  block: "aes"        # Encryption algorithm
  key: "your-key"     # Any length (derived via PBKDF2)
```

**Available Algorithms:**

| Algorithm | Key Size | Speed | Notes |
|-----------|----------|-------|-------|
| `null` | - | Fastest | No encryption, no authentication |
| `none` | - | Fastest | No encryption, has authentication |
| `xor` | 32 | Very fast | Weak, use only for testing |
| `aes-128-gcm` | 16 | Fast | **Recommended** - AEAD |
| `aes-128` | 16 | Fast | Hardware accelerated |
| `aes` / `aes-256` | 32 | Medium | Full 256-bit key |
| `aes-192` | 24 | Medium | - |
| `salsa20` | 32 | Fast | Stream cipher |
| `sm4` | 16 | Fast | Chinese standard |
| `blowfish` | 32 | Medium | Legacy |
| `twofish` | 32 | Medium | AES alternative |
| `cast5` | 16 | Medium | Legacy |
| `3des` | 24 | Slow | Avoid |
| `tea` | 16 | Fast | Weak |
| `xtea` | 16 | Fast | Improved TEA |

### Key Derivation

Keys are derived using PBKDF2 (from `internal/conf/kcp_block.go`):
```go
dkey := pbkdf2.Key([]byte(key), []byte("paqet"), 100_000, 32, sha256.New)
```

- **Salt:** "paqet"
- **Iterations:** 100,000
- **Output:** 32 bytes (truncated per algorithm requirements)

**Recommendation:** Use `aes-128-gcm` for best security/performance balance. Key length doesn't matter (derived), but use 16+ characters for entropy.

### Key Generation

```bash
./paqet secret
```

---

## Connection Multiplexing

### Multiple Connections (`transport.conn`)

```yaml
transport:
  conn: 1    # 1-256 parallel KCP connections
```

**Benefits:**
- Better bandwidth utilization
- Reduced head-of-line blocking
- Load balancing across connections

**Trade-offs:**
- More memory per connection
- More CPU overhead
- May not saturate single connection first

**Guidelines:**

| Bandwidth | Recommended `conn` |
|-----------|-------------------|
| <10 Mbps | 1 |
| 10-50 Mbps | 2-4 |
| 50-100 Mbps | 4-8 |
| 100-500 Mbps | 8-16 |
| 500+ Mbps | 16-32 |

**Constraint:** When `conn > 1`, client port must be `0` (random). Explicit port only allowed with `conn: 1`.

---

## OS Tuning

### Linux Kernel Parameters

**Critical:** You must set both the **default** and **max** values. Applications use the default buffer size unless they explicitly request larger buffers. Setting only the max is insufficient.

```bash
# Socket buffer limits (max values)
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
sysctl -w net.netfilter.nf_conntrack_max=1000000
```

**Make persistent across reboots:**
```bash
cat >> /etc/sysctl.conf << 'EOF'
net.core.rmem_max=268435456
net.core.wmem_max=268435456
net.core.rmem_default=16777216
net.core.wmem_default=16777216
net.ipv4.tcp_rmem=4096 8388608 268435456
net.ipv4.tcp_wmem=4096 8388608 268435456
net.core.netdev_max_backlog=65536
EOF

sysctl -p
```

**Verify settings after reboot:**
```bash
sysctl net.ipv4.tcp_rmem net.ipv4.tcp_wmem
# Expected: net.ipv4.tcp_rmem = 4096 8388608 268435456
```

### NIC Optimization

```bash
# Enable offloading
ethtool -K eth0 tso on gso on gro on

# Ring buffers
ethtool -G eth0 rx 4096 tx 4096
```

### File Descriptors

```bash
ulimit -n 65535
```

### CPU Affinity

```bash
# Pin to specific cores
sudo taskset -c 0,1 ./paqet run -c config.yaml

# NUMA binding
sudo numactl --cpunodebind=0 --membind=0 ./paqet run -c config.yaml
```

---

## Firewall Setup

### Required iptables Rules (Server)

**Critical:** These rules are mandatory for proper operation.

```bash
#!/bin/bash
PORT=9999

# Bypass connection tracking
iptables -t raw -A PREROUTING -p tcp --dport $PORT -j NOTRACK
iptables -t raw -A OUTPUT -p tcp --sport $PORT -j NOTRACK

# Drop kernel RST packets (kernel sends RST for packets it doesn't recognize)
iptables -t mangle -A OUTPUT -p tcp --sport $PORT --tcp-flags RST RST -j DROP
```

**Why needed:**
- `NOTRACK`: Prevents conntrack from interfering with raw packets
- `DROP RST`: Kernel sends RST for TCP packets it didn't initiate; without this, connections die

### nftables Alternative

```bash
#!/usr/sbin/nft -f

table inet paqet {
    chain prerouting {
        type filter hook prerouting priority raw; policy accept;
        tcp dport 9999 notrack
    }
    chain output {
        type filter hook output priority mangle; policy accept;
        tcp sport 9999 tcp flags rst drop
    }
}
```

---

## Monitoring & Debugging

### Log Levels (`log.level`)

```yaml
log:
  level: "none"    # none, debug, info, warn, error, fatal
```

**Default:** `none` (no logging, best performance)

| Level | Value | Use Case |
|-------|-------|----------|
| none | -1 | Production, best performance |
| debug | 0 | Troubleshooting, verbose |
| info | 1 | Normal operation |
| warn | 2 | Warnings only |
| error | 3 | Errors only |
| fatal | 4 | Fatal errors only |

**Performance Impact:** Debug logging can reduce throughput 10-20%. Use `none` in production.

### Diagnostic Commands

#### ping - Test Connectivity

```bash
sudo ./paqet ping -c client.yaml
```

Tests: Network reachability, KCP handshake, encryption/decryption, round-trip time.

#### dump - Packet Capture

```bash
sudo ./paqet dump -p 9999           # Capture on port
sudo ./paqet dump -i eth0 -p 9999   # Specific interface
sudo ./paqet dump -p 9999 -v        # Verbose
```

#### iface - List Interfaces

```bash
./paqet iface    # Lists interfaces with GUIDs (Windows)
```

#### secret - Generate Key

```bash
./paqet secret    # Generates secure random key
```

#### version - Build Info

```bash
./paqet version
```

### Measuring Actual Overhead

To measure real traffic overhead:

**Method 1: vnstat (long-term monitoring)**
```bash
# Install vnstat
apt install -y vnstat

# Check daily traffic ratio
vnstat -d

# Calculate overhead: rx_from_tunnel / tx_to_users
# Expected: 1.10-1.15 (10-15% overhead)
# Problem: >1.50 (50%+ overhead) = likely buffer issues
```

**Method 2: Controlled test (precise measurement)**
```bash
# Record starting bytes
cat /sys/class/net/eth0/statistics/rx_bytes > /tmp/start_rx
cat /sys/class/net/eth0/statistics/tx_bytes > /tmp/start_tx

# Download a known-size file through VPN (e.g., 100MB)
# Have a user download 100MB file

# Record ending bytes
cat /sys/class/net/eth0/statistics/rx_bytes > /tmp/end_rx
cat /sys/class/net/eth0/statistics/tx_bytes > /tmp/end_tx

# Calculate
RX_DIFF=$(($(cat /tmp/end_rx) - $(cat /tmp/start_rx)))
TX_DIFF=$(($(cat /tmp/end_tx) - $(cat /tmp/start_tx)))
FILE_SIZE=104857600  # 100MB

echo "Tunnel received: $RX_DIFF bytes"
echo "Sent to users: $TX_DIFF bytes"
echo "Overhead: $(echo "scale=2; ($RX_DIFF - $FILE_SIZE) * 100 / $FILE_SIZE" | bc)%"
```

**Method 3: Check retransmissions**
```bash
cat /proc/net/snmp | grep Tcp
# RetransSegs = number of retransmitted segments
# High RetransSegs relative to OutSegs indicates packet loss or buffer issues
```

---

## Troubleshooting

### "Message too long" Error

**Cause:** KCP MTU exceeds the path MTU between client and server.

**Symptoms:**
- Error in logs: `send: Message too long`
- Connections fail immediately after establishment
- `paqet ping` shows "Packet sent successfully" but no response

**Solution:**
1. Find your path MTU:
   ```bash
   # Test different sizes until one works
   ping -M do -s 1472 <server_ip>   # Test 1500 byte path
   ping -M do -s 1372 <server_ip>   # Test 1400 byte path
   ```
2. Set KCP MTU to `path_mtu - 100` (safe margin for encryption overhead)
3. **Both client and server must use the same MTU**

**Example:** If path MTU is 1400, set `mtu: 1280` on both sides.

### Connection Timeout / Slow Ramp-up

**Cause:** `nocongestion: 0` enables TCP-like congestion control, which can cause slow connection establishment on variable bandwidth links.

**Symptoms:**
- Connections take long time to establish
- Tunnel appears to work but users experience delays
- Works fine on stable links, fails on variable bandwidth

**Solution:**
- Use `nocongestion: 1` (default) for variable bandwidth environments
- Or use mode presets (fast, normal) which have sensible defaults
- Avoid `mode: "manual"` with `nocongestion: 0` on VPS with fluctuating bandwidth

### Config Not Applying

**Cause:** Wrong YAML key names.

**Common Mistakes:**
| Wrong Key | Correct Key |
|-----------|-------------|
| `snd_wnd` | `sndwnd` |
| `rcv_wnd` | `rcvwnd` |
| `nc` | `nocongestion` |
| `data_shard` | `dshard` |
| `parity_shard` | `pshard` |

**Note:** Invalid keys are silently ignored - paqet will use default values instead.

### Manual Mode Parameters Ignored

**Cause:** Using manual mode parameters with a mode preset.

**Problem:** Parameters like `nodelay`, `interval`, `resend`, `wdelay`, `acknodelay`, `nocongestion` only work when `mode: "manual"`.

**Solution:**
- Either use `mode: "manual"` and set all parameters explicitly
- Or use mode presets (normal, fast, fast2, fast3) and accept their built-in values

### "No buffer space available" Error

**Cause:** OS socket buffer limits are too small, causing packet loss when paqet tries to write to local services (e.g., xray, v2ray).

**Symptoms:**
- Error in logs: `send: No buffer space available`
- TCP streams failing with `writeto tcp 127.0.0.1:XXXX->127.0.0.1:443: send: No buffer space available`
- Massive retransmissions (check with `cat /proc/net/snmp | grep Tcp`)
- High traffic overhead (60-80%+ instead of expected 10-15%)

**Diagnosis:**
```bash
# Check current socket buffer sizes
ss -tnm | grep -A2 ":443" | head -10

# Look for rbXXXXX (receive buffer) - if it's small (e.g., rb87380 = 87KB), that's the problem
# Should be rb8388608 (8MB) or larger
```

**Solution:**
1. Apply the OS tuning settings from the [OS Tuning section](#os-tuning) - **both default and max values**
2. Restart paqet AND the local service (xray, v2ray, etc.) to create new sockets with larger buffers
3. Verify: `ss -tnm | grep -A2 ":443"` should show `rb8388608` or larger

**Why this matters:**
When paqet receives data from the tunnel faster than the local service (xray) can process, data backs up in the socket buffer. If the buffer is too small (default ~87KB), it fills instantly and packets are dropped, causing KCP retransmissions that multiply your traffic usage.

**Example overhead impact:**
- With small buffers (87KB): 70-80% overhead due to constant retransmissions
- With proper buffers (8MB): 10-15% overhead

### Verifying Buffer Fix

After applying OS tuning and restarting services:
```bash
# 1. Check socket buffers are large
ss -tnm | grep -A2 ":443"
# Should show: skmem:(r0,rb8388608,...)

# 2. Check for buffer errors (should be empty)
journalctl -u paqet --since "10 minutes ago" | grep -i "buffer"

# 3. Monitor retransmissions over time
cat /proc/net/snmp | grep Tcp
# RetransSegs should grow slowly, not rapidly
```

---

## Scenario Configurations

### Gaming (Low Latency)

```yaml
role: "client"
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
    streambuf: 524288
```

### Bulk Transfer (High Throughput)

```yaml
role: "client"
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
    streambuf: 8388608
```

### Mobile/Lossy Network

```yaml
role: "client"
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
    key: "your-key"
```

### Satellite (High Latency)

```yaml
role: "client"
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
    streambuf: 16777216
```

### Datacenter (Maximum Performance)

```yaml
role: "client"
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
    streambuf: 33554432
```

### VPN Service (Traffic-Constrained)

Optimized for VPN providers with traffic-limited entry servers. Prioritizes low bandwidth overhead while maintaining acceptable latency for browsing and streaming.

**Client (Entry Server):**
```yaml
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
    streambuf: 2097152
```

**Server (Exit Server):**
```yaml
role: "server"
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
    streambuf: 4194304
```

**Required OS Tuning (apply on BOTH servers):**
```bash
# See OS Tuning section for details
sysctl -w net.core.rmem_max=268435456
sysctl -w net.core.wmem_max=268435456
sysctl -w net.core.rmem_default=16777216
sysctl -w net.core.wmem_default=16777216
sysctl -w net.ipv4.tcp_rmem="4096 8388608 268435456"
sysctl -w net.ipv4.tcp_wmem="4096 8388608 268435456"
```

**Key Optimizations:**
| Setting | Value | Reason |
|---------|-------|--------|
| `mode` | normal | Conservative, ~10-15% overhead |
| `conn` | 1 | Single connection, minimal overhead |
| `mtu` | 1280 | Safe for most path MTUs |
| `block` | aes-128-gcm | Efficient authenticated encryption |
| `sndwnd/rcvwnd` | 1024/2048 | Balanced for variable bandwidth |
| `tcpbuf` | 16384/32768 | Larger reads for streaming |
| Buffer sizes | Tuned | Optimized for 1GB RAM servers |
| OS buffers | 8MB default | Prevents "No buffer space available" |

**Expected Performance:**
- Overhead: ~10-15% (vs 40-60% with aggressive modes)
- Suitable for: Browsing, streaming, messaging
- Not ideal for: Gaming, real-time voice/video

**Troubleshooting High Overhead:**
If you see 60%+ overhead despite correct config:
1. Check for "No buffer space available" errors: `journalctl -u paqet | grep -i buffer`
2. Verify socket buffer sizes: `ss -tnm | grep -A2 ":443"` (should show `rb8388608`)
3. Check retransmissions: `cat /proc/net/snmp | grep Tcp` (RetransSegs growing rapidly = problem)
4. Apply OS tuning from above and restart both paqet and xray/v2ray

---

## Quick Reference

### KCP Modes Summary

| Mode | Latency | Throughput | CPU | Use Case |
|------|---------|------------|-----|----------|
| normal | High | Medium | Low | Conservative, TCP-like |
| fast | Medium | Good | Medium | Default, balanced |
| fast2 | Low | Good | Higher | Real-time apps |
| fast3 | Lowest | Good | Highest | Gaming, VoIP |
| manual | Custom | Custom | Custom | Full control |

### Buffer Sizing Quick Reference

| Bandwidth | PCAP | SMUX | Stream | Window |
|-----------|------|------|--------|--------|
| <10 Mbps | 4MB | 4MB | 2MB | 512 |
| 10-50 Mbps | 8MB | 4MB | 2MB | 1024 |
| 50-100 Mbps | 16MB | 8MB | 4MB | 2048 |
| 100-500 Mbps | 32MB | 16MB | 8MB | 4096 |
| 500+ Mbps | 64MB | 32MB | 16MB | 8192 |

### Encryption Performance

Fastest → Slowest:
```
null/none > xor > aes-128-gcm > aes-128 > salsa20 > aes > sm4 > twofish > 3des
```

---

## Quick Diagnostic Checklist

If you're experiencing high overhead or connection issues, run through this checklist:

### 1. Check for Buffer Errors
```bash
journalctl -u paqet --since "1 hour ago" | grep -i "buffer"
# If output shows "No buffer space available" → Apply OS tuning from OS Tuning section
```

### 2. Verify Socket Buffer Sizes
```bash
ss -tnm | grep -A2 ":443"
# Should show: rb8388608 or larger
# If shows rb87380 or similar small number → OS tuning not applied correctly
```

### 3. Check Retransmissions
```bash
cat /proc/net/snmp | grep Tcp
# RetransSegs should be much smaller than OutSegs
# High RetransSegs = packet loss or buffer issues
```

### 4. Verify Config Keys
```bash
# Check for common wrong keys:
grep -E "snd_wnd|rcv_wnd|data_shard|parity_shard|^nc:" /opt/paqet/config.yaml
# If any match → fix the key names (sndwnd, rcvwnd, dshard, pshard, nocongestion)
```

### 5. Check MTU
```bash
# Find path MTU
ping -M do -s 1372 <server_ip>  # Test 1400 byte path
# If fails, try smaller sizes

# Verify both configs use same MTU
grep "mtu:" /opt/paqet/config.yaml
# Should be same on both client and server
```

### 6. Monitor Traffic Ratio
```bash
vnstat -d
# rx (from tunnel) / tx (to users) should be ~1.15
# If >1.50 → buffer or retransmission issue
```

### Common Issues Summary

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| "No buffer space available" errors | OS socket buffers too small | Apply OS tuning, restart services |
| 60%+ overhead | Buffer overflow causing retransmissions | Apply OS tuning with 8MB default |
| Config values not applying | Wrong YAML keys | Fix key names (see Troubleshooting) |
| "Message too long" errors | MTU too large | Reduce MTU to match path MTU |
| Slow connection ramp-up | `nocongestion: 0` on variable BW | Use default or mode presets |
