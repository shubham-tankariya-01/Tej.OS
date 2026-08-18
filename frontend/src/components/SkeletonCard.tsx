import React from 'react';

interface SkeletonCardProps {
    className?: string;
    height?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '', height = 'h-48' }) => (
    <div className={`${height} skeleton rounded-card ${className}`} />
);

export const SkeletonText: React.FC<{ width?: string; className?: string }> = ({ width = 'w-24', className = '' }) => (
    <div className={`h-3 skeleton rounded-full ${width} ${className}`} />
);

export default SkeletonCard;
