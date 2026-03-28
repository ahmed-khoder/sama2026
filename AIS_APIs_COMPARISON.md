# 🚢 مقارنة شاملة لـ APIs تتبع السفن

## 📊 جدول المقارنة السريع

| الخدمة | التكلفة | Requests/Day | Real-Time | التغطية | سهولة الاستخدام | التقييم |
|--------|---------|--------------|-----------|---------|-----------------|---------|
| **AISHub** | 🟢 مجاني | محدود | ⚠️ 2-5 دقائق | 🟢 جيدة | 🟢 سهل | ⭐⭐⭐⭐ |
| **AIS Stream** | 🟢 مجاني | محدود | 🟢 فوري | 🟢 ممتازة | 🟢 سهل | ⭐⭐⭐⭐⭐ |
| **MarineTraffic Free** | 🟢 مجاني | 50 | ⚠️ 5-10 دقائق | 🟡 محدودة | 🟡 متوسط | ⭐⭐⭐ |
| **MarineTraffic Basic** | 🔴 $99/شهر | ♾️ Unlimited | 🟢 فوري | 🟢 ممتازة | 🟢 سهل | ⭐⭐⭐⭐⭐ |
| **VesselFinder Free** | 🟢 مجاني | 10 | ⚠️ تأخير | 🟡 محدودة | 🟡 متوسط | ⭐⭐ |
| **VesselFinder Paid** | 🔴 €49/شهر | 1000-10000 | 🟢 فوري | 🟢 جيدة | 🟢 سهل | ⭐⭐⭐⭐ |

---

## 1️⃣ AISHub (التوصية الأولى للبدء)

### ✅ المميزات:
- **مجاني 100%** بدون قيود على المدة
- بيانات AIS خام من محطات استقبال عالمية
- WebSocket support للبيانات الحية
- REST API متاح
- لا يتطلب بطاقة ائتمان

### ⚠️ العيوب:
- تأخير 2-5 دقائق في البيانات
- التغطية تعتمد على محطات الاستقبال
- معدل طلبات محدود (لكن معقول)
- واجهة API بسيطة

### 📝 طريقة الاستخدام:
```bash
# 1. التسجيل
https://www.aishub.net/register

# 2. الحصول على Username

# 3. API Call
GET http://data.aishub.net/ws.php?username=YOUR_USERNAME&format=1&output=json&compress=0

# 4. WebSocket (للبيانات الحية)
ws://stream.aishub.net/ws?username=YOUR_USERNAME&format=1
```

### 📊 نموذج البيانات:
```json
[
  {
    "MMSI": 538005989,
    "TIME": "2026-01-13 10:30:15",
    "LONGITUDE": 32.3019,
    "LATITUDE": 31.2653,
    "COG": 285,
    "SOG": 12.5,
    "HEADING": 287,
    "ROT": 0,
    "NAVSTAT": 0,
    "IMO": 9811000,
    "NAME": "EVER GIVEN",
    "CALLSIGN": "3FXY8",
    "TYPE": 70,
    "A": 200,
    "B": 200,
    "C": 30,
    "D": 29,
    "DRAUGHT": 14.5,
    "DEST": "ROTTERDAM",
    "ETA": "01-15 14:30"
  }
]
```

### 🎯 مثالي لـ:
- ✅ التطوير والاختبار
- ✅ MVPs والنماذج الأولية
- ✅ المشاريع ذات الميزانية المحدودة
- ✅ التطبيقات التعليمية

---

## 2️⃣ AIS Stream (الأفضل المجاني)

### ✅ المميزات:
- **مجاني بالكامل**
- **Real-time** (فوري جداً)
- WebSocket streaming
- تغطية عالمية ممتازة
- سهل الاستخدام
- دعم جيد من المجتمع

### ⚠️ العيوب:
- معدل بيانات محدود (لكن كافي)
- يحتاج API key (مجاني)

### 📝 طريقة الاستخدام:
```javascript
// 1. الحصول على API Key من
https://aisstream.io/

// 2. WebSocket Connection
const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');

ws.onopen = () => {
    ws.send(JSON.stringify({
        APIKey: 'YOUR_API_KEY',
        BoundingBoxes: [
            [[29, 30], [33, 34]]  // منطقة مصر
        ]
    }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Ship data:', data);
};
```

### 📊 نموذج البيانات:
```json
{
  "MessageType": "PositionReport",
  "Message": {
    "PositionReport": {
      "Cog": 285.0,
      "Latitude": 31.2653,
      "Longitude": 32.3019,
      "NavigationalStatus": 0,
      "Sog": 12.5,
      "TrueHeading": 287,
      "Timestamp": "2026-01-13T10:30:15Z",
      "UserID": 538005989
    }
  },
  "MetaData": {
    "ShipName": "EVER GIVEN",
    "MMSI": 538005989,
    "ShipType": 70,
    "Destination": "ROTTERDAM",
    "ETA": "2026-01-15T14:30:00Z"
  }
}
```

### 🎯 مثالي لـ:
- ✅ التطبيقات الإنتاجية المجانية
- ✅ Real-time tracking
- ✅ WebSocket streaming
- ✅ Global coverage

---

## 3️⃣ MarineTraffic API

### 🆓 الخطة المجانية:
- **50 requests/day**
- تأخير 5-10 دقائق
- بيانات أساسية

### 💰 الخطة المدفوعة (Basic - $99/شهر):
- **Unlimited requests**
- **Real-time data**
- بيانات تفصيلية
- Historical data
- Vessel photos
- Port information
- ETA predictions

