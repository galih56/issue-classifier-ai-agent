"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState } from "react";

export function Mermaid({ chart }: { chart: string }) {
  return <MermaidContent chart={chart} />;
}

const cache = new Map<string, Promise<unknown>>();

function cachePromise<T>(key: string, setPromise: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached) return cached as Promise<T>;

  const promise = setPromise();
  cache.set(key, promise);
  return promise;
}

function MermaidContent({ chart }: { chart: string }) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [scale, setScale] = useState(0.7);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    const renderSvg = async () => {
      const svg = await cachePromise(`${chart}-${resolvedTheme}`, async () => {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          fontFamily: "inherit",
          themeCSS: `
            margin: 1.5rem auto 0;
            .labelBkg { background-color: transparent !important; }
          `,
          theme: resolvedTheme === "dark" ? "dark" : "default",
          themeVariables: {
            edgeLabelBackground: resolvedTheme === "dark" ? "#1a1a1a" : "#d4d4d4",
          },
        });
        const { svg } = await mermaid.render(id, chart.replaceAll("\\n", "\n"));
        return svg;
      });
      setSvg(svg);
    };

    renderSvg();
  }, [chart, resolvedTheme, id]);

  const [initialAutoFitScale, setInitialAutoFitScale] = useState(0.6);
  const [ready, setReady] = useState(false);

  // Auto-fit diagram to container and store initial scale
  useEffect(() => {
    if (!svg) return; // only run when svg is available

    const timer = setTimeout(() => {
      if (svgRef.current && containerRef.current) {
        const svgElement = svgRef.current.querySelector("svg");
        if (svgElement) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const svgRect = svgElement.getBoundingClientRect();

          const scaleX = (containerRect.width * 0.6) / svgRect.width;
          const scaleY = (containerRect.height * 0.6) / svgRect.height;
          const fitScale = Math.min(scaleX, scaleY, 1);
          const autoFitScale = Math.max(fitScale, 0.1);

          setScale(autoFitScale);
          setInitialAutoFitScale(autoFitScale);
          setReady(true);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [svg]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventScroll = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(10, scale * delta));
      setScale(newScale);
    };

    container.addEventListener("wheel", preventScroll, { passive: false });

    return () => {
      container.removeEventListener("wheel", preventScroll);
    };
  }, [scale]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(10, prev * 1.2));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(0.1, prev / 1.2));
  };

  const resetView = () => {
    setScale(initialAutoFitScale);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="my-6">
      <div className="max-w-4xl mx-auto border rounded-lg overflow-hidden bg-background">
        <div
          ref={containerRef}
          className="relative overflow-hidden cursor-move select-none"
          style={{ height: "500px" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          role="application"
          aria-label="Interactive Mermaid diagram - use mouse to pan and scroll to zoom"
        >
          <div
            ref={svgRef}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: "center center",
              opacity: ready ? 1 : 0,
            }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Needed for mermaid SVG rendering
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-3 border-t bg-muted/50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Scroll to zoom • Drag to pan
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={zoomOut}
              className="p-2 bg-background border border-border hover:bg-muted rounded transition-colors hover:cursor-pointer"
              aria-label="Zoom out"
              title="Zoom out"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button
              type="button"
              onClick={zoomIn}
              className="p-2 bg-background border border-border hover:bg-muted rounded transition-colors hover:cursor-pointer"
              aria-label="Zoom in"
              title="Zoom in"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button
              type="button"
              onClick={resetView}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground border border-primary hover:bg-primary/90 transition-colors hover:cursor-pointer rounded"
              disabled={scale === initialAutoFitScale && pan.x === 0 && pan.y === 0}
            >
              Reset
            </button>
            <span className="text-sm text-muted-foreground ml-2">{Math.round(scale * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
