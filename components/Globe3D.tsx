'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Globe2, MapPin, Ship } from 'lucide-react';

// ============================================
// PORT LOCATIONS - Same as before
// ============================================
const locations = [
    // Egypt & Middle East Hubs
    { id: 'port-said', nameAr: 'بورسعيد', nameEn: 'Port Said', lat: 31.2653, lon: 32.3019, type: 'hub' },
    { id: 'jebel-ali', nameAr: 'جبل علي', nameEn: 'Jebel Ali', lat: 24.9857, lon: 55.0275, type: 'hub' },
    { id: 'jeddah', nameAr: 'جدة', nameEn: 'Jeddah', lat: 21.4858, lon: 39.1925, type: 'hub' },
    
    // Asia Hubs
    { id: 'singapore', nameAr: 'سنغافورة', nameEn: 'Singapore', lat: 1.3521, lon: 103.8198, type: 'hub' },
    { id: 'shanghai', nameAr: 'شنغهاي', nameEn: 'Shanghai', lat: 31.2304, lon: 121.4737, type: 'hub' },
    { id: 'hong-kong', nameAr: 'هونغ كونغ', nameEn: 'Hong Kong', lat: 22.3193, lon: 114.1694, type: 'hub' },
    { id: 'busan', nameAr: 'بوسان', nameEn: 'Busan', lat: 35.1796, lon: 129.0756, type: 'hub' },
    { id: 'tokyo', nameAr: 'طوكيو', nameEn: 'Tokyo', lat: 35.6762, lon: 139.6503, type: 'port' },
    { id: 'mumbai', nameAr: 'مومباي', nameEn: 'Mumbai', lat: 19.0760, lon: 72.8777, type: 'hub' },
    
    // Europe Hubs
    { id: 'rotterdam', nameAr: 'روتردام', nameEn: 'Rotterdam', lat: 51.9244, lon: 4.4777, type: 'hub' },
    { id: 'hamburg', nameAr: 'هامبورغ', nameEn: 'Hamburg', lat: 53.5511, lon: 9.9937, type: 'hub' },
    { id: 'piraeus', nameAr: 'بيرايوس', nameEn: 'Piraeus', lat: 37.9475, lon: 23.6372, type: 'hub' },
    
    // Americas
    { id: 'new-york', nameAr: 'نيويورك', nameEn: 'New York', lat: 40.7128, lon: -74.0060, type: 'hub' },
    { id: 'los-angeles', nameAr: 'لوس أنجلوس', nameEn: 'Los Angeles', lat: 33.7405, lon: -118.2720, type: 'hub' },
    { id: 'santos', nameAr: 'سانتوس', nameEn: 'Santos', lat: -23.9608, lon: -46.3331, type: 'hub' },
];

// Major shipping routes
const routes = [
    // From Port Said
    { from: 'port-said', to: 'singapore', type: 'main' },
    { from: 'port-said', to: 'shanghai', type: 'main' },
    { from: 'port-said', to: 'rotterdam', type: 'main' },
    { from: 'port-said', to: 'mumbai', type: 'main' },
    { from: 'port-said', to: 'jebel-ali', type: 'main' },
    
    // From Jebel Ali
    { from: 'jebel-ali', to: 'singapore', type: 'main' },
    { from: 'jebel-ali', to: 'mumbai', type: 'main' },
    
    // Asia Network
    { from: 'shanghai', to: 'singapore', type: 'main' },
    { from: 'shanghai', to: 'busan', type: 'main' },
    { from: 'shanghai', to: 'los-angeles', type: 'main' },
    { from: 'singapore', to: 'hong-kong', type: 'main' },
    { from: 'hong-kong', to: 'los-angeles', type: 'main' },
    { from: 'busan', to: 'los-angeles', type: 'main' },
    { from: 'tokyo', to: 'los-angeles', type: 'main' },
    
    // Europe Network
    { from: 'rotterdam', to: 'new-york', type: 'main' },
    { from: 'hamburg', to: 'new-york', type: 'main' },
    
    // Trans routes
    { from: 'singapore', to: 'rotterdam', type: 'main' },
    { from: 'santos', to: 'singapore', type: 'main' },
];

