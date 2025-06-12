declare module "lyte" {
  type Signal<T> = [() => T, (value: T | ((prev: T) => T)) => void];
  type DisposeFn = () => void;
  type EffectFn = () => void | DisposeFn;
  type ComputedFn<T> = () => T;
  type Comparator<T> = (a: T, b: T) => boolean;

  interface EffectOptions {
    scheduler?: Scheduler;
  }

  interface SignalOptions<T> {
    comparator?: Comparator<T>;
  }

  interface Scheduler {
    schedule: (task: () => void) => void;
  }

  interface Store<T> {
    getState: () => T;
    setState: (newState: T | ((prev: T) => T)) => void;
    subscribe: (listener: (state: T) => void) => DisposeFn;
    dispatch: (reducer: (state: T) => T) => void;
    withMiddleware: (...middlewares: Middleware[]) => Store<T>;
  }

  type Middleware = (store: Store<any>) => Store<any>;

  interface Plugin {
    install?: (api: typeof Lyte) => void;
    extend?: (api: typeof Lyte) => void;
  }

  export function createSignal<T>(
    initialValue: T,
    options?: SignalOptions<T>
  ): Signal<T>;

  export function computed<T>(computeFn: ComputedFn<T>): () => T;

  export function effect(
    effectFn: EffectFn,
    options?: EffectOptions
  ): DisposeFn;

  export function batch<T>(fn: () => T): T;

  export function untrack<T>(fn: () => T): T;

  export function createContext<T>(defaultValue: T): {
    Provider: (props: { value: T; children: () => any }) => any;
    useContext: () => T;
  };

  export function createStore<T>(initialState: T): Store<T>;

  export function createTransition(): {
    startTransition: <T>(callback: () => T) => T;
    transitionEffect: (effectFn: EffectFn) => DisposeFn;
    isTransitioning: () => boolean;
  };

  export function setScheduler(scheduler: Scheduler): void;

  export function createAnimationScheduler(): Scheduler;

  export function createThrottledScheduler(interval: number): Scheduler;

  export function withErrorBoundary<T extends Function>(
    fn: T,
    handler: (error: any) => void
  ): T;

  export function registerPlugin(plugin: Plugin): void;

  export const version: string;
}
