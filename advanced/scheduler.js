const defaultScheduler = {
  /**
   * Schedules a task to be executed after the current task.
   *
   * When `queueMicrotask` is available, it is used to schedule the task.
   * Otherwise, a resolved promise is used to schedule the task.
   *
   * @param {function} task - The task to schedule.
   */
  schedule: (task) => {
    if (typeof queueMicrotask === "function") {
      queueMicrotask(task);
    } else {
      Promise.resolve().then(task);
    }
  },
};

let currentScheduler = defaultScheduler;

/**
 * Sets the scheduler to use for scheduling effects.
 *
 * The scheduler is an object with a single method, `schedule`, which takes a
 * task to schedule and schedules it for execution after the current task.
 *
 * The default scheduler uses `queueMicrotask` if available, or a resolved
 * promise if not.
 *
 * @param {Object} scheduler - The scheduler to use for scheduling effects.
 */
export function setScheduler(scheduler) {
  currentScheduler = scheduler;
}

/**
 * Schedules the given effect to be executed after the current task.
 *
 * If the effect has a scheduler, it is used to schedule the effect. Otherwise,
 * the current scheduler is used.
 *
 * @param {Effect} effect - The effect to schedule.
 */
export function scheduleEffect(effect) {
  if (effect.scheduler) {
    effect.scheduler.schedule(() => effect.execute());
  } else {
    currentScheduler.schedule(() => effect.execute());
  }
}

/**
 * Creates a scheduler that schedules tasks to run on the next animation frame.
 *
 * The scheduler uses `requestAnimationFrame` to schedule the tasks. The task
 * is scheduled to run on the next animation frame, and then again on the
 * following animation frame. This is done to ensure that the task is executed
 * on the next animation frame, even if the first animation frame has already
 * passed.
 *
 * @returns {Object} - The scheduler object.
 */
export function createAnimationScheduler() {
  return {
    schedule: (task) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(task);
      });
    },
  };
}

/**
 * Creates a scheduler that schedules tasks to run no more than once every
 * `interval` milliseconds.
 *
 * The scheduler uses `setTimeout` to schedule the tasks. If multiple tasks are
 * scheduled within the same `interval` period, only the last task is executed.
 *
 * @param {number} interval - The interval in milliseconds.
 *
 * @returns {Object} - The scheduler object.
 */
export function createThrottledScheduler(interval) {
  let lastRun = 0;
  let scheduled = false;
  let pendingTask = null;

  return {
    schedule: (task) => {
      pendingTask = task;
      if (!scheduled) {
        scheduled = true;
        const now = performance.now();
        const delay = Math.max(0, interval - (now - lastRun));

        setTimeout(() => {
          scheduled = false;
          lastRun = performance.now();
          pendingTask();
          pendingTask = null;
        }, delay);
      }
    },
  };
}
