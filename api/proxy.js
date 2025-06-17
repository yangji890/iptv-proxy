const https = require('https');
const http = require('http');
const { URL } = require('url');

module.exports = async (req, res) => {
  // 目标IPTV服务器
  const target = 'http://line.din-ott.com';

  // 解析原始请求的路径与查询
  // 获取类似 /proxy/player_api.php?username=xxx&password=xxx&action=xxx
  const { url, headers, method } = req;
  // 只保留 /proxy/ 后面的部分
  const proxyPath = url.replace(/^\/api\/proxy/, '');

  // 构造目标URL
  const targetUrl = target + proxyPath;

  // 选择http或https
  const lib = targetUrl.startsWith('https') ? https : http;

  // 发起代理请求
  const proxyReq = lib.request(targetUrl, {
    method,
    headers
  }, proxyRes => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  // 错误处理
  proxyReq.on('error', (err) => {
    res.statusCode = 500;
    res.end('Proxy error: ' + err.message);
  });

  // pipe原请求体（如有）
  req.pipe(proxyReq, { end: true });
};
