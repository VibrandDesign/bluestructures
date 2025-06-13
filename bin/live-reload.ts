export const liveReloadCode = `
(() => {
  const origins = ORIGIN_URL;
  const wsUrls = Array.isArray(origins) 
    ? origins.map(origin => \`ws\${origin.startsWith('https') ? 's' : ''}://\${origin.replace(/^https?:\\/\\//, '')}/_reload\`)
    : [\`ws://127.0.0.1:PORT_NUMBER/_reload\`];

  function connectWebSocket(url) {
    const ws = new WebSocket(url);
    ws.addEventListener('message', () => location.reload());
    ws.addEventListener('close', () => {
      // Try to reconnect after a delay
      setTimeout(() => connectWebSocket(url), 1000);
    });
    return ws;
  }

  // Connect to all available WebSocket URLs
  wsUrls.forEach(url => connectWebSocket(url));
})();
`;
