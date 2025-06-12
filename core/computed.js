import { currentContext } from "./context.js";

class Computed {
  /**
   * Initializes a new instance of the Computed class.
   *
   * @param {function} computeFn - The function used to compute the value of the computed signal.
   */

  constructor(computeFn) {
    this.computeFn = computeFn;
    this.value = undefined;
    this.dependencies = new Set();
    this.dirty = true;
    this.cache = undefined;
  }

  /**
   * Retrieves the current value of the computed signal and subscribes to it.
   *
   * If the computed signal is dirty, it is recomputed and the dirty flag is reset.
   *
   * @returns {*} The value of the computed signal.
   */
  get() {
    if (currentContext) {
      this.subscribers.add(currentContext);
      currentContext.dependencies.add(this);
    }

    if (this.dirty) {
      this.recompute();
      this.dirty = false;
    }

    return this.value;
  }

  /**
   * Recomputes the value of the computed signal and notifies its subscribers if the value
   * has changed.
   *
   * The context is temporarily set to the computed signal while the computation is in
   * progress. The dependencies of the computed signal are cleared and then the computation
   * function is called. If the returned value is different from the current value, the
   * value is updated and the subscribers are notified.
   */
  recompute() {
    const prevContext = currentContext;
    currentContext = this;
    this.dependencies.clear();

    try {
      const newValue = this.computeFn();
      if (!Object.is(this.value, newValue)) {
        this.value = newValue;
        this.notify();
      }
    } finally {
      currentContext = prevContext;
    }
  }

  /**
   * Marks the computed signal as dirty and notifies its subscribers.
   *
   * If the computed signal is already dirty, this method does nothing.
   */
  markDirty() {
    if (!this.dirty) {
      this.dirty = true;
      this.notify();
    }
  }

  /**
   * Notifies all subscribers of the computed signal by marking them as dirty.
   *
   * When a computed signal is marked as dirty, all of its subscribers are also
   * marked as dirty. This method is called when the value of the computed signal
   * changes.
   */
  notify() {
    this.subscribers.forEach((sub) => sub.markDirty());
  }
}

/**
 * Creates a new computed signal that computes its value by calling the given
 * computation function when any of its dependencies change.
 *
 * The computation function is called with no arguments and should return the new
 * value of the computed signal. The computation function is only called when
 * the dependencies of the computed signal change.
 *
 * The returned value is a function that can be used to retrieve the value of the
 * computed signal. The function is bound to the computed signal and can be used
 * as a signal.
 *
 * @param {function} computeFn - The computation function to use to compute the
 * value of the computed signal.
 *
 * @returns {function} - A function that can be used to retrieve the value of the
 * computed signal.
 */
export function computed(computeFn) {
  const computedSignal = new Computed(computeFn);
  computedSignal.recompute();
  return computedSignal.get.bind(computedSignal);
}
