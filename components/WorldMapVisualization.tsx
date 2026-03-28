'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Ship, Globe2, Radio, Zap } from 'lucide-react';
import { LiveShip } from './LiveShip';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

// ============================================
// MAP PROJECTION — d3-geo Natural Earth 1
// Same projection renders BOTH the map and ports → guaranteed 1:1 alignment
// ============================================
const SVG_WIDTH = 2000;
const SVG_HEIGHT = 857;

// Crop projection to relevant latitudes only (skip polar ice)
// 73°N captures all of Russia/Canada; 58°S captures Tierra del Fuego
const VISIBLE_BOUNDS: any = {
    type: 'Polygon',
    coordinates: [[[-180, 73], [180, 73], [180, -58], [-180, -58], [-180, 73]]]
};

// Create the projection, fitted to the CROPPED bounds for a panoramic view
const projection = geoNaturalEarth1()
    .fitSize([SVG_WIDTH, SVG_HEIGHT], VISIBLE_BOUNDS);

const d3PathGenerator = geoPath(projection);

const project = (lat: number, lon: number) => {
    const p = projection([lon, lat]);
    if (!p) return { x: 0, y: 0 };
    return { x: p[0], y: p[1] };
};

// ============================================
// CITY LIGHTS DATA — Major world cities for night-glow effect
// tier: 1 = megacity (r=1.2), 2 = major (r=0.7), 3 = mid-size (r=0.4)
// ============================================
const CITY_LIGHTS: { lat: number; lon: number; tier: 1 | 2 | 3 }[] = [
    // ── Tier 1: Megacities ──
    { lat: 35.68, lon: 139.69, tier: 1 }, // Tokyo
    { lat: 28.61, lon: 77.21, tier: 1 },  // Delhi
    { lat: 31.23, lon: 121.47, tier: 1 }, // Shanghai
    { lat: 23.13, lon: 113.26, tier: 1 }, // Guangzhou
    { lat: 19.08, lon: 72.88, tier: 1 },  // Mumbai
    { lat: -23.55, lon: -46.63, tier: 1 },// São Paulo
    { lat: 39.90, lon: 116.40, tier: 1 }, // Beijing
    { lat: 30.04, lon: 31.24, tier: 1 },  // Cairo
    { lat: 19.43, lon: -99.13, tier: 1 }, // Mexico City
    { lat: 40.71, lon: -74.01, tier: 1 }, // New York
    { lat: 6.52, lon: 3.38, tier: 1 },    // Lagos
    { lat: 34.69, lon: 135.50, tier: 1 }, // Osaka
    { lat: -4.38, lon: -38.52, tier: 1 }, // Fortaleza area
    { lat: 23.81, lon: 90.41, tier: 1 },  // Dhaka
    { lat: 24.86, lon: 67.01, tier: 1 },  // Karachi
    { lat: 41.01, lon: 28.98, tier: 1 },  // Istanbul
    { lat: -6.21, lon: 106.85, tier: 1 }, // Jakarta
    { lat: 37.57, lon: 126.98, tier: 1 }, // Seoul
    { lat: 13.76, lon: 100.50, tier: 1 }, // Bangkok
    { lat: 51.51, lon: -0.13, tier: 1 },  // London
    { lat: 55.76, lon: 37.62, tier: 1 },  // Moscow
    { lat: 34.05, lon: -118.24, tier: 1 },// Los Angeles
    { lat: 14.60, lon: 120.98, tier: 1 }, // Manila
    // ── Tier 2: Major cities ──
    { lat: 48.86, lon: 2.35, tier: 2 },   // Paris
    { lat: 52.52, lon: 13.41, tier: 2 },  // Berlin
    { lat: 40.42, lon: -3.70, tier: 2 },  // Madrid
    { lat: 41.39, lon: 2.17, tier: 2 },   // Barcelona
    { lat: 45.46, lon: 9.19, tier: 2 },   // Milan
    { lat: 41.90, lon: 12.50, tier: 2 },  // Rome
    { lat: 50.85, lon: 4.35, tier: 2 },   // Brussels
    { lat: 52.37, lon: 4.90, tier: 2 },   // Amsterdam
    { lat: 59.33, lon: 18.07, tier: 2 },  // Stockholm
    { lat: 60.17, lon: 24.94, tier: 2 },  // Helsinki
    { lat: 38.72, lon: -9.14, tier: 2 },  // Lisbon
    { lat: 47.50, lon: 19.04, tier: 2 },  // Budapest
    { lat: 50.08, lon: 14.44, tier: 2 },  // Prague
    { lat: 52.23, lon: 21.01, tier: 2 },  // Warsaw
    { lat: 48.21, lon: 16.37, tier: 2 },  // Vienna
    { lat: 37.98, lon: 23.73, tier: 2 },  // Athens
    { lat: 44.43, lon: 26.10, tier: 2 },  // Bucharest
    { lat: 59.93, lon: 30.32, tier: 2 },  // St Petersburg
    { lat: 50.45, lon: 30.52, tier: 2 },  // Kyiv
    { lat: 53.55, lon: 10.00, tier: 2 },  // Hamburg
    { lat: 48.14, lon: 11.58, tier: 2 },  // Munich
    { lat: 43.30, lon: 5.37, tier: 2 },   // Marseille
    { lat: 53.48, lon: -2.24, tier: 2 },  // Manchester
    { lat: 55.95, lon: -3.19, tier: 2 },  // Edinburgh
    { lat: 53.34, lon: -6.26, tier: 2 },  // Dublin
    { lat: 25.20, lon: 55.27, tier: 2 },  // Dubai
    { lat: 24.47, lon: 54.37, tier: 2 },  // Abu Dhabi
    { lat: 21.49, lon: 39.19, tier: 2 },  // Jeddah
    { lat: 24.71, lon: 46.68, tier: 2 },  // Riyadh
    { lat: 26.21, lon: 50.59, tier: 2 },  // Manama
    { lat: 25.29, lon: 51.53, tier: 2 },  // Doha
    { lat: 29.38, lon: 47.99, tier: 2 },  // Kuwait City
    { lat: 33.89, lon: 35.50, tier: 2 },  // Beirut
    { lat: 31.95, lon: 35.93, tier: 2 },  // Amman
    { lat: 36.19, lon: 44.01, tier: 2 },  // Erbil
    { lat: 33.31, lon: 44.37, tier: 2 },  // Baghdad
    { lat: 35.69, lon: 51.39, tier: 2 },  // Tehran
    { lat: 31.63, lon: 65.71, tier: 2 },  // Kandahar
    { lat: 34.53, lon: 69.17, tier: 2 },  // Kabul
    { lat: 31.55, lon: 74.35, tier: 2 },  // Lahore
    { lat: 33.69, lon: 73.04, tier: 2 },  // Islamabad
    { lat: 12.97, lon: 77.59, tier: 2 },  // Bangalore
    { lat: 13.08, lon: 80.27, tier: 2 },  // Chennai
    { lat: 22.57, lon: 88.36, tier: 2 },  // Kolkata
    { lat: 17.39, lon: 78.49, tier: 2 },  // Hyderabad
    { lat: 18.52, lon: 73.86, tier: 2 },  // Pune
    { lat: 26.85, lon: 80.91, tier: 2 },  // Lucknow
    { lat: 27.18, lon: 78.02, tier: 2 },  // Agra
    { lat: 26.91, lon: 75.79, tier: 2 },  // Jaipur
    { lat: 1.35, lon: 103.82, tier: 2 },  // Singapore
    { lat: 3.14, lon: 101.69, tier: 2 },  // Kuala Lumpur
    { lat: 10.82, lon: 106.63, tier: 2 }, // Ho Chi Minh
    { lat: 21.03, lon: 105.85, tier: 2 }, // Hanoi
    { lat: 16.87, lon: 96.20, tier: 2 },  // Yangon
    { lat: 22.32, lon: 114.17, tier: 2 }, // Hong Kong
    { lat: 22.54, lon: 114.06, tier: 2 }, // Shenzhen
    { lat: 30.57, lon: 104.07, tier: 2 }, // Chengdu
    { lat: 29.56, lon: 106.55, tier: 2 }, // Chongqing
    { lat: 34.26, lon: 108.94, tier: 2 }, // Xi'an
    { lat: 30.25, lon: 120.17, tier: 2 }, // Hangzhou
    { lat: 32.06, lon: 118.78, tier: 2 }, // Nanjing
    { lat: 38.05, lon: 114.49, tier: 2 }, // Shijiazhuang
    { lat: 36.07, lon: 120.38, tier: 2 }, // Qingdao
    { lat: 39.14, lon: 117.18, tier: 2 }, // Tianjin
    { lat: 23.02, lon: 72.57, tier: 2 },  // Ahmedabad
    { lat: 25.04, lon: 121.57, tier: 2 }, // Taipei
    { lat: 43.07, lon: 141.35, tier: 2 }, // Sapporo
    { lat: 35.18, lon: 136.91, tier: 2 }, // Nagoya
    { lat: 35.01, lon: 135.77, tier: 2 }, // Kyoto
    { lat: -33.87, lon: 151.21, tier: 2 },// Sydney
    { lat: -37.81, lon: 144.96, tier: 2 },// Melbourne
    { lat: -27.47, lon: 153.03, tier: 2 },// Brisbane
    { lat: -31.95, lon: 115.86, tier: 2 },// Perth
    { lat: -36.85, lon: 174.76, tier: 2 },// Auckland
    { lat: 43.65, lon: -79.38, tier: 2 }, // Toronto
    { lat: 45.50, lon: -73.57, tier: 2 }, // Montreal
    { lat: 49.28, lon: -123.12, tier: 2 },// Vancouver
    { lat: 41.88, lon: -87.63, tier: 2 }, // Chicago
    { lat: 29.76, lon: -95.37, tier: 2 }, // Houston
    { lat: 33.45, lon: -112.07, tier: 2 },// Phoenix
    { lat: 39.95, lon: -75.17, tier: 2 }, // Philadelphia
    { lat: 32.72, lon: -117.16, tier: 2 },// San Diego
    { lat: 37.77, lon: -122.42, tier: 2 },// San Francisco
    { lat: 47.61, lon: -122.33, tier: 2 },// Seattle
    { lat: 25.76, lon: -80.19, tier: 2 }, // Miami
    { lat: 33.75, lon: -84.39, tier: 2 }, // Atlanta
    { lat: 42.36, lon: -71.06, tier: 2 }, // Boston
    { lat: 38.91, lon: -77.04, tier: 2 }, // Washington DC
    { lat: 32.78, lon: -96.80, tier: 2 }, // Dallas
    { lat: 39.74, lon: -104.99, tier: 2 },// Denver
    { lat: 36.17, lon: -115.14, tier: 2 },// Las Vegas
    { lat: -22.91, lon: -43.17, tier: 2 },// Rio de Janeiro
    { lat: -34.60, lon: -58.38, tier: 2 },// Buenos Aires
    { lat: -33.45, lon: -70.67, tier: 2 },// Santiago
    { lat: -12.05, lon: -77.04, tier: 2 },// Lima
    { lat: 4.71, lon: -74.07, tier: 2 },  // Bogotá
    { lat: 10.49, lon: -66.88, tier: 2 }, // Caracas
    { lat: -1.29, lon: 36.82, tier: 2 },  // Nairobi
    { lat: -26.20, lon: 28.04, tier: 2 }, // Johannesburg
    { lat: -33.93, lon: 18.42, tier: 2 }, // Cape Town
    { lat: 5.56, lon: -0.19, tier: 2 },   // Accra
    { lat: 33.57, lon: -7.59, tier: 2 },  // Casablanca
    { lat: 36.75, lon: 3.04, tier: 2 },   // Algiers
    { lat: 36.81, lon: 10.18, tier: 2 },  // Tunis
    { lat: 9.02, lon: 38.75, tier: 2 },   // Addis Ababa
    { lat: -6.17, lon: 35.75, tier: 2 },  // Dodoma
    { lat: 0.35, lon: 32.58, tier: 2 },   // Kampala
    // ── Tier 3: Mid-size / coastal cities for density ──
    { lat: 57.71, lon: 11.97, tier: 3 },  // Gothenburg
    { lat: 55.68, lon: 12.57, tier: 3 },  // Copenhagen
    { lat: 63.43, lon: 10.40, tier: 3 },  // Trondheim
    { lat: 60.39, lon: 5.32, tier: 3 },   // Bergen
    { lat: 59.91, lon: 10.75, tier: 3 },  // Oslo
    { lat: 56.95, lon: 24.11, tier: 3 },  // Riga
    { lat: 54.69, lon: 25.28, tier: 3 },  // Vilnius
    { lat: 59.44, lon: 24.75, tier: 3 },  // Tallinn
    { lat: 42.70, lon: 23.32, tier: 3 },  // Sofia
    { lat: 44.82, lon: 20.41, tier: 3 },  // Belgrade
    { lat: 45.81, lon: 15.98, tier: 3 },  // Zagreb
    { lat: 43.86, lon: 18.41, tier: 3 },  // Sarajevo
    { lat: 46.06, lon: 14.51, tier: 3 },  // Ljubljana
    { lat: 47.37, lon: 8.54, tier: 3 },   // Zurich
    { lat: 46.20, lon: 6.14, tier: 3 },   // Geneva
    { lat: 43.77, lon: 11.25, tier: 3 },  // Florence
    { lat: 45.44, lon: 12.32, tier: 3 },  // Venice
    { lat: 40.85, lon: 14.27, tier: 3 },  // Naples
    { lat: 43.61, lon: 1.44, tier: 3 },   // Toulouse
    { lat: 45.76, lon: 4.84, tier: 3 },   // Lyon
    { lat: 47.22, lon: -1.55, tier: 3 },  // Nantes
    { lat: 51.05, lon: 3.72, tier: 3 },   // Ghent
    { lat: 51.44, lon: 5.47, tier: 3 },   // Eindhoven
    { lat: 51.92, lon: 4.48, tier: 3 },   // Rotterdam
    { lat: 50.94, lon: 6.96, tier: 3 },   // Cologne
    { lat: 50.11, lon: 8.68, tier: 3 },   // Frankfurt
    { lat: 49.45, lon: 11.08, tier: 3 },  // Nuremberg
    { lat: 51.34, lon: 12.37, tier: 3 },  // Leipzig
    { lat: 51.05, lon: 13.74, tier: 3 },  // Dresden
    { lat: 54.32, lon: 10.14, tier: 3 },  // Kiel
    { lat: 54.09, lon: 12.10, tier: 3 },  // Rostock
    { lat: 16.92, lon: -99.84, tier: 3 }, // Acapulco
    { lat: 20.67, lon: -103.35, tier: 3 },// Guadalajara
    { lat: 25.69, lon: -100.32, tier: 3 },// Monterrey
    { lat: 23.63, lon: -102.55, tier: 3 },// Zacatecas
    { lat: -15.79, lon: -47.88, tier: 3 },// Brasilia
    { lat: -19.92, lon: -43.94, tier: 3 },// Belo Horizonte
    { lat: -25.43, lon: -49.27, tier: 3 },// Curitiba
    { lat: -30.03, lon: -51.20, tier: 3 },// Porto Alegre
    { lat: -3.72, lon: -38.53, tier: 3 }, // Fortaleza
    { lat: -8.05, lon: -34.87, tier: 3 }, // Recife
    { lat: -12.97, lon: -38.51, tier: 3 },// Salvador
    { lat: 18.47, lon: -69.93, tier: 3 }, // Santo Domingo
    { lat: 23.14, lon: -82.36, tier: 3 }, // Havana
    { lat: 18.00, lon: -76.79, tier: 3 }, // Kingston
    { lat: 8.98, lon: -79.52, tier: 3 },  // Panama City
    { lat: -0.18, lon: -78.47, tier: 3 }, // Quito
    { lat: -16.50, lon: -68.15, tier: 3 },// La Paz
    { lat: -25.26, lon: -57.58, tier: 3 },// Asunción
    { lat: -34.88, lon: -56.16, tier: 3 },// Montevideo
    { lat: 44.65, lon: -63.57, tier: 3 }, // Halifax
    { lat: 45.42, lon: -75.70, tier: 3 }, // Ottawa
    { lat: 51.04, lon: -114.07, tier: 3 },// Calgary
    { lat: 53.55, lon: -113.49, tier: 3 },// Edmonton
    { lat: 30.27, lon: -97.74, tier: 3 }, // Austin
    { lat: 35.23, lon: -80.84, tier: 3 }, // Charlotte
    { lat: 36.16, lon: -86.78, tier: 3 }, // Nashville
    { lat: 44.98, lon: -93.27, tier: 3 }, // Minneapolis
    { lat: 38.63, lon: -90.20, tier: 3 }, // St. Louis
    { lat: 21.31, lon: -157.86, tier: 3 },// Honolulu
    { lat: 61.22, lon: -149.90, tier: 3 },// Anchorage
    { lat: 45.50, lon: -122.68, tier: 3 },// Portland
    { lat: 27.95, lon: -82.46, tier: 3 }, // Tampa
    { lat: 28.54, lon: -81.38, tier: 3 }, // Orlando
    { lat: 29.95, lon: -90.07, tier: 3 }, // New Orleans
    { lat: 42.33, lon: -83.05, tier: 3 }, // Detroit
    { lat: 40.44, lon: -79.99, tier: 3 }, // Pittsburgh
    { lat: -4.04, lon: 39.67, tier: 3 },  // Mombasa
    { lat: -6.79, lon: 39.28, tier: 3 },  // Dar es Salaam
    { lat: 11.59, lon: 43.15, tier: 3 },  // Djibouti
    { lat: 15.35, lon: 44.21, tier: 3 },  // Sana'a
    { lat: 12.31, lon: 45.03, tier: 3 },  // Aden
    { lat: 23.59, lon: 58.38, tier: 3 },  // Muscat
    { lat: 16.94, lon: 54.01, tier: 3 },  // Salalah
    { lat: 27.19, lon: 56.28, tier: 3 },  // Bandar Abbas
    { lat: 32.62, lon: 51.66, tier: 3 },  // Isfahan
    { lat: 29.06, lon: 58.20, tier: 3 },  // Kerman
    { lat: 38.08, lon: 46.29, tier: 3 },  // Tabriz
    { lat: 36.30, lon: 59.60, tier: 3 },  // Mashhad
    { lat: 5.41, lon: 100.33, tier: 3 },  // Penang
    { lat: 7.89, lon: 98.39, tier: 3 },   // Phuket
    { lat: 13.37, lon: 103.86, tier: 3 }, // Siem Reap
    { lat: 11.56, lon: 104.92, tier: 3 }, // Phnom Penh
    { lat: 17.97, lon: 102.63, tier: 3 }, // Vientiane
    { lat: 22.40, lon: 91.83, tier: 3 },  // Chittagong
    { lat: 6.93, lon: 79.85, tier: 3 },   // Colombo
    { lat: 27.72, lon: 85.32, tier: 3 },  // Kathmandu
    { lat: 45.75, lon: 126.65, tier: 3 }, // Harbin
    { lat: 41.80, lon: 123.43, tier: 3 }, // Shenyang
    { lat: 43.88, lon: 125.32, tier: 3 }, // Changchun
    { lat: 36.67, lon: 116.98, tier: 3 }, // Jinan
    { lat: 34.75, lon: 113.65, tier: 3 }, // Zhengzhou
    { lat: 30.59, lon: 114.31, tier: 3 }, // Wuhan
    { lat: 28.23, lon: 112.94, tier: 3 }, // Changsha
    { lat: 22.82, lon: 108.32, tier: 3 }, // Nanning
    { lat: 23.13, lon: 113.26, tier: 3 }, // Dongguan
    { lat: 24.48, lon: 118.09, tier: 3 }, // Xiamen
    { lat: 26.07, lon: 119.30, tier: 3 }, // Fuzhou
    { lat: 36.06, lon: 103.83, tier: 3 }, // Lanzhou
    { lat: 43.80, lon: 87.60, tier: 3 },  // Ürümqi
    { lat: 29.65, lon: 91.13, tier: 3 },  // Lhasa
    { lat: 47.92, lon: 106.91, tier: 3 }, // Ulaanbaatar
    { lat: 35.67, lon: 51.42, tier: 3 },  // Karaj
    { lat: 55.01, lon: 82.93, tier: 3 },  // Novosibirsk
    { lat: 56.84, lon: 60.60, tier: 3 },  // Yekaterinburg
    { lat: 43.24, lon: 76.95, tier: 3 },  // Almaty
    { lat: 41.31, lon: 69.28, tier: 3 },  // Tashkent
    { lat: 39.67, lon: 66.96, tier: 3 },  // Samarkand
    { lat: 51.17, lon: 71.45, tier: 3 },  // Nur-Sultan
    { lat: -29.86, lon: 31.02, tier: 3 }, // Durban
    { lat: 14.69, lon: -17.44, tier: 3 }, // Dakar
    { lat: 5.35, lon: -4.01, tier: 3 },   // Abidjan
    { lat: 12.37, lon: -1.52, tier: 3 },  // Ouagadougou
    { lat: 9.06, lon: 7.49, tier: 3 },    // Abuja
    { lat: 4.06, lon: 9.77, tier: 3 },    // Douala
    { lat: -4.27, lon: 15.27, tier: 3 },  // Kinshasa
    { lat: -4.32, lon: 15.32, tier: 3 },  // Brazzaville
    { lat: 0.39, lon: 9.45, tier: 3 },    // Libreville
    { lat: -8.84, lon: 13.23, tier: 3 },  // Luanda
    { lat: -15.42, lon: 28.28, tier: 3 }, // Lusaka
    { lat: -17.83, lon: 31.05, tier: 3 }, // Harare
    { lat: -25.97, lon: 32.57, tier: 3 }, // Maputo
    { lat: -20.16, lon: 57.50, tier: 3 }, // Port Louis
    { lat: -18.92, lon: 47.52, tier: 3 }, // Antananarivo
    { lat: 31.63, lon: -8.01, tier: 3 },  // Marrakech
    { lat: 35.76, lon: -5.83, tier: 3 },  // Tangier
    { lat: 30.05, lon: 31.23, tier: 3 },  // Giza
    { lat: 31.20, lon: 29.92, tier: 3 },  // Alexandria
    { lat: 27.18, lon: 31.19, tier: 3 },  // Luxor
    { lat: 24.09, lon: 32.90, tier: 3 },  // Aswan
    { lat: 15.50, lon: 32.56, tier: 3 },  // Khartoum
    { lat: 32.90, lon: 13.18, tier: 3 },  // Tripoli
    { lat: -1.95, lon: 30.06, tier: 3 },  // Kigali
    { lat: -3.38, lon: 29.36, tier: 3 },  // Bujumbura
    { lat: -12.05, lon: -77.04, tier: 3 },// Lima cluster
    { lat: -16.39, lon: -71.54, tier: 3 },// Arequipa
    { lat: -2.17, lon: -79.92, tier: 3 }, // Guayaquil
    { lat: 10.69, lon: -71.61, tier: 3 }, // Maracaibo
    { lat: 4.60, lon: -74.08, tier: 3 },  // Bogotá cluster
    { lat: 6.25, lon: -75.56, tier: 3 },  // Medellín
    { lat: -2.50, lon: -44.28, tier: 3 }, // São Luís
    { lat: -3.10, lon: -60.03, tier: 3 }, // Manaus
    { lat: 19.44, lon: -70.69, tier: 3 }, // Santiago (DR)
    { lat: 18.54, lon: -72.34, tier: 3 }, // Port-au-Prince
    { lat: 14.63, lon: -90.51, tier: 3 }, // Guatemala City
    { lat: 13.69, lon: -89.19, tier: 3 }, // San Salvador
    { lat: 14.07, lon: -87.19, tier: 3 }, // Tegucigalpa
    { lat: 12.11, lon: -86.24, tier: 3 }, // Managua
    { lat: 9.93, lon: -84.08, tier: 3 },  // San José
];

