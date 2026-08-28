'use client';

import { useEffect, useRef, useState } from 'react';

interface Trophy {
    id: number;
    left: number; // vw
    delay: number; // s - negative so it's mid-fall immediately on load
    duration: number; // s
    size: number; // rem
    opacity: number;
}

interface ThrownTrophy {
    id: number;
    x: number; // px, scoop origin
    y: number; // px
    dx: number; // px, final horizontal offset - mirrors cursor's direction/speed at throw time
    dy: number; // px, final vertical offset (plus a bit of gravity drop baked in)
    rotate: number; // deg, tumble as it flies
    size: number; // rem
}

const TROPHY_COUNT = 18;
const MAX_THROWN_TROPHIES = 40;
const THROW_THROTTLE_MS = 55;
const THROWS_PER_BURST = 2; // a "scoop" tosses a small handful, not just one
const THROW_MULTIPLIER = 6; // scales raw per-tick mouse delta into a throw distance
const MAX_THROW_DISTANCE = 260; // px, clamps fast flicks from flinging trophies absurdly far
const THROW_DURATION_MS = 750;

function generateTrophies(): Trophy[] {
    return Array.from({ length: TROPHY_COUNT }, (_, i) => {
        const duration = 8 + Math.random() * 7;
        return {
            id: i,
            left: Math.random() * 100,
            // Negative delay = animation acts as if it already started that many seconds ago,
            // so trophies are scattered mid-fall the instant the page loads instead of all
            // starting from the top empty-handed.
            delay: -(Math.random() * duration),
            duration,
            size: 1 + Math.random() * 1.5,
            opacity: 0.15 + Math.random() * 0.25,
        };
    });
}

export default function TrophyRain() {
    const [trophies, setTrophies] = useState<Trophy[] | null>(null);
    const [thrownTrophies, setThrownTrophies] = useState<ThrownTrophy[]>([]);
    const lastThrowRef = useRef(0);
    const lastPosRef = useRef<{ x: number; y: number } | null>(null);
    const nextIdRef = useRef(0);

    useEffect(() => {
        setTrophies(generateTrophies());
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const prevPos = lastPosRef.current;
            lastPosRef.current = { x: e.clientX, y: e.clientY };
            if (!prevPos) return; // need a previous point to know direction/speed

            const rawDx = e.clientX - prevPos.x;
            const rawDy = e.clientY - prevPos.y;
            const speed = Math.hypot(rawDx, rawDy);
            if (speed < 2) return; // ignore near-stationary jitter

            const now = Date.now();
            if (now - lastThrowRef.current < THROW_THROTTLE_MS) return;
            lastThrowRef.current = now;

            // Throw direction/distance mirrors the cursor's own instantaneous velocity,
            // clamped so a fast flick doesn't send trophies flying unreasonably far.
            const scale = Math.min(THROW_MULTIPLIER, MAX_THROW_DISTANCE / speed);

            const newTrophies: ThrownTrophy[] = Array.from({ length: THROWS_PER_BURST }, () => {
                const variance = 0.8 + Math.random() * 0.4; // each trophy in the scoop varies a little
                return {
                    id: nextIdRef.current++,
                    x: e.clientX,
                    y: e.clientY,
                    dx: rawDx * scale * variance,
                    dy: rawDy * scale * variance,
                    rotate: (Math.random() - 0.5) * 260,
                    size: 0.9 + Math.random() * 0.7,
                };
            });

            setThrownTrophies((prev) => {
                const next = [...prev, ...newTrophies];
                return next.length > MAX_THROWN_TROPHIES ? next.slice(next.length - MAX_THROWN_TROPHIES) : next;
            });

            const idsToRemove = newTrophies.map((t) => t.id);
            setTimeout(() => {
                setThrownTrophies((prev) => prev.filter((t) => !idsToRemove.includes(t.id)));
            }, THROW_DURATION_MS + 50);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
            {trophies?.map((t) => (
                <span
                    key={t.id}
                    className="absolute animate-trophy-fall select-none"
                    style={{
                        left: `${t.left}vw`,
                        top: '-10vh',
                        fontSize: `${t.size}rem`,
                        opacity: t.opacity,
                        animationDelay: `${t.delay}s`,
                        animationDuration: `${t.duration}s`,
                    }}
                >
                    🏆
                </span>
            ))}

            {thrownTrophies.map((t) => (
                <span
                    key={t.id}
                    className="absolute select-none animate-trophy-throw"
                    style={
                        {
                            left: `${t.x}px`,
                            top: `${t.y}px`,
                            fontSize: `${t.size}rem`,
                            '--throw-dx': `${t.dx}px`,
                            '--throw-dy': `${t.dy}px`,
                            '--throw-rotate': `${t.rotate}deg`,
                        } as React.CSSProperties
                    }
                >
                    🏆
                </span>
            ))}
        </div>
    );
}
