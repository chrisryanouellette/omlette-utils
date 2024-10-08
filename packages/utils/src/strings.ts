import { SelectorFn } from "@ouellettec/utils-types";
import { hasKey } from "./objects";

export type ProtectedString<T extends string> = T;

export function protectString<T extends string>(
  string: unknown,
): ProtectedString<T> {
  return string as ProtectedString<T>;
}

export function unProtectString(string: unknown): string {
  return string as string;
}

export function stringSelector<State>(
  selector: string,
): SelectorFn<State, unknown> {
  return function handleSelectStateFromStringKey(state: State) {
    let value = state as object;
    for (const key of selector.split(".")) {
      if (/\[[0-9]+\]/.test(key)) {
        const index = Number(key.replace("[", "").replace("]", ""));
        if (isNaN(index)) {
          throw new Error(
            `Index "${index}" is NaN and can not be used in selector "${selector}"`,
          );
        }
        if (hasKey(index, value)) {
          value = value[index];
          continue;
        }
        throw new Error(
          `Key "${index}" from selector "${selector}" can not be used to index state.`,
        );
      }
      if (hasKey(key, value)) {
        value = value[key];
        continue;
      }
      throw new Error(
        `Key "${key}" can not be selected from state when using selector ${selector}`,
      );
    }
    return value;
  };
}
