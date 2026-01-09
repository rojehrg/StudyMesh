/**
 * GraphLegend - Legend explaining node sizes and colors
 */

'use client';

import { motion } from 'framer-motion';

export function GraphLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg border border-coffee-foam p-3 text-xs"
    >
      <div className="space-y-2">
        {/* Node size */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-coffee-cortado" />
            <div className="w-3 h-3 rounded-full bg-coffee-cortado" />
            <div className="w-4 h-4 rounded-full bg-coffee-cortado" />
          </div>
          <span className="text-coffee-mocha">Expertise depth</span>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-coffee-cortado" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-500" />
          </div>
          <span className="text-coffee-mocha">Available now</span>
        </div>

        {/* Connection strength */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <div className="w-4 h-0.5 bg-coffee-cortado/20" />
            <div className="w-4 h-0.5 bg-coffee-cortado/40" />
            <div className="w-4 h-1 bg-coffee-cortado/60" />
          </div>
          <span className="text-coffee-mocha">Connection strength</span>
        </div>
      </div>
    </motion.div>
  );
}
