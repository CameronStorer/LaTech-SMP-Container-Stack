'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
    images: string[];
    intervalMs?: number;
    /** Fill the entire parent as an absolutely-positioned background instead of a bordered box. */
    fill?: boolean;
    /** Randomize image order (per page load) instead of showing them in the given order. */
    shuffle?: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export default function Carousel({ images, intervalMs = 5000, fill = false, shuffle = false }: CarouselProps) {
    // Shuffle once per mount (client-side, so each page load gets a different order)
    // rather than re-shuffling on every render.
    const ordered = useMemo(() => (shuffle ? shuffleArray(images) : images), [images, shuffle]);
    const [index, setIndex] = useState(0);

    const next = useCallback(() => {
        setIndex((i) => (i + 1) % ordered.length);
    }, [ordered.length]);

    const prev = () => {
        setIndex((i) => (i - 1 + ordered.length) % ordered.length);
    };

    useEffect(() => {
        if (ordered.length <= 1) return;
        const timer = setInterval(next, intervalMs);
        return () => clearInterval(timer);
    }, [next, intervalMs, ordered.length]);

    const containerClasses = fill
        ? 'absolute inset-0'
        : 'relative w-full h-64 md:h-96 rounded-xl overflow-hidden border-2 border-[#E31B23]/50 shadow-2xl';

    if (ordered.length === 0) {
        if (fill) return null;
        return (
            <div className="flex items-center justify-center h-64 md:h-96 rounded-xl border-2 border-dashed border-gray-600 text-gray-400">
                <p>Screenshots coming soon!</p>
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            {/* Fills any space left empty by object-contain (letterboxing) with the tiled black-pixel texture
                instead of a flat color, so images show their full height without being cropped. */}
            <div className="absolute inset-0 tiled-bg-black" />

            {ordered.map((src, i) => (
                <div
                    key={src}
                    className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    <Image
                        src={src}
                        alt={`LA Tech SMP screenshot ${i + 1}`}
                        fill
                        sizes={fill ? '100vw' : '(max-width: 768px) 100vw, 800px'}
                        className="object-contain scale-[1.15]"
                        priority={i === 0}
                    />
                </div>
            ))}

            {ordered.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        aria-label="Previous photo"
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 transition z-30"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={next}
                        aria-label="Next photo"
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 transition z-30"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}
        </div>
    );
}
