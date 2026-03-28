'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { ShipData } from '@/lib/mock-ship-data';

// تحويل lat/lng إلى SVG coordinates
const SVG_WIDTH = 2000;
const SVG_HEIGHT = 857;
const MAP_CENTER_X = 1000;
const MAP_SCALE_X = 5.11;

const LAT_KNOTS = [
    { lat: 70, y: 65 },
    { lat: 66.5, y: 84 },
    { lat: 51.5, y: 175 },
    { lat: 33, y: 288 },
    { lat: 0, y: 505 },
    { lat: -18, y: 644 },
    { lat: -34, y: 740 },
    { lat: -41, y: 780 },
    { lat: -52, y: 836 },
    { lat: -60, y: 855 },
];

const interpolateY = (lat: number) => {
    const safeLat = Math.max(-85, Math.min(85, lat));
    for (let i = 0; i < LAT_KNOTS.length - 1; i++) {
        const p1 = LAT_KNOTS[i];
        const p2 = LAT_KNOTS[i + 1];
        if ((safeLat <= p1.lat && safeLat >= p2.lat) || (safeLat >= p1.lat && safeLat <= p2.lat)) {
            const ratio = (safeLat - p1.lat) / (p2.lat - p1.lat);
            return p1.y + ratio * (p2.y - p1.y);
        }
    }
    return safeLat > 0 ? 50 : 850;
};

const project = (lat: number, lon: number) => {
    const x = MAP_CENTER_X + (lon * MAP_SCALE_X);
    const y = interpolateY(lat);
    return { x, y };
};

interface LiveShipProps {
    ship: ShipData;
    onHover?: () => void;
    onLeave?: () => void;
    isHovered?: boolean;
}

export function LiveShip({ ship, onHover, onLeave, isHovered = false }: LiveShipProps) {
    const { x, y } = project(ship.position.lat, ship.position.lng);
    
    // تحديد اللون حسب نوع السفينة
    const getShipColor = () => {
        if (ship.type.includes('Container')) return '#f97316'; // برتقالي
        if (ship.type.includes('Tanker')) return '#dc2626';    // أحمر
        if (ship.type.includes('Bulk')) return '#059669';      // أخضر
        return '#0ea5e9'; // أزرق افتراضي
    };
    
    const shipColor = getShipColor();
    const shipSize = ship.type.includes('Container') ? 8 : ship.type.includes('Tanker') ? 7 : 6;
    
    return (
        <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: isHovered ? 1.5 : 1 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            style={{ cursor: 'pointer' }}
        >
            {/* Wake effect (أثر الموجة خلف السفينة) */}
            <motion.ellipse
                cx={x}
                cy={y + shipSize / 2}
                rx={shipSize * 0.6}
                ry={shipSize * 1.2}
                fill="rgba(255, 255, 255, 0.15)"
                style={{ transformOrigin: `${x}px ${y}px` }}
                animate={{
                    opacity: [0.2, 0.05, 0.2],
                    scaleY: [1, 1.3, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            />
            
            {/* Glow effect */}
            {isHovered && (
                <motion.circle
                    cx={x}
                    cy={y}
                    r={shipSize * 2}
                    fill={shipColor}
                    opacity={0.2}
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0, 0.2]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity
                    }}
                />
            )}
            
            {/* Ship icon - شكل السفينة */}
            <motion.g
                style={{
                    transformOrigin: `${x}px ${y}px`,
                }}
                animate={{
                    rotate: ship.heading || ship.course
                }}
                transition={{ duration: 0.5 }}
            >
                {/* Ship body */}
                <path
                    d={`M${x},${y - shipSize} 
                        L${x + shipSize * 0.5},${y + shipSize * 0.3}
                        L${x + shipSize * 0.5},${y + shipSize * 0.7}
                        L${x - shipSize * 0.5},${y + shipSize * 0.7}
                        L${x - shipSize * 0.5},${y + shipSize * 0.3}
                        Z`}
                    fill={shipColor}
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 1 : 0.5}
                    filter={isHovered ? 'url(#shipGlow)' : undefined}
                />
                
                {/* Ship bridge/superstructure */}
                <rect
                    x={x - shipSize * 0.25}
                    y={y - shipSize * 0.3}
                    width={shipSize * 0.5}
                    height={shipSize * 0.4}
                    fill={shipColor}
                    stroke="#ffffff"
                    strokeWidth={0.3}
                    opacity={0.8}
                />
                
                {/* Direction indicator (bow) */}
                <circle
                    cx={x}
                    cy={y - shipSize * 0.9}
                    r={shipSize * 0.15}
                    fill="#ffffff"
                    opacity={0.9}
                />
            </motion.g>
            
            {/* Ship name (يظهر عند hover) */}
            {isHovered && (
                <motion.g
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Background for text */}
                    <rect
                        x={x - 40}
                        y={y - shipSize * 2 - 12}
                        width={80}
                        height={20}
                        fill="rgba(0, 0, 0, 0.8)"
                        rx={4}
                    />
                    
                    {/* Ship name */}
                    <text
                        x={x}
                        y={y - shipSize * 2}
                        fontSize="8"
                        fill="#ffffff"
                        textAnchor="middle"
                        fontWeight="bold"
                        className="pointer-events-none"
                    >
                        {ship.name.length > 15 ? ship.name.substring(0, 15) + '...' : ship.name}
                    </text>
                    
                    {/* Speed indicator */}
                    <text
                        x={x}
                        y={y - shipSize * 2 + 10}
                        fontSize="6"
                        fill="#4ade80"
                        textAnchor="middle"
                        className="pointer-events-none"
                    >
                        {ship.speed.toFixed(1)} kts
                    </text>
                </motion.g>
            )}
            
            {/* Moving dot indicator */}
            <motion.circle
                cx={x}
                cy={y}
                r={2}
                fill="#ffffff"
                animate={{
                    opacity: [1, 0.3, 1],
                    scale: [1, 1.5, 1]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            />
        </motion.g>
    );
}