// ============================================
// GREAT CIRCLE CALCULATION FOR SPHERICAL EARTH
// ============================================

// Convert degrees to radians
const toRad = (deg: number) => deg * (Math.PI / 180);
const toDeg = (rad: number) => rad * (180 / Math.PI);

// Calculate intermediate point on great circle
const getGreatCirclePoint = (
    lat1: number, lon1: number,
    lat2: number, lon2: number,
    fraction: number // 0 to 1
): { lat: number; lon: number } => {
    const φ1 = toRad(lat1);
    const λ1 = toRad(lon1);
    const φ2 = toRad(lat2);
    const λ2 = toRad(lon2);

    // Calculate angular distance
    const d = 2 * Math.asin(Math.sqrt(
        Math.pow(Math.sin((φ2 - φ1) / 2), 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.pow(Math.sin((λ2 - λ1) / 2), 2)
    ));

    if (d === 0) return { lat: lat1, lon: lon1 };

    const A = Math.sin((1 - fraction) * d) / Math.sin(d);
    const B = Math.sin(fraction * d) / Math.sin(d);

    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);

    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const lon = toDeg(Math.atan2(y, x));

    return { lat, lon };
};

// Check if route crosses the date line (antimeridian)
const crossesDateLine = (lon1: number, lon2: number): boolean => {
    return Math.abs(lon2 - lon1) > 180;
};

// Get the shorter longitude difference considering date line
const getLonDifference = (lon1: number, lon2: number): number => {
    let diff = lon2 - lon1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
};

// Generate great circle waypoints for long routes
const generateGreatCircleWaypoints = (
    lat1: number, lon1: number,
    lat2: number, lon2: number,
    numPoints: number = 10
): { lat: number; lon: number }[] => {
    const points: { lat: number; lon: number }[] = [];

    // Adjust for date line crossing
    let adjustedLon2 = lon2;
    if (crossesDateLine(lon1, lon2)) {
        // Adjust lon2 to be on the same "side" for calculation
        if (lon2 < 0 && lon1 > 0) {
            adjustedLon2 = lon2 + 360;
        } else if (lon2 > 0 && lon1 < 0) {
            adjustedLon2 = lon2 - 360;
        }
    }

    for (let i = 1; i < numPoints; i++) {
        const fraction = i / numPoints;
        const point = getGreatCirclePoint(lat1, lon1, lat2, adjustedLon2, fraction);

        // Normalize longitude back to -180 to 180
        let normalizedLon = point.lon;
        while (normalizedLon > 180) normalizedLon -= 360;
        while (normalizedLon < -180) normalizedLon += 360;

        points.push({ lat: point.lat, lon: normalizedLon });
    }

    return points;
};

