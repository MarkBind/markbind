type EventHandler = () => void;

const subscribers: Record<string, EventHandler[]> = {};

export function subscribe(event: string, handler: EventHandler): void {
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
