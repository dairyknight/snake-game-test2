type Handler<T> = (data: T) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class EventEmitter<T extends Record<string, any>> {
  private readonly listeners: Partial<{ [K in keyof T]: Handler<T[K]>[] }> = {};

  on<K extends keyof T>(event: K, handler: Handler<T[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    (this.listeners[event] as Handler<T[K]>[]).push(handler);
  }

  off<K extends keyof T>(event: K, handler: Handler<T[K]>): void {
    const list = this.listeners[event] as Handler<T[K]>[] | undefined;
    if (!list) return;
    this.listeners[event] = list.filter(h => h !== handler) as Handler<T[K]>[];
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const list = this.listeners[event] as Handler<T[K]>[] | undefined;
    if (!list) return;
    for (const h of list) h(data);
  }
}
