const https = require('https');
const http = require('http');
const url = require('url');

module.exports = async (req, res) => {
  // 目标IPTV服务器
  const target = 'http://line.din-ott.com';

  // 拼接目标URL
  const path = req.url.replace(/^\/api\/proxy/, '');
  const targetUrl = target + path + (req._parsedUrl.search || '');

  // 选择http或https
  const lib = targetUrl.startsWith('https') ? https : http;

  // 转发请求
  const proxyReq = lib.request(targetUrl, {
    method: req.method,
    headers: req.headers,
  }, proxyRes => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });

  proxyReq.on('error', (err) => {
    res.statusCode = 500;
    res.end('Proxy error: ' + err.message);
  });
};