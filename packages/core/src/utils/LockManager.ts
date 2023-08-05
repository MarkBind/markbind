import { v4 as uuidv4 } from 'uuid';

class LockManager {
  private static _instance: LockManager;
  private locks: Map<string, boolean>;

  private constructor() {
    this.locks = new Map();
  }

  public static get instance() {
    if (!LockManager._instance) {
      LockManager._instance = new LockManager();
    }

    return LockManager._instance;
  }

  createLock(id?: string): string {
    const lockId = id ?? uuidv4();
    this.locks.set(lockId, true);
    return lockId;
  }
  
  deleteLock(lockId: string): void {
    this.locks.delete(lockId);
  }

  deleteAllLocks(): void {
    this.locks.clear();
  }

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

export = LockManager.instance;
