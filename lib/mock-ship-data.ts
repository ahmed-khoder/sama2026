// Mock AIS Ship Data - بيانات تجريبية واقعية للسفن
// تحاكي البيانات الحية من AIS APIs

export interface ShipData {
    mmsi: string;           // Maritime Mobile Service Identity
    imo: string;            // International Maritime Organization number
    name: string;           // اسم السفينة
    callsign: string;       // نداء السفينة
    type: string;           // نوع السفينة
    typeCode: number;       // رمز النوع
    flag: string;           // العلم
    length: number;         // الطول (متر)
    width: number;          // العرض (متر)
    position: {
        lat: number;        // خط العرض
        lng: number;        // خط الطول
    };
    course: number;         // الاتجاه (0-360 درجة)
    speed: number;          // السرعة (عقدة)
    heading: number;        // اتجاه البوصلة
    destination: string;    // الوجهة
    eta: string;           // وقت الوصول المتوقع
    draught: number;       // الغاطس (متر)
    lastUpdate: string;    // آخر تحديث
    status: string;        // الحالة
    fromPort: string;      // من ميناء
    toPort: string;        // إلى ميناء
    route: {               // المسار
        start: { lat: number; lng: number };
        end: { lat: number; lng: number };
        waypoints?: { lat: number; lng: number }[];
    };
}

