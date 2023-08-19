import { v4 as uuidv4 } from 'uuid';

/**
 * The `LockManager` is a singleton class designed to help wait for required async
 * promised operations to complete
 * before the page is generated. It provides functionalities to create, delete, and wait
 * for the release of locks.
 * The locks are stored in a Map with a unique ID (either provided or auto-generated) as
 * the key.
 * The class provides an instance property to get the singleton instance of `LockManager`.
 */

class LockManager {
  // Holds the single instance of LockManager.
  private static _instance: LockManager;

  // A Map to keep track of the active locks.
  private locks: Map<string, boolean>;

  /**
   * Private constructor to prevent direct instantiation from outside.
   * Initializes the locks Map.
   */
  private constructor() {
    this.locks = new Map();
  }

  /**
   * Provides a way to access the single instance of the LockManager.
   * If it doesn't exist, it creates one.
   * @returns {LockManager} The single instance of LockManager.
   */
  public static get instance() {
    if (!LockManager._instance) {
      LockManager._instance = new LockManager();
    }

    return LockManager._instance;
  }

  /**
   * Creates a new lock.
   * @param {string} [id] - An optional ID to use for the lock. If not provided, a UUID will be generated.
   * @returns {string} The ID of the created lock.
   */
  createLock(id?: string): string {
    const lockId = id ?? uuidv4();
    this.locks.set(lockId, true);
    return lockId;
  }

  /**
   * Deletes a lock by its ID.
   * @param {string} lockId - The ID of the lock to be deleted.
   */
  deleteLock(lockId: string): void {
    this.locks.delete(lockId);
  }

  /**
   * Deletes all locks, clearing the locks Map.
   */
  deleteAllLocks(): void {
    this.locks.clear();
  }

  /**
   * Waits until all locks are released and then resolves.
   * @returns {Promise<void>} A promise that resolves when all locks are released.
   */
  waitForLockRelease(): Promise<void> {
    return new Promise((resolve) => {
      const checkLocks = () => {
        if (this.locks.size === 0) {
          resolve();
        } else {
          setTimeout(checkLocks, 100);
        }
      };
      checkLocks();
    });
  }
}

// Export the singleton instance of LockManager.
export = LockManager.instance;
