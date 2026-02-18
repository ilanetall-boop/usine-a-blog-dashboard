/**
 * DAILY CHECK SCRIPT
 * Exécuté automatiquement chaque jour via OpenClaw heartbeat
 * 
 * Tâches:
 * 1. Vérifier les liens Amazon cassés
 * 2. Vérifier les prix des produits
 * 3. Générer un rapport
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BLOGS = [
  {
    name: 'bestbathrugs.com',
    path: '/mnt/c/Users/USER/OneDrive/Usine-a-blog/bestbathrugs-dynamic/bestbathrugs_site',
    tag: 'bathrugsguide-20'
  },
  {
    name: 'best-shower-curtains.com',
    path: '/mnt/c/Users/USER/OneDrive/Usine-a-blog/best-shower-curtains',
    tag: 'bestshowercurtains-20'
  }
];

const SKIP_FILES = ['index.html', 'about.html', 'contact.html', 'privacy.html', 'terms.html', 'disclosure.html', 'articles.html', 'comparisons.html', '404.html'];

// Extract Amazon links from HTML
function extractAmazonLinks(html) {
  const links = [];
  const regex = /href="[^"]*amazon\.com\/dp\/([A-Z0-9]{10})[^"]*"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push(match[1]); // ASIN
  }
  return [...new Set(links)];
}

// Check if Amazon product exists
function checkAmazonProduct(asin) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.amazon.com',
      path: `/dp/${asin}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html'
      }
    };
    
    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const isError = 
          data.includes('Page not found') ||
          data.includes("Sorry, we couldn't find") ||
          data.includes('ref=cs_404_link') ||
          res.statusCode === 404;
        
        // Try to extract price
        let price = null;
        const priceMatch = data.match(/\$(\d+\.?\d{0,2})/);
        if (priceMatch) price = priceMatch[0];
        
        resolve({ asin, available: !isError, price });
      });
    });
    
    req.on('error', () => resolve({ asin, available: false, price: null }));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ asin, available: false, price: null, timeout: true });
    });
  });
}

// Analyze a blog
async function analyzeBlog(blog) {
  const results = {
    name: blog.name,
    totalArticles: 0,
    totalLinks: 0,
    brokenLinks: [],
    priceChanges: []
  };
  
  const files = fs.readdirSync(blog.path)
    .filter(f => f.endsWith('.html') && !SKIP_FILES.includes(f));
  
  results.totalArticles = files.length;
  
  const allASINs = new Set();
  const asinToFiles = {};
  
  // Collect all ASINs
  for (const file of files) {
    const content = fs.readFileSync(path.join(blog.path, file), 'utf-8');
    const asins = extractAmazonLinks(content);
    asins.forEach(asin => {
      allASINs.add(asin);
      if (!asinToFiles[asin]) asinToFiles[asin] = [];
      asinToFiles[asin].push(file);
    });
  }
  
  results.totalLinks = allASINs.size;
  
  // Check each ASIN (with rate limiting)
  for (const asin of allASINs) {
    const check = await checkAmazonProduct(asin);
    
    if (!check.available) {
      results.brokenLinks.push({
        asin,
        files: asinToFiles[asin]
      });
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 300));
  }
  
  return results;
}

// Generate report
async function generateReport() {
  const report = {
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    blogs: [],
    summary: {
      totalArticles: 0,
      totalLinks: 0,
      brokenLinks: 0,
      status: 'OK'
    }
  };
  
  for (const blog of BLOGS) {
    console.log(`Checking ${blog.name}...`);
    const results = await analyzeBlog(blog);
    report.blogs.push(results);
    report.summary.totalArticles += results.totalArticles;
    report.summary.totalLinks += results.totalLinks;
    report.summary.brokenLinks += results.brokenLinks.length;
  }
  
  if (report.summary.brokenLinks > 0) {
    report.summary.status = 'ALERT';
  }
  
  return report;
}

// Format alert message for Telegram
function formatAlertMessage(report) {
  let msg = `📊 **Rapport Quotidien Usine-a-Blog**\n`;
  msg += `📅 ${report.date}\n\n`;
  
  msg += `📈 **Résumé:**\n`;
  msg += `• Articles: ${report.summary.totalArticles}\n`;
  msg += `• Liens Amazon uniques: ${report.summary.totalLinks}\n`;
  msg += `• Liens cassés: ${report.summary.brokenLinks}\n\n`;
  
  if (report.summary.brokenLinks > 0) {
    msg += `🚨 **ALERTES:**\n`;
    for (const blog of report.blogs) {
      if (blog.brokenLinks.length > 0) {
        msg += `\n**${blog.name}:**\n`;
        for (const broken of blog.brokenLinks) {
          msg += `• ${broken.asin} (${broken.files.join(', ')})\n`;
        }
      }
    }
  } else {
    msg += `✅ Tous les liens fonctionnent!`;
  }
  
  return msg;
}

// Main
async function main() {
  console.log('🔍 Starting daily check...\n');
  
  const report = await generateReport();
  
  // Save report
  const reportsDir = '/mnt/c/Users/USER/OneDrive/Usine-a-blog/data/reports';
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  
  const reportPath = path.join(reportsDir, `${report.date}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 Report saved to:', reportPath);
  
  // Output for OpenClaw to send via Telegram
  const alertMsg = formatAlertMessage(report);
  console.log('\n' + alertMsg);
  
  // Return status
  if (report.summary.status === 'ALERT') {
    console.log('\n⚠️ ACTION REQUIRED: Fix broken links!');
    process.exit(1);
  } else {
    console.log('\n✅ All checks passed!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
