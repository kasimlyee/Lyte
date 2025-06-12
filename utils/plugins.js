const plugins = new Set();

/**
 * Registers a plugin to extend Lyte's functionality.
 *
 * Plugins can export an `install` method, which is called with the Lyte API
 * as an argument. The plugin can then use the API to extend Lyte.
 *
 * @param {Object} plugin - The plugin object.
 */
export function registerPlugin(plugin) {
  if (typeof plugin.install === "function") {
    plugins.add(plugin);
    plugin.install(LyteAPI);
  }
}

/**
 * Applies all registered plugins to the given API.
 *
 * Plugins can export an `extend` method, which is called with the Lyte API
 * as an argument. The plugin can then use the API to extend Lyte.
 *
 * @param {Object} api - The Lyte API to extend.
 */
export function applyPlugins(api) {
  plugins.forEach((plugin) => {
    if (typeof plugin.extend === "function") {
      plugin.extend(api);
    }
  });
}

const LyteAPI = {
  createSignal,
  computed,
  effect,
  batch,
  createContext,
  createStore,
  registerPlugin,
  // ... other exposed APIs
};

export default LyteAPI;
