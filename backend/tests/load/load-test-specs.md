# Load Testing Specifications for JIFFY Backend

**Production readiness assessment via load testing**

---

## 🎯 **Testing Objectives**

1. **Validate Performance** - Ensure API meets SLA targets
2. **Identify Bottlenecks** - Find performance constraints
3. **Test Scalability** - Verify horizontal scaling capability
4. **Stress Testing** - Determine breaking points
5. **Endurance Testing** - Confirm stability over time

---

## 📊 **Performance Targets**

### **API Response Times (p95):**

| Endpoint Category | Target | Acceptable |
|-------------------|--------|------------|
| Authentication | < 200ms | < 500ms |
| User Management | < 300ms | < 600ms |
| Chat Operations | < 400ms | < 800ms |
| GIF Search (cached) | < 50ms | < 100ms |
| GIF Search (uncached) | < 1000ms | < 2000ms |
| Message Send | < 500ms | < 1000ms |

### **Throughput Targets:**

| Metric | Target | Notes |
|--------|--------|-------|
| **Concurrent Users** | 100 | Active simultaneous users |
| **Requests/Second** | 500 | Sustained load |
| **Peak RPS** | 1000 | Burst capacity |
| **Messages/Second** | 50 | Chat throughput |

### **Resource Limits:**

| Resource | Limit | Alert Threshold |
|----------|-------|-----------------|
| **CPU** | < 80% | > 70% |
| **Memory** | < 512 MB | > 400 MB |
| **Response Time** | < 1s (p95) | > 800ms |
| **Error Rate** | < 1% | > 0.5% |

---

## 🧪 **Load Test Scenarios**

### **Scenario 1: Normal Load (Baseline)**

**Purpose:** Establish baseline performance metrics

**Configuration:**
- Virtual Users: 50
- Duration: 10 minutes
- Ramp-up: 2 minutes
- Pattern: Constant load

**Test Mix:**
- 40% - GET /api/chats (list chats)
- 30% - GET /api/chats/:id/messages
- 20% - POST /api/chats/:id/messages
- 10% - GET /api/gifs/search

**Expected Results:**
- p95 response: < 500ms
- Error rate: < 0.1%
- CPU: < 50%
- Memory: < 300 MB

---

### **Scenario 2: Peak Load**

**Purpose:** Test performance under peak usage

**Configuration:**
- Virtual Users: 100
- Duration: 15 minutes
- Ramp-up: 3 minutes
- Pattern: Stepped load

**Test Mix:**
- 30% - GET /api/chats
- 25% - GET /api/chats/:id/messages
- 25% - POST /api/chats/:id/messages
- 10% - GET /api/gifs/search
- 5% - POST /api/chats/direct
- 5% - POST /api/gifs/favorites

**Expected Results:**
- p95 response: < 800ms
- Error rate: < 1%
- CPU: < 80%
- Memory: < 450 MB

---

### **Scenario 3: Stress Test**

**Purpose:** Find breaking point and recovery behavior

**Configuration:**
- Virtual Users: 200 → 500
- Duration: 20 minutes
- Ramp-up: 5 minutes continuously
- Pattern: Aggressive ramp

**Expected Behavior:**
- Graceful degradation (not crash)
- Rate limiting kicks in (429)
- Circuit breakers activate
- Recovery after load decrease

**Breaking Point Target:**
- > 500 concurrent users
- > 1000 RPS sustained

---

### **Scenario 4: Spike Test**

**Purpose:** Test sudden traffic spikes

**Configuration:**
- Baseline: 50 users
- Spike: 250 users (5x)
- Spike Duration: 2 minutes
- Pattern: Immediate spike

**Expected Results:**
- No crashes
- Rate limiting working
- Response time degrades gracefully
- Recovery < 30 seconds

---

### **Scenario 5: Endurance Test**

**Purpose:** Test stability over extended period

**Configuration:**
- Virtual Users: 75
- Duration: 2 hours
- Pattern: Constant load

**Monitor:**
- Memory leaks
- Connection pool exhaustion
- Cache effectiveness
- Error accumulation

**Expected Results:**
- Stable memory usage
- No degradation over time
- Error rate constant < 0.5%
- No resource exhaustion

---

### **Scenario 6: Realtime Messaging Load**

**Purpose:** Test chat throughput specifically

**Configuration:**
- Virtual Users: 100
- Duration: 10 minutes
- Pattern: Message-heavy

**Test Mix:**
- 70% - POST /api/chats/:id/messages
- 20% - GET /api/chats/:id/messages
- 10% - POST /api/chats/:id/read

**Targets:**
- 50 messages/second sustained
- p95 send time: < 500ms
- Realtime broadcast: < 100ms
- FCM delivery: < 1 second

---

## 🛠️ **Recommended Tools**

### **1. Artillery (Recommended)**

**Installation:**
```bash
npm install -g artillery
```

**Configuration:** `artillery.yml`
```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
  
scenarios:
  - name: "Chat messaging flow"
    flow:
      - post:
          url: "/api/auth/verify"
          json:
            token: "{{ $processEnvironment.TEST_TOKEN }}"
          capture:
            - json: "$.user.id"
              as: "userId"
      
      - get:
          url: "/api/chats"
          headers:
            Authorization: "Bearer {{ $processEnvironment.TEST_TOKEN }}"
      
      - post:
          url: "/api/chats/{{ chatId }}/messages"
          json:
            content: "Load test message"
            type: "TEXT"
          headers:
            Authorization: "Bearer {{ $processEnvironment.TEST_TOKEN }}"
```

