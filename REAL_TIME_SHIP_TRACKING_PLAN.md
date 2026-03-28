# 🚢 خطة تنفيذ نظام تتبع السفن الحية (Real-Time Ship Tracking)

## 🎯 الفكرة المقترحة

استخدام بيانات AIS (Automatic Identification System) الحية لعرض حركة السفن الحقيقية بدلاً من الحركة المحاكاة.

---

## 📊 مصادر البيانات المجانية/المحدودة

### 1. **AISHub** (الأفضل للبدء)
- **الموقع**: https://www.aishub.net/
- **النوع**: مجاني تماماً
- **البيانات**: 
  - بيانات AIS خام من محطات استقبال حول العالم
  - تحديث كل 1-3 دقائق
  - MMSI, Position, Speed, Course, Ship Name, etc.
- **API**: 
  - WebSocket للبيانات الحية
  - REST API للبيانات التاريخية
- **القيود**: 
  - تحتاج تسجيل مجاني
  - معدل طلبات محدود
  - تغطية غير كاملة

**مثال على الاستخدام:**
```javascript
// WebSocket Connection
ws://stream.aishub.net/ws?username=YOUR_USERNAME&format=1
```

---

### 2. **MarineTraffic API** (الأكثر شهرة)
- **الموقع**: https://www.marinetraffic.com/en/ais-api-services
- **النوع**: مجاني محدود + خطط مدفوعة
- **الخطة المجانية**:
  - 50 requests/day
  - بيانات أساسية للسفن
  - تأخير 5-10 دقائق
- **الخطة المدفوعة** (يبدأ من $99/شهر):
  - Unlimited requests
  - Real-time data
  - Historical data
  - Advanced filtering

**مثال API Call:**
```javascript
GET https://services.marinetraffic.com/api/exportvessels/YOUR_API_KEY
```

---

### 3. **VesselFinder API**
- **الموقع**: https://www.vesselfinder.com/api
- **النوع**: مجاني محدود + مدفوع
- **الخطة المجانية**:
  - 10 requests/day
  - معلومات أساسية
- **الخطة المدفوعة** (من €49/شهر):
  - 1000-10000 requests/day
  - Real-time positions
  - Vessel details

---

### 4. **AIS Stream API** (Open Source Community)
- **الموقع**: https://aisstream.io/
- **النوع**: مجاني بالكامل
- **البيانات**: 
  - WebSocket stream
  - Real-time AIS messages
  - Global coverage
- **القيود**: 
  - تحتاج API key مجاني
  - معدل محدود للبيانات

**مثال WebSocket:**
```javascript
wss://stream.aisstream.io/v0/stream
```

---

### 5. **APRS.fi** (للهواة - محدود)
- **النوع**: مجاني
- **البيانات**: محدودة جداً
- **الاستخدام**: للتجربة فقط

---

## 🎯 التوصية المقترحة

### **النهج الهجين (Hybrid Approach):**

```
Phase 1: AISHub (مجاني) → للبدء والتطوير
Phase 2: AIS Stream (مجاني) → للتحسين
Phase 3: MarineTraffic (مدفوع) → للإنتاج النهائي
```

---

## 📋 خطة التنفيذ المحكمة

### **المرحلة 1: البحث والتجهيز** (يوم 1)

#### 1.1 التسجيل في الخدمات:
- [x] إنشاء حساب على AISHub
- [x] الحصول على API Key من AIS Stream
- [x] تسجيل تجريبي في MarineTraffic

#### 1.2 دراسة البيانات:
```json
// نموذج بيانات AIS
{
  "mmsi": 538005989,           // رقم التعريف الفريد
  "lat": 31.2653,              // خط العرض
  "lng": 32.3019,              // خط الطول
  "speed": 12.5,               // السرعة (عقدة)
  "course": 285,               // الاتجاه (درجات)
  "heading": 287,              // اتجاه البوصلة
  "name": "EVER GIVEN",        // اسم السفينة
  "destination": "ROTTERDAM",   // الوجهة
  "eta": "2026-01-15 14:30",   // وقت الوصول المتوقع
  "type": "Cargo",             // نوع السفينة
  "timestamp": 1642167234      // وقت آخر تحديث
}
```

---

### **المرحلة 2: تطوير Backend API** (يوم 2-3)

#### 2.1 إنشاء Proxy API:
```typescript
// /app/api/ships/live/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const bounds = searchParams.get('bounds'); // منطقة الخريطة
    
    try {
        // الاتصال بـ AISHub أو AIS Stream
        const response = await fetch(
            `https://data.aishub.net/ws.php?username=${process.env.AISHUB_USERNAME}&format=1&output=json&compress=0`,
            {
                headers: {
                    'Accept': 'application/json'
                },
                next: { revalidate: 60 } // Cache لمدة دقيقة
            }
        );
        
        const data = await response.json();
        
        // تصفية البيانات حسب المنطقة والموانئ
        const filteredShips = filterShipsByArea(data, bounds);
        
        return NextResponse.json({
            success: true,
            ships: filteredShips,
            timestamp: Date.now()
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch ships' },
            { status: 500 }
        );
    }
}

