
export const try_ = async <T>(fn: () => T | PromiseLike<T>, onError?: (e: unknown) => void): Promise<null | T> => {
  try {
    return await fn();
  } catch(e) {
    onError?.(e);
    return null;
  }
}
