const subscribers = {};

export function subscribe(event, handler) {
  if (!subscribers[event]) {
    subscribers[event] = [];
  }
  subscribers[event].push(handler);
}

export function publish(event) {
  if (!subscribers[event]) {
    return;
  }
  subscribers[event].forEach(handler => handler());
}
