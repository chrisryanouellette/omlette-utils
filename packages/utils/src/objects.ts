export function hasKey<O extends object>(key: unknown, obj: O): key is keyof O {
  return (
    !!key &&
    (typeof key === "string" ||
      typeof key === "number" ||
      typeof key === "symbol") &&
    key in obj
  );
}
