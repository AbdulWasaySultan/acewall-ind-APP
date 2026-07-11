import React from "react";
import { motion } from "framer-motion";

const VaultLoader = ({ loading }) => {
  return (
    <motion.div
      key="vault"
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex overflow-hidden pointer-events-none"
    >
      {/* Left Door */}
      <motion.div
        initial={{ x: 0 }}
        animate={!loading ? { x: "-100%" } : { x: 0 }}
        transition={{ duration: 1.5, ease: [0.7, 0, 0.2, 1] }}
        className="w-1/2 h-full bg-[#1a1a1a] border-r-4 border-[#333] flex items-center justify-end pointer-events-auto shadow-[20px_0_50px_rgba(0,0,0,0.5)] relative"
        style={{
          backgroundImage: "radial-gradient(circle at center, #2c2c2c 0%, #111 100%)",
        }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-black/30" />
      </motion.div>

      {/* Right Door */}
      <motion.div
        initial={{ x: 0 }}
        animate={!loading ? { x: "100%" } : { x: 0 }}
        transition={{ duration: 1.5, ease: [0.7, 0, 0.2, 1] }}
        className="w-1/2 h-full bg-[#1a1a1a] border-l-4 border-[#333] flex items-center justify-start pointer-events-auto shadow-[-20px_0_50px_rgba(0,0,0,0.5)] relative"
        style={{
          backgroundImage: "radial-gradient(circle at center, #2c2c2c 0%, #111 100%)",
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/30" />
      </motion.div>

      {/* Central Mechanical Wheel */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={!loading ? { scale: 0.8, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-[110] flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: loading ? 360 : 0 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="w-48 h-48 md:w-64 md:h-64 border-[12px] border-[#444] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,1)] bg-[#222]"
          >
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <div
                key={angle}
                className="absolute w-2 h-full bg-green-800 border-x border-white/5"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-8 bg-gradient-to-b from-[#555] to-[#222] rounded-full border border-white/10 shadow-lg" />
              </div>
            ))}
            <div className="w-20 h-20 md:w-28 md:h-28 bg-[#222] rounded-full border-4 border-[#444] shadow-inner flex items-center justify-center relative z-20">
              <div className="w-8 h-8 bg-green-600/20 rounded-full animate-pulse blur-md" />
              <div className="absolute w-4 h-4 bg-green-500 rounded-full shadow-[0_0_15px_#22c55e]" />
            </div>
          </motion.div>
        </motion.div>

        {/* Status Text */}
        <motion.div
          animate={{ y: loading ? 120 : 150, opacity: loading ? 1 : 0 }}
          className="absolute text-center mt-20"
        >
          <p className="text-green-500 font-mono tracking-[0.5em] text-sm md:text-base uppercase">
            {loading ? "Accessing Featured Topics..." : "Access Granted"}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VaultLoader;