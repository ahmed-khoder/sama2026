'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, useTexture } from '@react-three/drei';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Globe2 } from 'lucide-react';
import * as THREE from 'three';

// PORT LOCATIONS - Major Global Shipping Hubs
const locations = [
    // Egypt & Middle East Hubs
    { id: 'port-said', nameAr: 'بورسعيد', nameEn: 'Port Said', lat: 31.2653, lng: 32.3019, type: 'hub' },
    { id: 'jebel-ali', nameAr: 'جبل علي', nameEn: 'Jebel Ali', lat: 24.9857, lng: 55.0275, type: 'hub' },
    { id: 'jeddah', nameAr: 'جدة', nameEn: 'Jeddah', lat: 21.4858, lng: 39.1925, type: 'hub' },
    { id: 'alexandria', nameAr: 'الإسكندرية', nameEn: 'Alexandria', lat: 31.2001, lng: 29.9187, type: 'hub' },
    { id: 'suez', nameAr: 'السويس', nameEn: 'Suez', lat: 29.9668, lng: 32.5498, type: 'port' },

    // Asia Major Hubs
    { id: 'singapore', nameAr: 'سنغافورة', nameEn: 'Singapore', lat: 1.3521, lng: 103.8198, type: 'hub' },
    { id: 'shanghai', nameAr: 'شنغهاي', nameEn: 'Shanghai', lat: 31.2304, lng: 121.4737, type: 'hub' },
    { id: 'hong-kong', nameAr: 'هونغ كونغ', nameEn: 'Hong Kong', lat: 22.3193, lng: 114.1694, type: 'hub' },
    { id: 'shenzhen', nameAr: 'شنجن', nameEn: 'Shenzhen', lat: 22.5431, lng: 114.0579, type: 'hub' },
    { id: 'busan', nameAr: 'بوسان', nameEn: 'Busan', lat: 35.1796, lng: 129.0756, type: 'hub' },
    { id: 'tokyo', nameAr: 'طوكيو', nameEn: 'Tokyo', lat: 35.6762, lng: 139.6503, type: 'port' },
    { id: 'mumbai', nameAr: 'مومباي', nameEn: 'Mumbai', lat: 19.0760, lng: 72.8777, type: 'hub' },
    { id: 'colombo', nameAr: 'كولومبو', nameEn: 'Colombo', lat: 6.9271, lng: 79.8612, type: 'hub' },
    { id: 'chennai', nameAr: 'تشيناي', nameEn: 'Chennai', lat: 13.0827, lng: 80.2707, type: 'port' },

    // Europe Hubs
    { id: 'rotterdam', nameAr: 'روتردام', nameEn: 'Rotterdam', lat: 51.9244, lng: 4.4777, type: 'hub' },
    { id: 'hamburg', nameAr: 'هامبورغ', nameEn: 'Hamburg', lat: 53.5511, lng: 9.9937, type: 'hub' },
    { id: 'antwerp', nameAr: 'أنتويرب', nameEn: 'Antwerp', lat: 51.2194, lng: 4.4025, type: 'hub' },
    { id: 'piraeus', nameAr: 'بيرايوس', nameEn: 'Piraeus', lat: 37.9475, lng: 23.6372, type: 'hub' },
    { id: 'istanbul', nameAr: 'إسطنبول', nameEn: 'Istanbul', lat: 41.0082, lng: 28.9784, type: 'hub' },
    { id: 'genoa', nameAr: 'جنوة', nameEn: 'Genoa', lat: 44.4056, lng: 8.9463, type: 'port' },
    { id: 'barcelona', nameAr: 'برشلونة', nameEn: 'Barcelona', lat: 41.3851, lng: 2.1734, type: 'port' },

    // Americas
    { id: 'new-york', nameAr: 'نيويورك', nameEn: 'New York', lat: 40.7128, lng: -74.0060, type: 'hub' },
    { id: 'los-angeles', nameAr: 'لوس أنجلوس', nameEn: 'Los Angeles', lat: 33.7405, lng: -118.2720, type: 'hub' },
    { id: 'long-beach', nameAr: 'لونغ بيتش', nameEn: 'Long Beach', lat: 33.7701, lng: -118.1937, type: 'port' },
    { id: 'santos', nameAr: 'سانتوس', nameEn: 'Santos', lat: -23.9608, lng: -46.3331, type: 'hub' },
    { id: 'savannah', nameAr: 'سافانا', nameEn: 'Savannah', lat: 32.0809, lng: -81.0912, type: 'port' },

    // Africa
    { id: 'durban', nameAr: 'ديربان', nameEn: 'Durban', lat: -29.8587, lng: 31.0218, type: 'port' },
    { id: 'cape-town', nameAr: 'كيب تاون', nameEn: 'Cape Town', lat: -33.9249, lng: 18.4241, type: 'port' },
];

