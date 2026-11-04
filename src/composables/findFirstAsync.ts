/** Tries each item in order, one at a time, and returns the first result that is not undefined. */
export const findFirstAsync = <Item, Result>(
  items: Item[],
  attempt: (item: Item) => Promise<Result | undefined>,
): Promise<Result | undefined> =>
  items.reduce<Promise<Result | undefined>>(async (found, item) => (await found) ?? attempt(item), Promise.resolve(undefined))
