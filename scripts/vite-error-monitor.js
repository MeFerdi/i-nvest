
// Vite Error Monitor - Auto-recovery for stale dependency cache
(function() {
  if (window.__viteErrorMonitorInstalled) return;
  window.__viteErrorMonitorInstalled = true;

  // Namespace localStorage per preview project
  // All previews share the same origin — without namespacing, stale data from
  // one project (e.g. reddit_posts with 'timestamp') crashes another (expecting 'createdAt')
  try {
    var projectId = window.location.pathname.split('/')[2] || '';
    if (projectId && typeof Proxy !== 'undefined') {
      var prefix = '__p_' + projectId + '_';
      var realStorage = window.localStorage;
      var storageProto = Object.getPrototypeOf(realStorage);
      var reservedProps = {
        getItem: true,
        setItem: true,
        removeItem: true,
        clear: true,
        key: true,
        length: true
      };

      function toNamespacedKey(key) {
        return prefix + String(key);
      }

      function fromNamespacedKey(key) {
        return key.indexOf(prefix) === 0 ? key.slice(prefix.length) : key;
      }

      function getNamespacedKeys() {
        var keys = [];
        for (var i = 0; i < realStorage.length; i++) {
          var key = realStorage.key(i);
          if (key && key.indexOf(prefix) === 0) {
            keys.push(key);
          }
        }
        return keys;
      }

      var namespacedStorage = new Proxy(realStorage, {
        get: function(target, prop) {
          if (prop === 'setItem') {
            return function(key, value) {
              return target.setItem(toNamespacedKey(key), value);
            };
          }
          if (prop === 'getItem') {
            return function(key) {
              return target.getItem(toNamespacedKey(key));
            };
          }
          if (prop === 'removeItem') {
            return function(key) {
              return target.removeItem(toNamespacedKey(key));
            };
          }
          if (prop === 'clear') {
            return function() {
              var keys = getNamespacedKeys();
              for (var i = 0; i < keys.length; i++) {
                target.removeItem(keys[i]);
              }
            };
          }
          if (prop === 'key') {
            return function(index) {
              var keys = getNamespacedKeys();
              var key = keys[index];
              return typeof key === 'string' ? fromNamespacedKey(key) : null;
            };
          }
          if (prop === 'length') {
            return getNamespacedKeys().length;
          }
          if (typeof prop === 'string' && !reservedProps[prop] && !(prop in storageProto)) {
            return target.getItem(toNamespacedKey(prop));
          }

          var value = target[prop];
          return typeof value === 'function' ? value.bind(target) : value;
        },
        set: function(target, prop, value) {
          if (typeof prop === 'string' && !reservedProps[prop] && !(prop in storageProto)) {
            target.setItem(toNamespacedKey(prop), String(value));
            return true;
          }
          target[prop] = value;
          return true;
        },
        deleteProperty: function(target, prop) {
          if (typeof prop === 'string' && !reservedProps[prop] && !(prop in storageProto)) {
            target.removeItem(toNamespacedKey(prop));
            return true;
          }
          return delete target[prop];
        },
        has: function(target, prop) {
          if (typeof prop === 'string' && !reservedProps[prop] && !(prop in storageProto)) {
            return target.getItem(toNamespacedKey(prop)) !== null;
          }
          return prop in target;
        },
        ownKeys: function() {
          var keys = getNamespacedKeys();
          for (var i = 0; i < keys.length; i++) {
            keys[i] = fromNamespacedKey(keys[i]);
          }
          return keys;
        },
        getOwnPropertyDescriptor: function(target, prop) {
          if (typeof prop === 'string' && !reservedProps[prop] && !(prop in storageProto)) {
            var value = target.getItem(toNamespacedKey(prop));
            if (value !== null) {
              return {
                configurable: true,
                enumerable: true,
                writable: true,
                value: value
              };
            }
          }
          return Object.getOwnPropertyDescriptor(target, prop);
        }
      });

      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        enumerable: true,
        writable: false,
        value: namespacedStorage
      });
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
        window.parent.postMessage({
          type: 'vite-cache-error',
          error: errorMsg,
          timestamp: Date.now()
        }, '*');
      } catch (e) {}
    }
  };

  // Listen for failed resource loads
  window.addEventListener('error', function(event) {
    if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
      const url = event.target.src || event.target.href;
      if (url && url.includes('node_modules/.vite/deps')) {
        try {
          window.parent.postMessage({
            type: 'vite-cache-error',
            error: 'Failed to load Vite optimized dependency: ' + url,
            timestamp: Date.now()
          }, '*');
        } catch (e) {}
      }
    }
  }, true);
})();