// ============================================
// MARITIME WAYPOINTS - Real ocean navigation points
// ============================================
const maritimeWaypoints: { [key: string]: { lat: number; lon: number } } = {
    // Suez Canal & Red Sea
    'suez-north': { lat: 31.0, lon: 32.3 },
    'suez-south': { lat: 29.9, lon: 32.5 },
    'red-sea-north': { lat: 27.0, lon: 34.0 },
    'red-sea-center': { lat: 22.0, lon: 38.0 },
    'bab-el-mandeb': { lat: 12.5, lon: 43.5 },

    // Arabian Sea & Indian Ocean
    'gulf-of-aden': { lat: 12.0, lon: 48.0 },
    'arabian-sea-west': { lat: 15.0, lon: 58.0 },
    'arabian-sea-center': { lat: 15.0, lon: 65.0 },
    'arabian-sea-east': { lat: 12.0, lon: 72.0 },
    'indian-ocean-west': { lat: 0.0, lon: 60.0 },
    'indian-ocean-center': { lat: -5.0, lon: 75.0 },
    'indian-ocean-east': { lat: 0.0, lon: 90.0 },

    // Southeast Asia
    'bay-of-bengal': { lat: 12.0, lon: 85.0 },           // moved west — was 88 which is too close to Myanmar coast
    'andaman-sea': { lat: 8.0, lon: 94.0 },               // moved south/west — was 10,96 which lands on Myanmar/Thailand
    'malacca-strait-west': { lat: 3.5, lon: 98.5 },       // moved south — was 5,98 which clips Sumatra
    'malacca-strait-east': { lat: 1.5, lon: 104.0 },
    'singapore-strait': { lat: 1.2, lon: 104.0 },

    // South China Sea
    'south-china-sea-south': { lat: 3.0, lon: 108.0 },
    'south-china-sea-center': { lat: 12.0, lon: 114.0 },
    'south-china-sea-north': { lat: 18.0, lon: 116.0 },

    // East Asia
    'taiwan-strait': { lat: 24.0, lon: 119.0 },
    'east-china-sea': { lat: 28.0, lon: 125.0 },
    'yellow-sea': { lat: 35.0, lon: 124.0 },
    'sea-of-japan': { lat: 38.0, lon: 132.0 },
    'pacific-japan': { lat: 35.0, lon: 145.0 },

    // Mediterranean Sea
    'med-east': { lat: 34.0, lon: 32.0 },
    'med-center-east': { lat: 35.0, lon: 25.0 },
    'med-center': { lat: 37.0, lon: 15.0 },
    'med-west': { lat: 38.0, lon: 5.0 },
    'gibraltar': { lat: 36.0, lon: -5.5 },
    'tyrrhenian-sea': { lat: 40.0, lon: 12.0 },
    'adriatic-south': { lat: 40.0, lon: 18.0 },
    'aegean-sea': { lat: 38.0, lon: 25.0 },
    'black-sea-west': { lat: 43.0, lon: 29.0 },
    'black-sea-east': { lat: 43.0, lon: 37.0 },

    // Atlantic Ocean - Europe
    'atlantic-gibraltar': { lat: 36.0, lon: -8.0 },
    'atlantic-portugal': { lat: 40.0, lon: -12.0 },
    'bay-of-biscay': { lat: 45.0, lon: -5.0 },
    'english-channel': { lat: 50.0, lon: -1.0 },
    'north-sea-south': { lat: 52.0, lon: 3.0 },
    'north-sea-center': { lat: 55.0, lon: 4.0 },
    'north-sea-north': { lat: 58.0, lon: 3.0 },
    'baltic-entrance': { lat: 56.0, lon: 11.0 },
    'baltic-sea': { lat: 55.0, lon: 15.0 },

    // Atlantic Ocean - Trans-Atlantic
    'atlantic-west-africa': { lat: 20.0, lon: -20.0 },
    'atlantic-central-north': { lat: 40.0, lon: -40.0 },
    'atlantic-central-south': { lat: 20.0, lon: -35.0 },
    'atlantic-east-us': { lat: 38.0, lon: -65.0 },
    'atlantic-caribbean': { lat: 20.0, lon: -70.0 },

    // Caribbean & Gulf of Mexico
    'caribbean-east': { lat: 15.0, lon: -65.0 },
    'caribbean-center': { lat: 15.0, lon: -75.0 },
    'caribbean-west': { lat: 18.0, lon: -85.0 },
    'gulf-of-mexico': { lat: 25.0, lon: -90.0 },

    // Panama Canal
    'panama-atlantic': { lat: 9.5, lon: -79.5 },
    'panama-pacific': { lat: 8.5, lon: -79.5 },

    // Pacific Ocean - East
    'pacific-central-america': { lat: 10.0, lon: -90.0 },
    'pacific-mexico': { lat: 18.0, lon: -110.0 },
    'pacific-california': { lat: 30.0, lon: -125.0 },
    'pacific-northwest': { lat: 45.0, lon: -130.0 },

    // Pacific Ocean - Trans-Pacific (key shipping lanes)
    'pacific-hawaii': { lat: 21.0, lon: -157.0 },
    'pacific-midway': { lat: 28.0, lon: -177.0 },
    'pacific-dateline-north': { lat: 35.0, lon: 180.0 },
    'pacific-dateline-south': { lat: 10.0, lon: 180.0 },
    'pacific-west-japan': { lat: 30.0, lon: 145.0 },
    'pacific-west-central': { lat: 20.0, lon: 150.0 },
    'pacific-east-hawaii': { lat: 22.0, lon: -150.0 },
    'pacific-ne': { lat: 40.0, lon: -140.0 },
    'pacific-central-north': { lat: 38.0, lon: -165.0 },
    'pacific-central-south': { lat: 5.0, lon: -160.0 },
    'pacific-west': { lat: 25.0, lon: 155.0 },

    // South America
    'atlantic-brazil-north': { lat: 0.0, lon: -40.0 },
    'atlantic-brazil-south': { lat: -25.0, lon: -40.0 },
    'atlantic-argentina': { lat: -38.0, lon: -55.0 },
    'cape-horn': { lat: -56.0, lon: -68.0 },
    'pacific-chile': { lat: -30.0, lon: -80.0 },
    'pacific-peru': { lat: -10.0, lon: -85.0 },
    'pacific-ecuador': { lat: 0.0, lon: -85.0 },

    // Africa
    'atlantic-morocco': { lat: 32.0, lon: -10.0 },
    'atlantic-senegal': { lat: 15.0, lon: -20.0 },
    'gulf-of-guinea': { lat: 3.0, lon: 3.0 },
    'atlantic-angola': { lat: -10.0, lon: 10.0 },
    'atlantic-namibia': { lat: -22.0, lon: 12.0 },
    'cape-of-good-hope': { lat: -35.0, lon: 18.0 },
    'indian-ocean-mozambique': { lat: -20.0, lon: 40.0 },
    'indian-ocean-madagascar': { lat: -18.0, lon: 50.0 },

    // Oceania
    'coral-sea': { lat: -18.0, lon: 155.0 },
    'tasman-sea': { lat: -38.0, lon: 160.0 },
    'pacific-nz': { lat: -35.0, lon: 175.0 },
    'pacific-fiji': { lat: -18.0, lon: 178.0 },
    'pacific-papua': { lat: -5.0, lon: 150.0 },
    'arafura-sea': { lat: -9.0, lon: 133.0 },              // moved to be clearly north of Australia
    'java-sea': { lat: -5.0, lon: 112.0 },

    // Australia coastal waypoints (ocean only — routing around the continent)
    'torres-strait': { lat: -10.0, lon: 143.5 },           // in the strait between PNG and Cape York
    'australia-ne-coast': { lat: -16.0, lon: 148.0 },       // off Cairns — further east to avoid reef coast
    'australia-se-coast': { lat: -34.0, lon: 153.5 },       // off Sydney — further east into Tasman Sea
    'australia-south-coast': { lat: -40.0, lon: 141.0 },    // south of Bass Strait — further south to avoid land
    'australia-sw-coast': { lat: -34.0, lon: 112.0 },       // SW of Australia, well into Indian Ocean
    'bass-strait-east': { lat: -40.0, lon: 149.5 },         // east entrance of Bass Strait — further south

    // Additional coastal waypoints to avoid land crossings
    'gulf-of-thailand': { lat: 8.0, lon: 103.0 },            // Gulf of Thailand, east of Malay Peninsula — moved east
    'india-south-tip': { lat: 6.0, lon: 77.0 },              // south of Cape Comorin — moved further south into ocean
    'south-africa-south': { lat: -36.0, lon: 25.0 },         // south coast of South Africa

    // Persian Gulf
    'persian-gulf-center': { lat: 27.0, lon: 51.0 },
    'strait-of-hormuz': { lat: 26.5, lon: 56.5 },
    'gulf-of-oman': { lat: 24.0, lon: 59.0 },
};

// Get projected waypoint coordinates
const getWaypointCoords = (waypointId: string) => {
    const wp = maritimeWaypoints[waypointId];
    if (!wp) return null;
    return project(wp.lat, wp.lon);
};

// ============================================
// ROUTE DEFINITIONS WITH WAYPOINTS
// ============================================
type RouteWithWaypoints = {
    from: string;
    to: string;
    type: 'main' | 'regional';
    waypoints?: string[]; // Array of waypoint IDs
};

// Generate path string from points — hard-breaks at antimeridian jumps
const generatePathFromPoints = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';

    const MAX_DX = 400; // Max horizontal distance before breaking the path

    // For 2 points, simple line (but skip if it crosses the map)
    if (points.length === 2) {
        if (Math.abs(points[1].x - points[0].x) > MAX_DX) return '';
        return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    // For multiple points, create smooth curve with hard-breaks at cross-map jumps
    let path = `M ${points[0].x} ${points[0].y}`;
    let needsMoveTo = false;

    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        // If this segment jumps across the map, skip it entirely
        if (Math.abs(p2.x - p1.x) > MAX_DX) {
            needsMoveTo = true;
            continue;
        }

        // Start a new sub-path after a skipped segment
        if (needsMoveTo) {
            path += ` M ${p1.x} ${p1.y}`;
            needsMoveTo = false;
        }

        // Get neighbors for Catmull-Rom, but clamp them if they're across a gap
        const p0raw = points[Math.max(0, i - 1)];
        const p3raw = points[Math.min(points.length - 1, i + 2)];
        const p0 = Math.abs(p0raw.x - p1.x) > MAX_DX ? p1 : p0raw;
        const p3 = Math.abs(p3raw.x - p2.x) > MAX_DX ? p2 : p3raw;

        const tension = 0.08;
        const cp1x = p1.x + (p2.x - p0.x) * tension;
        const cp1y = p1.y + (p2.y - p0.y) * tension;
        const cp2x = p2.x - (p3.x - p1.x) * tension;
        const cp2y = p2.y - (p3.y - p1.y) * tension;

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return path;
};