// دالة تصفية
function filterShipsByArea(ships: any[], bounds: string) {
    // تصفية السفن داخل منطقة محددة
    // تصفية حسب الموانئ المستهدفة
    // تصفية حسب نوع السفينة (Cargo, Container, Tanker)
    return ships.filter(ship => {
        // منطق التصفية
    });
}
```

#### 2.2 إنشاء WebSocket للبيانات الحية:
```typescript
// /app/api/ships/stream/route.ts
export async function GET(request: Request) {
    // إنشاء WebSocket connection
    // الاتصال بـ AIS Stream
    // إرسال البيانات المحدثة للعملاء
}
```

---

### **المرحلة 3: تطوير Frontend** (يوم 4-5)

#### 3.1 مكون السفينة الحية:
```typescript
// /components/LiveShip.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface LiveShipProps {
    mmsi: string;
    lat: number;
    lng: number;
    speed: number;
    course: number;
    name: string;
}

export function LiveShip({ mmsi, lat, lng, speed, course, name }: LiveShipProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    
    useEffect(() => {
        // تحويل lat/lng إلى x/y على الخريطة
        const projected = project(lat, lng);
        setPosition(projected);
    }, [lat, lng]);
    
    return (
        <motion.g
            animate={{ x: position.x, y: position.y }}
            transition={{ duration: 1, ease: 'linear' }}
        >
            {/* أيقونة السفينة */}
            <motion.path
                d="M0,-8 L3,-2 L3,6 L-3,6 L-3,-2 Z"
                fill="#ff6b35"
                stroke="#fff"
                strokeWidth={0.5}
                style={{ transformOrigin: 'center' }}
                animate={{ rotate: course }}
            />
            
            {/* Wake effect */}
            <motion.ellipse
                cx={0}
                cy={5}
                rx={2}
                ry={4}
                fill="rgba(255, 255, 255, 0.3)"
                animate={{
                    opacity: [0.3, 0.1, 0.3],
                    scaleY: [1, 1.2, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Ship name */}
            <text
                x={0}
                y={-10}
                fontSize="3"
                fill="#fff"
                textAnchor="middle"
                className="pointer-events-none"
            >
                {name}
            </text>
        </motion.g>
    );
}
```

#### 3.2 دمج في الخريطة:
```typescript
// تحديث WorldMapVisualization.tsx
'use client';

import { useState, useEffect } from 'react';
import { LiveShip } from './LiveShip';

export default function WorldMapVisualization() {
    const [liveShips, setLiveShips] = useState([]);
    const [isLiveMode, setIsLiveMode] = useState(false);
    
    useEffect(() => {
        if (!isLiveMode) return;
        
        // جلب البيانات الحية كل دقيقة
        const fetchLiveShips = async () => {
            try {
                const response = await fetch('/api/ships/live?bounds=...');
                const data = await response.json();
                setLiveShips(data.ships);
            } catch (error) {
                console.error('Failed to fetch live ships:', error);
            }
        };
        
        fetchLiveShips();
        const interval = setInterval(fetchLiveShips, 60000); // كل دقيقة
        
        return () => clearInterval(interval);
    }, [isLiveMode]);
    
    return (
        <div>
            {/* زر تبديل الوضع */}
            <button onClick={() => setIsLiveMode(!isLiveMode)}>
                {isLiveMode ? '🔴 Live Mode' : '▶️ Simulation'}
            </button>
            
            <svg>
                {/* الخريطة والمسارات */}
                
                {/* السفن الحية */}
                {isLiveMode && liveShips.map(ship => (
                    <LiveShip key={ship.mmsi} {...ship} />
                ))}
                
                {/* السفن المحاكاة (إذا لم يكن Live Mode) */}
                {!isLiveMode && <AnimatedShips />}
            </svg>
        </div>
    );
}
```

---

### **المرحلة 4: التحسينات** (يوم 6-7)

#### 4.1 معلومات السفينة التفصيلية:
```typescript
// Ship Info Card عند الضغط
<ShipInfoCard
    name="EVER GIVEN"
    type="Container Ship"
    flag="Panama"
    destination="Rotterdam"
    eta="2026-01-15 14:30"
    speed="12.5 knots"
    course="285°"
    length="400m"
    width="59m"
/>
```

#### 4.2 تصفية حسب نوع السفينة:
- Container Ships
- Cargo Ships
- Tankers
- Passenger Ships

#### 4.3 تتبع سفينة محددة:
```typescript
// تتبع سفينة بالـ MMSI أو الاسم
const [trackedShip, setTrackedShip] = useState(null);

function trackShip(mmsi: string) {
    // Zoom إلى السفينة
    // تسليط الضوء عليها
    // عرض معلوماتها
}
```

---

## 💰 تحليل التكلفة

### **السيناريو 1: مجاني بالكامل (AISHub + AIS Stream)**
- **التكلفة**: $0/شهر
- **المميزات**: 
  - ✅ بيانات حية حقيقية
  - ✅ تغطية جيدة
- **العيوب**:
  - ⚠️ تأخير 2-5 دقائق
  - ⚠️ معدل طلبات محدود
  - ⚠️ بيانات غير مكتملة أحياناً

### **السيناريو 2: مدفوع (MarineTraffic Basic)**
- **التكلفة**: $99/شهر (~375 ريال)
- **المميزات**:
  - ✅ Real-time (بدون تأخير)
  - ✅ Unlimited requests
  - ✅ بيانات مفصلة
  - ✅ Historical data
- **العيوب**:
  - ⚠️ تكلفة شهرية

### **السيناريو 3: هجين (Hybrid)**
- **التكلفة**: $0 في البداية
- **الاستراتيجية**:
  - استخدام AISHub للتطوير والتجربة
  - الترقية لـ MarineTraffic عند الإنتاج
  - إمكانية التبديل بين الوضعين

---

## 🎯 المميزات المقترحة

### **1. Dual Mode:**
```
[Simulation Mode] ⟷ [Live Mode]
```
- **Simulation**: حركة محاكاة سريعة وسلسة (الوضع الحالي)
- **Live**: بيانات حية حقيقية من AIS

### **2. Smart Filtering:**
- عرض السفن القريبة من الموانئ المستهدفة فقط
- تصفية حسب الحجم والنوع
- عرض السفن المتجهة للموانئ المصرية

### **3. Ship Details:**
- اسم السفينة
- الوجهة
- السرعة الحالية
- وقت الوصول المتوقع (ETA)
- صورة السفينة (إذا متاحة)

### **4. Notifications:**
- تنبيه عند وصول سفينة لميناء
- تنبيه عند مغادرة سفينة
- عدد السفن النشطة حالياً

---

## 📈 مقارنة: Simulation vs Live

| الميزة | Simulation (حالي) | Live Data |
|--------|-------------------|-----------|
| التكلفة | ✅ مجاني | ⚠️ محدود مجاني / مدفوع |
| السرعة | ✅ سريع وسلس | ⚠️ يعتمد على التحديثات |
| الواقعية | ⚠️ محاكاة | ✅ بيانات حقيقية |
| عدد السفن | ✅ غير محدود | ⚠️ يعتمد على المنطقة |
| التحكم | ✅ كامل | ⚠️ محدود |
| المعلومات | ⚠️ أساسية | ✅ تفصيلية |

---

## 🚀 خطة الإطلاق

### **Week 1: Foundation**
- ✅ دراسة APIs
- ✅ تسجيل وحصول على مفاتيح
- ✅ اختبار البيانات

### **Week 2: Backend Development**
- [ ] إنشاء API Proxy
- [ ] معالجة البيانات
- [ ] Caching strategy

### **Week 3: Frontend Integration**
- [ ] مكون LiveShip
- [ ] دمج في الخريطة
- [ ] Dual mode toggle

### **Week 4: Enhancement & Testing**
- [ ] تحسينات UI/UX
- [ ] اختبار الأداء
- [ ] معالجة الأخطاء
- [ ] Documentation

---

## 🎯 النتيجة المتوقعة

```
🌍 خريطة تفاعلية
  ├─ 🎬 Simulation Mode (سريع وسلس)
  └─ 🔴 Live Mode (بيانات حقيقية)
      ├─ 🚢 عرض سفن حقيقية
      ├─ 📊 معلومات تفصيلية
      ├─ 🎯 تتبع مخصص
      └─ 🔔 إشعارات ذكية
```

---

## 📋 قائمة المتطلبات

### **تقنية:**
- ✅ Next.js API Routes
- ✅ WebSocket support (اختياري)
- ✅ Environment variables للمفاتيح
- ✅ Rate limiting
- ✅ Error handling

### **خارجية:**
- [ ] حساب AISHub (مجاني)
- [ ] API Key من AIS Stream (مجاني)
- [ ] (اختياري) اشتراك MarineTraffic

---

## 💡 التوصية النهائية

### **ابدأ بـ:**
1. **AISHub** (مجاني) - للتطوير والتجربة
2. **Dual Mode** - حافظ على الـ Simulation كخيار
3. **Smart Filtering** - اعرض سفن محددة فقط

### **ثم ترقى إلى:**
1. **MarineTraffic** - عند الحاجة لبيانات real-time دقيقة
2. **Advanced Features** - تتبع، إشعارات، تفاصيل

---

## 🤔 الأسئلة المفتوحة للنقاش

1. **هل نبدأ بـ AISHub المجاني أولاً؟**
2. **هل نحتفظ بـ Simulation Mode كخيار احتياطي؟**
3. **ما هي الميزانية المتاحة للاشتراكات المدفوعة؟**
4. **هل نريد عرض جميع السفن أم فقط تلك المتجهة لموانئنا؟**
5. **هل نحتاج WebSocket للتحديثات الفورية أم يكفي Polling كل دقيقة؟**

---

دعنا نناقش هذه النقاط ونضع خطة تنفيذ محكمة! 🚢✨