// Maritime waypoints for realistic ocean routes
const maritimeWaypoints: { [key: string]: { lat: number; lng: number } } = {
    'suez-south': { lat: 29.9, lng: 32.5 },
    'bab-el-mandeb': { lat: 12.5, lng: 43.5 },
    'arabian-sea': { lat: 15.0, lng: 65.0 },
    'indian-ocean': { lat: 0.0, lng: 75.0 },
    'malacca-strait': { lat: 1.5, lng: 104.0 },
    'south-china-sea': { lat: 12.0, lng: 114.0 },
    'med-center': { lat: 36.0, lng: 18.0 },
    'gibraltar': { lat: 36.0, lng: -5.5 },
    'mid-atlantic': { lat: 35.0, lng: -40.0 },
    'atlantic-europe': { lat: 45.0, lng: -10.0 },
    'pacific-west': { lat: 25.0, lng: 155.0 },
    'pacific-center': { lat: 30.0, lng: -170.0 },
    'pacific-east': { lat: 30.0, lng: -140.0 },
    'cape-hope': { lat: -35.0, lng: 18.0 },
    'indian-south': { lat: -20.0, lng: 60.0 },
};

// Convert lat/lng to 3D coordinates
function latLngToVector3(lat: number, lng: number, radius: number = 2.02) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

// Great circle interpolation
function getGreatCirclePoints(start: THREE.Vector3, end: THREE.Vector3, segments: number = 50) {
    const points: THREE.Vector3[] = [];

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const point = new THREE.Vector3();

        // Spherical interpolation (SLERP)
        const angle = start.angleTo(end);
        const sinAngle = Math.sin(angle);

        if (sinAngle < 0.001) {
            point.copy(start);
        } else {
            const ratioA = Math.sin((1 - t) * angle) / sinAngle;
            const ratioB = Math.sin(t * angle) / sinAngle;

            point.x = ratioA * start.x + ratioB * end.x;
            point.y = ratioA * start.y + ratioB * end.y;
            point.z = ratioA * start.z + ratioB * end.z;
        }

        points.push(point.clone().normalize().multiplyScalar(2.02));
    }

    return points;
}

// Helper function to create route with waypoints
const createRoute = (from: string, to: string, waypoints: string[] = []) => {
    const fromLoc = locations.find(l => l.id === from);
    const toLoc = locations.find(l => l.id === to);

    if (!fromLoc || !toLoc) return null;

    const coords = [
        { lat: fromLoc.lat, lng: fromLoc.lng },
        ...waypoints.map(wp => ({ lat: maritimeWaypoints[wp].lat, lng: maritimeWaypoints[wp].lng })),
        { lat: toLoc.lat, lng: toLoc.lng }
    ];

    return {
        from,
        to,
        coords
    };
};

