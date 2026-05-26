"use client";

import { motion } from "framer-motion";

export default function DemoVideo() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-purple-200 bg-gradient-to-br from-[#faf5ff] to-white p-6">

      {/* Glow */}
      <motion.div
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
        className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-300 blur-3xl"
      />

      {/* Window */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1,
        }}
        className="relative z-10 mx-auto mt-10 w-full max-w-[700px] rounded-3xl border border-neutral-200 bg-white shadow-2xl"
      >
        {/* Top bar */}
        <div className="flex items-center gap-2 border-b p-4">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>

        {/* Code */}
        <div className="space-y-4 p-6 font-mono text-sm">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "80%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="h-4 rounded bg-purple-200"
          />

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "60%" }}
            transition={{
              duration: 2,
              delay: 0.3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="h-4 rounded bg-purple-100"
          />

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "90%" }}
            transition={{
              duration: 2,
              delay: 0.6,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="h-4 rounded bg-purple-200"
          />
        </div>
      </motion.div>

      {/* Floating AI Badge */}
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
        className="absolute bottom-10 right-10 z-20 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-xl"
      >
        AI Review Complete ✓
      </motion.div>
    </div>
  );
}