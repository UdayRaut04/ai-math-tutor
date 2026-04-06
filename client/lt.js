const localtunnel = require('localtunnel');
(async () => {
  const tunnel = await localtunnel({ port: 3000, subdomain: 'uday-ai-tutor-' + Math.floor(Math.random()*1000) });
  console.log('Tunnel URL:', tunnel.url);
  tunnel.on('close', () => { });
})();