**Run:**
```bash
export TEST_TOKEN="your-jwt-token"
artillery run artillery.yml
```

---

### **2. k6 (Alternative)**

**Installation:**
```bash
# macOS
brew install k6

# Linux
sudo apt install k6
```

**Test Script:** `load-test.js`
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp to 50 users
    { duration: '5m', target: 100 }, // Peak load
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    http_req_failed: ['rate<0.01'],   // < 1% errors
  },
};

const BASE_URL = 'http://localhost:3000';
const TOKEN = __ENV.TEST_TOKEN;

export default function () {
  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };
  
  // Get chats
  let res = http.get(`${BASE_URL}/api/chats`, { headers });
  check(res, {
    'get chats status 200': (r) => r.status === 200,
    'get chats < 300ms': (r) => r.timings.duration < 300,
  });
  
  sleep(1);
  
  // Search GIFs
  res = http.get(`${BASE_URL}/api/gifs/search?q=happy`, { headers });
  check(res, {
    'gif search completed': (r) => r.status === 200 || r.status === 503,
  });
  
  sleep(2);
}
```

**Run:**
```bash
TEST_TOKEN="your-jwt-token" k6 run load-test.js
```

---

### **3. Apache JMeter (GUI Option)**

**Features:**
- Visual test plan designer
- Real-time graphs
- Detailed reports
- Distributed testing

**Test Plan:**
1. Thread Group (100 users, 5 min)
2. HTTP Request Defaults (BASE_URL)
3. HTTP Header Manager (Authorization)
4. Samplers:
   - GET /api/chats
   - POST /api/chats/:id/messages
   - GET /api/gifs/search
5. Listeners:
   - View Results Tree
   - Summary Report
   - Graph Results

---

## 📈 **Metrics to Monitor**

### **Application Metrics:**
- Request rate (RPS)
- Response time (p50, p95, p99)
- Error rate (%)
- Throughput (requests/second)
- Concurrent connections

### **System Metrics:**
- CPU usage (%)
- Memory usage (MB)
- Disk I/O
- Network bandwidth
- Database connections

### **External Service Metrics:**
- Supabase query time
- Firebase FCM delivery time
- GIPHY API response time
- Tenor API response time
- Cache hit rate

---

## 🎯 **Success Criteria**

### **Must Pass:**
✅ p95 response time < 1 second  
✅ Error rate < 1%  
✅ Handle 100 concurrent users  
✅ 500 RPS sustained  
✅ No memory leaks (2 hour test)  
✅ No crashes under load  
✅ Rate limiting working  

### **Nice to Have:**
⭐ p95 response time < 500ms  
⭐ Error rate < 0.1%  
⭐ Handle 200+ concurrent users  
⭐ 1000 RPS burst capacity  

---

## 📋 **Load Test Checklist**

### **Pre-Test:**
- [ ] Deploy to staging environment
- [ ] Configure production-like resources
- [ ] Set up monitoring (Railway/metrics)
- [ ] Prepare test data
- [ ] Get valid JWT tokens
- [ ] Configure external API keys
- [ ] Set up log aggregation

### **During Test:**
- [ ] Monitor Railway dashboard
- [ ] Watch application logs
- [ ] Monitor database performance
- [ ] Track error rates
- [ ] Observe cache hit rates
- [ ] Check rate limiting

### **Post-Test:**
- [ ] Analyze Artillery/k6 reports
- [ ] Review application logs
- [ ] Check for errors
- [ ] Identify bottlenecks
- [ ] Document findings
- [ ] Create optimization tickets

---

## 🚀 **Quick Start**

### **Using Artillery (Simplest):**

**1. Install:**
```bash
npm install -g artillery
```

**2. Create Config:**
Save as `load-test.yml`:
```yaml
config:
  target: "https://your-app.railway.app"
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - flow:
      - get:
          url: "/api/health"
```

**3. Run:**
```bash
artillery run load-test.yml
```

**4. View Report:**
```
Summary report @ 10:38:00
  Scenarios launched:  600
  Scenarios completed: 600
  Requests completed:  600
  Mean response/sec:   10
  Response time (msec):
    min: 5
    max: 245
    median: 12
    p95: 45
    p99: 89
  Codes:
    200: 600
```

---

## 📊 **Sample Load Test**

### **Quick Performance Test:**

```bash
# Install Artillery
npm install -g artillery

# Quick test (1 minute, 10 users)
artillery quick --duration 60 --rate 10 \
  -H "Authorization: Bearer TOKEN" \
  https://your-app.railway.app/api/health

# Expected output:
# Summary:
#   Scenarios: 600
#   p95: < 50ms
#   Codes: 200 (100%)
```

---

## 🎯 **Production Readiness Checklist**

### **Performance:**
- [ ] All load tests passed
- [ ] p95 < 500ms under normal load
- [ ] Handles 100+ concurrent users
- [ ] No memory leaks in 2-hour test
- [ ] Cache hit rate > 80%
- [ ] Rate limiting working

### **Reliability:**
- [ ] Error rate < 1%
- [ ] Graceful degradation under stress
- [ ] Circuit breakers functional
- [ ] Fallbacks working (GIPHY → Tenor)
- [ ] Database connection pool stable

### **Monitoring:**
- [ ] Health checks functional
- [ ] Metrics endpoint working
- [ ] Logs aggregated
- [ ] Alerts configured
- [ ] PostHog tracking (optional)

---

**Load testing ensures JIFFY backend is production-ready! 🚀**
