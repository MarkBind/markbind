/**
* Creates a function that batches calls and delays execution.
* It ensures the 'targetFunction' is only called after a 'delayMs' wait period
* AND after the previous execution has finished.
*
* Batch and Delay, collects multiple requests into a single group
* and delays the execution of the target function.
*
* @param targetFunction the promise-returning function to delay,
*        targetFunction should take in a single array
* @param delayMs the number of milliseconds to delay
* @returns delayedFunc that takes an optional argument (array, single value, or nothing)
*/
export function delay<T>(targetFunction: (arg: T[]) => Promise<unknown>, delayMs: number) {
  let context: any;
  let itemsInQueue: T[] = [];

  let ongoingWorkPromise: Promise<unknown> = Promise.resolve();
  let currentScheduledBatch: Promise<unknown> | null = null;

  const sleep = (ms: number) => new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

  return function (this: any, newItem?: T | T[]): Promise<unknown> {
    context = this;

    // Add new item to queue when called
    if (Array.isArray(newItem)) {
      itemsInQueue = itemsInQueue.concat(newItem);
    } else if (newItem) {
      itemsInQueue.push(newItem);
    }

    // Schedule a new batch if there is none scheduled
    if (currentScheduledBatch === null) {
      const batchPromise = Promise.all([sleep(delayMs), ongoingWorkPromise])
        .then(async () => {
          currentScheduledBatch = null;
          const itemsToProcess = [...itemsInQueue];
          itemsInQueue = [];

          return targetFunction.apply(context, [itemsToProcess]);
        });

      currentScheduledBatch = batchPromise;
      ongoingWorkPromise = batchPromise.catch(() => {});
    }

    return currentScheduledBatch;
  };
}
