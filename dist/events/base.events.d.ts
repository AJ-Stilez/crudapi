export declare class BaseEvent<T> {
    private readonly data;
    constructor(data: T | T[]);
    toString(): string;
    toJSON(): T | T[];
}