// Calculate path data for a route with waypoints
const calculateMaritimePath = (
    fromLoc: { x: number; y: number; lat: number; lon: number },
    toLoc: { x: number; y: number; lat: number; lon: number },
    waypointIds?: string[]
) => {
    const points: { x: number; y: number }[] = [{ x: fromLoc.x, y: fromLoc.y }];

    // Check if this is a trans-Pacific or long route that needs great circle treatment
    const lonDiff = Math.abs(getLonDifference(fromLoc.lon, toLoc.lon));
    const isTransPacific = crossesDateLine(fromLoc.lon, toLoc.lon);
    const isLongRoute = lonDiff > 60; // More than 60 degrees longitude

    if (waypointIds && waypointIds.length > 0) {
        // Use provided waypoints
        let prevLat = fromLoc.lat;
        let prevLon = fromLoc.lon;

        for (let i = 0; i < waypointIds.length; i++) {
            const wpId = waypointIds[i];
            const wp = maritimeWaypoints[wpId];
            if (wp) {
                // Check if this segment crosses date line
                if (crossesDateLine(prevLon, wp.lon)) {
                    // Add intermediate great circle points for this segment
                    const gcPoints = generateGreatCircleWaypoints(prevLat, prevLon, wp.lat, wp.lon, 8);
                    for (const gcPoint of gcPoints) {
                        const projected = project(gcPoint.lat, gcPoint.lon);
                        points.push(projected);
                    }
                }

                const wpCoords = project(wp.lat, wp.lon);
                points.push(wpCoords);
                prevLat = wp.lat;
                prevLon = wp.lon;
            }
        }

        // Check last segment to destination
        if (crossesDateLine(prevLon, toLoc.lon)) {
            const gcPoints = generateGreatCircleWaypoints(prevLat, prevLon, toLoc.lat, toLoc.lon, 8);
            for (const gcPoint of gcPoints) {
                const projected = project(gcPoint.lat, gcPoint.lon);
                points.push(projected);
            }
        }
    } else if (isTransPacific || isLongRoute) {
        // No waypoints but long route - generate great circle points
        const numPoints = isTransPacific ? 15 : 8;
        const gcPoints = generateGreatCircleWaypoints(fromLoc.lat, fromLoc.lon, toLoc.lat, toLoc.lon, numPoints);
        for (const gcPoint of gcPoints) {
            const projected = project(gcPoint.lat, gcPoint.lon);
            points.push(projected);
        }
    }

    points.push({ x: toLoc.x, y: toLoc.y });

    // Filter out any NaN or invalid points
    const validPoints = points.filter(p => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y));

    // For trans-Pacific routes, we might need to split the path
    // Check if any segment jumps more than half the map width
    const splitPaths: { x: number; y: number }[][] = [];
    let currentPath: { x: number; y: number }[] = [];

    for (let i = 0; i < validPoints.length; i++) {
        if (i === 0) {
            currentPath.push(validPoints[i]);
        } else {
            const dx = Math.abs(validPoints[i].x - validPoints[i - 1].x);
            // If jump is more than 600 pixels, split the path (catches date-line crossings even at 1.28× scale)
            if (dx > 600) {
                // End current path at the edge
                const prevPoint = validPoints[i - 1];
                const nextPoint = validPoints[i];

                // Determine which edge to go to
                if (prevPoint.x > nextPoint.x) {
                    // Going from right to left (crossing date line westward)
                    currentPath.push({ x: SVG_WIDTH + 50, y: prevPoint.y });
                    splitPaths.push([...currentPath]);
                    currentPath = [{ x: -50, y: nextPoint.y }, nextPoint];
                } else {
                    // Going from left to right (crossing date line eastward)
                    currentPath.push({ x: -50, y: prevPoint.y });
                    splitPaths.push([...currentPath]);
                    currentPath = [{ x: SVG_WIDTH + 50, y: nextPoint.y }, nextPoint];
                }
            } else {
                currentPath.push(validPoints[i]);
            }
        }
    }

    if (currentPath.length > 0) {
        splitPaths.push(currentPath);
    }

    // Generate path strings for all split paths
    const pathStrings = splitPaths.map(pts => generatePathFromPoints(pts));
    const combinedPath = pathStrings.join(' ');

    // Use all valid points for animation
    const allPoints = splitPaths.flat();

    // Calculate midpoint for ship animation
    const midIndex = Math.floor(allPoints.length / 2);
    const midPoint = allPoints[midIndex] || allPoints[0];

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 0; i < allPoints.length - 1; i++) {
        const dx = allPoints[i + 1].x - allPoints[i].x;
        const dy = allPoints[i + 1].y - allPoints[i].y;
        // Don't count huge jumps (date line crossings)
        if (Math.abs(dx) < 1000) {
            totalDistance += Math.sqrt(dx * dx + dy * dy);
        }
    }

    return {
        path: combinedPath,
        points: allPoints,
        splitPaths,
        midPoint,
        totalDistance,
        isTransPacific
    };
};

// Get point on path at time t (0 to 1) - works with array of points
const getPointOnPath = (
    points: { x: number; y: number }[],
    t: number
) => {
    if (points.length < 2) return points[0] || { x: 0, y: 0 };

    // Calculate total path length and segment lengths
    const segments: { start: { x: number; y: number }; end: { x: number; y: number }; length: number }[] = [];
    let totalLength = 0;

    for (let i = 0; i < points.length - 1; i++) {
        const dx = points[i + 1].x - points[i].x;
        const dy = points[i + 1].y - points[i].y;
        const length = Math.sqrt(dx * dx + dy * dy);
        segments.push({ start: points[i], end: points[i + 1], length });
        totalLength += length;
    }

    // Find the segment at time t
    const targetLength = t * totalLength;
    let accumulatedLength = 0;

    for (const segment of segments) {
        if (accumulatedLength + segment.length >= targetLength) {
            const segmentT = (targetLength - accumulatedLength) / segment.length;
            return {
                x: segment.start.x + (segment.end.x - segment.start.x) * segmentT,
                y: segment.start.y + (segment.end.y - segment.start.y) * segmentT
            };
        }
        accumulatedLength += segment.length;
    }

    return points[points.length - 1];
};

// Get tangent angle at point t on path
const getTangentAngleOnPath = (
    points: { x: number; y: number }[],
    t: number
) => {
    if (points.length < 2) return 0;

    // Get points slightly before and after t
    const t1 = Math.max(0, t - 0.01);
    const t2 = Math.min(1, t + 0.01);

    const p1 = getPointOnPath(points, t1);
    const p2 = getPointOnPath(points, t2);

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    return Math.atan2(dy, dx) * (180 / Math.PI);
};

// ============================================
// PORT/CITY LOCATIONS - COMPREHENSIVE GLOBAL NETWORK
// ============================================
const locations = [
    // ========== MIDDLE EAST & EGYPT - MAIN HUBS ==========
    { id: 'port-said', nameAr: 'بورسعيد', nameEn: 'Port Said', lat: 31.2653, lon: 32.3019, type: 'hub' },
    { id: 'alexandria', nameAr: 'الإسكندرية', nameEn: 'Alexandria', lat: 31.2001, lon: 29.9187, type: 'hub' },
    { id: 'suez', nameAr: 'السويس', nameEn: 'Suez', lat: 29.9668, lon: 32.5498, type: 'port' },
    { id: 'damietta', nameAr: 'دمياط', nameEn: 'Damietta', lat: 31.4175, lon: 31.8144, type: 'port' },
    { id: 'jebel-ali', nameAr: 'جبل علي', nameEn: 'Jebel Ali', lat: 24.9857, lon: 55.0275, type: 'hub' },
    { id: 'jeddah', nameAr: 'جدة', nameEn: 'Jeddah', lat: 21.4858, lon: 39.1925, type: 'hub' },
    { id: 'dammam', nameAr: 'الدمام', nameEn: 'Dammam', lat: 26.4367, lon: 50.1033, type: 'port' },
    { id: 'salalah', nameAr: 'صلالة', nameEn: 'Salalah', lat: 16.9357, lon: 54.0090, type: 'port' },
    { id: 'muscat', nameAr: 'مسقط', nameEn: 'Muscat', lat: 23.5880, lon: 58.3829, type: 'port' },
    { id: 'aqaba', nameAr: 'العقبة', nameEn: 'Aqaba', lat: 29.5167, lon: 35.0000, type: 'port' },
    { id: 'beirut', nameAr: 'بيروت', nameEn: 'Beirut', lat: 33.9000, lon: 35.5333, type: 'port' },
    { id: 'haifa', nameAr: 'حيفا', nameEn: 'Haifa', lat: 32.8192, lon: 34.9983, type: 'port' },
    { id: 'bandar-abbas', nameAr: 'بندر عباس', nameEn: 'Bandar Abbas', lat: 27.1865, lon: 56.2808, type: 'port' },
    { id: 'kuwait', nameAr: 'الكويت', nameEn: 'Kuwait', lat: 29.3759, lon: 47.9774, type: 'port' },
    { id: 'bahrain', nameAr: 'البحرين', nameEn: 'Bahrain', lat: 26.2285, lon: 50.5860, type: 'port' },

    // ========== AFRICA ==========
    { id: 'durban', nameAr: 'ديربان', nameEn: 'Durban', lat: -29.8587, lon: 31.0218, type: 'port' },
    { id: 'cape-town', nameAr: 'كيب تاون', nameEn: 'Cape Town', lat: -33.9249, lon: 18.4241, type: 'port' },
    { id: 'mombasa', nameAr: 'مومباسا', nameEn: 'Mombasa', lat: -4.0435, lon: 39.6682, type: 'port' },
    { id: 'dar-es-salaam', nameAr: 'دار السلام', nameEn: 'Dar es Salaam', lat: -6.7924, lon: 39.2083, type: 'port' },
    { id: 'djibouti', nameAr: 'جيبوتي', nameEn: 'Djibouti', lat: 11.5886, lon: 43.1456, type: 'port' },
    { id: 'tangier', nameAr: 'طنجة', nameEn: 'Tangier', lat: 35.7595, lon: -5.8340, type: 'port' },
    { id: 'casablanca', nameAr: 'الدار البيضاء', nameEn: 'Casablanca', lat: 33.5731, lon: -7.5898, type: 'port' },
    { id: 'lagos', nameAr: 'لاغوس', nameEn: 'Lagos', lat: 6.4541, lon: 3.3947, type: 'port' },
    { id: 'abidjan', nameAr: 'أبيدجان', nameEn: 'Abidjan', lat: 5.3600, lon: -4.0083, type: 'port' },

    // ========== EUROPE - MAJOR PORTS ==========
    { id: 'rotterdam', nameAr: 'روتردام', nameEn: 'Rotterdam', lat: 51.9244, lon: 4.4777, type: 'hub' },
    { id: 'antwerp', nameAr: 'أنتويرب', nameEn: 'Antwerp', lat: 51.2194, lon: 4.4025, type: 'hub' },
    { id: 'hamburg', nameAr: 'هامبورغ', nameEn: 'Hamburg', lat: 53.5511, lon: 9.9937, type: 'hub' },
    { id: 'felixstowe', nameAr: 'فيليكستو', nameEn: 'Felixstowe', lat: 51.9536, lon: 1.3513, type: 'port' },
    { id: 'southampton', nameAr: 'ساوثهامبتون', nameEn: 'Southampton', lat: 50.9097, lon: -1.4044, type: 'port' },
    { id: 'le-havre', nameAr: 'لوهافر', nameEn: 'Le Havre', lat: 49.4944, lon: 0.1079, type: 'port' },
    { id: 'marseille', nameAr: 'مرسيليا', nameEn: 'Marseille', lat: 43.2965, lon: 5.3698, type: 'port' },
    { id: 'genoa', nameAr: 'جنوة', nameEn: 'Genoa', lat: 44.4056, lon: 8.9463, type: 'port' },
    { id: 'barcelona', nameAr: 'برشلونة', nameEn: 'Barcelona', lat: 41.3851, lon: 2.1734, type: 'port' },
    { id: 'valencia', nameAr: 'فالنسيا', nameEn: 'Valencia', lat: 39.4699, lon: -0.3763, type: 'port' },
    { id: 'algeciras', nameAr: 'الجزيرة الخضراء', nameEn: 'Algeciras', lat: 36.1408, lon: -5.4536, type: 'port' },
    { id: 'piraeus', nameAr: 'بيرايوس', nameEn: 'Piraeus', lat: 37.9475, lon: 23.6372, type: 'hub' },
    { id: 'istanbul', nameAr: 'إسطنبول', nameEn: 'Istanbul', lat: 41.0082, lon: 28.9784, type: 'hub' },
    { id: 'constanta', nameAr: 'كونستانتا', nameEn: 'Constanta', lat: 44.1598, lon: 28.6348, type: 'port' },
    { id: 'odessa', nameAr: 'أوديسا', nameEn: 'Odessa', lat: 46.4825, lon: 30.7233, type: 'port' },
    { id: 'gdansk', nameAr: 'غدانسك', nameEn: 'Gdansk', lat: 54.3520, lon: 18.6466, type: 'port' },
    { id: 'gothenburg', nameAr: 'غوتنبرغ', nameEn: 'Gothenburg', lat: 57.7089, lon: 11.9746, type: 'port' },
    { id: 'lisbon', nameAr: 'لشبونة', nameEn: 'Lisbon', lat: 38.7223, lon: -9.1393, type: 'port' },

    // ========== ASIA - MAJOR SHIPPING HUBS ==========
    { id: 'shanghai', nameAr: 'شنغهاي', nameEn: 'Shanghai', lat: 31.2304, lon: 121.4737, type: 'hub' },
    { id: 'singapore', nameAr: 'سنغافورة', nameEn: 'Singapore', lat: 1.3521, lon: 103.8198, type: 'hub' },
    { id: 'hong-kong', nameAr: 'هونغ كونغ', nameEn: 'Hong Kong', lat: 22.3193, lon: 114.1694, type: 'hub' },
    { id: 'shenzhen', nameAr: 'شنجن', nameEn: 'Shenzhen', lat: 22.5431, lon: 114.0579, type: 'hub' },
    { id: 'ningbo', nameAr: 'نينغبو', nameEn: 'Ningbo', lat: 29.8683, lon: 121.5440, type: 'hub' },
    { id: 'busan', nameAr: 'بوسان', nameEn: 'Busan', lat: 35.1796, lon: 129.0756, type: 'hub' },
    { id: 'tokyo', nameAr: 'طوكيو', nameEn: 'Tokyo', lat: 35.6762, lon: 139.6503, type: 'port' },
    { id: 'yokohama', nameAr: 'يوكوهاما', nameEn: 'Yokohama', lat: 35.4437, lon: 139.6380, type: 'port' },
    { id: 'kobe', nameAr: 'كوبي', nameEn: 'Kobe', lat: 34.6901, lon: 135.1956, type: 'port' },
    { id: 'nagoya', nameAr: 'ناغويا', nameEn: 'Nagoya', lat: 35.1815, lon: 136.9066, type: 'port' },
    { id: 'kaohsiung', nameAr: 'كاوشيونغ', nameEn: 'Kaohsiung', lat: 22.6273, lon: 120.3014, type: 'port' },
    { id: 'taipei', nameAr: 'تايبيه', nameEn: 'Taipei', lat: 25.0330, lon: 121.5654, type: 'port' },
    { id: 'manila', nameAr: 'مانيلا', nameEn: 'Manila', lat: 14.5995, lon: 120.9842, type: 'port' },
    { id: 'ho-chi-minh', nameAr: 'هو شي منه', nameEn: 'Ho Chi Minh', lat: 10.8231, lon: 106.6297, type: 'port' },
    { id: 'bangkok', nameAr: 'بانكوك', nameEn: 'Bangkok', lat: 13.7563, lon: 100.5018, type: 'port' },
    { id: 'port-klang', nameAr: 'بورت كلانج', nameEn: 'Port Klang', lat: 3.0319, lon: 101.3685, type: 'port' },
    { id: 'jakarta', nameAr: 'جاكرتا', nameEn: 'Jakarta', lat: -6.2088, lon: 106.8456, type: 'port' },
    { id: 'surabaya', nameAr: 'سورابايا', nameEn: 'Surabaya', lat: -7.2575, lon: 112.7521, type: 'port' },

    // ========== SOUTH ASIA ==========
    { id: 'mumbai', nameAr: 'مومباي', nameEn: 'Mumbai', lat: 19.0760, lon: 72.8777, type: 'hub' },
    { id: 'chennai', nameAr: 'تشيناي', nameEn: 'Chennai', lat: 13.0827, lon: 80.2707, type: 'port' },
    { id: 'colombo', nameAr: 'كولومبو', nameEn: 'Colombo', lat: 6.9271, lon: 79.8612, type: 'hub' },
    { id: 'karachi', nameAr: 'كراتشي', nameEn: 'Karachi', lat: 24.8607, lon: 67.0011, type: 'port' },
    { id: 'chittagong', nameAr: 'شيتاغونغ', nameEn: 'Chittagong', lat: 22.3569, lon: 91.7832, type: 'port' },
    { id: 'kolkata', nameAr: 'كولكاتا', nameEn: 'Kolkata', lat: 22.5726, lon: 88.3639, type: 'port' },
    { id: 'cochin', nameAr: 'كوتشي', nameEn: 'Cochin', lat: 9.9312, lon: 76.2673, type: 'port' },

    // ========== AMERICAS - MAJOR PORTS ==========
    { id: 'new-york', nameAr: 'نيويورك', nameEn: 'New York', lat: 40.7128, lon: -74.0060, type: 'hub' },
    { id: 'los-angeles', nameAr: 'لوس أنجلوس', nameEn: 'Los Angeles', lat: 33.7405, lon: -118.2720, type: 'hub' },
    { id: 'long-beach', nameAr: 'لونغ بيتش', nameEn: 'Long Beach', lat: 33.7701, lon: -118.1937, type: 'port' },
    { id: 'savannah', nameAr: 'سافانا', nameEn: 'Savannah', lat: 32.0809, lon: -81.0912, type: 'port' },
    { id: 'houston', nameAr: 'هيوستن', nameEn: 'Houston', lat: 29.7604, lon: -95.3698, type: 'port' },
    { id: 'new-orleans', nameAr: 'نيو أورلينز', nameEn: 'New Orleans', lat: 29.9511, lon: -90.0715, type: 'port' },
    { id: 'miami', nameAr: 'ميامي', nameEn: 'Miami', lat: 25.7617, lon: -80.1918, type: 'port' },
    { id: 'charleston', nameAr: 'تشارلستون', nameEn: 'Charleston', lat: 32.7765, lon: -79.9311, type: 'port' },
    { id: 'seattle', nameAr: 'سياتل', nameEn: 'Seattle', lat: 47.6062, lon: -122.3321, type: 'port' },
    { id: 'vancouver', nameAr: 'فانكوفر', nameEn: 'Vancouver', lat: 49.2827, lon: -123.1207, type: 'port' },
    { id: 'montreal', nameAr: 'مونتريال', nameEn: 'Montreal', lat: 45.5017, lon: -73.5673, type: 'port' },
    { id: 'halifax', nameAr: 'هاليفاكس', nameEn: 'Halifax', lat: 44.6488, lon: -63.5752, type: 'port' },

    // ========== LATIN AMERICA ==========
    { id: 'santos', nameAr: 'سانتوس', nameEn: 'Santos', lat: -23.9608, lon: -46.3331, type: 'hub' },
    { id: 'buenos-aires', nameAr: 'بوينس آيرس', nameEn: 'Buenos Aires', lat: -34.6037, lon: -58.3816, type: 'port' },
    { id: 'cartagena', nameAr: 'قرطاجنة', nameEn: 'Cartagena', lat: 10.3910, lon: -75.4794, type: 'port' },
    { id: 'colon', nameAr: 'كولون', nameEn: 'Colon', lat: 9.3547, lon: -79.9017, type: 'hub' },
    { id: 'balboa', nameAr: 'بالبوا', nameEn: 'Balboa', lat: 8.9500, lon: -79.5667, type: 'port' },
    { id: 'callao', nameAr: 'كالاو', nameEn: 'Callao', lat: -12.0500, lon: -77.1333, type: 'port' },
    { id: 'guayaquil', nameAr: 'غواياكيل', nameEn: 'Guayaquil', lat: -2.1710, lon: -79.9223, type: 'port' },
    { id: 'manzanillo-mx', nameAr: 'مانزانيلو', nameEn: 'Manzanillo MX', lat: 19.0514, lon: -104.3182, type: 'port' },
    { id: 'veracruz', nameAr: 'فيراكروز', nameEn: 'Veracruz', lat: 19.1738, lon: -96.1342, type: 'port' },

    // ========== OCEANIA ==========
    { id: 'sydney', nameAr: 'سيدني', nameEn: 'Sydney', lat: -33.8688, lon: 151.2093, type: 'port' },
    { id: 'melbourne', nameAr: 'ملبورن', nameEn: 'Melbourne', lat: -37.8136, lon: 144.9631, type: 'port' },
    { id: 'brisbane', nameAr: 'بريزبن', nameEn: 'Brisbane', lat: -27.4698, lon: 153.0251, type: 'port' },
    { id: 'auckland', nameAr: 'أوكلاند', nameEn: 'Auckland', lat: -36.8485, lon: 174.7633, type: 'port' },
    { id: 'port-moresby', nameAr: 'بورت مورسبي', nameEn: 'Port Moresby', lat: -9.4438, lon: 147.1803, type: 'port' },
];