// قائمة السفن التجريبية - 20 سفينة حقيقية
export const mockShips: ShipData[] = [
    // ========== سفن متجهة من/إلى بورسعيد ==========
    {
        mmsi: '538005989',
        imo: '9811000',
        name: 'EVER GIVEN',
        callsign: '3FXY8',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'Panama',
        length: 400,
        width: 59,
        position: { lat: 31.5, lng: 33.2 },
        course: 285,
        speed: 12.5,
        heading: 287,
        destination: 'ROTTERDAM',
        eta: '2026-01-20T14:30:00Z',
        draught: 14.5,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'port-said',
        toPort: 'rotterdam',
        route: {
            start: { lat: 31.2653, lng: 32.3019 },
            end: { lat: 51.9244, lng: 4.4777 },
            waypoints: [
                { lat: 36.0, lng: 18.0 },  // Mediterranean
                { lat: 36.0, lng: -5.5 },  // Gibraltar
                { lat: 45.0, lng: -10.0 }  // Atlantic
            ]
        }
    },
    {
        mmsi: '477654200',
        imo: '9632147',
        name: 'MSC GÜLSÜN',
        callsign: 'VRWY8',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'Hong Kong',
        length: 400,
        width: 61,
        position: { lat: 30.8, lng: 32.8 },
        course: 95,
        speed: 13.2,
        heading: 98,
        destination: 'SINGAPORE',
        eta: '2026-01-25T08:00:00Z',
        draught: 15.2,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'port-said',
        toPort: 'singapore',
        route: {
            start: { lat: 31.2653, lng: 32.3019 },
            end: { lat: 1.3521, lng: 103.8198 },
            waypoints: [
                { lat: 29.9, lng: 32.5 },   // Suez South
                { lat: 12.5, lng: 43.5 },   // Bab el-Mandeb
                { lat: 15.0, lng: 65.0 },   // Arabian Sea
                { lat: 0.0, lng: 75.0 },    // Indian Ocean
                { lat: 1.5, lng: 104.0 }    // Malacca Strait
            ]
        }
    },
    {
        mmsi: '636019825',
        imo: '9795482',
        name: 'CMA CGM ANTOINE DE SAINT EXUPERY',
        callsign: 'A8QM5',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'Liberia',
        length: 400,
        width: 59,
        position: { lat: 28.5, lng: 33.8 },
        course: 165,
        speed: 11.8,
        heading: 168,
        destination: 'JEBEL ALI',
        eta: '2026-01-18T16:00:00Z',
        draught: 14.8,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'port-said',
        toPort: 'jebel-ali',
        route: {
            start: { lat: 31.2653, lng: 32.3019 },
            end: { lat: 24.9857, lng: 55.0275 },
            waypoints: [
                { lat: 29.9, lng: 32.5 },   // Suez South
                { lat: 12.5, lng: 43.5 }    // Bab el-Mandeb
            ]
        }
    },

    // ========== سفن في المحيط الهادئ (Trans-Pacific) ==========
    {
        mmsi: '477995900',
        imo: '9839471',
        name: 'COSCO SHIPPING UNIVERSE',
        callsign: 'VRPJ6',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'Hong Kong',
        length: 400,
        width: 58,
        position: { lat: 28.5, lng: 175.0 },
        course: 65,
        speed: 14.5,
        heading: 67,
        destination: 'LOS ANGELES',
        eta: '2026-01-22T10:00:00Z',
        draught: 14.2,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'shanghai',
        toPort: 'los-angeles',
        route: {
            start: { lat: 31.2304, lng: 121.4737 },
            end: { lat: 33.7405, lng: -118.2720 },
            waypoints: [
                { lat: 25.0, lng: 155.0 },   // Pacific West
                { lat: 30.0, lng: -170.0 },  // Pacific Center
                { lat: 30.0, lng: -140.0 }   // Pacific East
            ]
        }
    },
    {
        mmsi: '477371200',
        imo: '9708800',
        name: 'OOCL HONG KONG',
        callsign: 'VRMH6',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'Hong Kong',
        length: 400,
        width: 59,
        position: { lat: 32.0, lng: 155.0 },
        course: 285,
        speed: 15.2,
        heading: 283,
        destination: 'HONG KONG',
        eta: '2026-01-28T06:00:00Z',
        draught: 14.9,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'los-angeles',
        toPort: 'hong-kong',
        route: {
            start: { lat: 33.7405, lng: -118.2720 },
            end: { lat: 22.3193, lng: 114.1694 },
            waypoints: [
                { lat: 30.0, lng: -140.0 },  // Pacific East
                { lat: 30.0, lng: -170.0 },  // Pacific Center
                { lat: 25.0, lng: 155.0 }    // Pacific West
            ]
        }
    },

    // ========== سفن في آسيا ==========
    {
        mmsi: '563808000',
        imo: '9467438',
        name: 'APL TEMASEK',
        callsign: '9V7854',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'Singapore',
        length: 368,
        width: 51,
        position: { lat: 8.5, lng: 110.0 },
        course: 320,
        speed: 16.8,
        heading: 318,
        destination: 'SHANGHAI',
        eta: '2026-01-19T22:00:00Z',
        draught: 13.5,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'singapore',
        toPort: 'shanghai',
        route: {
            start: { lat: 1.3521, lng: 103.8198 },
            end: { lat: 31.2304, lng: 121.4737 },
            waypoints: [
                { lat: 12.0, lng: 114.0 }  // South China Sea
            ]
        }
    },
    {
        mmsi: '477906100',
        imo: '9708824',
        name: 'OOCL GERMANY',
        callsign: 'VRPB5',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'Hong Kong',
        length: 400,
        width: 59,
        position: { lat: 18.5, lng: 118.0 },
        course: 185,
        speed: 12.3,
        heading: 187,
        destination: 'SINGAPORE',
        eta: '2026-01-21T14:00:00Z',
        draught: 14.6,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'hong-kong',
        toPort: 'singapore',
        route: {
            start: { lat: 22.3193, lng: 114.1694 },
            end: { lat: 1.3521, lng: 103.8198 },
            waypoints: [
                { lat: 12.0, lng: 114.0 }  // South China Sea
            ]
        }
    },

    // ========== سفن في المحيط الهندي ==========
    {
        mmsi: '566590000',
        imo: '9488015',
        name: 'MAERSK KOLKATA',
        callsign: '9V3775',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'Singapore',
        length: 300,
        width: 48,
        position: { lat: 8.0, lng: 80.0 },
        course: 280,
        speed: 14.2,
        heading: 282,
        destination: 'JEBEL ALI',
        eta: '2026-01-23T18:00:00Z',
        draught: 12.8,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'colombo',
        toPort: 'jebel-ali',
        route: {
            start: { lat: 6.9271, lng: 79.8612 },
            end: { lat: 24.9857, lng: 55.0275 },
            waypoints: [
                { lat: 15.0, lng: 65.0 }  // Arabian Sea
            ]
        }
    },
    {
        mmsi: '419000752',
        imo: '9401666',
        name: 'MSC SHREYA',
        callsign: 'APOB',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'India',
        length: 294,
        width: 40,
        position: { lat: 18.5, lng: 71.0 },
        course: 105,
        speed: 13.5,
        heading: 108,
        destination: 'COLOMBO',
        eta: '2026-01-17T12:00:00Z',
        draught: 11.9,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'mumbai',
        toPort: 'colombo',
        route: {
            start: { lat: 19.0760, lng: 72.8777 },
            end: { lat: 6.9271, lng: 79.8612 },
            waypoints: [
                { lat: 0.0, lng: 75.0 }  // Indian Ocean
            ]
        }
    },

    // ========== سفن في الأطلسي ==========
    {
        mmsi: '210180000',
        imo: '9839843',
        name: 'MSC TESSA',
        callsign: 'DIEG',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'Germany',
        length: 400,
        width: 61,
        position: { lat: 42.0, lng: -25.0 },
        course: 85,
        speed: 15.8,
        heading: 87,
        destination: 'ROTTERDAM',
        eta: '2026-01-19T08:00:00Z',
        draught: 15.1,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'new-york',
        toPort: 'rotterdam',
        route: {
            start: { lat: 40.7128, lng: -74.0060 },
            end: { lat: 51.9244, lng: 4.4777 },
            waypoints: [
                { lat: 35.0, lng: -40.0 }  // Mid Atlantic
            ]
        }
    },
    {
        mmsi: '255806320',
        imo: '9813783',
        name: 'MSC ELOANE',
        callsign: 'CQBB2',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'Portugal',
        length: 398,
        width: 61,
        position: { lat: 38.0, lng: -50.0 },
        course: 265,
        speed: 14.9,
        heading: 267,
        destination: 'NEW YORK',
        eta: '2026-01-24T16:00:00Z',
        draught: 14.7,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'rotterdam',
        toPort: 'new-york',
        route: {
            start: { lat: 51.9244, lng: 4.4777 },
            end: { lat: 40.7128, lng: -74.0060 },
            waypoints: [
                { lat: 35.0, lng: -40.0 }  // Mid Atlantic
            ]
        }
    },

    // ========== سفن النفط (Tankers) ==========
    {
        mmsi: '636020154',
        imo: '9712354',
        name: 'DHI TABARAK',
        callsign: 'A8RR7',
        type: 'Crude Oil Tanker',
        typeCode: 80,
        flag: 'Liberia',
        length: 333,
        width: 60,
        position: { lat: 25.5, lng: 52.0 },
        course: 190,
        speed: 10.5,
        heading: 192,
        destination: 'SINGAPORE',
        eta: '2026-01-30T20:00:00Z',
        draught: 16.8,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'jebel-ali',
        toPort: 'singapore',
        route: {
            start: { lat: 24.9857, lng: 55.0275 },
            end: { lat: 1.3521, lng: 103.8198 },
            waypoints: [
                { lat: 15.0, lng: 65.0 },   // Arabian Sea
                { lat: 0.0, lng: 75.0 },    // Indian Ocean
                { lat: 1.5, lng: 104.0 }    // Malacca Strait
            ]
        }
    },
    {
        mmsi: '477350300',
        imo: '9629309',
        name: 'ALPINE PENELOPE',
        callsign: 'VRNI6',
        type: 'Crude Oil Tanker',
        typeCode: 80,
        flag: 'Hong Kong',
        length: 336,
        width: 60,
        position: { lat: 5.0, lng: 95.0 },
        course: 285,
        speed: 11.2,
        heading: 288,
        destination: 'FUJAIRAH',
        eta: '2026-02-02T14:00:00Z',
        draught: 17.2,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'singapore',
        toPort: 'jebel-ali',
        route: {
            start: { lat: 1.3521, lng: 103.8198 },
            end: { lat: 24.9857, lng: 55.0275 },
            waypoints: [
                { lat: 0.0, lng: 75.0 },    // Indian Ocean
                { lat: 15.0, lng: 65.0 }    // Arabian Sea
            ]
        }
    },

    // ========== سفن متنوعة ==========
    {
        mmsi: '431005000',
        imo: '9795494',
        name: 'ONE INNOVATION',
        callsign: 'JDYH',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'Japan',
        length: 400,
        width: 59,
        position: { lat: 34.0, lng: 138.0 },
        course: 65,
        speed: 14.8,
        heading: 67,
        destination: 'LONG BEACH',
        eta: '2026-01-26T18:00:00Z',
        draught: 14.5,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'tokyo',
        toPort: 'long-beach',
        route: {
            start: { lat: 35.6762, lng: 139.6503 },
            end: { lat: 33.7701, lng: -118.1937 },
            waypoints: [
                { lat: 25.0, lng: 155.0 },   // Pacific West
                { lat: 30.0, lng: -170.0 },  // Pacific Center
                { lat: 30.0, lng: -140.0 }   // Pacific East
            ]
        }
    },
    {
        mmsi: '441226000',
        imo: '9845907',
        name: 'NYK DELPHINUS',
        callsign: 'JOCC',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'South Korea',
        length: 368,
        width: 51,
        position: { lat: 35.5, lng: 127.0 },
        course: 285,
        speed: 13.9,
        heading: 283,
        destination: 'SINGAPORE',
        eta: '2026-01-27T10:00:00Z',
        draught: 13.8,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'busan',
        toPort: 'singapore',
        route: {
            start: { lat: 35.1796, lng: 129.0756 },
            end: { lat: 1.3521, lng: 103.8198 },
            waypoints: [
                { lat: 12.0, lng: 114.0 },   // South China Sea
                { lat: 1.5, lng: 104.0 }     // Malacca Strait
            ]
        }
    },

    // ========== سفن في أمريكا الجنوبية ==========
    {
        mmsi: '710988000',
        imo: '9713894',
        name: 'MSC FEDERICA',
        callsign: 'HPTJ',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'Brazil',
        length: 366,
        width: 51,
        position: { lat: -18.0, lng: -38.0 },
        course: 85,
        speed: 15.5,
        heading: 87,
        destination: 'ROTTERDAM',
        eta: '2026-02-05T12:00:00Z',
        draught: 13.2,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'santos',
        toPort: 'rotterdam',
        route: {
            start: { lat: -23.9608, lng: -46.3331 },
            end: { lat: 51.9244, lng: 4.4777 },
            waypoints: [
                { lat: 35.0, lng: -40.0 },   // Mid Atlantic
                { lat: 45.0, lng: -10.0 }    // Atlantic Europe
            ]
        }
    },
    {
        mmsi: '636019837',
        imo: '9839867',
        name: 'CMA CGM BENJAMIN FRANKLIN',
        callsign: 'A8QP3',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'Liberia',
        length: 398,
        width: 54,
        position: { lat: -28.0, lng: 8.0 },
        course: 35,
        speed: 12.8,
        heading: 37,
        destination: 'SINGAPORE',
        eta: '2026-02-08T08:00:00Z',
        draught: 14.4,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'santos',
        toPort: 'singapore',
        route: {
            start: { lat: -23.9608, lng: -46.3331 },
            end: { lat: 1.3521, lng: 103.8198 },
            waypoints: [
                { lat: -35.0, lng: 18.0 },   // Cape Hope
                { lat: -20.0, lng: 60.0 },   // Indian South
                { lat: 0.0, lng: 75.0 },     // Indian Ocean
                { lat: 1.5, lng: 104.0 }     // Malacca Strait
            ]
        }
    },

    // ========== سفن في أوروبا ==========
    {
        mmsi: '305464000',
        imo: '9321483',
        name: 'MAERSK KENSINGTON',
        callsign: 'C6GK3',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'Bahamas',
        length: 347,
        width: 43,
        position: { lat: 53.0, lng: 8.5 },
        course: 285,
        speed: 8.5,
        heading: 287,
        destination: 'ROTTERDAM',
        eta: '2026-01-16T06:00:00Z',
        draught: 13.1,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'hamburg',
        toPort: 'rotterdam',
        route: {
            start: { lat: 53.5511, lng: 9.9937 },
            end: { lat: 51.9244, lng: 4.4777 }
        }
    },
    {
        mmsi: '246813000',
        imo: '9489731',
        name: 'MSC MINA',
        callsign: 'PDRM',
        type: 'Container Ship',
        typeCode: 70,
        flag: 'Netherlands',
        length: 366,
        width: 51,
        position: { lat: 38.5, lng: 22.0 },
        course: 95,
        speed: 16.2,
        heading: 97,
        destination: 'PIRAEUS',
        eta: '2026-01-16T18:00:00Z',
        draught: 13.7,
        lastUpdate: new Date().toISOString(),
        status: 'Under way using engine',
        fromPort: 'rotterdam',
        toPort: 'piraeus',
        route: {
            start: { lat: 51.9244, lng: 4.4777 },
            end: { lat: 37.9475, lng: 23.6372 },
            waypoints: [
                { lat: 36.0, lng: -5.5 },   // Gibraltar
                { lat: 36.0, lng: 18.0 }    // Med Center
            ]
        }
    }
];

