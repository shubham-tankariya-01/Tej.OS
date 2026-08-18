import React from 'react';

interface RadialGaugeProps {
    /** 0–100 percentage to show */
    value: number;
    /** Outer radius in SVG units */
    size?: number;
    label?: string;
    sublabel?: string;
}

const STROKE = 10;

const RadialGauge: React.FC<RadialGaugeProps> = ({ value, size = 120, label, sublabel }) => {
    const r = (size / 2) - STROKE - 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * r;
    // We draw the arc from -90deg (top), going clockwise
    const fillAngle = Math.min(Math.max(value, 0), 100) / 100;
    const dashArray = circumference;
    const dashOffset = circumference * (1 - fillAngle);

    // Tick marks (like a clock face)
    const ticks = Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * 360 - 90; // start from top
        const rad = (angle * Math.PI) / 180;
        const isMajor = i % 6 === 0;
        const outerR = r + STROKE + (isMajor ? 5 : 3);
        const innerR = r + STROKE + 1;
        const x1 = cx + innerR * Math.cos(rad);
        const y1 = cy + innerR * Math.sin(rad);
        const x2 = cx + outerR * Math.cos(rad);
        const y2 = cy + outerR * Math.sin(rad);
        return { x1, y1, x2, y2, isMajor };
    });

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                {/* Tick marks */}
                {ticks.map((t, i) => (
                    <line
                        key={i}
                        x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                        stroke="#131313"
                        strokeWidth={t.isMajor ? 1.5 : 0.75}
                        strokeOpacity={0.25}
                        strokeLinecap="round"
                    />
                ))}

                {/* Track ring */}
                <circle
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke="#131313"
                    strokeWidth={STROKE}
                    strokeOpacity={0.1}
                />

                {/* Progress arc — coral, starts from top (-90deg transform) */}
                <circle
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke="#F2694A"
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    transform={`rotate(-90 ${cx} ${cy})`}
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                />

                {/* Center value */}
                <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle"
                    fontSize={size * 0.22} fontWeight="700" fill="#131313" fontFamily="Space Grotesk, sans-serif">
                    {Math.round(value)}%
                </text>
                {sublabel && (
                    <text x={cx} y={cy + size * 0.15} textAnchor="middle" dominantBaseline="middle"
                        fontSize={size * 0.1} fill="#131313" fillOpacity={0.55} fontFamily="Space Grotesk, sans-serif">
                        {sublabel}
                    </text>
                )}
            </svg>
            {label && <p className="text-xs font-bold text-text-on-color mt-1 uppercase tracking-wide opacity-60">{label}</p>}
        </div>
    );
};

export default RadialGauge;
