export let currentContext = null;
export let batchDepth = 0;
export let pendingEffects = new Set();

/**
 * Creates a new context object with the given default value.
 *
 * The context object contains a Provider function that allows components to
 * provide a new context value to their descendants. The Provider function
 * temporarily sets the context's value while rendering the children and
 * restores the previous value afterwards. This ensures that the context value
 * is isolated to the components rendered within the Provider.
 *
 * @param {*} defaultValue - The default value of the context.
 * @returns {Object} - The context object containing the value and Provider.
 */

export function createContext(defaultValue) {
  const context = {
    _value: defaultValue,
    _subscribers: new Set(),
    /**
     * Provider component that provides a new context value to its descendants.
     *
     * The Provider component takes a single prop, `value`, which is the new
     * context value to provide to its descendants. The Provider component
     * temporarily sets the context's value to the given value while rendering
     * its children, and then restores the previous value afterwards.
     *
     * @param {{ value: *, children: * }} props - The props for the Provider component.
     * @returns {*} The rendered children.
     */
    Provider: function Provider({ value, children }) {
      const prevValue = context._value;
      context._value = value;

      try {
        return children();
      } finally {
        context._value = prevValue;
      }
    },
  };

  return context;
}

/**
 * Retrieves the current value of the context and subscribes to it.
 *
 * If called from a component, the component is added to the context's subscriber
 * set and the context is added to the component's dependencies set. The context
 * value is then returned.
 *
 * @param {Object} context - The context object created by createContext.
 *
 * @returns {*} The current value of the context.
 */
export function useContext(context) {
  if (currentContext) {
    context._subscribers.add(currentContext);
    currentContext.dependencies.add(context);
  }
  return context._value;
}