// Stats
const stats = [
    { valueAr: '+50', valueEn: '50+', labelAr: 'دولة', labelEn: 'Countries' },
    { valueAr: '+100', valueEn: '100+', labelAr: 'ميناء', labelEn: 'Ports' },
    { valueAr: '+200', valueEn: '200+', labelAr: 'وكيل شحن', labelEn: 'Agents' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Convert lat/lon to 3D sphere coordinates
const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return new THREE.Vector3(x, y, z);
};

// Generate curve points for great circle route
const getGreatCirclePoints = (
    lat1: number, lon1: number,
    lat2: number, lon2: number,
    radius: number,
    segments: number = 50
): THREE.Vector3[] => {
    const points: THREE.Vector3[] = [];
    
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        
        // Spherical interpolation (slerp-like)
        const startVec = latLonToVector3(lat1, lon1, radius);
        const endVec = latLonToVector3(lat2, lon2, radius);
        
        const angle = startVec.angleTo(endVec);
        const sinAngle = Math.sin(angle);
        
        if (sinAngle === 0) {
            points.push(startVec.clone());
            continue;
        }
        
        const a = Math.sin((1 - t) * angle) / sinAngle;
        const b = Math.sin(t * angle) / sinAngle;
        
        const interpolated = new THREE.Vector3(
            a * startVec.x + b * endVec.x,
            a * startVec.y + b * endVec.y,
            a * startVec.z + b * endVec.z
        );
        
        // Normalize to sphere surface (add slight height for visibility)
        interpolated.normalize().multiplyScalar(radius + 0.02);
        points.push(interpolated);
    }
    
    return points;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function Globe3D() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [hoveredPort, setHoveredPort] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0e27);

        // Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 3;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);

        // Create Earth sphere
        const globeRadius = 1;
        const globeGeometry = new THREE.SphereGeometry(globeRadius, 128, 128);
        
        // Load Earth texture
        const textureLoader = new THREE.TextureLoader();
        
        // Create detailed canvas with Earth map
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');
        
        let earthTexture: THREE.Texture;
        
        if (ctx) {
            // Draw ocean (base) - darker blue for contrast
            const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            oceanGradient.addColorStop(0, '#1a3a5a');
            oceanGradient.addColorStop(0.5, '#1a4d7a');
            oceanGradient.addColorStop(1, '#1a3a5a');
            ctx.fillStyle = oceanGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Function to draw more accurate continents
            const drawContinent = (path: string, color: string) => {
                ctx.fillStyle = color;
                const p = new Path2D(path);
                ctx.fill(p);
            };
            
            // Set land color with gradient
            const landColor1 = '#2a5a3a';
            const landColor2 = '#3d7a4d';
            
            // Africa (more detailed shape)
            ctx.fillStyle = landColor1;
            ctx.beginPath();
            ctx.moveTo(2000, 900);
            ctx.bezierCurveTo(1950, 850, 1900, 800, 1950, 750);
            ctx.bezierCurveTo(2000, 700, 2100, 680, 2200, 700);
            ctx.bezierCurveTo(2300, 720, 2400, 780, 2450, 850);
            ctx.bezierCurveTo(2500, 920, 2480, 1000, 2450, 1100);
            ctx.bezierCurveTo(2420, 1200, 2380, 1300, 2300, 1400);
            ctx.bezierCurveTo(2220, 1450, 2140, 1480, 2050, 1450);
            ctx.bezierCurveTo(1960, 1420, 1900, 1350, 1880, 1250);
            ctx.bezierCurveTo(1860, 1150, 1900, 1050, 1950, 980);
            ctx.closePath();
            ctx.fill();
            
            // Europe
            ctx.fillStyle = landColor2;
            ctx.beginPath();
            ctx.moveTo(2000, 600);
            ctx.bezierCurveTo(2050, 580, 2150, 600, 2250, 620);
            ctx.bezierCurveTo(2300, 630, 2350, 650, 2380, 680);
            ctx.bezierCurveTo(2360, 720, 2320, 750, 2250, 760);
            ctx.bezierCurveTo(2180, 770, 2100, 760, 2050, 730);
            ctx.bezierCurveTo(2000, 700, 1980, 650, 2000, 600);
            ctx.closePath();
            ctx.fill();
            
            // Asia (large continent)
            ctx.fillStyle = landColor1;
            ctx.beginPath();
            ctx.moveTo(2400, 700);
            ctx.bezierCurveTo(2500, 680, 2650, 700, 2800, 750);
            ctx.bezierCurveTo(2950, 800, 3100, 850, 3200, 900);
            ctx.bezierCurveTo(3300, 950, 3350, 1000, 3350, 1050);
            ctx.bezierCurveTo(3350, 1100, 3300, 1150, 3200, 1150);
            ctx.bezierCurveTo(3100, 1150, 3000, 1120, 2900, 1080);
            ctx.bezierCurveTo(2800, 1040, 2700, 1000, 2600, 950);
            ctx.bezierCurveTo(2500, 900, 2450, 820, 2420, 750);
            ctx.closePath();
            ctx.fill();
            
            // India Peninsula
            ctx.fillStyle = landColor2;
            ctx.beginPath();
            ctx.moveTo(2700, 950);
            ctx.bezierCurveTo(2750, 1000, 2780, 1080, 2770, 1150);
            ctx.bezierCurveTo(2760, 1200, 2730, 1240, 2680, 1240);
            ctx.bezierCurveTo(2630, 1240, 2600, 1200, 2590, 1150);
            ctx.bezierCurveTo(2580, 1100, 2600, 1020, 2650, 970);
            ctx.closePath();
            ctx.fill();
            
            // Southeast Asia Islands
            ctx.fillStyle = landColor1;
            ctx.fillRect(2900, 1150, 150, 80);
            ctx.fillRect(3100, 1200, 200, 100);
            
            // North America
            ctx.fillStyle = landColor2;
            ctx.beginPath();
            ctx.moveTo(600, 500);
            ctx.bezierCurveTo(700, 450, 850, 480, 950, 550);
            ctx.bezierCurveTo(1050, 620, 1100, 720, 1100, 850);
            ctx.bezierCurveTo(1100, 980, 1050, 1100, 950, 1150);
            ctx.bezierCurveTo(850, 1200, 700, 1180, 600, 1100);
            ctx.bezierCurveTo(500, 1020, 450, 900, 480, 780);
            ctx.bezierCurveTo(510, 660, 550, 550, 600, 500);
            ctx.closePath();
            ctx.fill();
            
            // South America
            ctx.fillStyle = landColor1;
            ctx.beginPath();
            ctx.moveTo(1000, 1150);
            ctx.bezierCurveTo(1100, 1180, 1180, 1250, 1200, 1350);
            ctx.bezierCurveTo(1220, 1450, 1200, 1550, 1150, 1620);
            ctx.bezierCurveTo(1100, 1690, 1020, 1720, 950, 1700);
            ctx.bezierCurveTo(880, 1680, 820, 1620, 820, 1520);
            ctx.bezierCurveTo(820, 1420, 860, 1320, 920, 1250);
            ctx.bezierCurveTo(980, 1180, 950, 1150, 1000, 1150);
            ctx.closePath();
            ctx.fill();
            
            // Australia
            ctx.fillStyle = landColor2;
            ctx.beginPath();
            ctx.moveTo(3200, 1350);
            ctx.bezierCurveTo(3300, 1340, 3420, 1370, 3500, 1420);
            ctx.bezierCurveTo(3550, 1450, 3570, 1500, 3550, 1550);
            ctx.bezierCurveTo(3530, 1600, 3480, 1620, 3400, 1610);
            ctx.bezierCurveTo(3320, 1600, 3240, 1560, 3200, 1500);
            ctx.bezierCurveTo(3160, 1440, 3150, 1380, 3200, 1350);
            ctx.closePath();
            ctx.fill();
            
            // Antarctica (bottom)
            ctx.fillStyle = '#e8f4f8';
            ctx.fillRect(0, 1850, canvas.width, 198);
            
            // Add some detail texture to land
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = landColor2;
            for (let i = 0; i < 8000; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const size = Math.random() * 2 + 0.5;
                ctx.fillRect(x, y, size, size);
            }
            ctx.globalAlpha = 1.0;
            
            // Add latitude lines (subtle)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 200; i < canvas.height - 200; i += 250) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }
            
            // Add longitude lines (subtle)
            for (let i = 0; i < canvas.width; i += 341) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }
        }
        
        earthTexture = new THREE.CanvasTexture(canvas);
        earthTexture.needsUpdate = true;
        
        // Create bump map for terrain effect
        const bumpCanvas = document.createElement('canvas');
        bumpCanvas.width = 2048;
        bumpCanvas.height = 1024;
        const bumpCtx = bumpCanvas.getContext('2d');
        
        if (bumpCtx) {
            // Create noise for terrain
            bumpCtx.fillStyle = '#808080';
            bumpCtx.fillRect(0, 0, bumpCanvas.width, bumpCanvas.height);
            
            for (let i = 0; i < 10000; i++) {
                const x = Math.random() * bumpCanvas.width;
                const y = Math.random() * bumpCanvas.height;
                const brightness = Math.random() * 100 + 100;
                bumpCtx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
                bumpCtx.fillRect(x, y, 2, 2);
            }
        }
        
        const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
        
        // Earth material with texture and bump map
        const globeMaterial = new THREE.MeshPhongMaterial({
            map: earthTexture,
            bumpMap: bumpTexture,
            bumpScale: 0.02,
            specular: new THREE.Color(0x444444),
            shininess: 20,
        });
        
        const globe = new THREE.Mesh(globeGeometry, globeMaterial);
        scene.add(globe);

        // Add atmosphere glow
        const atmosphereGeometry = new THREE.SphereGeometry(globeRadius * 1.15, 64, 64);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.BackSide,
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(0.3, 0.6, 1.0, 0.7) * intensity;
                }
            `,
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphere);

        // Add a subtle grid overlay (removed the old land layer)
        // The texture now handles the land visualization

        // Add ports as glowing points
        const portsGroup = new THREE.Group();
        locations.forEach((loc) => {
            const position = latLonToVector3(loc.lat, loc.lon, globeRadius);
            
            // Port marker
            const markerGeometry = new THREE.SphereGeometry(loc.type === 'hub' ? 0.015 : 0.01, 16, 16);
            const markerMaterial = new THREE.MeshBasicMaterial({
                color: loc.type === 'hub' ? 0xf97316 : 0x0ea5e9,
            });
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.copy(position);
            portsGroup.add(marker);

            // Glow effect
            const glowGeometry = new THREE.SphereGeometry(loc.type === 'hub' ? 0.025 : 0.018, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: loc.type === 'hub' ? 0xf97316 : 0x0ea5e9,
                transparent: true,
                opacity: 0.3,
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.copy(position);
            portsGroup.add(glow);
        });
        scene.add(portsGroup);

        // Add shipping routes as curved lines
        const routesGroup = new THREE.Group();
        routes.forEach((route) => {
            const fromLoc = locations.find(l => l.id === route.from);
            const toLoc = locations.find(l => l.id === route.to);
            
            if (!fromLoc || !toLoc) return;

            const points = getGreatCirclePoints(
                fromLoc.lat, fromLoc.lon,
                toLoc.lat, toLoc.lon,
                globeRadius,
                50
            );

            const curve = new THREE.CatmullRomCurve3(points);
            const tubeGeometry = new THREE.TubeGeometry(curve, 50, 0.002, 8, false);
            const tubeMaterial = new THREE.MeshBasicMaterial({
                color: route.type === 'main' ? 0xf97316 : 0x0ea5e9,
                transparent: true,
                opacity: 0.6,
            });
            const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
            routesGroup.add(tube);

            // Add animated particles along routes
            const particleGeometry = new THREE.SphereGeometry(0.005, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: route.type === 'main' ? 0xffa500 : 0x00bfff,
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.userData = { curve, progress: Math.random() };
            routesGroup.add(particle);
        });
        scene.add(routesGroup);

        // Mouse interaction
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let rotationVelocity = { x: 0, y: 0 };
        const dampingFactor = 0.95;

        const onMouseDown = (e: MouseEvent) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            rotationVelocity.x = deltaY * 0.005;
            rotationVelocity.y = deltaX * 0.005;

            previousMousePosition = { x: e.clientX, y: e.clientY };
        };

        const onMouseUp = () => {
            isDragging = false;
        };

        // Touch support
        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 1) {
                isDragging = true;
                previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!isDragging || e.touches.length !== 1) return;

            const deltaX = e.touches[0].clientX - previousMousePosition.x;
            const deltaY = e.touches[0].clientY - previousMousePosition.y;

            rotationVelocity.x = deltaY * 0.005;
            rotationVelocity.y = deltaX * 0.005;

            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        };

        const onTouchEnd = () => {
            isDragging = false;
        };

        container.addEventListener('mousedown', onMouseDown);
        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseup', onMouseUp);
        container.addEventListener('touchstart', onTouchStart);
        container.addEventListener('touchmove', onTouchMove);
        container.addEventListener('touchend', onTouchEnd);

        // Zoom with mouse wheel
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            camera.position.z += e.deltaY * 0.001;
            camera.position.z = Math.max(1.5, Math.min(5, camera.position.z));
        };

        container.addEventListener('wheel', onWheel, { passive: false });

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Apply rotation with damping
            if (!isDragging) {
                rotationVelocity.x *= dampingFactor;
                rotationVelocity.y *= dampingFactor;
            }

            globe.rotation.x += rotationVelocity.x;
            globe.rotation.y += rotationVelocity.y;
            portsGroup.rotation.x = globe.rotation.x;
            portsGroup.rotation.y = globe.rotation.y;
            routesGroup.rotation.x = globe.rotation.x;
            routesGroup.rotation.y = globe.rotation.y;

            // Auto-rotate slowly if not interacting
            if (Math.abs(rotationVelocity.x) < 0.001 && Math.abs(rotationVelocity.y) < 0.001 && !isDragging) {
                globe.rotation.y += 0.001;
                portsGroup.rotation.y += 0.001;
                routesGroup.rotation.y += 0.001;
            }

            // Animate particles along routes
            routesGroup.children.forEach((child) => {
                if (child.userData.curve) {
                    child.userData.progress += 0.001;
                    if (child.userData.progress > 1) child.userData.progress = 0;
                    const point = child.userData.curve.getPoint(child.userData.progress);
                    child.position.copy(point);
                }
            });

            renderer.render(scene, camera);
        };

        animate();
        setIsLoading(false);

        // Handle resize
        const handleResize = () => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            container.removeEventListener('mousedown', onMouseDown);
            container.removeEventListener('mousemove', onMouseMove);
            container.removeEventListener('mouseup', onMouseUp);
            container.removeEventListener('touchstart', onTouchStart);
            container.removeEventListener('touchmove', onTouchMove);
            container.removeEventListener('touchend', onTouchEnd);
            container.removeEventListener('wheel', onWheel);
            window.removeEventListener('resize', handleResize);
            container.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return (
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-[#0a0e27] dark:to-[#0d1433] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-marine-100/30 via-transparent to-transparent dark:from-marine-800/20" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-brand-orange/5 via-transparent to-transparent" />
            </div>

            {/* Glowing orbs */}
            <motion.div 
                className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-brand-orange/5 dark:bg-brand-orange/10 rounded-full blur-[120px]"
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <motion.div 
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-marine-100 to-marine-50 dark:from-marine-800/60 dark:to-marine-800/40 backdrop-blur-sm border border-marine-200/50 dark:border-marine-700/50 text-marine-700 dark:text-marine-200 text-sm font-bold mb-6 shadow-lg shadow-marine-500/10"
                        whileHover={{ scale: 1.02 }}
                    >
                        <Globe2 className="w-4 h-4" />
                        <span>{isRTL ? 'شبكتنا العالمية' : 'Our Global Network'}</span>
                    </motion.div>
                    <h2 className="text-3xl md:text-5xl font-bold text-marine-900 dark:text-white mb-4">
                        {isRTL ? 'نصل إلى كل مكان' : 'We Reach Everywhere'}
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-marine-300 max-w-2xl mx-auto mb-4">
                        {isRTL
                            ? 'شبكة شركاء واسعة تغطي أكثر من 50 دولة حول العالم'
                            : 'Extensive partner network covering over 50 countries worldwide'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-marine-400">
                        {isRTL ? '🖱️ اسحب لتدوير الكرة الأرضية • مرر للتكبير' : '🖱️ Drag to rotate • Scroll to zoom'}
                    </p>
                </motion.div>

                {/* 3D Globe Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative aspect-[16/10] max-w-6xl mx-auto mb-16"
                >
                    <div className="rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 dark:from-[#0d1e36]/90 dark:to-[#0a1628]/90 border border-gray-700/30 dark:border-marine-700/30 p-4 md:p-8 backdrop-blur-xl overflow-hidden shadow-2xl shadow-marine-500/10 dark:shadow-marine-900/50 relative">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
                                    <p className="text-white font-medium">
                                        {isRTL ? 'جاري تحميل الكرة الأرضية...' : 'Loading Globe...'}
                                    </p>
                                </div>
                            </div>
                        )}
                        <div 
                            ref={containerRef} 
                            className="w-full h-full min-h-[500px] md:min-h-[600px] rounded-2xl overflow-hidden"
                            style={{ touchAction: 'none' }}
                        />
                    </div>

                    {/* Legend */}
                    <div className="absolute bottom-8 right-8 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 text-sm bg-slate-900/90 dark:bg-marine-900/90 backdrop-blur-xl px-4 py-3 rounded-xl border border-gray-700/50 dark:border-marine-700/50 shadow-lg">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-4 h-4 rounded-full bg-brand-orange" />
                                <motion.div
                                    className="absolute inset-0 w-4 h-4 rounded-full bg-brand-orange"
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>
                            <span className="text-white font-medium">
                                {isRTL ? 'مركز رئيسي' : 'Main Hub'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-marine-400" />
                            <span className="text-white font-medium">
                                {isRTL ? 'ميناء شريك' : 'Partner Port'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-0.5 bg-gradient-to-r from-brand-orange to-brand-orange/50 rounded" />
                            <span className="text-white font-medium">
                                {isRTL ? 'خط رئيسي' : 'Main Route'}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative group"
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 to-marine-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="relative p-6 rounded-2xl bg-white/50 dark:bg-marine-800/30 backdrop-blur-sm border border-gray-200/50 dark:border-marine-700/30">
                                <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-marine-900 to-marine-600 dark:from-white dark:to-marine-200 bg-clip-text text-transparent mb-2">
                                    {isRTL ? stat.valueAr : stat.valueEn}
                                </div>
                                <div className="text-gray-600 dark:text-marine-400 font-medium">
                                    {isRTL ? stat.labelAr : stat.labelEn}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
