import { effect, batch } from "../core/effects.js";

/**
 * Creates a transition object that can be used to manage a transition between
 * two states of an application.
 *
 * A transition is a period of time during which state is being updated, and
 * during which side effects should be queued and executed at the end of the
 * transition.
 *
 * The returned object has three methods:
 *
 * - `startTransition(callback)`: Starts a transition by calling the given
 * callback function. If a transition is already in progress, the callback is
 * called immediately. Otherwise, it is called after batching all side effects
 * scheduled during the transition. The side effects are then flushed at the end
 * of the transition.
 *
 * - `transitionEffect(effectFn)`: Returns a new effect function that schedules
 * the given effect function to run at the end of the transition, if one is
 * in progress. Otherwise, the effect function is executed immediately.
 *
 * - `isTransitioning()`: Returns a boolean indicating whether a transition is
 * currently in progress.
 *
 * @returns {Object} - An object with methods for managing a transition.
 */
export function createTransition() {
  let isTransitioning = false;
  let pendingUpdates = [];

  function startTransition(callback) {
    if (isTransitioning) {
      return callback();
    }

    isTransitioning = true;
    pendingUpdates = [];

    try {
      return batch(() => {
        const result = callback();
        flushPending();
        return result;
      });
    } finally {
      isTransitioning = false;
    }
  }

  function flushPending() {
    const updates = pendingUpdates;
    pendingUpdates = [];

    for (const update of updates) {
      update();
    }
  }

  function transitionEffect(effectFn) {
    return effect(() => {
      if (isTransitioning) {
        pendingUpdates.push(effectFn);
      } else {
        effectFn();
      }
    });
  }

  return {
    startTransition,
    transitionEffect,
    isTransitioning: () => isTransitioning,
  };
}