// Major shipping routes (selecting key routes only for performance)
const routes = [
    // From Port Said (Suez Canal Hub) - 8 routes
    createRoute('port-said', 'singapore', ['suez-south', 'bab-el-mandeb', 'arabian-sea', 'indian-ocean', 'malacca-strait']),
    createRoute('port-said', 'shanghai', ['suez-south', 'bab-el-mandeb', 'arabian-sea', 'indian-ocean', 'malacca-strait', 'south-china-sea']),
    createRoute('port-said', 'rotterdam', ['med-center', 'gibraltar', 'atlantic-europe']),
    createRoute('port-said', 'mumbai', ['suez-south', 'bab-el-mandeb', 'arabian-sea']),
    createRoute('port-said', 'jebel-ali', ['suez-south', 'bab-el-mandeb']),

    // From Jebel Ali - 4 routes
    createRoute('jebel-ali', 'singapore', ['arabian-sea', 'indian-ocean', 'malacca-strait']),
    createRoute('jebel-ali', 'shanghai', ['arabian-sea', 'indian-ocean', 'malacca-strait', 'south-china-sea']),

    // Asia Major Hub Routes - 8 routes
    createRoute('singapore', 'shanghai', ['south-china-sea']),
    createRoute('singapore', 'hong-kong', ['south-china-sea']),
    createRoute('singapore', 'rotterdam', ['malacca-strait', 'indian-ocean', 'arabian-sea', 'bab-el-mandeb', 'suez-south', 'med-center', 'gibraltar', 'atlantic-europe']),

    // Trans-Pacific - 6 routes
    createRoute('shanghai', 'los-angeles', ['pacific-west', 'pacific-center', 'pacific-east']),
    createRoute('hong-kong', 'los-angeles', ['pacific-west', 'pacific-center', 'pacific-east']),
    createRoute('busan', 'los-angeles', ['pacific-west', 'pacific-center', 'pacific-east']),

    // Europe Network - 4 routes
    createRoute('rotterdam', 'new-york', ['mid-atlantic']),
    createRoute('rotterdam', 'piraeus', ['gibraltar', 'med-center']),

    // Americas - 3 routes
    createRoute('santos', 'singapore', ['cape-hope', 'indian-south', 'indian-ocean', 'malacca-strait']),
    createRoute('santos', 'rotterdam', ['mid-atlantic', 'atlantic-europe']),
].filter(Boolean);

// Earth component
function Earth() {
    const meshRef = useRef<THREE.Mesh>(null);

    // Load textures
    const [colorMap, bumpMap] = useTexture([
        '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
        '//unpkg.com/three-globe/example/img/earth-topology.png'
    ]);

    // Rotate earth slowly
    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.001;
        }
    });

    return (
        <Sphere ref={meshRef} args={[2, 64, 64]}>
            <meshStandardMaterial
                map={colorMap}
                bumpMap={bumpMap}
                bumpScale={0.05}
            />
        </Sphere>
    );
}

// Port Point component
function PortPoint({ location }: { location: typeof locations[0] }) {
    const position = latLngToVector3(location.lat, location.lng);
    const isHub = location.type === 'hub';
    const meshRef = useRef<THREE.Mesh>(null);

    // Pulsing animation for hubs
    useFrame((state) => {
        if (meshRef.current && isHub) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
            meshRef.current.scale.setScalar(scale);
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[isHub ? 0.02 : 0.012, 16, 16]} />
            <meshBasicMaterial
                color={isHub ? '#ff6b35' : '#0ea5e9'}
                transparent
                opacity={0.9}
            />
        </mesh>
    );
}

// Animated Shipping Route
function AnimatedRoute({ route, index }: { route: any; index: number }) {
    const lineRef = useRef<THREE.Line>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const points = useMemo(() => {
        const allPoints: THREE.Vector3[] = [];

        for (let i = 0; i < route.coords.length - 1; i++) {
            const start = latLngToVector3(route.coords[i].lat, route.coords[i].lng);
            const end = latLngToVector3(route.coords[i + 1].lat, route.coords[i + 1].lng);
            const segmentPoints = getGreatCirclePoints(start, end, 30);
            allPoints.push(...segmentPoints);
        }

        return allPoints;
    }, [route]);

    const geometry = useMemo(() => {
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        return geom;
    }, [points]);

    // Custom shader for animated flowing effect
    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color('#f97316') },
                color2: { value: new THREE.Color('#ff6b35') },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec2 vUv;
                
                void main() {
                    float pattern = mod(vUv.x * 10.0 - time * 2.0, 1.0);
                    float alpha = smoothstep(0.0, 0.2, pattern) * smoothstep(1.0, 0.8, pattern);
                    vec3 color = mix(color1, color2, vUv.x);
                    gl_FragColor = vec4(color, alpha * 0.8);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
        });
    }, []);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.time.value = state.clock.elapsedTime + index * 0.5;
        }
    });

    return (
        // @ts-ignore - R3F <line> maps to Three.js Line, not SVG line
        <line ref={lineRef} geometry={geometry}>
            <primitive ref={materialRef} object={shaderMaterial} attach="material" />
        </line>
    );
}

