import { NextResponse } from 'next/server';
import { mockShips, updateShipPositions, type ShipData } from '@/lib/mock-ship-data';

// GET /api/ships/live
// يعيد بيانات السفن التجريبية (محاكاة للبيانات الحية)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        
        // معاملات اختيارية
        const filterType = searchParams.get('type'); // نوع السفينة
        const filterPort = searchParams.get('port'); // تصفية حسب ميناء
        const limit = parseInt(searchParams.get('limit') || '20');
        const simulate = searchParams.get('simulate') === 'true'; // محاكاة الحركة
        
        let ships: ShipData[] = mockShips;
        
        // إذا كانت المحاكاة مفعلة، حدّث المواقع
        if (simulate) {
            const now = Date.now();
            const startTime = now - (3600000 * 2); // بدأت منذ ساعتين
            ships = updateShipPositions(now - startTime);
        }
        
        // تصفية حسب النوع
        if (filterType) {
            ships = ships.filter(ship => 
                ship.type.toLowerCase().includes(filterType.toLowerCase())
            );
        }
        
        // تصفية حسب الميناء
        if (filterPort) {
            ships = ships.filter(ship => 
                ship.fromPort === filterPort || 
                ship.toPort === filterPort
            );
        }
        
        // تحديد العدد
        ships = ships.slice(0, limit);
        
        // إضافة metadata
        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            count: ships.length,
            ships: ships,
            metadata: {
                source: 'mock-data',
                realtime: false,
                updateInterval: 60, // seconds
                coverage: 'global'
            }
        };
        
        return NextResponse.json(response, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            }
        });
        
    } catch (error) {
        console.error('Error fetching ship data:', error);
        
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch ship data',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
