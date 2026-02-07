const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const admin = require('../config/firebase');
const giphyService = require('../services/giphy.service');
const tenorService = require('../services/tenor.service');
const logger = require('../config/logger');
const config = require('../config/config');
const os = require('os');

/**
 * Enhanced Health Check Routes
 * Monitors API health, database, external services, and performance
 */

/**
 * GET /api/health
 * Basic health check - fast response
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  res.json({
    status: 'ok',
    service: 'JIFFY Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    responseTime: Date.now() - startTime,
  });
});

/**
 * GET /api/health/detailed
 * Detailed health check with all dependencies
 */
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();
  const checks = {
    api: { status: 'ok', responseTime: 0 },
    database: { status: 'unknown', responseTime: 0 },
    firebase: { status: 'unknown', configured: false },
    giphy: { status: 'unknown', configured: false },
    tenor: { status: 'unknown', configured: false },
  };
  
  // Check Database (Supabase)
  try {
    const dbStart = Date.now();
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single();
    
    checks.database.responseTime = Date.now() - dbStart;
    checks.database.status = error && error.code !== 'PGRST116' ? 'error' : 'ok';
    checks.database.error = error ? error.message : undefined;
  } catch (error) {
    checks.database.status = 'error';
    checks.database.error = error.message;
  }
  
  // Check Firebase (FCM)
  try {
    checks.firebase.configured = !!admin;
    checks.firebase.status = admin ? 'ok' : 'not_configured';
    
    if (admin) {
      // Test FCM by checking app
      checks.firebase.projectId = admin.app().options.credential.projectId;
    }
  } catch (error) {
    checks.firebase.status = 'error';
    checks.firebase.error = error.message;
  }
  
  // Check GIPHY
  try {
    checks.giphy.configured = giphyService.isConfigured();
    checks.giphy.status = checks.giphy.configured ? 'ok' : 'not_configured';
    
    if (checks.giphy.configured) {
      checks.giphy.cache = giphyService.getCacheStats();
    }
  } catch (error) {
    checks.giphy.status = 'error';
    checks.giphy.error = error.message;
  }
  
  // Check Tenor
  try {
    checks.tenor.configured = tenorService.isConfigured();
    checks.tenor.status = checks.tenor.configured ? 'ok' : 'not_configured';
    
    if (checks.tenor.configured) {
      checks.tenor.cache = tenorService.getCacheStats();
    }
  } catch (error) {
    checks.tenor.status = 'error';
    checks.tenor.error = error.message;
  }
  
  // Overall health
  const allHealthy = Object.values(checks).every(
    check => check.status === 'ok' || check.status === 'not_configured'
  );
  
  const responseTime = Date.now() - startTime;
  
  // Return appropriate status code
  const statusCode = allHealthy ? 200 : 503;
  
  res.status(statusCode).json({
    status: allHealthy ? 'healthy' : 'degraded',
    service: 'JIFFY Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    responseTime,
    checks,
  });
});

/**
 * GET /api/health/metrics
 * System metrics and performance data
 */
router.get('/metrics', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  res.json({
    service: 'JIFFY Backend API',
    timestamp: new Date().toISOString(),
    
    // Process metrics
    process: {
      uptime: process.uptime(),
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    
    // Memory metrics (in MB)
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
      percentUsed: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
    },
    
    // CPU metrics (in microseconds)
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system,
    },
    
    // System metrics
    system: {
      totalMemory: Math.round(os.totalmem() / 1024 / 1024),
      freeMemory: Math.round(os.freemem() / 1024 / 1024),
      loadAverage: os.loadavg(),
      cpuCount: os.cpus().length,
    },
    
    // Cache metrics
    cache: {
      giphy: giphyService.getCacheStats(),
      tenor: tenorService.getCacheStats(),
    },
    
    // Configuration status
    configured: {
      database: !!config.supabase.url,
      firebase: !!config.fcm.projectId,
      giphy: giphyService.isConfigured(),
      tenor: tenorService.isConfigured(),
    },
  });
});

/**
 * GET /api/health/readiness
 * Kubernetes-style readiness probe
 */
router.get('/readiness', async (req, res) => {
  try {
    // Check database connectivity
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw new Error('Database not ready');
    }
    
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/health/liveness
 * Kubernetes-style liveness probe
 */
router.get('/liveness', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
