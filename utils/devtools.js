export function connectDevTools() {
  if (typeof window === "undefined" || !window.__LYTE_DEVTOOLS__) {
    return;
  }

  const devTools = window.__LYTE_DEVTOOLS__;

  devTools.on("inspect", (payload) => {
    // Handle inspection requests
  });

  devTools.on("dispatch", (action) => {
    // Handle dispatched actions
  });

  // Send initial state
  devTools.send("init", {
    version: "__VERSION__",
    // Initial state
  });

  return {
    trackSignal(signal) {
      // Track signal changes
    },
    trackEffect(effect) {
      // Track effect runs
    },
  };
}
