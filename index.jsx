import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --black: #000000;
      --white: #ffffff;
      --gray-100: #f5f5f5;
      --gray-200: #e8e8e8;
      --gray-300: #c8c8c8;
      --gray-400: #888888;
      --gray-500: #555555;
      --gray-600: #333333;
      --gray-700: #1a1a1a;
      --gray-800: #111111;
      --accent: #ff3b30;
      --accent-dim: rgba(255,59,48,0.12);
      --accent2: #00d4ff;
      --glass: rgba(255,255,255,0.04);
      --glass-border: rgba(255,255,255,0.08);
      --font-display: 'Syne', sans-serif;
      --font-mono: 'Space Mono', monospace;
      --font-body: 'DM Sans', sans-serif;
    }

    html, body { height: 100%; background: var(--black); color: var(--white); font-family: var(--font-body); }
    #root { height: 100%; }

    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--gray-600); border-radius: 2px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--gray-400); }

    .dot-grid {
      background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
      background-size: 24px 24px;
    }
    .fine-grid {
      background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .glass {
      background: var(--glass);
      backdrop-filter: blur(12px);
      border: 1px solid var(--glass-border);
    }

    @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse-dot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.7); } }
    @keyframes scan { 0% { transform:translateY(-100%); } 100% { transform:translateY(100vh); } }
    @keyframes blink { 0%,49% { opacity:1; } 50%,100% { opacity:0; } }
    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes progress-fill { from { width:0%; } }
    @keyframes glow-pulse { 0%,100% { box-shadow:0 0 0 0 rgba(255,59,48,0); } 50% { box-shadow:0 0 20px 4px rgba(255,59,48,0.2); } }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .animate-in { animation: fadeIn 0.3s ease forwards; }
    .cursor-blink { animation: blink 1s step-end infinite; }

    .btn {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 10px 20px;
      border: 1px solid var(--gray-600);
      background: transparent;
      color: var(--white);
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex; align-items: center; gap: 8px;
      white-space: nowrap;
    }
    .btn:hover { border-color: var(--white); background: rgba(255,255,255,0.05); }
    .btn-primary {
      background: var(--white); color: var(--black); border-color: var(--white);
    }
    .btn-primary:hover { background: var(--gray-200); border-color: var(--gray-200); }
    .btn-accent {
      background: var(--accent); color: var(--white); border-color: var(--accent);
    }
    .btn-accent:hover { background: #e62e25; border-color: #e62e25; }
    .btn-ghost { border-color: transparent; }
    .btn-ghost:hover { border-color: var(--gray-600); }
    .btn-sm { padding: 6px 12px; font-size: 10px; }
    .btn-icon { padding: 8px; width: 34px; height: 34px; justify-content: center; }

    input, textarea, select {
      background: var(--gray-800);
      border: 1px solid var(--gray-600);
      color: var(--white);
      font-family: var(--font-body);
      font-size: 13px;
      padding: 10px 14px;
      outline: none;
      width: 100%;
      transition: border-color 0.15s;
    }
    input:focus, textarea:focus, select:focus { border-color: var(--white); }
    input::placeholder { color: var(--gray-500); }
    select option { background: var(--gray-700); }
    label { font-size: 11px; font-family: var(--font-mono); letter-spacing: 0.06em; color: var(--gray-400); text-transform: uppercase; display: block; margin-bottom: 6px; }

    .tag {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 3px 8px;
      border: 1px solid currentColor;
      display: inline-flex; align-items: center; gap: 4px;
    }

    .divider { height: 1px; background: var(--gray-700); width: 100%; }

    /* Syntax highlighting */
    .tok-kw { color: #ff79c6; }
    .tok-str { color: #f1fa8c; }
    .tok-num { color: #bd93f9; }
    .tok-cmt { color: #6272a4; font-style: italic; }
    .tok-fn { color: #50fa7b; }
    .tok-pp { color: #ff5555; }
    .tok-type { color: #8be9fd; }
  `}</style>
);

/* ─────────────────────────────────────────────
   IN-MEMORY DATABASE
───────────────────────────────────────────── */
const DB = {
  users: [
    {
      id: "u1", username: "demo", email: "demo@kernelforge.io",
      passwordHash: "demo1234", // plain for demo
      plan: "free", role: "user",
      createdAt: "2025-01-15T10:00:00Z",
      apiKey: "kf_sk_demo_a1b2c3d4e5f6g7h8",
    }
  ],
  projects: [
    {
      id: "p1", userId: "u1", name: "NullOS",
      description: "Minimal Linux-based OS with custom init",
      arch: "x86_64", kernel: "6.6.30", bootloader: "GRUB2",
      initSystem: "custom", packageBase: "musl-libc",
      createdAt: "2025-02-01T12:00:00Z",
      updatedAt: "2025-02-20T15:30:00Z",
      buildStatus: "idle",
      version: "0.3.1",
      buildHistory: [
        { id: "b1", version: "0.2.0", status: "success", duration: 142, at: "2025-02-10T09:00:00Z", size: "48.2 MB" },
        { id: "b2", version: "0.3.0", status: "success", duration: 138, at: "2025-02-18T14:00:00Z", size: "51.7 MB" },
        { id: "b3", version: "0.3.1", status: "error", duration: 23, at: "2025-02-20T15:30:00Z", size: null },
      ],
      files: {
        "/kernel/main.c": `#include <linux/init.h>\n#include <linux/module.h>\n#include <linux/kernel.h>\n\nMODULE_LICENSE("GPL");\nMODULE_AUTHOR("NullOS Team");\nMODULE_DESCRIPTION("NullOS Kernel Module");\nMODULE_VERSION("0.3.1");\n\nstatic int __init nullos_init(void) {\n    printk(KERN_INFO "NullOS: Kernel module loaded\\n");\n    return 0;\n}\n\nstatic void __exit nullos_exit(void) {\n    printk(KERN_INFO "NullOS: Kernel module unloaded\\n");\n}\n\nmodule_init(nullos_init);\nmodule_exit(nullos_exit);`,
        "/kernel/config.h": `#ifndef NULLOS_CONFIG_H\n#define NULLOS_CONFIG_H\n\n#define NULLOS_VERSION "0.3.1"\n#define NULLOS_ARCH "x86_64"\n#define NULLOS_KERNEL "6.6.30"\n#define MAX_PROCESSES 4096\n#define PAGE_SIZE 4096\n#define STACK_SIZE (8 * 1024 * 1024)\n\n// Feature flags\n#define ENABLE_SMP 1\n#define ENABLE_PREEMPT 1\n#define ENABLE_DEBUG 0\n\n#endif /* NULLOS_CONFIG_H */`,
        "/drivers/display.c": `#include <linux/fb.h>\n#include <linux/module.h>\n#include "../kernel/config.h"\n\n/* NullOS Display Driver\n * Framebuffer implementation for NullOS\n */\n\nstatic struct fb_info *nullos_fb;\n\nstatic int nullos_fb_init(void) {\n    // Initialize framebuffer\n    printk(KERN_INFO "NullOS Display: Initializing framebuffer\\n");\n    return 0;\n}\n\nstatic void nullos_fb_exit(void) {\n    printk(KERN_INFO "NullOS Display: Framebuffer released\\n");\n}\n\nmodule_init(nullos_fb_init);\nmodule_exit(nullos_fb_exit);\nMODULE_LICENSE("GPL");`,
        "/boot/grub.cfg": `# NullOS GRUB Configuration\nset default=0\nset timeout=3\n\nmenuentry "NullOS 0.3.1" {\n    linux /boot/vmlinuz root=/dev/sda1 quiet splash\n    initrd /boot/initrd.img\n}\n\nmenuentry "NullOS (Recovery)" {\n    linux /boot/vmlinuz root=/dev/sda1 single\n    initrd /boot/initrd.img\n}`,
        "/userspace/init.c": `#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <sys/wait.h>\n\n/* NullOS Init System - PID 1 */\n\nvoid mount_filesystems(void) {\n    // Mount /proc, /sys, /dev\n    printf("init: mounting filesystems\\n");\n}\n\nvoid start_services(void) {\n    printf("init: starting services\\n");\n    // Launch shell\n    execl("/bin/sh", "sh", NULL);\n}\n\nint main(void) {\n    printf("NullOS init starting...\\n");\n    mount_filesystems();\n    start_services();\n    \n    // Reap zombies\n    while (1) {\n        wait(NULL);\n    }\n    return 0;\n}`,
        "/assets/logo.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff" stroke-width="2"/>\n  <circle cx="50" cy="50" r="8" fill="#ffffff"/>\n  <line x1="50" y1="5" x2="50" y2="95" stroke="#ffffff" stroke-width="1" opacity="0.3"/>\n  <line x1="5" y1="50" x2="95" y2="50" stroke="#ffffff" stroke-width="1" opacity="0.3"/>\n  <text x="50" y="75" text-anchor="middle" fill="#ffffff" font-size="10" font-family="monospace">NULL</text>\n</svg>`,
        "/config/build.json": `{\n  "project": "NullOS",\n  "version": "0.3.1",\n  "arch": "x86_64",\n  "kernel": {\n    "version": "6.6.30",\n    "config": "defconfig",\n    "modules": ["fb", "virtio", "ext4", "tmpfs"]\n  },\n  "bootloader": "grub2",\n  "initSystem": "custom",\n  "packages": ["musl-libc", "busybox"],\n  "isoLabel": "NULLOS_031",\n  "outputFormat": "iso9660"\n}`,
      },
      snapshots: [
        { id: "s1", label: "Pre-driver refactor", version: "0.2.0", at: "2025-02-09T11:00:00Z" },
        { id: "s2", label: "Working boot sequence", version: "0.3.0", at: "2025-02-17T16:00:00Z" },
      ],
    }
  ]
};

/* ─────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 10);
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

function syntaxHighlight(code, lang = "c") {
  if (lang === "json") {
    return code
      .replace(/(".*?")\s*:/g, '<span class="tok-kw">$1</span>:')
      .replace(/:\s*(".*?")/g, ': <span class="tok-str">$1</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="tok-num">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span class="tok-pp">$1</span>');
  }
  if (lang === "xml" || lang === "svg") {
    return code
      .replace(/(&lt;\/?[\w:]+)/g, '<span class="tok-kw">$1</span>')
      .replace(/([\w-]+=)/g, '<span class="tok-fn">$1</span>')
      .replace(/(".*?")/g, '<span class="tok-str">$1</span>')
      .replace(/(&gt;)/g, '<span class="tok-kw">$1</span>');
  }
  // C syntax
  return code
    .replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, '<span class="tok-cmt">$1</span>')
    .replace(/(#\w+)/g, '<span class="tok-pp">$1</span>')
    .replace(/\b(int|char|void|return|if|else|while|for|struct|typedef|static|const|unsigned|long|short|include|define|ifndef|endif|printf|NULL|else|switch|case|break|continue|do)\b/g, '<span class="tok-kw">$1</span>')
    .replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="tok-fn">$1</span>')
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span class="tok-str">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="tok-num">$1</span>');
}

function getLang(path) {
  if (!path) return "c";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".svg")) return "xml";
  if (path.endsWith(".cfg") || path.endsWith(".sh")) return "shell";
  return "c";
}

/* ─────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────── */

/* NDOT — signature brand element */
const NDot = ({ size = 8, color = "var(--accent)", style = {} }) => (
  <span style={{
    display: "inline-block", width: size, height: size,
    borderRadius: "50%", background: color,
    animation: "pulse-dot 2s ease-in-out infinite",
    flexShrink: 0, ...style
  }} />
);

/* STATUS BADGE */
const StatusBadge = ({ status }) => {
  const map = {
    idle: { color: "var(--gray-400)", label: "IDLE" },
    building: { color: "var(--accent2)", label: "BUILDING" },
    success: { color: "#30d158", label: "SUCCESS" },
    error: { color: "var(--accent)", label: "ERROR" },
    free: { color: "var(--gray-400)", label: "FREE" },
    premium: { color: "#ffd60a", label: "PREMIUM" },
  };
  const s = map[status] || map.idle;
  return (
    <span className="tag" style={{ color: s.color, borderColor: s.color, fontSize: 9 }}>
      <NDot size={5} color={s.color} style={{ animation: status === "building" ? "pulse-dot 0.8s ease-in-out infinite" : "none" }} />
      {s.label}
    </span>
  );
};

/* TOP NAV */
const TopNav = ({ user, onNav, currentView, onLogout }) => (
  <nav style={{
    height: 52, borderBottom: "1px solid var(--gray-700)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", position: "sticky", top: 0, zIndex: 100,
    background: "rgba(0,0,0,0.92)", backdropFilter: "blur(16px)",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
      <button className="btn-ghost btn" onClick={() => onNav("dashboard")} style={{ padding: 0, gap: 8 }}>
        <NDot size={10} />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}>
          KERNEL<span style={{ color: "var(--accent)" }}>FORGE</span>
        </span>
      </button>
      {user && (
        <div style={{ display: "flex", gap: 4 }}>
          {[
            ["dashboard", "Dashboard"],
            ["projects", "Projects"],
            ["docs", "Docs"],
          ].map(([v, l]) => (
            <button key={v} className="btn btn-ghost btn-sm"
              style={{ color: currentView === v ? "var(--white)" : "var(--gray-400)", borderColor: "transparent" }}
              onClick={() => onNav(v)}>{l}</button>
          ))}
        </div>
      )}
    </div>
    {user ? (
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <StatusBadge status={user.plan} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gray-400)" }}>
          {user.username}
        </span>
        <button className="btn btn-sm" onClick={onLogout}>Logout</button>
      </div>
    ) : (
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-sm" onClick={() => onNav("login")}>Login</button>
        <button className="btn btn-primary btn-sm" onClick={() => onNav("register")}>Register</button>
      </div>
    )}
  </nav>
);

/* ─── LANDING PAGE ─── */
const LandingPage = ({ onNav }) => {
  const [scanY, setScanY] = useState(0);
  useEffect(() => {
    let t = 0;
    const iv = setInterval(() => { t = (t + 0.5) % 100; setScanY(t); }, 16);
    return () => clearInterval(iv);
  }, []);

  const features = [
    { icon: "⬡", title: "Browser IDE", desc: "Full C editor with syntax highlighting, autocomplete and linting. No setup needed." },
    { icon: "◎", title: "Real Builds", desc: "Containerized GCC cross-compilation. Actual bootable ISO output, not simulation." },
    { icon: "▦", title: "Live Preview", desc: "QEMU-powered virtualization. See your OS boot in real-time via the browser." },
    { icon: "◈", title: "SVG Assets", desc: "Android-style XML UI assets. Write, preview and export vector graphics inline." },
    { icon: "⬖", title: "ISO Export", desc: "Download fully bootable ISO. Test in QEMU or install on real hardware." },
    { icon: "◉", title: "Version Control", desc: "Built-in snapshots, build history and diff. Never lose progress." },
  ];

  return (
    <div style={{ minHeight: "calc(100vh - 52px)", position: "relative", overflow: "hidden" }}>
      {/* Scan line effect */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: 1, background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)",
        transform: `translateY(${scanY}vh)`, pointerEvents: "none", zIndex: 50,
        transition: "none",
      }} />

      {/* Hero */}
      <div className="dot-grid" style={{ position: "relative", padding: "120px 0 80px", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(255,59,48,0.06) 0%, transparent 70%)" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 32 }}>
            {Array(5).fill(0).map((_, i) => (
              <NDot key={i} size={6} style={{ animationDelay: `${i * 0.2}s`, opacity: 0.6 }} />
            ))}
          </div>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", color: "var(--gray-400)", marginBottom: 20, textTransform: "uppercase" }}>
            Build your OS. In your browser.
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "clamp(52px, 8vw, 88px)", lineHeight: 0.95,
            letterSpacing: "-0.04em", marginBottom: 32,
          }}>
            KERNEL<br /><span style={{ color: "var(--accent)" }}>FORGE</span>
          </h1>

          <p style={{ fontFamily: "var(--font-body)", color: "var(--gray-300)", fontSize: 17, lineHeight: 1.6, maxWidth: 540, margin: "0 auto 48px", fontWeight: 300 }}>
            The complete online platform for designing, building and exporting real Linux-based operating systems. Write C. Configure kernels. Boot real hardware.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" style={{ fontSize: 12, padding: "14px 32px" }} onClick={() => onNav("register")}>
              Start Building — Free
            </button>
            <button className="btn" style={{ fontSize: 12, padding: "14px 32px" }} onClick={() => onNav("login")}>
              Sign In
            </button>
          </div>

          <div style={{ marginTop: 64, display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
            {[["10k+", "Kernels Built"], ["99.1%", "Build Success"], ["< 3min", "Avg Build Time"], ["ISO", "Real Output"]].map(([v, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, marginBottom: 4 }}>{v}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-400)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Terminal preview */}
      <div style={{ padding: "0 24px 80px", maxWidth: 900, margin: "0 auto" }}>
        <div className="glass" style={{ borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: 36, background: "var(--gray-800)", display: "flex", alignItems: "center", padding: "0 16px", gap: 8, borderBottom: "1px solid var(--gray-700)" }}>
            {["var(--accent)", "#ffd60a", "#30d158"].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
            ))}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-500)", marginLeft: 8 }}>kernelforge — build — 80×24</span>
          </div>
          <div style={{ padding: "20px 24px", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 2, color: "var(--gray-300)" }}>
            {[
              { p: "kf@forge:~$", t: " kernelforge build --arch x86_64 --kernel 6.6.30", c: "var(--white)" },
              { p: "", t: "◎  Pulling kernel source linux-6.6.30.tar.xz", c: "var(--gray-400)" },
              { p: "", t: "◎  Applying NullOS patches (14 patches)", c: "var(--gray-400)" },
              { p: "", t: "◎  Configuring: x86_64_defconfig + custom overlay", c: "var(--gray-400)" },
              { p: "", t: "◉  Compiling kernel... [████████████████████░░░░] 82%", c: "var(--accent2)" },
              { p: "", t: "◎  Building initramfs with musl-libc", c: "var(--gray-400)" },
              { p: "", t: "✓  ISO written: nullos-0.3.1-x86_64.iso (51.7 MB)", c: "#30d158" },
            ].map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                {l.p && <span style={{ color: "var(--accent2)", flexShrink: 0 }}>{l.p}</span>}
                <span style={{ color: l.c }}>{l.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div style={{ padding: "0 24px 100px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 12 }}>Platform Features</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 36, letterSpacing: "-0.03em" }}>Everything you need to build a real OS</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1, border: "1px solid var(--gray-700)" }}>
          {features.map((f, i) => (
            <div key={i} className="fine-grid" style={{
              padding: "32px 28px", borderRight: i % 2 === 0 ? "1px solid var(--gray-700)" : "none",
              borderBottom: i < 4 ? "1px solid var(--gray-700)" : "none",
              transition: "background 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ fontSize: 24, marginBottom: 16, opacity: 0.7 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 8, letterSpacing: "-0.02em" }}>{f.title}</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gray-400)", lineHeight: 1.6, fontWeight: 300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ borderTop: "1px solid var(--gray-700)", padding: "80px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 40, letterSpacing: "-0.03em", marginBottom: 24 }}>
          Ready to forge your kernel?
        </h2>
        <button className="btn btn-primary" style={{ fontSize: 12, padding: "16px 48px" }} onClick={() => onNav("register")}>
          Create Free Account
        </button>
      </div>
    </div>
  );
};

/* ─── AUTH ─── */
const AuthPage = ({ mode, onAuth, onSwitch, error }) => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const isLogin = mode === "login";

  return (
    <div className="dot-grid" style={{
      minHeight: "calc(100vh - 52px)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div className="glass animate-in" style={{ width: "100%", maxWidth: 400, padding: 40 }}>
        <div style={{ marginBottom: 32 }}>
          <NDot style={{ marginBottom: 16 }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, letterSpacing: "-0.03em", marginBottom: 8 }}>
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ color: "var(--gray-400)", fontSize: 13 }}>
            {isLogin ? "Sign in to your KernelForge workspace" : "Start building your OS today — free forever"}
          </p>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent)", fontSize: 12, marginBottom: 20, fontFamily: "var(--font-mono)" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!isLogin && (
            <div>
              <label>Username</label>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="your_handle" />
            </div>
          )}
          <div>
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && onAuth(form)} />
          </div>

          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => onAuth(form)}>
            {isLogin ? "Sign In →" : "Create Account →"}
          </button>
        </div>

        {isLogin && (
          <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--gray-400)" }}>
            Demo: demo@kernelforge.io / demo1234
          </div>
        )}

        <div className="divider" style={{ margin: "24px 0" }} />
        <div style={{ textAlign: "center", fontSize: 12, color: "var(--gray-400)" }}>
          {isLogin ? "No account yet?" : "Already have an account?"}{" "}
          <button className="btn-ghost btn" style={{ padding: 0, fontSize: 12, color: "var(--white)", border: "none" }}
            onClick={onSwitch}>{isLogin ? "Register" : "Sign In"}</button>
        </div>
      </div>
    </div>
  );
};

/* ─── DASHBOARD ─── */
const Dashboard = ({ user, projects, onNewProject, onOpenProject }) => {
  const userProjects = projects.filter(p => p.userId === user.id);
  const canCreate = user.plan === "premium" || userProjects.length < 1;

  return (
    <div className="animate-in" style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", color: "var(--gray-400)", textTransform: "uppercase", marginBottom: 8 }}>
            {fmtDate(new Date().toISOString())}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 36, letterSpacing: "-0.03em" }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--gray-400)", marginTop: 4, fontSize: 13 }}>
            {userProjects.length} project{userProjects.length !== 1 ? "s" : ""} · {user.plan} plan
          </p>
        </div>
        <button
          className={`btn ${canCreate ? "btn-primary" : ""}`}
          onClick={canCreate ? onNewProject : () => alert("Upgrade to Premium for unlimited projects")}
          style={{ opacity: canCreate ? 1 : 0.5 }}
        >
          {!canCreate && "🔒 "}+ New Project
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, marginBottom: 48, border: "1px solid var(--gray-700)" }}>
        {[
          { label: "Projects", value: userProjects.length, max: user.plan === "free" ? "/ 1" : "∞" },
          { label: "Total Builds", value: userProjects.reduce((s, p) => s + p.buildHistory.length, 0), max: "" },
          { label: "Successful", value: userProjects.reduce((s, p) => s + p.buildHistory.filter(b => b.status === "success").length, 0), max: "" },
          { label: "Plan", value: user.plan.toUpperCase(), max: "" },
        ].map((s, i) => (
          <div key={i} className="fine-grid" style={{ padding: "24px 20px", borderRight: i < 3 ? "1px solid var(--gray-700)" : "none" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-400)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28 }}>
              {s.value} <span style={{ fontSize: 14, color: "var(--gray-500)", fontWeight: 400 }}>{s.max}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Plan upgrade banner for free */}
      {user.plan === "free" && (
        <div style={{
          marginBottom: 32, padding: "16px 24px",
          background: "linear-gradient(135deg, rgba(255,214,10,0.06), rgba(255,59,48,0.06))",
          border: "1px solid rgba(255,214,10,0.2)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#ffd60a", letterSpacing: "0.08em", marginBottom: 4 }}>FREE PLAN</div>
            <div style={{ fontSize: 13, color: "var(--gray-300)" }}>Upgrade to Premium for unlimited projects, private builds, and priority queue</div>
          </div>
          <button className="btn btn-sm" style={{ borderColor: "#ffd60a", color: "#ffd60a", flexShrink: 0, marginLeft: 16 }}>Upgrade →</button>
        </div>
      )}

      {/* Projects */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray-400)" }}>
          Your Projects
        </h2>
      </div>

      {userProjects.length === 0 ? (
        <div className="fine-grid" style={{ padding: "80px 24px", textAlign: "center", border: "1px solid var(--gray-700)" }}>
          <div style={{ fontSize: 32, marginBottom: 16, opacity: 0.3 }}>◎</div>
          <p style={{ color: "var(--gray-500)", fontSize: 13, marginBottom: 24 }}>No projects yet. Create your first OS.</p>
          <button className="btn btn-primary" onClick={onNewProject}>+ New Project</button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 1, border: "1px solid var(--gray-700)" }}>
          {userProjects.map(project => (
            <div key={project.id} className="fine-grid"
              style={{ padding: "24px 28px", cursor: "pointer", transition: "background 0.15s", borderBottom: "1px solid var(--gray-700)" }}
              onClick={() => onOpenProject(project)}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>{project.name}</h3>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-500)" }}>v{project.version}</span>
                    <StatusBadge status={project.buildStatus} />
                  </div>
                  <p style={{ fontSize: 13, color: "var(--gray-400)", marginBottom: 12 }}>{project.description}</p>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {[
                      [project.arch, "ARCH"],
                      [project.kernel, "KERNEL"],
                      [project.bootloader, "BOOT"],
                      [project.initSystem, "INIT"],
                    ].map(([v, l]) => (
                      <span key={l} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-500)" }}>
                        <span style={{ color: "var(--gray-600)" }}>{l} </span>{v}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right", marginLeft: 32, flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-500)", marginBottom: 4 }}>Last build</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gray-300)" }}>{fmtDate(project.updatedAt)}</div>
                  <div style={{ marginTop: 8, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-500)" }}>{project.buildHistory.length} builds</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API Key Section */}
      <div style={{ marginTop: 48, padding: "24px 28px", border: "1px solid var(--gray-700)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray-400)", marginBottom: 4 }}>API Access</h3>
            <p style={{ fontSize: 12, color: "var(--gray-500)" }}>Use your API key to trigger builds, manage projects and access build artifacts programmatically</p>
          </div>
          <button className="btn btn-sm">Regenerate</button>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--gray-800)", padding: "8px 14px", flex: 1, color: "var(--gray-300)", border: "1px solid var(--gray-700)", letterSpacing: "0.04em" }}>
            {user.apiKey}
          </code>
          <button className="btn btn-sm btn-icon" title="Copy" onClick={() => navigator.clipboard?.writeText(user.apiKey)}>⎘</button>
        </div>
      </div>
    </div>
  );
};

/* ─── NEW PROJECT WIZARD ─── */
const NewProjectWizard = ({ user, onCreate, onCancel }) => {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState({
    name: "", description: "",
    arch: "x86_64", kernel: "6.6.30", bootloader: "GRUB2",
    initSystem: "custom", packageBase: "musl-libc",
  });

  const steps = [
    { title: "Project", desc: "Name and describe your OS" },
    { title: "Architecture", desc: "Target hardware" },
    { title: "Kernel", desc: "Kernel version and bootloader" },
    { title: "Userspace", desc: "Init and packages" },
    { title: "Review", desc: "Confirm configuration" },
  ];

  const set = (k, v) => setConfig(c => ({ ...c, [k]: v }));

  const handleCreate = () => {
    if (!config.name) return;
    const now = new Date().toISOString();
    onCreate({
      id: "p" + uid(), userId: user.id,
      ...config, version: "0.1.0",
      createdAt: now, updatedAt: now,
      buildStatus: "idle", buildHistory: [], snapshots: [],
      files: {
        "/kernel/main.c": `#include <linux/init.h>\n#include <linux/module.h>\n\nMODULE_LICENSE("GPL");\nMODULE_AUTHOR("Author");\nMODULE_DESCRIPTION("${config.name} Kernel Module");\n\nstatic int __init ${config.name.toLowerCase()}_init(void) {\n    printk(KERN_INFO "${config.name}: loaded\\n");\n    return 0;\n}\n\nstatic void __exit ${config.name.toLowerCase()}_exit(void) {\n    printk(KERN_INFO "${config.name}: unloaded\\n");\n}\n\nmodule_init(${config.name.toLowerCase()}_init);\nmodule_exit(${config.name.toLowerCase()}_exit);`,
        "/kernel/config.h": `#ifndef CONFIG_H\n#define CONFIG_H\n\n#define OS_NAME "${config.name}"\n#define OS_VERSION "0.1.0"\n#define OS_ARCH "${config.arch}"\n\n#endif`,
        "/boot/grub.cfg": `set default=0\nset timeout=5\n\nmenuentry "${config.name}" {\n    linux /boot/vmlinuz quiet\n    initrd /boot/initrd.img\n}`,
        "/userspace/init.c": `#include <stdio.h>\n\nint main(void) {\n    printf("${config.name} init starting...\\n");\n    return 0;\n}`,
        "/assets/logo.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" fill="none" stroke="#fff" stroke-width="2"/>\n  <text x="50" y="55" text-anchor="middle" fill="#fff" font-size="14">${config.name.slice(0, 3).toUpperCase()}</text>\n</svg>`,
        "/config/build.json": JSON.stringify({ project: config.name, version: "0.1.0", arch: config.arch, kernel: { version: config.kernel }, bootloader: config.bootloader.toLowerCase(), initSystem: config.initSystem }, null, 2),
      }
    });
  };

  return (
    <div className="dot-grid animate-in" style={{ minHeight: "calc(100vh - 52px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 640 }}>
        {/* Progress */}
        <div style={{ display: "flex", gap: 0, marginBottom: 48 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", position: "relative" }}>
              <div style={{
                height: 2, background: i <= step ? "var(--white)" : "var(--gray-700)",
                transition: "background 0.3s", marginBottom: 10,
              }} />
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: i === step ? "var(--white)" : "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {s.title}
              </div>
            </div>
          ))}
        </div>

        <div className="glass animate-in" style={{ padding: 40 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-400)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
              Step {step + 1} / {steps.length}
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, letterSpacing: "-0.03em", marginBottom: 4 }}>{steps[step].title}</h2>
            <p style={{ color: "var(--gray-400)", fontSize: 13 }}>{steps[step].desc}</p>
          </div>

          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label>OS Name</label><input value={config.name} onChange={e => set("name", e.target.value)} placeholder="e.g. VoidOS, AlphaKernel" /></div>
              <div><label>Description</label><textarea value={config.description} onChange={e => set("description", e.target.value)} placeholder="Brief description of your OS" style={{ minHeight: 80, resize: "vertical" }} /></div>
            </div>
          )}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["x86_64", "64-bit Intel/AMD — Most compatible"], ["aarch64", "64-bit ARM — Raspberry Pi, servers"], ["riscv64", "RISC-V 64-bit — Open ISA"], ["i386", "32-bit x86 — Legacy support"]].map(([v, d]) => (
                <label key={v} style={{ cursor: "pointer", padding: "14px 16px", border: `1px solid ${config.arch === v ? "var(--white)" : "var(--gray-700)"}`, display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s" }}
                  onClick={() => set("arch", v)}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${config.arch === v ? "var(--white)" : "var(--gray-600)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {config.arch === v && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--white)" }} />}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, marginBottom: 2 }}>{v}</div>
                    <div style={{ fontSize: 11, color: "var(--gray-400)" }}>{d}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label>Kernel Version</label>
                <select value={config.kernel} onChange={e => set("kernel", e.target.value)}>
                  {["6.9.0", "6.6.30 (LTS)", "6.1.87 (LTS)", "5.15.158 (LTS)", "5.10.214 (LTS)"].map(v => <option key={v} value={v.split(" ")[0]}>{v}</option>)}
                </select>
              </div>
              <div><label>Bootloader</label>
                <select value={config.bootloader} onChange={e => set("bootloader", e.target.value)}>
                  {["GRUB2", "syslinux", "rEFInd", "UEFI stub"].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
          )}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label>Init System</label>
                <select value={config.initSystem} onChange={e => set("initSystem", e.target.value)}>
                  {[["custom", "Custom init (C)"], ["busybox", "BusyBox init"], ["systemd", "systemd (heavy)"], ["runit", "runit (lightweight)"], ["openrc", "OpenRC"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div><label>Package Base</label>
                <select value={config.packageBase} onChange={e => set("packageBase", e.target.value)}>
                  {[["musl-libc", "musl libc (minimal)"], ["glibc", "GNU libc (compatible)"], ["busybox", "BusyBox only"], ["alpine-base", "Alpine base"], ["none", "None (bare kernel)"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
          )}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--gray-700)" }}>
              {Object.entries(config).map(([k, v]) => (
                <div key={k} style={{ display: "flex", padding: "12px 16px", borderBottom: "1px solid var(--gray-700)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gray-400)", width: 120, textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--white)" }}>{v || "—"}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 32 }}>
            <button className="btn" onClick={() => step === 0 ? onCancel() : setStep(s => s - 1)}>
              {step === 0 ? "Cancel" : "← Back"}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : handleCreate()}
              disabled={step === 0 && !config.name}
            >
              {step === steps.length - 1 ? "Create Project →" : "Continue →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── FILE TREE ─── */
const FileTree = ({ files, selectedFile, onSelect, onNewFile }) => {
  const folders = {};
  Object.keys(files).forEach(path => {
    const parts = path.split("/").filter(Boolean);
    const folder = "/" + parts[0];
    if (!folders[folder]) folders[folder] = [];
    folders[folder].push(path);
  });

  const [expanded, setExpanded] = useState(Object.keys(folders));
  const toggle = f => setExpanded(e => e.includes(f) ? e.filter(x => x !== f) : [...e, f]);

  const fileIcon = (path) => {
    if (path.endsWith(".c")) return "◈";
    if (path.endsWith(".h")) return "◇";
    if (path.endsWith(".json")) return "◎";
    if (path.endsWith(".cfg") || path.endsWith(".sh")) return "▶";
    if (path.endsWith(".svg")) return "◉";
    return "◦";
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", paddingBottom: 16 }}>
      <div style={{ padding: "12px 12px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--gray-700)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gray-500)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Explorer</span>
        <button className="btn btn-ghost btn-icon" style={{ width: 22, height: 22, fontSize: 14 }} onClick={onNewFile} title="New file">+</button>
      </div>
      {Object.entries(folders).sort().map(([folder, paths]) => (
        <div key={folder}>
          <div
            onClick={() => toggle(folder)}
            style={{ padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, userSelect: "none" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ fontSize: 8, color: "var(--gray-500)", transition: "transform 0.15s", display: "inline-block", transform: expanded.includes(folder) ? "rotate(90deg)" : "none" }}>▶</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gray-300)" }}>{folder.replace("/", "")}</span>
          </div>
          {expanded.includes(folder) && paths.sort().map(path => (
            <div key={path}
              onClick={() => onSelect(path)}
              style={{
                padding: "5px 12px 5px 28px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                background: selectedFile === path ? "rgba(255,255,255,0.06)" : "transparent",
                borderLeft: selectedFile === path ? "2px solid var(--accent)" : "2px solid transparent",
              }}
              onMouseEnter={e => { if (selectedFile !== path) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={e => { if (selectedFile !== path) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ color: "var(--gray-500)", fontSize: 10, flexShrink: 0 }}>{fileIcon(path)}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: selectedFile === path ? "var(--white)" : "var(--gray-400)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {path.split("/").pop()}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

/* ─── CODE EDITOR ─── */
const CodeEditor = ({ filePath, content, onChange }) => {
  const lineCount = (content || "").split("\n").length;
  const lang = getLang(filePath);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Tab bar */}
      {filePath && (
        <div style={{ height: 36, background: "var(--gray-800)", display: "flex", alignItems: "center", padding: "0 16px", gap: 8, borderBottom: "1px solid var(--gray-700)", flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--white)", background: "var(--gray-700)", padding: "4px 12px" }}>
            {filePath.split("/").pop()}
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{lang.toUpperCase()}</span>
        </div>
      )}

      {/* Editor */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Line numbers */}
        <div style={{ width: 48, background: "var(--gray-800)", padding: "16px 8px", textAlign: "right", userSelect: "none", overflowY: "hidden", flexShrink: 0, borderRight: "1px solid var(--gray-700)" }}>
          {Array(lineCount).fill(0).map((_, i) => (
            <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: "21px", color: "var(--gray-600)" }}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea + overlay */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* Highlight overlay */}
          <div
            style={{
              position: "absolute", inset: 0, padding: "16px 16px",
              fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: "21px",
              whiteSpace: "pre", overflowX: "auto", overflowY: "hidden",
              pointerEvents: "none", color: "transparent",
            }}
            dangerouslySetInnerHTML={{ __html: syntaxHighlight(content || "", lang).replace(/\n/g, "<br>") }}
          />
          <textarea
            value={content || ""}
            onChange={e => onChange(e.target.value)}
            spellCheck={false}
            style={{
              position: "absolute", inset: 0, padding: "16px 16px",
              fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: "21px",
              background: "transparent", border: "none", outline: "none",
              resize: "none", color: "var(--gray-300)", caretColor: "var(--white)",
              whiteSpace: "pre", overflowX: "auto",
              zIndex: 1,
            }}
          />
        </div>
      </div>

      {/* Status bar */}
      <div style={{ height: 22, background: "var(--gray-800)", display: "flex", alignItems: "center", padding: "0 16px", gap: 16, borderTop: "1px solid var(--gray-700)", flexShrink: 0 }}>
        {[
          ["UTF-8", ""], ["LF", ""], [`${lineCount} lines`, ""], [lang.toUpperCase(), ""],
        ].map(([v], i) => (
          <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gray-600)", letterSpacing: "0.06em" }}>{v}</span>
        ))}
      </div>
    </div>
  );
};

/* ─── SVG EDITOR ─── */
const SVGEditor = ({ content, onChange }) => {
  const [error, setError] = useState(null);

  const previewSvg = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "image/svg+xml");
      if (doc.querySelector("parsererror")) throw new Error("Invalid SVG");
      setError(null);
      return content;
    } catch (e) { setError(e.message); return ""; }
  };

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
      {/* Editor side */}
      <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--gray-700)" }}>
        <div style={{ padding: "8px 16px", background: "var(--gray-800)", borderBottom: "1px solid var(--gray-700)", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-400)", display: "flex", justifyContent: "space-between" }}>
          <span>SVG / XML SOURCE</span>
          <span style={{ color: error ? "var(--accent)" : "#30d158" }}>{error || "VALID"}</span>
        </div>
        <textarea
          value={content}
          onChange={e => { onChange(e.target.value); }}
          spellCheck={false}
          style={{ flex: 1, background: "var(--gray-900, #0a0a0a)", border: "none", outline: "none", resize: "none", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.7, color: "var(--gray-300)", padding: "16px", caretColor: "var(--white)" }}
        />
      </div>
      {/* Preview side */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "8px 16px", background: "var(--gray-800)", borderBottom: "1px solid var(--gray-700)", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-400)" }}>
          LIVE PREVIEW
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "repeating-conic-gradient(#1a1a1a 0% 25%, #111 0% 50%) 0 0/20px 20px", padding: 32 }}>
          {error ? (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>✕</div>
              {error}
            </div>
          ) : (
            <div style={{ maxWidth: "100%", maxHeight: "100%" }} dangerouslySetInnerHTML={{ __html: previewSvg() }} />
          )}
        </div>
        <div style={{ padding: "8px 16px", background: "var(--gray-800)", borderTop: "1px solid var(--gray-700)", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-500)" }}>
          Android-style XML asset system · Live render
        </div>
      </div>
    </div>
  );
};

/* ─── TERMINAL ─── */
const Terminal = ({ project }) => {
  const [lines, setLines] = useState([
    { type: "system", text: `KernelForge Terminal v2.1.0 — ${project.name} workspace` },
    { type: "system", text: `Arch: ${project.arch} · Kernel: ${project.kernel} · Status: ${project.buildStatus}` },
    { type: "system", text: 'Type "help" for available commands' },
    { type: "prompt", text: "" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);

  const commands = {
    help: () => [
      "Available commands:",
      "  ls [path]       — list files", "  cat [file]      — show file contents",
      "  build           — trigger build", "  arch            — show architecture",
      "  uname           — kernel info", "  make modules    — compile kernel modules",
      "  gcc [file]      — compile C file", "  clear           — clear terminal",
    ],
    clear: () => { setLines([{ type: "prompt", text: "" }]); return null; },
    ls: (args) => {
      const path = args[0] || "/";
      const files = Object.keys(project.files).filter(f => f.startsWith(path));
      return files.length ? files : [`ls: ${path}: No such directory`];
    },
    cat: (args) => {
      if (!args[0]) return ["cat: missing operand"];
      const f = project.files[args[0]];
      return f ? f.split("\n") : [`cat: ${args[0]}: No such file`];
    },
    uname: () => [`Linux ${project.name.toLowerCase()} ${project.kernel}-kernelforge #1 SMP PREEMPT x86_64 GNU/Linux`],
    arch: () => [project.arch],
    build: () => ["◎ Build queued. Use the Build panel to monitor progress."],
    make: (args) => args[0] === "modules" ? ["◎ Compiling kernel modules...", "  CC  kernel/main.o", "  LD  kernel/main.ko", "✓ Build complete"] : [`make: *** No rule to make target '${args[0] || "all"}'`],
    gcc: (args) => args[0] ? [`gcc: ${args[0]}: compiled successfully → a.out`] : ["gcc: no input files"],
    pwd: () => ["/workspace/" + project.name.toLowerCase()],
    whoami: () => ["root"],
    date: () => [new Date().toString()],
    echo: (args) => [args.join(" ")],
  };

  const run = (cmd) => {
    const parts = cmd.trim().split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (!cmd.trim()) return;
    setHistory(h => [cmd, ...h.slice(0, 49)]);
    setHistIdx(-1);

    const addLines = (newLines, isErr = false) => {
      setLines(l => [
        ...l.slice(0, -1),
        { type: "input", text: cmd },
        ...(newLines || []).map(t => ({ type: isErr ? "error" : "output", text: t })),
        { type: "prompt", text: "" },
      ]);
    };

    if (name === "clear") { commands.clear(); return; }
    if (commands[name]) {
      const result = commands[name](args);
      if (result) addLines(result);
    } else {
      addLines([`bash: ${name}: command not found`], true);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter") { run(input); setInput(""); }
    else if (e.key === "ArrowUp") {
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx); setInput(history[idx] || "");
    }
    else if (e.key === "ArrowDown") {
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx); setInput(idx === -1 ? "" : history[idx]);
    }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); commands.clear(); }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0a0a0a" }}
      onClick={() => inputRef.current?.focus()}>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.8, display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
            {l.type === "system" && <span style={{ color: "var(--gray-600)" }}># {l.text}</span>}
            {l.type === "input" && <><span style={{ color: "var(--accent2)", flexShrink: 0 }}>❯</span><span style={{ color: "var(--white)" }}>{l.text}</span></>}
            {l.type === "output" && <span style={{ color: "var(--gray-300)", paddingLeft: 20, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{l.text}</span>}
            {l.type === "error" && <span style={{ color: "var(--accent)", paddingLeft: 20 }}>{l.text}</span>}
            {l.type === "prompt" && i === lines.length - 1 && (
              <>
                <span style={{ color: "var(--accent2)", flexShrink: 0 }}>❯</span>
                <span style={{ color: "var(--white)", position: "relative" }}>
                  {input}
                  <span className="cursor-blink" style={{ display: "inline-block", width: 8, height: 14, background: "var(--white)", verticalAlign: "middle", marginLeft: 1 }} />
                </span>
              </>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <input
        ref={inputRef} value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKey}
        style={{ opacity: 0, height: 0, position: "absolute" }}
        autoFocus
      />
    </div>
  );
};

/* ─── BUILD PANEL ─── */
const BuildPanel = ({ project, onBuildStart, onBuildComplete }) => {
  const [building, setBuilding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [logs, setLogs] = useState([]);
  const [done, setDone] = useState(false);
  const [error, setBuildError] = useState(false);

  const buildStages = [
    { pct: 5, msg: "Pulling linux kernel source v" + project.kernel + "..." },
    { pct: 12, msg: "Extracting and verifying source..." },
    { pct: 18, msg: "Applying " + project.name + " patches..." },
    { pct: 22, msg: "Running make " + project.arch + "_defconfig..." },
    { pct: 28, msg: "Merging custom kernel config overlay..." },
    { pct: 35, msg: "Compiling kernel: arch/x86/boot/bzImage..." },
    { pct: 55, msg: "Building kernel modules (M=drivers/char)..." },
    { pct: 65, msg: "Compiling userspace: " + project.initSystem + " init..." },
    { pct: 72, msg: "Linking with " + project.packageBase + "..." },
    { pct: 78, msg: "Building initramfs..." },
    { pct: 84, msg: "Configuring GRUB bootloader..." },
    { pct: 90, msg: "Assembling ISO filesystem..." },
    { pct: 95, msg: "Writing ISO 9660 image..." },
    { pct: 100, msg: "✓ Build complete: " + project.name.toLowerCase() + "-0.4.0-" + project.arch + ".iso (54.2 MB)" },
  ];

  const startBuild = () => {
    setBuilding(true); setProgress(0); setLogs([]); setDone(false); setBuildError(false);
    onBuildStart?.();
    let i = 0;
    const next = () => {
      if (i >= buildStages.length) { setDone(true); setBuilding(false); onBuildComplete?.(); return; }
      const s = buildStages[i++];
      setProgress(s.pct);
      setStage(s.msg);
      setLogs(l => [...l, { time: new Date().toLocaleTimeString(), msg: s.msg, ok: !s.msg.startsWith("ERROR") }]);
      const delay = s.pct >= 35 && s.pct <= 65 ? 800 + Math.random() * 600 : 400 + Math.random() * 300;
      setTimeout(next, delay);
    };
    setTimeout(next, 200);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: 24, overflowY: "auto", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", marginBottom: 4 }}>Build System</h3>
          <p style={{ fontSize: 12, color: "var(--gray-400)" }}>Containerized GCC cross-compilation · Isolated sandbox · Real ISO output</p>
        </div>
        <button className={`btn ${building ? "" : "btn-primary"}`} onClick={startBuild} disabled={building}>
          {building ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◎</span> Building...</> : "▶ Start Build"}
        </button>
      </div>

      {/* Config summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, border: "1px solid var(--gray-700)" }}>
        {[["Target", project.arch], ["Kernel", project.kernel], ["Bootloader", project.bootloader], ["Init", project.initSystem], ["Base", project.packageBase], ["Output", "ISO 9660"]].map(([k, v]) => (
          <div key={k} style={{ padding: "12px 16px", borderRight: "1px solid var(--gray-700)", borderBottom: "1px solid var(--gray-700)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{k}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      {(building || done || error) && (
        <div style={{ border: "1px solid var(--gray-700)", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gray-300)" }}>{stage}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: done ? "#30d158" : "var(--accent2)" }}>{progress}%</span>
          </div>
          <div style={{ height: 2, background: "var(--gray-700)", position: "relative", overflow: "hidden" }}>
            <div style={{
              height: "100%", background: done ? "#30d158" : "var(--accent2)",
              width: progress + "%", transition: "width 0.4s ease",
            }} />
          </div>
          {done && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(48,209,88,0.08)", border: "1px solid rgba(48,209,88,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#30d158", marginBottom: 2 }}>BUILD SUCCESSFUL</div>
                <div style={{ fontSize: 12, color: "var(--gray-300)" }}>{project.name.toLowerCase()}-0.4.0-{project.arch}.iso · 54.2 MB</div>
              </div>
              <button className="btn btn-sm" style={{ color: "#30d158", borderColor: "#30d158" }}
                onClick={() => alert("In production: Downloads real ISO file. ISO passes QEMU boot test.")}>
                ↓ Download ISO
              </button>
            </div>
          )}
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div style={{ border: "1px solid var(--gray-700)", flex: 1, minHeight: 0 }}>
          <div style={{ padding: "8px 16px", background: "var(--gray-800)", borderBottom: "1px solid var(--gray-700)", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-400)" }}>BUILD LOG</div>
          <div style={{ padding: 16, overflowY: "auto", maxHeight: 300 }}>
            {logs.map((l, i) => (
              <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1.8, display: "flex", gap: 12 }}>
                <span style={{ color: "var(--gray-600)", flexShrink: 0 }}>{l.time}</span>
                <span style={{ color: l.ok ? (l.msg.startsWith("✓") ? "#30d158" : "var(--gray-300)") : "var(--accent)" }}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Build history */}
      {project.buildHistory.length > 0 && (
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-400)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Build History</div>
          <div style={{ border: "1px solid var(--gray-700)" }}>
            {project.buildHistory.map((b, i) => (
              <div key={b.id} style={{ padding: "12px 16px", borderBottom: i < project.buildHistory.length - 1 ? "1px solid var(--gray-700)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <StatusBadge status={b.status} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>v{b.version}</span>
                  {b.size && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-500)" }}>{b.size}</span>}
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-500)" }}>{b.duration}s</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-500)" }}>{fmtDate(b.at)}</span>
                  {b.status === "success" && (
                    <button className="btn btn-sm btn-ghost" style={{ fontSize: 10 }}
                      onClick={() => alert("Download: " + project.name + "-" + b.version + ".iso")}>↓</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── PROJECT IDE VIEW ─── */
const ProjectIDE = ({ project, onUpdate, onBack }) => {
  const [files, setFiles] = useState(project.files);
  const [selectedFile, setSelectedFile] = useState(Object.keys(project.files)[0]);
  const [activePanel, setActivePanel] = useState("editor"); // editor | terminal | build | svg
  const [saved, setSaved] = useState(true);

  const handleFileChange = (content) => {
    setSaved(false);
    setFiles(f => ({ ...f, [selectedFile]: content }));
  };

  const handleSave = useCallback(() => {
    onUpdate({ ...project, files, updatedAt: new Date().toISOString() });
    setSaved(true);
  }, [files, project, onUpdate]);

  useEffect(() => {
    const handler = (e) => { if (e.ctrlKey && e.key === "s") { e.preventDefault(); handleSave(); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  const isSvg = selectedFile?.endsWith(".svg");
  const currentContent = files[selectedFile] || "";

  const tabs = [
    { id: "editor", label: "Editor", icon: "◈" },
    { id: "svg", label: "SVG", icon: "◉" },
    { id: "terminal", label: "Terminal", icon: "▶" },
    { id: "build", label: "Build", icon: "⬡" },
  ];

  const addNewFile = () => {
    const name = prompt("New file path (e.g. /kernel/utils.c):");
    if (name && name.startsWith("/")) {
      setFiles(f => ({ ...f, [name]: `/* ${name} */\n` }));
      setSelectedFile(name);
    }
  };

  return (
    <div style={{ height: "calc(100vh - 52px)", display: "flex", flexDirection: "column" }}>
      {/* IDE Toolbar */}
      <div style={{
        height: 44, background: "var(--gray-800)", borderBottom: "1px solid var(--gray-700)",
        display: "flex", alignItems: "center", padding: "0 16px", gap: 8, flexShrink: 0,
      }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ color: "var(--gray-400)" }}>← Back</button>
        <div className="divider" style={{ width: 1, height: 20 }} />
        <NDot size={7} />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, letterSpacing: "-0.02em" }}>{project.name}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-500)" }}>v{project.version}</span>
        <StatusBadge status={project.buildStatus} />
        <div style={{ flex: 1 }} />

        {tabs.map(tab => (
          <button key={tab.id} className={`btn btn-sm ${activePanel === tab.id ? "" : "btn-ghost"}`}
            style={{
              background: activePanel === tab.id ? "var(--gray-700)" : "transparent",
              borderColor: activePanel === tab.id ? "var(--gray-500)" : "transparent",
              color: activePanel === tab.id ? "var(--white)" : "var(--gray-400)",
            }}
            onClick={() => setActivePanel(tab.id)}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}

        <div className="divider" style={{ width: 1, height: 20 }} />
        <button className="btn btn-sm" onClick={handleSave}
          style={{ color: saved ? "var(--gray-500)" : "#ffd60a", borderColor: saved ? "transparent" : "rgba(255,214,10,0.3)" }}>
          {saved ? "Saved" : "● Save"}
        </button>
      </div>

      {/* Main IDE layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* File tree */}
        <div style={{ width: 200, borderRight: "1px solid var(--gray-700)", background: "var(--gray-800)", flexShrink: 0, overflowY: "auto" }}>
          <FileTree files={files} selectedFile={selectedFile} onSelect={setSelectedFile} onNewFile={addNewFile} />
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {activePanel === "editor" && (
            isSvg
              ? <SVGEditor content={currentContent} onChange={handleFileChange} />
              : <CodeEditor filePath={selectedFile} content={currentContent} onChange={handleFileChange} />
          )}
          {activePanel === "svg" && (
            selectedFile?.endsWith(".svg")
              ? <SVGEditor content={currentContent} onChange={handleFileChange} />
              : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-600)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                Select an .svg file to open the visual editor
              </div>
          )}
          {activePanel === "terminal" && <Terminal project={project} />}
          {activePanel === "build" && (
            <BuildPanel
              project={project}
              onBuildStart={() => onUpdate({ ...project, buildStatus: "building" })}
              onBuildComplete={() => onUpdate({
                ...project, buildStatus: "idle", version: "0.4.0",
                buildHistory: [...project.buildHistory, {
                  id: "b" + uid(), version: "0.4.0", status: "success",
                  duration: 142, at: new Date().toISOString(), size: "54.2 MB"
                }]
              })}
            />
          )}
        </div>

        {/* Minimap / Snapshots sidebar */}
        <div style={{ width: 180, borderLeft: "1px solid var(--gray-700)", background: "var(--gray-800)", overflowY: "auto", flexShrink: 0, padding: "12px 0" }}>
          <div style={{ padding: "0 12px 8px", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gray-500)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Snapshots</div>
          {project.snapshots.map(s => (
            <div key={s.id} style={{ padding: "8px 12px", borderBottom: "1px solid var(--gray-700)", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--white)", marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gray-500)" }}>v{s.version}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gray-600)" }}>{fmtDate(s.at)}</div>
            </div>
          ))}
          <div style={{ padding: "8px 12px" }}>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 9, width: "100%", justifyContent: "center" }}
              onClick={() => {
                const label = prompt("Snapshot label:");
                if (label) onUpdate({ ...project, snapshots: [...project.snapshots, { id: "s" + uid(), label, version: project.version, at: new Date().toISOString() }] });
              }}>+ Snapshot</button>
          </div>

          <div className="divider" style={{ margin: "12px 0" }} />

          <div style={{ padding: "0 12px 8px", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gray-500)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Quick Info</div>
          <div style={{ padding: "0 12px" }}>
            {[["Files", Object.keys(project.files).length], ["Arch", project.arch], ["Kernel", project.kernel]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--gray-700)" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gray-500)" }}>{k}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gray-300)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── DOCS PAGE ─── */
const DocsPage = () => {
  const sections = [
    { title: "Getting Started", content: "Create a free account, start a new project using the wizard, and hit Build. Your first ISO will be ready in under 3 minutes." },
    { title: "Project Structure", content: "Every project has a defined directory layout: /kernel (kernel modules, config.h), /drivers (device drivers), /boot (bootloader config), /userspace (init and applications), /assets (SVG/XML UI assets), /config (build.json and kernel config)." },
    { title: "Build System", content: "Builds run in isolated Docker containers with resource limits. The GCC cross-compiler targets your chosen architecture. Kernel sources are pulled from kernel.org. Output is a real ISO 9660 image." },
    { title: "API Keys", content: "Use your API key from the dashboard to trigger builds via REST API: POST /api/v1/build with Authorization: Bearer kf_sk_... header and JSON body {projectId, config}." },
    { title: "ISO Export", content: "Downloaded ISOs are standard ISO 9660 images. Boot with: qemu-system-x86_64 -cdrom nullos.iso -m 512M. Or write to USB: dd if=nullos.iso of=/dev/sdX bs=4M." },
    { title: "SVG Asset System", content: "Inspired by Android XML layouts. Write SVG/XML in the editor, see a live preview. Assets are embedded into the OS at build time and can be used by userspace applications." },
  ];

  return (
    <div className="animate-in" style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-400)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Documentation</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 36, letterSpacing: "-0.03em" }}>KernelForge Docs</h1>
      </div>
      {sections.map((s, i) => (
        <div key={i} style={{ marginBottom: 0, padding: "28px 0", borderBottom: "1px solid var(--gray-700)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", marginBottom: 12 }}>{s.title}</h2>
          <p style={{ color: "var(--gray-300)", fontSize: 14, lineHeight: 1.7 }}>{s.content}</p>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function App() {
  const [users, setUsers] = useState(DB.users);
  const [projects, setProjects] = useState(DB.projects);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [currentProject, setCurrentProject] = useState(null);
  const [wizardMode, setWizardMode] = useState(false);

  const handleAuth = ({ username, email, password }) => {
    setAuthError("");
    if (authMode === "login") {
      const user = users.find(u => (u.email === email) && u.passwordHash === password);
      if (!user) { setAuthError("Invalid email or password"); return; }
      setCurrentUser(user);
      setView("dashboard");
    } else {
      if (!username || !email || !password) { setAuthError("All fields required"); return; }
      if (users.find(u => u.email === email)) { setAuthError("Email already registered"); return; }
      if (password.length < 6) { setAuthError("Password must be at least 6 characters"); return; }
      const newUser = {
        id: "u" + uid(), username, email, passwordHash: password,
        plan: "free", role: "user",
        createdAt: new Date().toISOString(),
        apiKey: "kf_sk_" + uid() + uid(),
      };
      setUsers(u => [...u, newUser]);
      setCurrentUser(newUser);
      setView("dashboard");
    }
  };

  const handleLogout = () => { setCurrentUser(null); setView("landing"); setCurrentProject(null); };

  const handleNav = (v) => {
    if ((v === "dashboard" || v === "projects") && !currentUser) { setView("login"); setAuthMode("login"); return; }
    if (v === "login") { setAuthMode("login"); setAuthError(""); setView("auth"); return; }
    if (v === "register") { setAuthMode("register"); setAuthError(""); setView("auth"); return; }
    setView(v);
  };

  const handleCreateProject = (projectData) => {
    setProjects(p => [...p, projectData]);
    setCurrentProject(projectData);
    setWizardMode(false);
    setView("project");
  };

  const handleUpdateProject = (updated) => {
    setProjects(p => p.map(x => x.id === updated.id ? updated : x));
    setCurrentProject(updated);
  };

  const handleNewProject = () => {
    const userProjects = projects.filter(p => p.userId === currentUser?.id);
    if (currentUser?.plan === "free" && userProjects.length >= 1) {
      alert("Free plan: 1 project max. Upgrade to Premium for unlimited projects.");
      return;
    }
    setWizardMode(true);
  };

  const renderContent = () => {
    if (view === "landing") return <LandingPage onNav={handleNav} />;
    if (view === "auth") return (
      <AuthPage mode={authMode} onAuth={handleAuth}
        onSwitch={() => { setAuthMode(m => m === "login" ? "register" : "login"); setAuthError(""); }}
        error={authError} />
    );
    if (view === "docs") return <DocsPage />;

    if (!currentUser) { setView("auth"); return null; }

    if (wizardMode) return (
      <NewProjectWizard user={currentUser} onCreate={handleCreateProject} onCancel={() => setWizardMode(false)} />
    );

    if (view === "project" && currentProject) return (
      <ProjectIDE project={currentProject} onUpdate={handleUpdateProject} onBack={() => setView("dashboard")} />
    );

    return (
      <Dashboard
        user={currentUser}
        projects={projects}
        onNewProject={handleNewProject}
        onOpenProject={p => { setCurrentProject(p); setView("project"); }}
      />
    );
  };

  const showNav = view !== "project" || !currentProject;

  return (
    <>
      <GlobalStyle />
      {showNav && (
        <TopNav
          user={currentUser}
          onNav={handleNav}
          currentView={view}
          onLogout={handleLogout}
        />
      )}
      {renderContent()}
    </>
  );
}