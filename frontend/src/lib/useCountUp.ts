import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 to `target` over `duration` ms.
 * Used to make stat numbers count up on load, per ui.md §4 "Extraordinary" tier.
 */
export function useCountUp(target: number, duration = 600, delay = 0): number {
    const [current, setCurrent] = useState(0);
    const rafRef = useRef<number | null>(null);
    const startRef = useRef<number | null>(null);

    useEffect(() => {
        if (target === 0) { setCurrent(0); return; }

        const startTime = Date.now() + delay;

        const tick = () => {
            const now = Date.now();
            if (now < startTime) { rafRef.current = requestAnimationFrame(tick); return; }

            if (startRef.current === null) startRef.current = now;
            const elapsed = now - startRef.current;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCurrent(Math.round(eased * target));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            startRef.current = null;
        };
    }, [target, duration, delay]);

    return current;
}