// Shipping routes with REAL MARITIME WAYPOINTS
const routes: RouteWithWaypoints[] = [
    // ========== FROM EGYPT - MAIN HUBS (Via Suez Canal) ==========
    // Port Said to Asia (Via Red Sea, Indian Ocean, Malacca Strait)
    { from: 'port-said', to: 'shanghai', type: 'main', waypoints: ['suez-south', 'red-sea-center', 'bab-el-mandeb', 'arabian-sea-center', 'indian-ocean-east', 'malacca-strait-west', 'malacca-strait-east', 'south-china-sea-south', 'south-china-sea-north', 'taiwan-strait'] },
    { from: 'port-said', to: 'singapore', type: 'main', waypoints: ['suez-south', 'red-sea-center', 'bab-el-mandeb', 'arabian-sea-center', 'indian-ocean-east', 'malacca-strait-west'] },
    { from: 'port-said', to: 'mumbai', type: 'main', waypoints: ['suez-south', 'red-sea-center', 'bab-el-mandeb', 'arabian-sea-west', 'arabian-sea-east'] },
    { from: 'port-said', to: 'jebel-ali', type: 'main', waypoints: ['suez-south', 'red-sea-center', 'bab-el-mandeb', 'gulf-of-aden', 'arabian-sea-west', 'gulf-of-oman', 'strait-of-hormuz'] },

    // Port Said to Europe (Via Mediterranean)
    { from: 'port-said', to: 'rotterdam', type: 'main', waypoints: ['med-east', 'med-center-east', 'med-center', 'med-west', 'gibraltar', 'atlantic-portugal', 'bay-of-biscay', 'english-channel', 'north-sea-south'] },
    { from: 'port-said', to: 'piraeus', type: 'main', waypoints: ['med-east', 'med-center-east'] },
    { from: 'port-said', to: 'genoa', type: 'regional', waypoints: ['med-east', 'med-center-east', 'med-center', 'tyrrhenian-sea'] },
    { from: 'port-said', to: 'istanbul', type: 'regional', waypoints: ['med-east', 'aegean-sea'] },
    { from: 'port-said', to: 'jeddah', type: 'regional', waypoints: ['suez-south', 'red-sea-north', 'red-sea-center'] },
    { from: 'port-said', to: 'djibouti', type: 'regional', waypoints: ['suez-south', 'red-sea-center', 'bab-el-mandeb'] },

    // Alexandria connections (Mediterranean)
    { from: 'alexandria', to: 'piraeus', type: 'regional', waypoints: ['med-east', 'med-center-east'] },
    { from: 'alexandria', to: 'istanbul', type: 'regional', waypoints: ['med-east', 'aegean-sea'] },
    { from: 'alexandria', to: 'genoa', type: 'regional', waypoints: ['med-east', 'med-center', 'tyrrhenian-sea'] },
    { from: 'alexandria', to: 'marseille', type: 'regional', waypoints: ['med-east', 'med-center'] },
    { from: 'alexandria', to: 'barcelona', type: 'regional', waypoints: ['med-east', 'med-center', 'med-west'] },
    { from: 'alexandria', to: 'beirut', type: 'regional', waypoints: ['med-east'] },

    // Damietta connections
    { from: 'damietta', to: 'haifa', type: 'regional', waypoints: ['med-east'] },
    { from: 'damietta', to: 'istanbul', type: 'regional', waypoints: ['med-east', 'aegean-sea'] },

    // ========== MIDDLE EAST NETWORK ==========
    // Jebel Ali Hub (Via Arabian Sea, Indian Ocean)
    { from: 'jebel-ali', to: 'singapore', type: 'main', waypoints: ['strait-of-hormuz', 'gulf-of-oman', 'arabian-sea-center', 'indian-ocean-east', 'malacca-strait-west'] },
    { from: 'jebel-ali', to: 'mumbai', type: 'main', waypoints: ['strait-of-hormuz', 'gulf-of-oman', 'arabian-sea-east'] },
    { from: 'jebel-ali', to: 'colombo', type: 'main', waypoints: ['strait-of-hormuz', 'gulf-of-oman', 'arabian-sea-center', 'indian-ocean-center'] },
    { from: 'jebel-ali', to: 'karachi', type: 'regional', waypoints: ['strait-of-hormuz', 'gulf-of-oman'] },
    { from: 'jebel-ali', to: 'dammam', type: 'regional', waypoints: ['persian-gulf-center'] },
    { from: 'jebel-ali', to: 'muscat', type: 'regional', waypoints: ['strait-of-hormuz'] },
    { from: 'jebel-ali', to: 'kuwait', type: 'regional', waypoints: ['persian-gulf-center'] },
    { from: 'jebel-ali', to: 'mombasa', type: 'regional', waypoints: ['strait-of-hormuz', 'gulf-of-oman', 'arabian-sea-west', 'gulf-of-aden', 'indian-ocean-west'] },

    // Jeddah Hub (Via Red Sea, Indian Ocean)
    { from: 'jeddah', to: 'singapore', type: 'main', waypoints: ['red-sea-center', 'bab-el-mandeb', 'arabian-sea-center', 'indian-ocean-east', 'malacca-strait-west'] },
    { from: 'jeddah', to: 'colombo', type: 'main', waypoints: ['red-sea-center', 'bab-el-mandeb', 'arabian-sea-center', 'indian-ocean-center'] },
    { from: 'jeddah', to: 'djibouti', type: 'regional', waypoints: ['red-sea-center', 'bab-el-mandeb'] },
    { from: 'jeddah', to: 'aqaba', type: 'regional', waypoints: ['red-sea-north'] },
    { from: 'jeddah', to: 'salalah', type: 'regional', waypoints: ['red-sea-center', 'bab-el-mandeb', 'gulf-of-aden'] },
    { from: 'jeddah', to: 'mombasa', type: 'regional', waypoints: ['red-sea-center', 'bab-el-mandeb', 'indian-ocean-west'] },

    // Other Middle East
    { from: 'salalah', to: 'singapore', type: 'main', waypoints: ['arabian-sea-center', 'indian-ocean-east', 'malacca-strait-west'] },
    { from: 'salalah', to: 'mumbai', type: 'regional', waypoints: ['arabian-sea-center', 'arabian-sea-east'] },
    { from: 'bandar-abbas', to: 'mumbai', type: 'regional', waypoints: ['gulf-of-oman', 'arabian-sea-east'] },
    { from: 'bandar-abbas', to: 'karachi', type: 'regional', waypoints: ['gulf-of-oman'] },

    // ========== ASIA PACIFIC NETWORK ==========
    // Shanghai Hub
    { from: 'shanghai', to: 'singapore', type: 'main', waypoints: ['east-china-sea', 'taiwan-strait', 'south-china-sea-north', 'south-china-sea-center', 'south-china-sea-south'] },
    { from: 'shanghai', to: 'busan', type: 'main', waypoints: ['east-china-sea', 'yellow-sea'] },
    { from: 'shanghai', to: 'tokyo', type: 'main', waypoints: ['east-china-sea', 'pacific-japan'] },
    { from: 'shanghai', to: 'hong-kong', type: 'main', waypoints: ['east-china-sea', 'taiwan-strait', 'south-china-sea-north'] },
    { from: 'shanghai', to: 'ningbo', type: 'regional', waypoints: [] },
    { from: 'shanghai', to: 'kaohsiung', type: 'regional', waypoints: ['east-china-sea', 'taiwan-strait'] },

    // Trans-Pacific from Shanghai (Great Circle routes via North Pacific)
    { from: 'shanghai', to: 'los-angeles', type: 'main', waypoints: ['east-china-sea', 'pacific-japan', 'pacific-west-japan', 'pacific-dateline-north', 'pacific-central-north', 'pacific-east-hawaii', 'pacific-california'] },
    { from: 'shanghai', to: 'vancouver', type: 'main', waypoints: ['east-china-sea', 'pacific-japan', 'pacific-west-japan', 'pacific-dateline-north', 'pacific-ne', 'pacific-northwest'] },

    // Asia to Europe via Suez
    { from: 'shanghai', to: 'rotterdam', type: 'main', waypoints: ['east-china-sea', 'taiwan-strait', 'south-china-sea-north', 'south-china-sea-south', 'malacca-strait-east', 'malacca-strait-west', 'indian-ocean-east', 'arabian-sea-center', 'bab-el-mandeb', 'red-sea-center', 'suez-south', 'med-east', 'med-center', 'gibraltar', 'atlantic-portugal', 'bay-of-biscay', 'north-sea-south'] },

    // Singapore Hub
    { from: 'singapore', to: 'hong-kong', type: 'main', waypoints: ['south-china-sea-south', 'south-china-sea-center'] },
    { from: 'singapore', to: 'jakarta', type: 'regional', waypoints: ['java-sea'] },
    { from: 'singapore', to: 'port-klang', type: 'regional', waypoints: ['malacca-strait-east'] },
    { from: 'singapore', to: 'ho-chi-minh', type: 'regional', waypoints: ['south-china-sea-south'] },
    { from: 'singapore', to: 'sydney', type: 'main', waypoints: ['java-sea', 'arafura-sea', 'torres-strait', 'australia-ne-coast', 'coral-sea', 'australia-se-coast'] },
    { from: 'singapore', to: 'chennai', type: 'regional', waypoints: ['malacca-strait-west', 'andaman-sea', 'bay-of-bengal'] },
    { from: 'singapore', to: 'bangkok', type: 'regional', waypoints: ['south-china-sea-south', 'gulf-of-thailand'] },
    { from: 'singapore', to: 'manila', type: 'regional', waypoints: ['south-china-sea-south', 'south-china-sea-center'] },
    { from: 'singapore', to: 'colombo', type: 'main', waypoints: ['malacca-strait-west', 'indian-ocean-east', 'indian-ocean-center'] },

    // Hong Kong & Shenzhen
    { from: 'hong-kong', to: 'shenzhen', type: 'regional', waypoints: [] },
    { from: 'hong-kong', to: 'kaohsiung', type: 'regional', waypoints: ['south-china-sea-north'] },
    { from: 'hong-kong', to: 'manila', type: 'regional', waypoints: ['south-china-sea-center'] },
    { from: 'hong-kong', to: 'los-angeles', type: 'main', waypoints: ['south-china-sea-north', 'taiwan-strait', 'pacific-japan', 'pacific-west-japan', 'pacific-dateline-north', 'pacific-central-north', 'pacific-east-hawaii', 'pacific-california'] },
    { from: 'shenzhen', to: 'busan', type: 'main', waypoints: ['south-china-sea-north', 'taiwan-strait', 'east-china-sea', 'yellow-sea'] },
    { from: 'shenzhen', to: 'rotterdam', type: 'main', waypoints: ['south-china-sea-north', 'south-china-sea-south', 'malacca-strait-east', 'malacca-strait-west', 'indian-ocean-east', 'arabian-sea-center', 'bab-el-mandeb', 'red-sea-center', 'suez-south', 'med-east', 'gibraltar', 'atlantic-portugal', 'north-sea-south'] },
    { from: 'shenzhen', to: 'los-angeles', type: 'main', waypoints: ['south-china-sea-north', 'taiwan-strait', 'pacific-japan', 'pacific-west-japan', 'pacific-dateline-north', 'pacific-central-north', 'pacific-east-hawaii', 'pacific-california'] },

    // Busan Hub
    { from: 'busan', to: 'tokyo', type: 'regional', waypoints: ['sea-of-japan'] },
    { from: 'busan', to: 'yokohama', type: 'regional', waypoints: ['sea-of-japan'] },
    { from: 'busan', to: 'los-angeles', type: 'main', waypoints: ['sea-of-japan', 'pacific-japan', 'pacific-west-japan', 'pacific-dateline-north', 'pacific-central-north', 'pacific-east-hawaii', 'pacific-california'] },
    { from: 'busan', to: 'seattle', type: 'main', waypoints: ['sea-of-japan', 'pacific-japan', 'pacific-west-japan', 'pacific-dateline-north', 'pacific-ne', 'pacific-northwest'] },
    { from: 'busan', to: 'nagoya', type: 'regional', waypoints: ['sea-of-japan'] },

    // Japan
    { from: 'tokyo', to: 'yokohama', type: 'regional', waypoints: [] },
    { from: 'tokyo', to: 'los-angeles', type: 'main', waypoints: ['pacific-japan', 'pacific-west-japan', 'pacific-dateline-north', 'pacific-central-north', 'pacific-east-hawaii', 'pacific-california'] },
    { from: 'kobe', to: 'shanghai', type: 'regional', waypoints: ['east-china-sea'] },
    { from: 'nagoya', to: 'shanghai', type: 'regional', waypoints: ['east-china-sea'] },

    // Southeast Asia
    { from: 'jakarta', to: 'surabaya', type: 'regional', waypoints: ['java-sea'] },
    { from: 'jakarta', to: 'port-klang', type: 'regional', waypoints: ['java-sea', 'malacca-strait-east'] },
    { from: 'ho-chi-minh', to: 'hong-kong', type: 'regional', waypoints: ['south-china-sea-center'] },
    { from: 'bangkok', to: 'hong-kong', type: 'regional', waypoints: ['gulf-of-thailand', 'south-china-sea-south', 'south-china-sea-center'] },

    // ========== SOUTH ASIA NETWORK ==========
    // Mumbai Hub
    { from: 'mumbai', to: 'colombo', type: 'main', waypoints: ['arabian-sea-east', 'indian-ocean-center'] },
    { from: 'mumbai', to: 'singapore', type: 'main', waypoints: ['arabian-sea-east', 'indian-ocean-east', 'malacca-strait-west'] },
    { from: 'mumbai', to: 'chennai', type: 'regional', waypoints: ['india-south-tip'] },  // حول جنوب الهند
    { from: 'mumbai', to: 'karachi', type: 'regional', waypoints: [] },
    { from: 'mumbai', to: 'cochin', type: 'regional', waypoints: [] },

    // Colombo Hub
    { from: 'colombo', to: 'chennai', type: 'regional', waypoints: ['bay-of-bengal'] },
    { from: 'colombo', to: 'singapore', type: 'main', waypoints: ['indian-ocean-east', 'malacca-strait-west'] },
    { from: 'colombo', to: 'cochin', type: 'regional', waypoints: [] },

    // Other South Asia
    { from: 'chennai', to: 'singapore', type: 'regional', waypoints: ['bay-of-bengal', 'andaman-sea', 'malacca-strait-west'] },
    { from: 'kolkata', to: 'singapore', type: 'regional', waypoints: ['bay-of-bengal', 'andaman-sea', 'malacca-strait-west'] },
    { from: 'chittagong', to: 'singapore', type: 'regional', waypoints: ['bay-of-bengal', 'andaman-sea', 'malacca-strait-west'] },
    { from: 'karachi', to: 'singapore', type: 'regional', waypoints: ['arabian-sea-center', 'indian-ocean-east', 'malacca-strait-west'] },

    // ========== EUROPE NETWORK ==========
    // Rotterdam Hub
    { from: 'rotterdam', to: 'antwerp', type: 'regional', waypoints: ['north-sea-south'] },
    { from: 'rotterdam', to: 'hamburg', type: 'regional', waypoints: ['north-sea-south', 'north-sea-center'] },
    { from: 'rotterdam', to: 'felixstowe', type: 'regional', waypoints: ['north-sea-south'] },
    { from: 'rotterdam', to: 'le-havre', type: 'regional', waypoints: ['north-sea-south', 'english-channel'] },
    { from: 'rotterdam', to: 'southampton', type: 'regional', waypoints: ['north-sea-south', 'english-channel'] },
    { from: 'rotterdam', to: 'gdansk', type: 'regional', waypoints: ['north-sea-center', 'baltic-entrance', 'baltic-sea'] },

    // Trans-Atlantic from Rotterdam
    { from: 'rotterdam', to: 'new-york', type: 'main', waypoints: ['north-sea-south', 'english-channel', 'atlantic-central-north', 'atlantic-east-us'] },

    // Hamburg Hub
    { from: 'hamburg', to: 'antwerp', type: 'regional', waypoints: ['north-sea-center', 'north-sea-south'] },
    { from: 'hamburg', to: 'gdansk', type: 'regional', waypoints: ['baltic-entrance', 'baltic-sea'] },
    { from: 'hamburg', to: 'gothenburg', type: 'regional', waypoints: ['north-sea-center', 'north-sea-north'] },
    { from: 'hamburg', to: 'felixstowe', type: 'regional', waypoints: ['north-sea-center', 'north-sea-south'] },
    { from: 'hamburg', to: 'new-york', type: 'main', waypoints: ['north-sea-center', 'north-sea-south', 'english-channel', 'atlantic-central-north', 'atlantic-east-us'] },

    // Mediterranean
    { from: 'piraeus', to: 'istanbul', type: 'regional', waypoints: ['aegean-sea'] },
    { from: 'piraeus', to: 'genoa', type: 'regional', waypoints: ['med-center-east', 'med-center', 'tyrrhenian-sea'] },
    { from: 'piraeus', to: 'valencia', type: 'regional', waypoints: ['med-center-east', 'med-center', 'med-west'] },
    { from: 'piraeus', to: 'constanta', type: 'regional', waypoints: ['aegean-sea', 'black-sea-west'] },
    { from: 'genoa', to: 'barcelona', type: 'regional', waypoints: ['tyrrhenian-sea', 'med-west'] },
    { from: 'genoa', to: 'marseille', type: 'regional', waypoints: [] },
    { from: 'barcelona', to: 'valencia', type: 'regional', waypoints: [] },
    { from: 'barcelona', to: 'tangier', type: 'regional', waypoints: ['med-west', 'gibraltar'] },
    { from: 'valencia', to: 'algeciras', type: 'regional', waypoints: ['med-west'] },
    { from: 'algeciras', to: 'tangier', type: 'regional', waypoints: ['gibraltar'] },
    { from: 'algeciras', to: 'casablanca', type: 'regional', waypoints: ['gibraltar', 'atlantic-morocco'] },
    { from: 'istanbul', to: 'constanta', type: 'regional', waypoints: ['black-sea-west'] },
    { from: 'istanbul', to: 'odessa', type: 'regional', waypoints: ['black-sea-west', 'black-sea-east'] },

    // UK & Atlantic Europe
    { from: 'felixstowe', to: 'southampton', type: 'regional', waypoints: ['english-channel'] },
    { from: 'southampton', to: 'le-havre', type: 'regional', waypoints: ['english-channel'] },
    { from: 'le-havre', to: 'antwerp', type: 'regional', waypoints: ['english-channel', 'north-sea-south'] },
    { from: 'lisbon', to: 'algeciras', type: 'regional', waypoints: ['atlantic-portugal', 'atlantic-gibraltar'] },
    { from: 'lisbon', to: 'casablanca', type: 'regional', waypoints: ['atlantic-portugal', 'atlantic-morocco'] },
    { from: 'felixstowe', to: 'new-york', type: 'main', waypoints: ['english-channel', 'atlantic-central-north', 'atlantic-east-us'] },
    { from: 'le-havre', to: 'new-york', type: 'main', waypoints: ['english-channel', 'atlantic-central-north', 'atlantic-east-us'] },
    { from: 'southampton', to: 'new-york', type: 'main', waypoints: ['english-channel', 'atlantic-central-north', 'atlantic-east-us'] },

    // ========== AFRICA NETWORK ==========
    // East Africa
    { from: 'djibouti', to: 'mombasa', type: 'regional', waypoints: ['indian-ocean-west'] },
    { from: 'mombasa', to: 'dar-es-salaam', type: 'regional', waypoints: [] },
    { from: 'dar-es-salaam', to: 'durban', type: 'regional', waypoints: ['indian-ocean-mozambique'] },
    { from: 'durban', to: 'cape-town', type: 'regional', waypoints: ['south-africa-south'] },

    // West Africa
    { from: 'tangier', to: 'casablanca', type: 'regional', waypoints: ['atlantic-morocco'] },
    { from: 'casablanca', to: 'abidjan', type: 'regional', waypoints: ['atlantic-morocco', 'atlantic-senegal', 'atlantic-west-africa'] },
    { from: 'abidjan', to: 'lagos', type: 'regional', waypoints: ['gulf-of-guinea'] },
    { from: 'lagos', to: 'cape-town', type: 'regional', waypoints: ['gulf-of-guinea', 'atlantic-angola', 'atlantic-namibia', 'cape-of-good-hope'] },

    // Africa to Asia (Via Cape of Good Hope)
    { from: 'durban', to: 'singapore', type: 'main', waypoints: ['indian-ocean-mozambique', 'indian-ocean-madagascar', 'indian-ocean-center', 'indian-ocean-east', 'malacca-strait-west'] },
    { from: 'cape-town', to: 'singapore', type: 'main', waypoints: ['cape-of-good-hope', 'indian-ocean-mozambique', 'indian-ocean-center', 'indian-ocean-east', 'malacca-strait-west'] },
    { from: 'mombasa', to: 'mumbai', type: 'regional', waypoints: ['indian-ocean-west', 'arabian-sea-center', 'arabian-sea-east'] },

    // ========== AMERICAS NETWORK ==========
    // US East Coast
    { from: 'new-york', to: 'savannah', type: 'regional', waypoints: ['atlantic-east-us'] },
    { from: 'new-york', to: 'charleston', type: 'regional', waypoints: ['atlantic-east-us'] },
    { from: 'new-york', to: 'halifax', type: 'regional', waypoints: [] },
    { from: 'savannah', to: 'rotterdam', type: 'main', waypoints: ['atlantic-east-us', 'atlantic-central-north', 'english-channel', 'north-sea-south'] },
    { from: 'charleston', to: 'colon', type: 'regional', waypoints: ['atlantic-caribbean', 'caribbean-center'] },
    { from: 'miami', to: 'cartagena', type: 'regional', waypoints: ['caribbean-east', 'caribbean-center'] },
    { from: 'houston', to: 'veracruz', type: 'regional', waypoints: ['gulf-of-mexico'] },
    { from: 'houston', to: 'colon', type: 'regional', waypoints: ['gulf-of-mexico', 'caribbean-west', 'caribbean-center'] },
    { from: 'new-orleans', to: 'houston', type: 'regional', waypoints: ['gulf-of-mexico'] },
    { from: 'new-york', to: 'antwerp', type: 'main', waypoints: ['atlantic-east-us', 'atlantic-central-north', 'english-channel', 'north-sea-south'] },

    // US West Coast
    { from: 'los-angeles', to: 'long-beach', type: 'regional', waypoints: [] },
    { from: 'los-angeles', to: 'seattle', type: 'regional', waypoints: ['pacific-california', 'pacific-northwest'] },
    { from: 'los-angeles', to: 'manzanillo-mx', type: 'regional', waypoints: ['pacific-california', 'pacific-mexico'] },
    { from: 'seattle', to: 'vancouver', type: 'regional', waypoints: [] },

    // Canada
    { from: 'montreal', to: 'halifax', type: 'regional', waypoints: [] },
    { from: 'halifax', to: 'rotterdam', type: 'main', waypoints: ['atlantic-central-north', 'english-channel', 'north-sea-south'] },
    { from: 'montreal', to: 'antwerp', type: 'regional', waypoints: ['atlantic-central-north', 'english-channel', 'north-sea-south'] },

    // Panama Canal routes
    { from: 'colon', to: 'balboa', type: 'regional', waypoints: ['panama-atlantic', 'panama-pacific'] },
    { from: 'colon', to: 'cartagena', type: 'regional', waypoints: ['caribbean-center'] },
    { from: 'balboa', to: 'los-angeles', type: 'main', waypoints: ['pacific-central-america', 'pacific-mexico', 'pacific-california'] },
    { from: 'balboa', to: 'callao', type: 'regional', waypoints: ['pacific-central-america', 'pacific-ecuador', 'pacific-peru'] },
    { from: 'balboa', to: 'guayaquil', type: 'regional', waypoints: ['pacific-central-america', 'pacific-ecuador'] },

    // South America
    { from: 'santos', to: 'buenos-aires', type: 'regional', waypoints: ['atlantic-brazil-south'] },
    { from: 'santos', to: 'rotterdam', type: 'main', waypoints: ['atlantic-brazil-south', 'atlantic-brazil-north', 'atlantic-central-south', 'atlantic-west-africa', 'atlantic-morocco', 'atlantic-portugal', 'bay-of-biscay', 'english-channel', 'north-sea-south'] },
    { from: 'santos', to: 'shanghai', type: 'main', waypoints: ['atlantic-brazil-south', 'cape-of-good-hope', 'indian-ocean-mozambique', 'indian-ocean-center', 'indian-ocean-east', 'malacca-strait-west', 'malacca-strait-east', 'south-china-sea-south', 'south-china-sea-north', 'taiwan-strait'] },
    { from: 'santos', to: 'singapore', type: 'main', waypoints: ['atlantic-brazil-south', 'cape-of-good-hope', 'indian-ocean-mozambique', 'indian-ocean-center', 'indian-ocean-east', 'malacca-strait-west'] },
    { from: 'buenos-aires', to: 'cape-town', type: 'main', waypoints: ['atlantic-argentina', 'atlantic-brazil-south', 'atlantic-namibia', 'cape-of-good-hope'] },
    { from: 'callao', to: 'guayaquil', type: 'regional', waypoints: ['pacific-peru', 'pacific-ecuador'] },
    { from: 'guayaquil', to: 'manzanillo-mx', type: 'regional', waypoints: ['pacific-ecuador', 'pacific-central-america', 'pacific-mexico'] },
    { from: 'cartagena', to: 'santos', type: 'regional', waypoints: ['caribbean-center', 'atlantic-brazil-north', 'atlantic-brazil-south'] },

    // ========== OCEANIA NETWORK ==========
    { from: 'sydney', to: 'melbourne', type: 'regional', waypoints: ['bass-strait-east', 'australia-south-coast'] },
    { from: 'sydney', to: 'brisbane', type: 'regional', waypoints: ['coral-sea'] },
    { from: 'sydney', to: 'auckland', type: 'regional', waypoints: ['tasman-sea', 'pacific-nz'] },
    { from: 'melbourne', to: 'singapore', type: 'main', waypoints: ['australia-south-coast', 'australia-sw-coast', 'indian-ocean-east', 'malacca-strait-west'] },
    { from: 'brisbane', to: 'shanghai', type: 'main', waypoints: ['coral-sea', 'australia-ne-coast', 'torres-strait', 'arafura-sea', 'java-sea', 'south-china-sea-south', 'south-china-sea-north', 'taiwan-strait'] },
    { from: 'auckland', to: 'sydney', type: 'regional', waypoints: ['pacific-nz', 'tasman-sea'] },
    { from: 'port-moresby', to: 'singapore', type: 'regional', waypoints: ['pacific-papua', 'arafura-sea', 'java-sea', 'malacca-strait-east'] },

    // Trans-Pacific
    { from: 'ningbo', to: 'los-angeles', type: 'main', waypoints: ['east-china-sea', 'pacific-japan', 'pacific-west-japan', 'pacific-dateline-north', 'pacific-central-north', 'pacific-east-hawaii', 'pacific-california'] },
    { from: 'sydney', to: 'los-angeles', type: 'main', waypoints: ['tasman-sea', 'pacific-fiji', 'pacific-dateline-south', 'pacific-central-south', 'pacific-hawaii', 'pacific-california'] },
];

