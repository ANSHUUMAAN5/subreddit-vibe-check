"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { SentimentResult } from "@/types/reddit";
import PostRow from "./PostRow";

export default function PostList({ results }: { results: SentimentResult[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rows = containerRef.current?.querySelectorAll("[data-post-row]");
      if (!rows || rows.length === 0) return;
      gsap.fromTo(
        rows,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.03,
        }
      );
    },
    { scope: containerRef, dependencies: [results] }
  );

  return (
    <div ref={containerRef} className="flex flex-col">
      {results.map((result, i) => (
        <PostRow key={result.post.id} result={result} rank={i + 1} />
      ))}
    </div>
  );
}
