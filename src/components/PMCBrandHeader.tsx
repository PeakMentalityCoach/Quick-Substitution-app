import React from 'react';
import { motion } from 'framer-motion';

export function PMCBrandHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6"
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">PMC</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Peak Mentality Coach</h1>
            <p className="text-sm text-blue-100">Football Optimizer</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm">Powered by AI</p>
          <p className="text-xs text-blue-100">Optimize Your Game</p>
        </div>
      </div>
    </motion.div>
  );
}
