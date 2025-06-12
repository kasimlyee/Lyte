const errorBoundaries = new WeakMap();

/**
 * Associates an error handler function with a specific context.
 *
 * The error handler will be invoked if an error occurs within the context
 * during effect execution. This allows for handling errors locally within
 * a component or a specific part of the application.
 *
 * @param {Object} context - The context with which the error handler is associated.
 * @param {function} handler - The function to handle errors for the given context.
 */

export function setErrorBoundary(context, handler) {
  errorBoundaries.set(context, handler);
}

/**
 * Handles an error that has occurred during effect execution.
 *
 * Walks the context tree from the given effect to find an error handler
 * associated with one of the contexts. If an error handler is found,
 * it is invoked with the error as an argument. If no error handler is
 * found, the error is rethrown using setTimeout to ensure it is thrown
 * asynchronously.
 *
 * @param {Object} effect - The effect with which the error occurred.
 * @param {*} error - The error that occurred.
 */
export function handleEffectError(effect, error) {
  let context = effect;
  while (context) {
    const handler = errorBoundaries.get(context);
    if (handler) {
      handler(error);
      return;
    }
    context = context.parent;
  }

  // No error boundary found - rethrow
  setTimeout(() => {
    throw error;
  }, 0);
}

/**
 * Wraps the given function with an error boundary.
 *
 * If the given function throws, the error is caught and handled by the given
 * error handler. The error handler is passed the error as an argument. If the
 * error handler returns a value, it is returned by the wrapped function.
 *
 * @param {function} fn - The function to wrap.
 * @param {function} handler - The error handler to invoke when the wrapped
 * function throws.
 *
 * @returns {function} - The wrapped function with error boundary.
 */
export function withErrorBoundary(fn, handler) {
  return function protectedFn() {
    const prevContext = currentContext;
    const context = {
      parent: prevContext,
      dependencies: new Set(),
      execute: protectedFn,
    };
    currentContext = context;

    setErrorBoundary(context, handler);

    try {
      return fn();
    } catch (error) {
      handleEffectError(context, error);
    } finally {
      currentContext = prevContext;
    }
  };
}
