'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const images = [
  'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80', // Container Ship
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80', // Shipping Port
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80', // Airplane Cargo
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80', // Truck Logistics
];

export default function HeroBackground() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Slideshow Images */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${images[index]})` }}
        />
      </AnimatePresence>

      {/* Animated Gradient Glass Overlay */}
      <div className="absolute inset-0 bg-marine-900/30 backdrop-blur-[2px]"></div>
      
      {/* Dynamic Moving Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-marine-900/60 via-transparent to-brand-orange/20 mix-blend-overlay animate-gradient-xy"></div>
      
      {/* Darker overlay for text readability - Increased Opacity */}
      <div className="absolute inset-0 bg-black/50"></div>
    </div>
  );
}

