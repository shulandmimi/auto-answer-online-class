export default abstract class EventEmitter<Events extends Record<string, (...arg: any) => any>> {
    private events = new Map<keyof Events, Events[keyof Events][]>();
    on<K extends keyof Events>(key: K, callback: Events[K]) {
        if (!this.events.has(key)) {
            this.events.set(key, []);
        }
        const eventList = this.events.get(key)!;

        eventList.push(callback);
    }
    emit<K extends keyof Events>(key: K, ...args: Parameters<Events[K]>) {
        if (!this.events.has(key)) return;

        const eventList = this.events.get(key)!;
        eventList.forEach(fn => fn.apply(this, args));
    }
    once<K extends keyof Events>(key: K, callback: Events[K]): () => void {
        const handle = (...args: any[]) => {
            callback.apply(this, args);
        };

        this.on(key, handle as unknown as Events[K]);

        return () => {
            this.events.set(
                key,
                this.events.get(key)!.filter(fn => fn !== handle)
            );
        };
    }
}
