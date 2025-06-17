const https = require('https');
const http = require('http');

module.exports = async (req, res) => {
  const target = 'http://line.din-ott.com';
  // 修正：去除 /api/proxy 和 /proxy 前缀，只保留 /player_api.php...
  const proxyPath = req.url.replace(/^\/api\/proxy/, '').replace(/^\/proxy/, '');
  const targetUrl = target + proxyPath;
  const lib = targetUrl.startsWith('https') ? https : http;

  // CORS 允许跨域，兼容 Web 客户端
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // 调试日志
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
      // 为了调试，也可打印 body
      // console.log('Response body:', body);

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
