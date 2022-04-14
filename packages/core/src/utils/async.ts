module.exports = {
  /**
   * Applies an asynchronous function for each element in an array.
   * Each application evaluation is done sequentially. That is, an asynchronous function
   * application of an element is evaluated only when the previous applications
   * have finished.
   *
   * @param {Array} array The array to be iterated over
   * @param func The asynchronous function to be applied to each element
   * @returns {Promise<void>} A Promise that resolves once every application has been evaluated
   */
  async sequentialAsyncForEach(array, func) {
    for (let i = 0; i < array.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await func(array[i]);
    }
  },
};
