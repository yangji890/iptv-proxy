const https = require('https');
const http = require('http');

module.exports = async (req, res) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.statusCode = 204;
    res.end();
    return;
  }

  const target = 'http://line.din-ott.com';
  // 修正路径拼接
  const proxyPath = req.url.replace(/^\/api\/proxy/, '').replace(/^\/proxy/, '');
  const targetUrl = target + proxyPath;
  const lib = targetUrl.startsWith('https') ? https : http;

  // 设置 CORS 响应头（每个请求都要加）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');

  console.log('Proxying to:', targetUrl);

  const proxyReq = lib.request(targetUrl, {
    method: req.method,
    headers: req.headers
  }, proxyRes => {
    console.log('Status from target:', proxyRes.statusCode);

    let body = '';
    proxyRes.on('data', chunk => body += chunk);
    proxyRes.on('end', () => {
      console.log('Response length:', body.length);
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      res.end(body);
    });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.statusCode = 500;
    res.end('Proxy error: ' + err.message);
  });

  req.pipe(proxyReq, { end: true });
};