// Stats
const stats = [
    { valueAr: '+50', valueEn: '50+', labelAr: 'دولة', labelEn: 'Countries' },
    { valueAr: '+100', valueEn: '100+', labelAr: 'ميناء', labelEn: 'Ports' },
    { valueAr: '+200', valueEn: '200+', labelAr: 'وكيل شحن', labelEn: 'Agents' },
];

// ============================================
// ANIMATED SHIP COMPONENT (Ref-based, zero re-renders)
// ============================================
interface AnimatedShipProps {
    points: { x: number; y: number }[];
    delay: number;
    duration: number;
    color: string;
    paused: boolean;
}

const AnimatedShip: React.FC<AnimatedShipProps> = ({
    points, delay, duration, color, paused
}) => {
    const shipRef = useRef<SVGGElement>(null);
    const trailRef = useRef<SVGCircleElement>(null);
    const startTimeRef = useRef<number | null>(null);
    const rafRef = useRef<number>(0);
    const activeRef = useRef(false);

    useEffect(() => {
        if (points.length < 2) return;
        const timer = setTimeout(() => { activeRef.current = true; }, delay);
        return () => clearTimeout(timer);
    }, [delay, points.length]);

    useEffect(() => {
        if (points.length < 2) return;

        // When paused, do NOT schedule any frames at all
        if (paused) {
            startTimeRef.current = null;
            return;
        }

        const animate = (time: number) => {
            if (!activeRef.current) {
                startTimeRef.current = null;
                rafRef.current = requestAnimationFrame(animate);
                return;
            }
            if (startTimeRef.current === null) startTimeRef.current = time;
            const elapsed = time - startTimeRef.current;
            const t = (elapsed % (duration * 1000)) / (duration * 1000);

            const pt = getPointOnPath(points, t);
            const angle = getTangentAngleOnPath(points, t);

            if (shipRef.current) {
                shipRef.current.setAttribute('transform', `translate(${pt.x}, ${pt.y}) rotate(${angle})`);
            }
            if (trailRef.current) {
                const tp = getPointOnPath(points, Math.max(0, t - 0.03));
                trailRef.current.setAttribute('cx', String(tp.x));
                trailRef.current.setAttribute('cy', String(tp.y));
            }
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [points, duration, paused]);

    if (points.length < 2) return null;

    return (
        <g>
            {/* Single trail dot */}
            <circle ref={trailRef} r={3} fill={color} opacity={0.2} />
            {/* Ship icon */}
            <g ref={shipRef}>
                <path d="M -6 0 L -4 -2 L 5 -2 L 7 0 L 5 2 L -4 2 Z" fill={color} />
                <path d="M 5 -1.5 L 8 0 L 5 1.5" fill={color} opacity={0.8} />
            </g>
        </g>
    );
};

// ============================================
// ANIMATED ROUTE PATH
// ============================================
interface AnimatedRouteProps {
    path: string;
    isAnimated: boolean;
    isHovered: boolean;
    isMain: boolean;
    index: number;
}

const AnimatedRoute: React.FC<AnimatedRouteProps> = ({ path, isAnimated, isHovered, isMain, index }) => {
    const baseOpacity = isMain ? 0.6 : 0.35;
    const strokeWidth = isMain ? 2.5 : 1.5;

    return (
        <g>
            {/* Background glow for hovered state */}
            {isHovered && (
                <motion.path
                    d={path}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth={strokeWidth + 4}
                    strokeOpacity={0.4}
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />
            )}

            {/* Main route line with gradient stroke */}
            <motion.path
                d={path}
                fill="none"
                stroke={`url(#routeGradient${isMain ? 'Main' : 'Secondary'})`}
                strokeWidth={isHovered ? strokeWidth + 0.5 : strokeWidth}
                strokeOpacity={isAnimated ? (isHovered ? 0.9 : baseOpacity) : 0}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={isAnimated ? { pathLength: 1 } : {}}
                transition={{ duration: 0.8, ease: 'easeOut', delay: (index % 15) * 0.05 }}
            />

            {/* Animated dash overlay for flow effect - ALL routes */}
            {isAnimated && (
                <>
                    {/* Main flowing animation */}
                    <motion.path
                        d={path}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth={isMain ? 1.2 : 0.8}
                        strokeOpacity={0.5}
                        strokeLinecap="round"
                        strokeDasharray="8 20"
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: -200 }}
                        transition={{
                            duration: isMain ? 4 : 5,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                    {/* Secondary glow effect for main routes */}
                    {isMain && (
                        <motion.path
                            d={path}
                            fill="none"
                            stroke="#f97316"
                            strokeWidth={1.5}
                            strokeOpacity={0.3}
                            strokeLinecap="round"
                            strokeDasharray="12 30"
                            initial={{ strokeDashoffset: 0 }}
                            animate={{ strokeDashoffset: -250 }}
                            transition={{
                                duration: 3.5,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            filter="url(#routeGlow)"
                        />
                    )}
                </>
            )}
        </g>
    );
};

// ============================================
// PORT MARKER COMPONENT (Lightweight — no Framer Motion)
// ============================================
interface PortMarkerProps {
    x: number;
    y: number;
    isHub: boolean;
    isHovered: boolean;
    onHover: () => void;
    onLeave: () => void;
}

const PortMarker: React.FC<PortMarkerProps> = ({ x, y, isHub, isHovered, onHover, onLeave }) => {
    const baseColor = isHub ? '#f97316' : '#0ea5e9';
    const size = isHub ? 8 : 5;

    return (
        <g
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            style={{ cursor: 'pointer' }}
        >
            {/* Static outer glow */}
            <circle
                cx={x}
                cy={y}
                r={isHovered ? size * 2 : size * 1.3}
                fill={baseColor}
                opacity={isHovered ? 0.35 : 0.2}
            />
            {/* Main dot */}
            <circle
                cx={x}
                cy={y}
                r={isHovered ? size * 1.2 : size}
                fill={baseColor}
            />
            {/* Inner highlight */}
            <circle
                cx={x - size * 0.15}
                cy={y - size * 0.15}
                r={size * 0.25}
                fill="white"
                opacity={0.5}
            />
        </g>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function WorldMapVisualization() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    // PERF: Removed hoveredLocation, hoveredRoute, hoveredShip states
    // These caused full SVG re-render on every mouse move across ~200 elements
    const [animatedRoutes, setAnimatedRoutes] = useState<number[]>([]);
    // Live Mode disabled for performance
    // const [isLiveMode, setIsLiveMode] = useState(false);
    // const [liveShips, setLiveShips] = useState<any[]>([]);
    const [isInView, setIsInView] = useState(false);
    const [worldGeoData, setWorldGeoData] = useState<any>(null);
    const sectionRef = useRef<HTMLElement>(null);

    // Fetch world topology for map rendering
    useEffect(() => {
        fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
            .then(res => res.json())
            .then(topology => {
                const countries = feature(topology, topology.objects.countries);
                const land = feature(topology, topology.objects.land);
                setWorldGeoData({ countries, land });
            })
            .catch(err => console.error('Failed to load world map data:', err));
    }, []);

    // IntersectionObserver: completely pause animations when off-screen
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsInView(entry.isIntersecting),
            { threshold: 0.05 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Calculate projected locations
    const projectedLocations = useMemo(() => {
        return locations.map(loc => ({
            ...loc,
            ...project(loc.lat, loc.lon)
        }));
    }, []);

    // Calculate maritime paths for all routes using waypoints
    const routePaths = useMemo(() => {
        return routes.map((route) => {
            const from = projectedLocations.find(l => l.id === route.from);
            const to = projectedLocations.find(l => l.id === route.to);
            if (!from || !to) return null;

            // Get original lat/lon from locations
            const fromLoc = locations.find(l => l.id === route.from);
            const toLoc = locations.find(l => l.id === route.to);
            if (!fromLoc || !toLoc) return null;

            const pathData = calculateMaritimePath(
                { x: from.x, y: from.y, lat: fromLoc.lat, lon: fromLoc.lon },
                { x: to.x, y: to.y, lat: toLoc.lat, lon: toLoc.lon },
                route.waypoints
            );

            return {
                ...pathData,
                from,
                to,
                type: route.type,
            };
        }).filter(Boolean);
    }, [projectedLocations]);

    // Animate routes in batches for better performance with many routes
    useEffect(() => {
        const animateRoutes = () => {
            const batchSize = 8; // Animate 8 routes at a time
            const batches = Math.ceil(routes.length / batchSize);

            for (let batch = 0; batch < batches; batch++) {
                setTimeout(() => {
                    const startIndex = batch * batchSize;
                    const endIndex = Math.min(startIndex + batchSize, routes.length);
                    const newIndices = Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i);
                    setAnimatedRoutes(prev => [...prev, ...newIndices]);
                }, batch * 150);
            }
        };

        const timer = setTimeout(animateRoutes, 300);
        return () => clearTimeout(timer);
    }, []);

    // Live Mode API fetch disabled for performance
    // useEffect(() => { ... }, [isLiveMode]);

    // PERF: Removed getLocationById — tooltip removed to eliminate hover-triggered re-renders

    return (
        <section ref={sectionRef} className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-[#0a1628] dark:to-[#0d1e36] relative overflow-hidden">
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0">
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-marine-100/30 via-transparent to-transparent dark:from-marine-800/20" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-brand-orange/5 via-transparent to-transparent" />

                {/* Animated grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px]" />
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
            <motion.div
                className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-marine-500/10 dark:bg-marine-500/20 rounded-full blur-[150px]"
                animate={{
                    opacity: [0.4, 0.7, 0.4],
                    scale: [1, 1.15, 1],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
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
                    <p className="text-xl text-gray-600 dark:text-marine-300 max-w-2xl mx-auto mb-3">
                        {isRTL
                            ? 'شبكة شركاء واسعة تغطي أكثر من 50 دولة حول العالم'
                            : 'Extensive partner network covering over 50 countries worldwide'}
                    </p>
                    {/* Live Mode section removed for performance */}
                </motion.div>

                {/* Map Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative aspect-[2/1] w-full mx-auto mb-16"
                >
                    <div
                        className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/80 to-white/60 dark:from-[#0d1e36]/90 dark:to-[#0a1628]/90 border border-gray-200/50 dark:border-marine-700/30 backdrop-blur-xl overflow-hidden shadow-2xl shadow-marine-500/10 dark:shadow-marine-900/50"
                        style={{ touchAction: 'pan-y' }}
                        onWheel={(e) => {
                            // Let the page scroll normally — don't let the SVG capture the wheel event
                            e.stopPropagation();
                            const target = e.currentTarget;
                            target.style.pointerEvents = 'none';
                            requestAnimationFrame(() => { target.style.pointerEvents = ''; });
                        }}
                    >
                        <svg
                            viewBox="0 0 2000 857"
                            className="w-full h-full"
                            preserveAspectRatio="xMidYMid slice"
                            style={{ overflow: 'hidden', display: 'block' }}
                        >
                            <defs>
                                {/* Gradient for main routes */}
                                <linearGradient id="routeGradientMain" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#f97316" stopOpacity="1" />
                                    <stop offset="50%" stopColor="#fb923c" stopOpacity="0.9" />
                                    <stop offset="100%" stopColor="#f97316" stopOpacity="1" />
                                </linearGradient>

                                {/* Gradient for secondary routes */}
                                <linearGradient id="routeGradientSecondary" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.9" />
                                    <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.7" />
                                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.9" />
                                </linearGradient>
                            </defs>

                            {/* All map content — no scale wrapper, projection fills viewBox natively */}

                            {/* World Map — d3-geo rendered country paths (dark landmasses) */}
                            {worldGeoData && worldGeoData.countries.features.map((feat: any, i: number) => (
                                <path
                                    key={i}
                                    d={d3PathGenerator(feat) || ''}
                                    className="fill-slate-300 dark:fill-[#0c1929] stroke-slate-400/50 dark:stroke-[#162a45]/60"
                                    strokeWidth={0.4}
                                    strokeLinejoin="round"
                                />
                            ))}

                            {/* City lights — solid color, zero filters (dark mode only) */}
                            <g className="hidden dark:block">
                                {CITY_LIGHTS.map((city, i) => {
                                    const p = projection([city.lon, city.lat]);
                                    if (!p) return null;
                                    const r = city.tier === 1 ? 1.6 : city.tier === 2 ? 0.9 : 0.5;
                                    return (
                                        <circle
                                            key={`cl-${i}`}
                                            cx={p[0]}
                                            cy={p[1]}
                                            r={r}
                                            fill="#ffe3a1"
                                            opacity={city.tier === 1 ? 0.95 : city.tier === 2 ? 0.7 : 0.45}
                                        />
                                    );
                                })}
                            </g>



                            {/* Curved shipping routes */}
                            {routePaths.map((routeData, index) => {
                                if (!routeData) return null;
                                const isAnimated = animatedRoutes.includes(index);
                                const isMain = routeData.type === 'main';

                                // Only show ships on first 6 main routes for performance
                                const mainRouteIndex = isMain ? routePaths.filter((r, i) => i < index && r?.type === 'main').length : -1;
                                const showShip = isMain && mainRouteIndex < 6;

                                return (
                                    <g key={index} className="route-group">
                                        <AnimatedRoute
                                            path={routeData.path}
                                            isAnimated={isAnimated}
                                            isHovered={false}
                                            isMain={isMain}
                                            index={index}
                                        />

                                        {/* Animated ship on main routes only */}
                                        {isAnimated && showShip && routeData.points && (
                                            <AnimatedShip
                                                points={routeData.points}
                                                delay={(index % 15) * 600 + 800}
                                                duration={12 + (routeData.totalDistance / 120)}
                                                color={'#f97316'}
                                                paused={!isInView}
                                            />
                                        )}
                                    </g>
                                );
                            })}

                            {/* Direction arrows on main routes only — static SVG for performance */}
                            {routePaths.map((routeData, index) => {
                                if (!routeData || !animatedRoutes.includes(index) || routeData.type !== 'main' || !routeData.points) return null;
                                const numArrows = Math.min(2, Math.max(1, Math.floor(routeData.points.length / 5)));
                                const arrows = [];
                                for (let i = 0; i < numArrows; i++) {
                                    const t = (i + 1) / (numArrows + 1);
                                    const point = getPointOnPath(routeData.points, t);
                                    const angle = getTangentAngleOnPath(routeData.points, t);
                                    arrows.push(
                                        <g key={`arrow-${index}-${i}`}
                                            transform={`translate(${point.x}, ${point.y}) rotate(${angle})`}
                                            opacity={0.5}
                                        >
                                            <path d="M -4 -3 L 4 0 L -4 3 L -1.5 0 Z" fill="#f97316" />
                                        </g>
                                    );
                                }
                                return <g key={`arrows-${index}`}>{arrows}</g>;
                            })}

                            {/* Port markers */}
                            {projectedLocations.map((location) => (
                                <PortMarker
                                    key={location.id}
                                    x={location.x}
                                    y={location.y}
                                    isHub={location.type === 'hub'}
                                    isHovered={false}
                                    onHover={() => { }}
                                    onLeave={() => { }}
                                />
                            ))}

                            {/* Live Ships removed for performance */}





                        </svg>
                    </div>

                    {/* PERF: Tooltips removed — they caused full re-renders on every mouse move */}

                    {/* Legend — hidden on mobile (shown below map instead) */}
                    <div className="hidden md:flex absolute bottom-4 right-4 flex-row items-center gap-6 text-sm bg-white/90 dark:bg-marine-900/80 backdrop-blur-xl px-4 py-3 rounded-xl border border-gray-200/50 dark:border-marine-700/50 shadow-lg">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-4 h-4 rounded-full bg-brand-orange" />
                                <motion.div
                                    className="absolute inset-0 w-4 h-4 rounded-full bg-brand-orange"
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>
                            <span className="text-gray-700 dark:text-marine-200 font-medium">
                                {isRTL ? 'مركز رئيسي' : 'Main Hub'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-marine-500" />
                            <span className="text-gray-700 dark:text-marine-200 font-medium">
                                {isRTL ? 'ميناء شريك' : 'Partner Port'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-0.5 bg-gradient-to-r from-brand-orange to-brand-orange/50 rounded" />
                            <span className="text-gray-700 dark:text-marine-200 font-medium">
                                {isRTL ? 'خط رئيسي' : 'Main Route'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-0.5 bg-gradient-to-r from-marine-500 to-marine-500/50 rounded" />
                            <span className="text-gray-700 dark:text-marine-200 font-medium">
                                {isRTL ? 'خط إقليمي' : 'Regional Route'}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Legend — mobile only: shown below the map */}
                <div className="flex md:hidden flex-wrap justify-center items-center gap-x-5 gap-y-2 text-sm bg-white/90 dark:bg-marine-900/80 backdrop-blur-xl px-4 py-3 rounded-xl border border-gray-200/50 dark:border-marine-700/50 shadow-lg mb-8 mx-4">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="w-4 h-4 rounded-full bg-brand-orange" />
                            <motion.div
                                className="absolute inset-0 w-4 h-4 rounded-full bg-brand-orange"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                        <span className="text-gray-700 dark:text-marine-200 font-medium">{isRTL ? 'مركز رئيسي' : 'Main Hub'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-marine-500" />
                        <span className="text-gray-700 dark:text-marine-200 font-medium">{isRTL ? 'ميناء شريك' : 'Partner Port'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-gradient-to-r from-brand-orange to-brand-orange/50 rounded" />
                        <span className="text-gray-700 dark:text-marine-200 font-medium">{isRTL ? 'خط رئيسي' : 'Main Route'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-gradient-to-r from-marine-500 to-marine-500/50 rounded" />
                        <span className="text-gray-700 dark:text-marine-200 font-medium">{isRTL ? 'خط إقليمي' : 'Regional Route'}</span>
                    </div>
                </div>

                {/* Stats - Enhanced */}
                <div className="grid grid-cols-3 gap-3 sm:gap-5 md:gap-8 max-w-3xl mx-auto text-center">
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
                            <div className="relative p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl bg-white/50 dark:bg-marine-800/30 backdrop-blur-sm border border-gray-200/50 dark:border-marine-700/30">
                                <div className="text-2xl sm:text-3xl md:text-5xl font-black bg-gradient-to-br from-marine-900 to-marine-600 dark:from-white dark:to-marine-200 bg-clip-text text-transparent mb-1 sm:mb-2">
                                    {isRTL ? stat.valueAr : stat.valueEn}
                                </div>
                                <div className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-marine-400 font-medium">
                                    {isRTL ? stat.labelAr : stat.labelEn}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div >
        </section >
    );
}
