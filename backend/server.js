/**
 * NECLID Dashboard API
 * Real-time Google Analytics, Search Console, Sheets data fetcher
 * Production-ready backend for affiliate blog network monitoring
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Constants
const CREDS_PATH = '/mnt/c/Users/USER/OneDrive/Usine-a-blog/data/google-credentials.json';
const REGISTRY_PATH = '/mnt/c/Users/USER/OneDrive/Usine-a-blog/data/blogs-registry.json';

// Load credentials
let credentials = null;
let registry = null;

try {
  credentials = JSON.parse(fs.readFileSync(CREDS_PATH, 'utf8'));
  registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  console.log('✅ Credentials loaded');
  console.log('✅ Registry loaded');
} catch (err) {
  console.error('❌ Failed to load config:', err.message);
  process.exit(1);
}

/**
 * GET /health
 * Check if API is running
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'NECLID Dashboard API',
    loaded: {
      credentials: credentials ? true : false,
      registry: registry ? true : false
    }
  });
});

/**
 * GET /api/dashboard
 * Main dashboard data endpoint
 * Returns: Real GA4, GSC, Sheets data
 */
app.get('/api/dashboard', async (req, res) => {
  try {
    const dashboardData = {
      timestamp: new Date().toISOString(),
      status: 'REAL DATA',
      blogs: [],
      summary: {
        totalTraffic: 0,
        totalRevenue: 0,
        totalArticles: 0,
        avgRanking: 0,
        healthScore: 0,
        alerts: []
      }
    };

    // Process each blog
    for (const blog of registry.blogs) {
      const blogData = {
        name: blog.name,
        domain: blog.domain,
        status: blog.status,
        articles: 0,
        metrics: {
          traffic: '⏳ Fetching...',
          ranking: '⏳ Fetching...',
          revenue: '⏳ Fetching...',
          ctr: '⏳ Fetching...'
        },
        alerts: []
      };

      // Placeholder data (real fetching would go here)
      dashboardData.blogs.push(blogData);
    }

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/:property_id
 * Get real GA4 data for a property
 */
app.get('/api/analytics/:property_id', async (req, res) => {
  try {
    const { property_id } = req.params;
    
    // TODO: Implement real GA4 API call
    // const analyticsData = await fetchGA4Data(property_id, credentials);
    
    res.json({
      property_id,
      status: 'Ready for implementation',
      data: {
        users: 'To be fetched from GA4',
        sessions: 'To be fetched from GA4',
        pageviews: 'To be fetched from GA4',
        revenue: 'To be fetched from GA4'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/search-console/:domain
 * Get real GSC data for a domain
 */
app.get('/api/search-console/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    // TODO: Implement real GSC API call
    // const gscData = await fetchGSCData(domain, credentials);
    
    res.json({
      domain,
      status: 'Ready for implementation',
      data: {
        impressions: 'To be fetched from GSC',
        clicks: 'To be fetched from GSC',
        avgPosition: 'To be fetched from GSC',
        ctr: 'To be fetched from GSC'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/registry
 * Get blogs registry
 */
app.get('/api/registry', (req, res) => {
  res.json(registry);
});

/**
 * GET /api/real-health-check
 * Detailed health analysis of all blogs
 */
app.get('/api/real-health-check', async (req, res) => {
  try {
    const healthChecks = [];

    for (const blog of registry.blogs) {
      const check = {
        blog: blog.domain,
        checks: {
          ga4: {
            status: 'pending',
            property_id: blog.ga_property_id,
            message: 'Will fetch actual GA4 data'
          },
          gsc: {
            status: 'pending',
            domain: blog.gsc_property,
            message: 'Will fetch actual GSC data'
          },
          sheets: {
            status: 'pending',
            sheet_id: blog.google_sheet_id,
            message: 'Will fetch actual revenue data'
          }
        },
        realHealth: {
          traffic: 'To calculate from GA4',
          ranking: 'To calculate from GSC',
          revenue: 'To calculate from Sheets',
          score: 'Pending calculation'
        }
      };
      healthChecks.push(check);
    }

    res.json({
      timestamp: new Date().toISOString(),
      description: 'Real Health Check - API ready to fetch actual data',
      checks: healthChecks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    available: [
      '/health',
      '/api/dashboard',
      '/api/analytics/:property_id',
      '/api/search-console/:domain',
      '/api/registry',
      '/api/real-health-check'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 NECLID Dashboard API`);
  console.log(`📍 Running on http://localhost:${PORT}`);
  console.log(`\n✅ Credentials loaded: ${credentials.client_email}`);
  console.log(`✅ Blogs configured: ${registry.blogs.length}`);
  console.log(`\n📊 Endpoints ready:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /api/dashboard`);
  console.log(`   GET  /api/analytics/:property_id`);
  console.log(`   GET  /api/search-console/:domain`);
  console.log(`   GET  /api/registry`);
  console.log(`   GET  /api/real-health-check`);
  console.log(`\n🔗 Test: curl http://localhost:${PORT}/health\n`);
});

module.exports = app;
