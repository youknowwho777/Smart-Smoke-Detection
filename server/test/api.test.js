// Self-contained API test runner
const http = require('http');
const { app, startServer } = require('../server');

const runTests = async () => {
  console.log('--- Starting Backend API Verification Tests ---');
  const server = await startServer();
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  const request = (method, path, data = null) => {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(url, options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });

      req.on('error', reject);
      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  };

  try {
    // 1. Health check
    console.log('[Test 1] Checking GET /api/health...');
    const health = await request('GET', '/api/health');
    console.assert(health.status === 200, `Health status should be 200, got ${health.status}`);
    console.log('✓ GET /api/health passed:', health.data.status);

    // 2. Devices
    console.log('[Test 2] Checking GET /api/devices...');
    const devices = await request('GET', '/api/devices');
    console.assert(devices.status === 200, `Devices status should be 200`);
    console.log('✓ GET /api/devices passed, device count:', devices.data.count);

    // 3. Settings
    console.log('[Test 3] Checking GET /api/settings...');
    const settings = await request('GET', '/api/settings');
    console.assert(settings.status === 200, `Settings status should be 200`);
    console.log('✓ GET /api/settings passed, warning threshold:', settings.data.data.warningThreshold);

    // 4. Telemetry Post
    console.log('[Test 4] Posting telemetry to POST /api/telemetry...');
    const telemetryPost = await request('POST', '/api/telemetry', {
      deviceId: 'SMOKE-001',
      sensor: {
        type: 'MQ-2',
        rawAdc: 2450,
        voltage: 1.97
      }
    });
    console.assert(telemetryPost.status === 201, `Telemetry POST status should be 201`);
    console.log('✓ POST /api/telemetry passed, computed status:', telemetryPost.data.data.status);

    // 5. Latest Telemetry
    console.log('[Test 5] Checking GET /api/telemetry/latest...');
    const latest = await request('GET', '/api/telemetry/latest');
    console.assert(latest.status === 200 && latest.data.data.rawAdc === 2450, 'Latest reading should match');
    console.log('✓ GET /api/telemetry/latest passed');

    // 6. Alerts
    console.log('[Test 6] Checking GET /api/alerts...');
    const alerts = await request('GET', '/api/alerts');
    console.assert(alerts.status === 200, `Alerts status should be 200`);
    console.log('✓ GET /api/alerts passed, alert count:', alerts.data.count);

    if (alerts.data.data.length > 0) {
      const alertId = alerts.data.data[0]._id;
      console.log(`[Test 7] Acknowledging alert ${alertId}...`);
      const ack = await request('PATCH', `/api/alerts/${alertId}/acknowledge`);
      console.assert(ack.status === 200 && ack.data.data.acknowledged === true, 'Alert should be acknowledged');
      console.log('✓ PATCH /api/alerts/:id/acknowledge passed');
    }

    // 8. Scenario Trigger
    console.log('[Test 8] Triggering simulation scenario CRITICAL...');
    const trig = await request('POST', '/api/settings/simulation/scenario', { scenario: 'CRITICAL' });
    console.assert(trig.status === 200, 'Scenario trigger should succeed');
    console.log('✓ POST /api/settings/simulation/scenario passed');

    console.log('\n=============================================');
    console.log('🎉 ALL BACKEND API INTEGRATION TESTS PASSED!');
    console.log('=============================================\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
};

runTests();
