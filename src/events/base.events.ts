export class BaseEvent<T> {
  constructor(private readonly data: T | T[]) {}
  toString() {
    return JSON.stringify({
      data: this.data,
    });
  }

  toJSON(): T | T[] {
    return this.data;
  }
}
