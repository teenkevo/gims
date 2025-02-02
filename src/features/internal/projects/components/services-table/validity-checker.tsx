"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";

export default function ValidityChecker({ isValid }: { isValid: boolean }) {
  return (
    <motion.div
      className="inline-flex items-center px-3 py-1 font-medium text-xs rounded-md shadow-sm relative border"
      initial={{ borderColor: "var(--primary)", color: "var(--primary)" }}
      animate={{
        borderColor: isValid ? "#16A349" : "#ed2d2d",
        color: isValid ? "#16A349" : "#ed2d2d",
      }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-3 h-3 mr-1.5 relative">
        <AnimatePresence mode="wait">
          {isValid ? (
            <motion.div
              key="check"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <CheckCircle className="h-3 w-3" />
            </motion.div>
          ) : (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Loader2 className="h-3 w-3 animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.span
        initial={{ width: "auto" }}
        animate={{ width: "auto" }}
        transition={{ duration: 0.5 }}
      >
        {isValid
          ? "Validity confirmed"
          : "Checking validity. Fill all required fields"}
      </motion.span>
    </motion.div>
  );
}
