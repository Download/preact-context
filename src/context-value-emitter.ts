export type StateUpdater<T> = (val: T, bitmask: number) => void;

export type BitmaskFactory<T> = (a: T, b: T) => number;

export interface ContextValueEmitter<T> {
  register: (updater: StateUpdater<T>) => void;
  unregister: (updater: StateUpdater<T>) => void;
  val: (value?: T) => T;
}

export function createEmitter<T>(
  initialValue: T,
  bitmaskFactory: BitmaskFactory<T>
): ContextValueEmitter<T> {
  let registeredUpdaters: Array<StateUpdater<T>> = [];
  let value = initialValue;

  const diff = (newValue: T) => bitmaskFactory(value, newValue) | 0;

  return {
    register(updater: StateUpdater<T>) {
      registeredUpdaters.push(updater);
      updater(value, diff(value));
    },
    unregister(updater: StateUpdater<T>) {
      registeredUpdaters = registeredUpdaters.filter(i => i !== updater);
    },
    val(newValue?: T) {
      if (newValue === undefined || newValue == value) {
        return value;
      }

      const bitmask = diff(newValue);

      value = newValue;
      registeredUpdaters.forEach(up => up(newValue, bitmask));
      return value;
    }
  };
}

export const noopEmitter: ContextValueEmitter<any> = {
  register(_: StateUpdater<any>) {
    console.warn("Consumer used without a Provider");
  },
  unregister(_: StateUpdater<any>) {
    // do nothing
  },
  val(_: any) {
    //do nothing;
  }
};
