"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { useEffect, useRef, useState, type ComponentProps } from "react";

type Props = ComponentProps<typeof PDFViewer>;

export default function AppPdfViewer({
  children,
  width = "100%",
  height,
  className,
  style,
  ...props
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState(
    typeof height === "number" ? height : 0
  );
  const shouldMeasure = typeof height !== "number";

  useEffect(() => {
    if (!shouldMeasure) {
      if (typeof height === "number") setMeasuredHeight(height);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const update = () =>
      setMeasuredHeight(Math.max(0, Math.floor(el.clientHeight)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [height, shouldMeasure]);

  const iframeHeight = typeof height === "number" ? height : measuredHeight;

  return (
    <div ref={containerRef} className={className ?? "h-full min-h-0 w-full"}>
      {iframeHeight > 0 ? (
        <PDFViewer
          width={width}
          height={iframeHeight}
          style={{ border: "none", display: "block", ...style }}
          {...props}
        >
          {children}
        </PDFViewer>
      ) : null}
    </div>
  );
}
