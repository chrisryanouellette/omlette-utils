export const isInstanceOf = <T extends typeof Element>(
  element: unknown,
  instances: T[],
): element is InstanceType<T> => {
  return instances.some((instance) => element instanceof instance);
};
