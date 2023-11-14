type GetState<State> = () => State;
type Subscribe<State> = (
  lister: (state: State, prev: State) => void,
) => () => void;
type Store<State> = {
  getState: GetState<State>;
  subscribe: Subscribe<State>;
};
type SetFn<T> = (args: T, replace?: true) => void;
type UseState<State> = <Selected = State>(
  selector?: string | SelectorFn<State, Selected>,
) => Selected;

export type SelectorFn<State, Selected> = (state: State) => Selected;

export type ReadonlyState<State> = Omit<Store<State>, "setState">;

export type Reducer<State, Update> = (
  state: State,
  update: Update,
) => Partial<State>;

export type UseStore<Store, State, Action = Partial<State>> = {
  state: Store;
  useState: UseState<State>;
  getState: GetState<State>;
  setState: SetFn<Action>;
  subscribe: Subscribe<State>;
};
