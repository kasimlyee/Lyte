import { currentContext } from "./context.js";
import { scheduleEffect } from "../advanced/scheduler.js";

class Effect {
  /**
   * Creates a new effect from the given effect function.
   *
   * The effect function is not called immediately. Instead, it is scheduled to be
   * called when the effect is executed.
   *
   * @param {function} effectFn - The effect function to execute.
   */
  constructor(effectFn) {
    this.effectFn = effectFn;
    this.dependencies = new Set();
    this.disposed = false;
    this.cleanup = null;
    this.scheduler = null;
  }

  /**
   * Executes the effect function.
   *
   * If the effect has been disposed, this method does nothing.
   *
   * The effect function is called with no arguments. If the effect function
   * throws an error, the error is caught and re-thrown with the effect instance
   * as the error's `cause` property.
   *
   * If the effect function returns a value, the value is assumed to be a cleanup
   * function. The cleanup function is called when the effect is disposed or when
   * the effect is executed again.
   */
  execute() {
    if (this.disposed) return;

    this.cleanup?.();

    const prevContext = currentContext;
    currentContext = this;
    this.dependencies.clear();

    try {
      this.cleanup = this.effectFn();
    } catch (error) {
      handleEffectError(this, error);
    } finally {
      currentContext = prevContext;
    }
  }

  /**
   * Disposes of the effect, cleaning up resources and removing dependencies.
   *
   * Marks the effect as disposed, calls the cleanup function if available,
   * and removes this effect from all of its dependencies' subscriber sets.
   */

  dispose() {
    this.disposed = true;
    this.cleanup?.();
    this.dependencies.forEach((dep) => dep.subscribers.delete(this));
  }

  /**
   * Configures the effect with the given scheduler.
   *
   * The scheduler is responsible for scheduling the effect's execution. If no
   * scheduler is provided, the effect is executed synchronously.
   *
   * @param {Scheduler} scheduler - The scheduler to use for this effect.
   *
   * @returns {Effect} - The configured effect.
   */
  withScheduler(scheduler) {
    this.scheduler = scheduler;
    return this;
  }
}

/**
 * Creates and schedules an effect based on the given effect function.
 *
 * The effect function is executed according to the specified scheduler in the
 * options, or immediately if no scheduler is provided. The effect is executed
 * with error boundaries to handle any potential errors and ensure proper cleanup.
 *
 * The effect function can return a cleanup function, which is called when the
 * effect is disposed of. The returned function can be used to manually dispose
 * of the effect and perform cleanup.
 *
 * @param {function} effectFn - The effect function to be executed.
 * @param {{ scheduler: Scheduler }} [options] - Options for the effect.
 * @param {Scheduler} [options.scheduler] - The scheduler to use for the effect.
 *
 * @returns {function} - A function to dispose of the effect.
 */

export function effect(effectFn, options = {}) {
  const eff = new Effect(effectFn);

  if (options.scheduler) {
    eff.withScheduler(options.scheduler);
  }

  // Initial run with error boundary
  try {
    scheduleEffect(eff);
  } catch (error) {
    handleEffectError(eff, error);
  }

  return eff.dispose.bind(eff);
}