// دالة للحصول على موقع السفينة بناءً على الوقت
export function getShipPosition(ship: ShipData, progressPercent: number = 50): { lat: number; lng: number } {
    const { route } = ship;
    const allPoints = [
        route.start,
        ...(route.waypoints || []),
        route.end
    ];
    
    // حساب المسافة الإجمالية
    const totalProgress = Math.min(Math.max(progressPercent, 0), 100) / 100;
    
    // تحديد القطعة الحالية من المسار
    const segmentCount = allPoints.length - 1;
    const currentSegmentFloat = totalProgress * segmentCount;
    const currentSegment = Math.floor(currentSegmentFloat);
    const segmentProgress = currentSegmentFloat - currentSegment;
    
    if (currentSegment >= segmentCount) {
        return route.end;
    }
    
    const start = allPoints[currentSegment];
    const end = allPoints[currentSegment + 1];
    
    // Interpolation بين نقطتين
    return {
        lat: start.lat + (end.lat - start.lat) * segmentProgress,
        lng: start.lng + (end.lng - start.lng) * segmentProgress
    };
}

// دالة لتحديث مواقع جميع السفن
export function updateShipPositions(timeElapsed: number = 0): ShipData[] {
    return mockShips.map(ship => {
        // حساب التقدم بناءً على السرعة والوقت
        // كل ساعة = 3600 ثانية
        // السرعة بالعقدة (nautical miles per hour)
        const hoursElapsed = timeElapsed / 3600000; // milliseconds to hours
        const distanceTraveled = ship.speed * hoursElapsed;
        
        // تقدير المسافة الإجمالية (تقريبي)
        const totalDistance = 1000; // nautical miles (تقديري)
        const progressPercent = (distanceTraveled / totalDistance) * 100;
        
        const newPosition = getShipPosition(ship, progressPercent);
        
        return {
            ...ship,
            position: newPosition,
            lastUpdate: new Date().toISOString()
        };
    });
}