### 📝 طريقة الاستخدام:
```javascript
// API Endpoints
const endpoints = {
    // Single Vessel
    singleVessel: 'https://services.marinetraffic.com/api/exportvessel/YOUR_KEY',
    
    // Multiple Vessels in area
    vessels: 'https://services.marinetraffic.com/api/exportvessels/YOUR_KEY',
    
    // Vessel Positions
    positions: 'https://services.marinetraffic.com/api/exportvesseltrack/YOUR_KEY'
};

// Example: Get vessels in area
fetch(`${endpoints.vessels}?protocol=jsono&minlat=29&maxlat=33&minlon=30&maxlon=34`)
    .then(res => res.json())
    .then(data => console.log(data));
```

### 📊 نموذج البيانات (مفصل جداً):
```json
{
  "MMSI": 538005989,
  "IMO": 9811000,
  "SHIP_ID": 5630138,
  "LAT": 31.2653,
  "LON": 32.3019,
  "SPEED": 125,
  "HEADING": 287,
  "COURSE": 285,
  "STATUS": 0,
  "TIMESTAMP": "2026-01-13T10:30:15",
  "DSRC": "TER",
  "SHIPNAME": "EVER GIVEN",
  "SHIPTYPE": 70,
  "CALLSIGN": "3FXY8",
  "FLAG": "PA",
  "LENGTH": 400,
  "WIDTH": 59,
  "GRT": 220000,
  "DWT": 199629,
  "DRAUGHT": 145,
  "YEAR_BUILT": 2018,
  "DESTINATION": "ROTTERDAM",
  "ETA": "2026-01-15T14:30:00",
  "CURRENT_PORT": "SUEZ CANAL",
  "LAST_PORT": "SINGAPORE",
  "NEXT_PORT_NAME": "ROTTERDAM"
}
```

### 🎯 مثالي لـ:
- ✅ التطبيقات التجارية
- ✅ البيانات التفصيلية
- ✅ Historical analysis
- ✅ Professional dashboards

---

## 4️⃣ VesselFinder API

### 🆓 الخطة المجانية:
- **10 requests/day**
- معلومات أساسية

### 💰 الخطة المدفوعة (€49/شهر):
- **1000-10000 requests/day**
- Real-time positions
- Vessel details
- Photos

### 📝 طريقة الاستخدام:
```javascript
GET https://api.vesselfinder.com/vessellocation?userkey=YOUR_KEY&imo=9811000
```

### 🎯 مثالي لـ:
- ⚠️ محدود جداً في الخطة المجانية
- ✅ بديل لـ MarineTraffic (أرخص)

---

## 🎯 التوصية النهائية

### **للبدء فوراً (مجاني):**
```
1. AIS Stream (أفضل مجاني)
   └─ Real-time WebSocket
   └─ تغطية ممتازة
   
2. AISHub (احتياطي)
   └─ REST API
   └─ مستقر وموثوق
```

### **للإنتاج المحترف:**
```
MarineTraffic Basic ($99/شهر)
   ├─ Unlimited requests
   ├─ Real-time data
   ├─ بيانات تفصيلية
   └─ Photos & History
```

---

## 📋 خطة التنفيذ المقترحة

### **Phase 1: Proof of Concept (أسبوع 1)**
```javascript
// استخدام AIS Stream مجاناً
const API_SOURCE = 'ais-stream'; // مجاني
const UPDATE_INTERVAL = 60000;  // كل دقيقة
const MAX_SHIPS_DISPLAY = 50;   // لتحسين الأداء
```

### **Phase 2: Beta Testing (أسبوع 2-3)**
```javascript
// تجربة مع مستخدمين حقيقيين
const API_SOURCE = 'ais-stream'; // لا يزال مجاني
const FEATURES = [
    'live-tracking',
    'ship-details',
    'eta-display',
    'port-filter'
];
```

### **Phase 3: Production (شهر 2)**
```javascript
// إذا نجح وكانت هناك ميزانية
const API_SOURCE = 'marinetraffic'; // مدفوع
const ADVANCED_FEATURES = [
    'historical-data',
    'predictive-eta',
    'ship-photos',
    'port-congestion'
];
```

---

## 💡 نصائح مهمة

### 1. **Caching Strategy:**
```typescript
// Cache البيانات لتقليل API calls
const CACHE_DURATION = 60000; // دقيقة واحدة

const cachedData = new Map();

async function getShipData(mmsi: string) {
    const cached = cachedData.get(mmsi);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    
    const fresh = await fetchFromAPI(mmsi);
    cachedData.set(mmsi, { data: fresh, timestamp: Date.now() });
    return fresh;
}
```

### 2. **Rate Limiting:**
```typescript
// تجنب تجاوز حدود الـ API
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(50, '1 d'), // 50/day
});
```

### 3. **Error Handling:**
```typescript
// Fallback إلى simulation عند فشل API
try {
    const liveShips = await fetchLiveShips();
    return liveShips;
} catch (error) {
    console.error('Failed to fetch live data, using simulation');
    return getSimulatedShips();
}
```

---

## 🔗 روابط مفيدة

- **AIS Stream**: https://aisstream.io/
- **AISHub**: https://www.aishub.net/
- **MarineTraffic**: https://www.marinetraffic.com/en/ais-api-services
- **VesselFinder**: https://www.vesselfinder.com/api
- **AIS Protocol**: https://gpsd.gitlab.io/gpsd/AIVDM.html

---

جاهز لبدء التنفيذ! 🚢✨
