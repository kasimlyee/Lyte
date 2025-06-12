import { currentContext, batchDepth, pendingEffects } from "./context.js";
import { scheduleEffect } from "../advanced/scheduler.js";

class Signal {
  /**
   * Initializes a new Signal instance with the given initial value.
   * Sets up the subscribers set and the default comparator.
   *
   * @param {*} initialValue - The initial value of the signal.
   */

  constructor(initialValue) {
    this.value = initialValue;
    this.subscribers = new Set();
    this.comparator = Object.is;
  }

  /**
   * Retrieves the current value of the signal and subscribes to it.
   *
   * When called, the currently active context will be added to the signal's
   * subscriber set and the signal will be added to the context's dependencies
   * set. The signal's value is then returned.
   *
   * @returns {*} The value of the signal.
   */
  get() {
    if (currentContext) {
      this.subscribers.add(currentContext);
      currentContext.dependencies.add(this);
    }
    return this.value;
  }

  /**
   * Updates the value of the signal and notifies its subscribers.
   *
   * If `newValue` is a function, it is called with the current value of the signal
   * and the returned value is used as the new value.
   *
   * If the new value is equal to the current value according to the signal's
   * comparator, the subscribers are not notified. Otherwise, the signal's value
   * is updated and the subscribers are notified.
   *
   * @param {*} newValue - The new value of the signal, or a function to derive it.
   */
  set(newValue) {
    if (typeof newValue === "function") {
      newValue = newValue(this.value);
    }

    if (this.comparator(this.value, newValue)) return;

    this.value = newValue;
    this.notify();
  }

  /**
   * Notifies all subscribers of the signal by scheduling their effects.
   *
   * When batching is enabled, the subscribers are added to the pending effects
   * set. Otherwise, their effects are scheduled for execution.
   */
  notify() {
    if (batchDepth > 0) {
      this.subscribers.forEach((sub) => pendingEffects.add(sub));
    } else {
      this.subscribers.forEach((sub) => scheduleEffect(sub));
    }
  }

  /**
   * Returns a new signal that is a copy of this signal but with the given
   * comparator.
   *
   * @param {function} comparator - A function that takes two arguments and
   * returns true if they are equal, false otherwise. The default comparator is
   * Object.is.
   *
   * @return {Signal}
   */
  withComparator(comparator) {
    this.comparator = comparator;
    return this;
  }
}

/**
 * Creates a new signal with the given initial value and comparator.
 *
 * @param {*} initialValue - The initial value of the signal.
 * @param {{ comparator: function }} [options] - Options for the signal.
 * @param {function} [options.comparator] - The comparator to use when comparing
 * the signal's current and new values. The default comparator is Object.is.
 *
 * @returns {[function, function]} - An array containing the get and set functions
 * of the signal.
 */
export function createSignal(initialValue, options = {}) {
  const signal = new Signal(initialValue);
  if (options.comparator) {
    signal.withComparator(options.comparator);
  }

  return [signal.get.bind(signal), signal.set.bind(signal)];
}
