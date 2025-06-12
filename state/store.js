import { batch, effect } from "../core/effects.js";
import { createSignal } from "../core/signals.js";

/**
 * Creates a store with the given initial state, providing methods for state management.
 *
 * The store offers functionalities to get and set the state, subscribe to state changes,
 * dispatch actions using reducers, and apply middleware to enhance the store's behavior.
 *
 * @param {*} initialState - The initial state of the store.
 * @returns {Object} - An object containing methods for state management:
 *   - `getState()`: Retrieves the current state.
 *   - `setState(newState)`: Updates the state, accepting a new state value or a function
 *     that derives the new state from the current state.
 *   - `subscribe(listener)`: Subscribes a listener function to state changes, returning
 *     a function to unsubscribe.
 *   - `dispatch(reducer)`: Applies a reducer function to the current state to produce and
 *     set a new state.
 *   - `withMiddleware(...middlewares)`: Enhances the store with middleware, allowing
 *     interception and modification of dispatched actions.
 */

export function createStore(initialState) {
  const [state, setState] = createSignal(initialState);
  const subscribers = new Set();

  /**
   * Retrieves the current state.
   *
   * @returns {*} The current state of the store.
   */
  function getState() {
    return state();
  }

  /**
   * Updates the state of the store.
   *
   * If `newState` is a function, it is called with the current state and the
   * returned value is used as the new state. The state update is batched to
   * ensure that all subscribers are notified after the update is complete.
   *
   * @param {*} newState - The new state value or a function to derive it.
   */

  function setState(newState) {
    batch(() => {
      if (typeof newState === "function") {
        newState = newState(getState());
      }
      setState(newState);
    });
  }

  /**
   * Subscribes a listener function to state changes.
   *
   * The listener function is called with the current state immediately after subscription.
   * Subsequent state changes will cause the listener to be called again. To unsubscribe,
   * call the returned function.
   *
   * @param {function} listener - A function to be called on state changes.
   * @returns {function} - A function to unsubscribe from state changes.
   */
  function subscribe(listener) {
    const dispose = effect(() => {
      const current = state();
      listener(current);
    });

    subscribers.add(dispose);
    return () => {
      dispose();
      subscribers.delete(dispose);
    };
  }

  /**
   * Applies a reducer function to the current state to produce and
   * set a new state.
   *
   * @param {function} reducer - A function that takes the current state and returns a new state.
   */
  function dispatch(reducer) {
    setState(reducer(getState()));
  }

  /**
   * Enhances the store with middleware, allowing interception and modification
   * of dispatched actions.
   *
   * The middleware functions are called in reverse order, each receiving the
   * previously enhanced store as an argument. The returned enhanced store is
   * then used as the new store.
   *
   * @param {...function} middlewares - Middleware functions to enhance the store.
   * @returns {Object} - An enhanced store with the dispatch method.
   */
  function withMiddleware(...middlewares) {
    let store = { getState, setState, subscribe, dispatch };

    middlewares.reverse().forEach((middleware) => {
      store = middleware(store);
    });

    return {
      ...store,
      dispatch: store.dispatch,
    };
  }

  return {
    getState,
    setState,
    subscribe,
    dispatch,
    withMiddleware,
  };
}
