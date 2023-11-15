export function isSSR(): boolean {
  return typeof window === "undefined";
}

export function isClient(): boolean {
  return typeof window !== "undefined";
}
