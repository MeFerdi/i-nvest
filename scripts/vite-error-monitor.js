
// Vite Error Monitor - Auto-recovery for stale dependency cache
(function() {
  if (window.__viteErrorMonitorInstalled) return;
  window.__viteErrorMonitorInstalled = true;

  // Only enable cross-origin messaging in development
  var isDevelopment = /localhost|127\.0\.0\.1/.test(window.location.host);
  var ALLOWED_PARENT_ORIGINS = isDevelopment ? [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    window.location.origin
  ] : [];

  // Namespace localStorage per preview project
  // All previews share the same origin — without namespacing, stale data from
  // one project (e.g. reddit_posts with 'timestamp') crashes another (expecting 'createdAt')
  try {
    var projectId = window.location.pathname.split('/')[2] || '';
    if (projectId) {
      var prefix = '__p_' + projectId + '_';
      var realSetItem = localStorage.setItem.bind(localStorage);
      var realGetItem = localStorage.getItem.bind(localStorage);
      var realRemoveItem = localStorage.removeItem.bind(localStorage);

      localStorage.setItem = function(key, value) {
        return realSetItem(prefix + key, value);
      };
      localStorage.getItem = function(key) {
        return realGetItem(prefix + key);
      };
      localStorage.removeItem = function(key) {
        return realRemoveItem(prefix + key);
      };
    }
  } catch (e) {}

  // Intercept console errors
  const originalError = console.error;
  console.error = function(...args) {
    originalError.apply(console, args);

    const errorMsg = args.join(' ');
    if (errorMsg.includes('Outdated Optimize Dep') ||
        errorMsg.includes('504') ||
        errorMsg.includes('Failed to fetch dynamically imported module')) {
      try {
        if (ALLOWED_PARENT_ORIGINS.length > 0 && window.parent !== window) {
          try {
            var parentOrigin = new URL(document.referrer || '').origin;
            if (ALLOWED_PARENT_ORIGINS.includes(parentOrigin)) {
              window.parent.postMessage({ type: 'vite-cache-error', error: errorMsg, timestamp: Date.now() }, parentOrigin);
            }
          } catch (e2) {
            // Referrer not available or invalid; don't send
          }
        }
      } catch (e) {}
    }
  };

  // Listen for failed resource loads
  window.addEventListener('error', function(event) {
    if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
      const url = event.target.src || event.target.href;
      if (url && url.includes('node_modules/.vite/deps')) {
        try {
          if (ALLOWED_PARENT_ORIGINS.length > 0 && window.parent !== window) {
            try {
              var parentOrigin = new URL(document.referrer || '').origin;
              if (ALLOWED_PARENT_ORIGINS.includes(parentOrigin)) {
                window.parent.postMessage({ type: 'vite-cache-error', error: 'Failed to load Vite optimized dependency: ' + url, timestamp: Date.now() }, parentOrigin);
              }
            } catch (e2) {
              // Referrer not available or invalid; don't send
            }
          }
        } catch (e) {}
      }
    }
  }, true);
})();
