import LockManager from '../../../src/utils/LockManager';

describe('LockManager', () => {
  let lockManager: typeof LockManager;

  beforeEach(() => {
    lockManager = LockManager;
  });

  afterEach(() => {
    lockManager.deleteAllLocks();
  });

  it('should create a new lock', () => {
    const lockId = lockManager.createLock();
    expect(lockId).toBeDefined();
  });

  it('should use the provided ID when creating a lock', () => {
    const lockId = 'customId';
    const createdLockId = lockManager.createLock(lockId);
    expect(createdLockId).toEqual(lockId);
  });

  it('should delete all locks', () => {
    lockManager.createLock();
    lockManager.createLock();
    lockManager.deleteAllLocks();
  });

  it('should wait until all locks are released and resolve', async () => {
    const lockId1 = lockManager.createLock();
    const lockId2 = lockManager.createLock();

    const waitForLockReleasePromise = lockManager.waitForLockRelease();

    setTimeout(() => lockManager.deleteLock(lockId1), 100);
    setTimeout(() => lockManager.deleteLock(lockId2), 200);

    await expect(waitForLockReleasePromise).resolves.toBeUndefined();
  });
});
