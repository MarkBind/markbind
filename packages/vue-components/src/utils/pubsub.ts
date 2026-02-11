const subscribers: Record<string, (() => void)[]> = {};

export function subscribe(event: string, handler: () => void): void {
  if (!subscribers[event]) {
    subscribers[event] = [];
  }
  subscribers[event].push(handler);
}

export function publish(event: string): void {
  if (!subscribers[event]) {
    return;
  }
  subscribers[event].forEach(handler => handler());
}
