import { createSignal, computed } from "../core/signals.js";
import { effect } from "../core/effects.js";
import { currentContext } from "../core/context.js";

/**
 * Creates a context with the given default value.
 *
 * The returned context object contains a Provider and a useContext function.
 *
 * The Provider function takes a value and children as props, and renders the
 * children with the given value available as the context.
 *
 * The useContext function takes no arguments and returns the current context
 * value. If called from a component, the component is subscribed to the
 * context and will re-render when the context changes.
 *
 * @param {*} defaultValue - The default value of the context.
 *
 * @returns {Object} - An object containing the Provider and useContext functions.
 */
export function createContext(defaultValue) {
  const contextSignal = createSignal(defaultValue);
  const subscribers = new Set();

  /**
   * Provider component that supplies a new context value to its descendants.
   *
   * The Provider component accepts `value` and `children` as props. It updates
   * the context value to the provided `value` and renders the `children` within
   * the updated context.
   *
   * When the context value changes, it triggers updates for all subscribed
   * components to ensure they re-render with the new context value.
   *
   * @param {{ value: *, children: * }} props - The props for the Provider component.
   * @returns {*} The rendered children components.
   */

  function Provider({ value, children }) {
    const prevValue = contextSignal[0]();
    contextSignal[1](value);

    effect(() => {
      const currentValue = contextSignal[0]();
      if (!Object.is(prevValue, currentValue)) {
        subscribers.forEach((sub) => sub(currentValue));
      }
    });

    return children();
  }

  /**
   * Returns the current context value and subscribes the component to context changes.
   *
   * If called within a component, the component is added to the context's subscribers,
   * and the context is added to the component's dependencies. This ensures that the
   * component re-renders when the context value changes.
   *
   * @returns {*} The current context value.
   */

  function useContext() {
    const value = contextSignal[0]();

    if (currentContext) {
      effect(() => {
        contextSignal[0]();
        subscribers.add(currentContext);
        currentContext.dependencies.add(contextSignal[0]);
      });
    }

    return value;
  }

  return {
    Provider,
    useContext,
  };
}