// Ship info card component
interface ShipInfoCardProps {
    ship: ShipData;
    isRTL?: boolean;
}

export function ShipInfoCard({ ship, isRTL = false }: ShipInfoCardProps) {
    const formatETA = (eta: string) => {
        const date = new Date(eta);
        return date.toLocaleString(isRTL ? 'ar-EG' : 'en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[400px] max-w-[90vw]"
        >
            <div className="bg-gradient-to-br from-slate-900/98 to-slate-800/98 backdrop-blur-xl rounded-2xl border border-orange-500/30 shadow-2xl shadow-orange-500/20 p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">
                            {ship.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                            {ship.type} • {ship.flag}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <span className="text-2xl">🚢</span>
                    </div>
                </div>
                
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">
                            {isRTL ? 'الوجهة' : 'Destination'}
                        </p>
                        <p className="text-sm font-semibold text-white">
                            {ship.destination}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">
                            {isRTL ? 'وقت الوصول' : 'ETA'}
                        </p>
                        <p className="text-sm font-semibold text-green-400">
                            {formatETA(ship.eta)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">
                            {isRTL ? 'السرعة' : 'Speed'}
                        </p>
                        <p className="text-sm font-semibold text-white">
                            {ship.speed.toFixed(1)} {isRTL ? 'عقدة' : 'knots'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">
                            {isRTL ? 'الاتجاه' : 'Course'}
                        </p>
                        <p className="text-sm font-semibold text-white">
                            {ship.course}°
                        </p>
                    </div>
                </div>
                
                {/* Ship Specs */}
                <div className="border-t border-gray-700/50 pt-4 mb-4">
                    <p className="text-xs text-gray-500 mb-2">
                        {isRTL ? 'المواصفات' : 'Specifications'}
                    </p>
                    <div className="flex gap-4 text-xs">
                        <span className="text-gray-400">
                            {isRTL ? 'الطول:' : 'Length:'} <span className="text-white font-medium">{ship.length}m</span>
                        </span>
                        <span className="text-gray-400">
                            {isRTL ? 'العرض:' : 'Width:'} <span className="text-white font-medium">{ship.width}m</span>
                        </span>
                        <span className="text-gray-400">
                            {isRTL ? 'الغاطس:' : 'Draught:'} <span className="text-white font-medium">{ship.draught}m</span>
                        </span>
                    </div>
                </div>
                
                {/* IDs */}
                <div className="flex gap-4 text-xs">
                    <span className="text-gray-500">
                        MMSI: <span className="text-gray-300 font-mono">{ship.mmsi}</span>
                    </span>
                    <span className="text-gray-500">
                        IMO: <span className="text-gray-300 font-mono">{ship.imo}</span>
                    </span>
                </div>
                
                {/* Live indicator */}
                <div className="mt-4 flex items-center gap-2 text-xs">
                    <motion.div
                        className="w-2 h-2 rounded-full bg-green-500"
                        animate={{
                            opacity: [1, 0.3, 1],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity
                        }}
                    />
                    <span className="text-gray-400">
                        {isRTL ? 'تحديث مباشر' : 'Live tracking'}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
