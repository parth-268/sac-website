import { motion } from "framer-motion";

export const PageBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-slate-50/50">
      {/* 1. Technical Grid Pattern (Subtle) */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 40%, black 70%, transparent)",
        }}
      />

      {/* 2. Ambient Orbs (Performance Optimized via Blur) */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] mix-blend-multiply" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] mix-blend-multiply" />
      <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[90px] mix-blend-multiply opacity-50" />

      {/* 3. Massive Watermark */}
      <div
        className="absolute -bottom-[5%] -right-[5%] font-black font-heading leading-none text-slate-900/[0.02] tracking-tighter"
        style={{
          fontSize: "25vw",
          zIndex: -1,
        }}
      >
        SAC
      </div>

      {/* 4. Cinematic Noise Overlay (Optional - adds texture) */}
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-repeat"
        style={{
          backgroundImage:
            "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      />
    </div>
  );
};