// Globe Scene
function GlobeScene() {
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 3, 5]} intensity={0.8} />
            <pointLight position={[-5, -3, -5]} intensity={0.4} color="#4a90e2" />

            {/* Earth */}
            <Earth />

            {/* Ports */}
            {locations.map((location) => (
                <PortPoint key={location.id} location={location} />
            ))}

            {/* Routes */}
            {routes.map((route, index) => (
                route && <AnimatedRoute key={`${route.from}-${route.to}-${index}`} route={route} index={index} />
            ))}

            {/* Atmosphere glow */}
            <Sphere args={[2.1, 64, 64]}>
                <meshBasicMaterial
                    color="#4a90e2"
                    transparent
                    opacity={0.1}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Controls */}
            <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={3}
                maxDistance={8}
                autoRotate
                autoRotateSpeed={0.5}
            />
        </>
    );
}

// Stats
const stats = [
    { valueAr: '+50', valueEn: '50+', labelAr: 'دولة', labelEn: 'Countries' },
    { valueAr: '+100', valueEn: '100+', labelAr: 'ميناء', labelEn: 'Ports' },
    { valueAr: '+200', valueEn: '200+', labelAr: 'وكيل شحن', labelEn: 'Agents' },
];

export default function ProfessionalGlobe() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

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
                        {isRTL ? '🖱️ اسحب لتدوير • مرر للتكبير • شاهد حركة السفن المستمرة 🚢' : '🖱️ Drag to rotate • Scroll to zoom • Watch live shipping activity 🚢'}
                    </p>
                </motion.div>

                {/* Globe Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative aspect-[16/10] max-w-6xl mx-auto mb-16"
                >
                    <div className="rounded-3xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 dark:from-[#0d1e36]/70 dark:to-[#0a1628]/70 border border-gray-700/30 dark:border-marine-700/30 p-4 md:p-8 backdrop-blur-xl overflow-hidden shadow-2xl shadow-marine-500/10 dark:shadow-marine-900/50 relative">
                        <div className="w-full h-full min-h-[500px] md:min-h-[600px] rounded-2xl overflow-hidden">
                            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                                <Suspense fallback={null}>
                                    <GlobeScene />
                                </Suspense>
                            </Canvas>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="absolute bottom-8 right-8 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 text-sm bg-slate-900/90 dark:bg-marine-900/90 backdrop-blur-xl px-5 py-3.5 rounded-xl border border-orange-500/30 shadow-xl shadow-orange-500/20">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-4 h-4 rounded-full bg-orange-500" />
                                <motion.div
                                    className="absolute inset-0 w-4 h-4 rounded-full bg-orange-400"
                                    animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            </div>
                            <span className="text-white font-medium">
                                {isRTL ? 'مركز رئيسي' : 'Main Hub'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-400" />
                            <span className="text-white font-medium">
                                {isRTL ? 'ميناء شريك' : 'Partner Port'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-8 h-1 rounded-full overflow-hidden bg-orange-900/30">
                                <motion.div
                                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-orange-400 to-transparent"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                />
                            </div>
                            <span className="text-white font-medium">
                                {isRTL ? 'سفينة متحركة' : 'Active Ship'}
                            </span>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="absolute top-8 left-8 bg-slate-900/90 dark:bg-marine-900/90 backdrop-blur-xl px-4 py-3 rounded-xl border border-orange-500/30 text-sm text-white max-w-xs shadow-lg shadow-orange-500/20">
                        <p className="font-semibold mb-2 flex items-center gap-2">
                            <span className="text-xl">🚢</span>
                            {isRTL ? 'حركة الشحن المباشرة' : 'Live Shipping Activity'}
                        </p>
                        <ul className="space-y-1 text-xs text-gray-300">
                            <li className="flex items-center gap-1.5">
                                <span className="text-orange-400">●</span>
                                {isRTL ? 'الخطوط المتحركة = سفن في الطريق' : 'Moving lines = Ships en route'}
                            </li>
                            <li className="flex items-center gap-1.5">
                                <span className="text-orange-400">◉</span>
                                {isRTL ? 'الموانئ النابضة = نشاط مستمر' : 'Pulsing ports = Active hubs'}
                            </li>
                            <li className="flex items-center gap-1.5">
                                <span className="text-blue-400">🖱️</span>
                                {isRTL ? 'اسحب وكبّر للاستكشاف' : 'Drag & zoom to explore'}
                            </li>
                        </ul>
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
