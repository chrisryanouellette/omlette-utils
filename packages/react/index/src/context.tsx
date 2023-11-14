import {
  createContext,
  PropsWithChildren,
  useContext as reactUseContext,
} from "react";

type ProviderProps<T> = PropsWithChildren<{
  value: T;
}>;

type ProviderFn<T> = (props: ProviderProps<T>) => JSX.Element;
type UseContextFn<T> = () => T;

export function contextFactory<T>(): [ProviderFn<T>, UseContextFn<T>] {
  const Context = createContext<T | null>(null);

  function Provider({ children, value }: ProviderProps<T>): JSX.Element {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useContext(): T {
    const context = reactUseContext(Context);
    if (!context) {
      throw new Error(
        `Consuming context con only be done withing a <Context.Provider>`,
      );
    }
    return context;
  }

  return [Provider, useContext];
}
