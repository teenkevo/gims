"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function CopyableInput({ inputValue }: { inputValue: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(inputValue)
      .then(() => {
        setCopied(true);
        toast("✅ Copied", {
          description: "Copied to clipboard",
        });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast("❌ Failed!", {
          description: "Failed to copy",
        });
      });
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className="max-w-lg">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Enter text to copy"
          value={inputValue}
          className="flex-grow text-[0.80rem]"
          readOnly
        />
        <Button
          size="icon"
          variant="outline"
          onClick={handleCopy}
          aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
          className="relative"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={copied ? "check" : "copy"}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </motion.div>
          </AnimatePresence>
        </Button>
      </div>
    </div>
  );
}
