const https = require('https');
const http = require('http');

module.exports = async (req, res) => {
  const target = 'http://line.din-ott.com';
  const proxyPath = req.url.replace(/^\/api\/proxy/, '');
  const targetUrl = target + proxyPath;
  const lib = targetUrl.startsWith('https') ? https : http;

  // 打印目标URL用于调试
  console.log('Proxying to:', targetUrl);

  const proxyReq = lib.request(targetUrl, {
    method: req.method,
    headers: req.headers
  }, proxyRes => {
    console.log('Status from target:', proxyRes.statusCode);

    let body = '';
    proxyRes.on('data', chunk => body += chunk);
    proxyRes.on('end', () => {
      // 打印响应内容长度和内容
      console.log('Response length:', body.length);
      console.log('Response body:', body);

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
