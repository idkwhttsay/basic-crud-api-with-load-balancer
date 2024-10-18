import { v4 as uuid, validate } from 'uuid';
import { DatabaseErrorID } from '../exceptions/database.exception';

export type UUID = ReturnType<typeof uuid>;

export default class Database<T> {
    protected data: { [key: UUID]: T };

    constructor(data?: { [key: UUID]: T }) {
        this.data = data || {};
    }

    private checkId(id: string) {
        if (!validate(id)) {
            throw new DatabaseErrorID();
        }
    }

    public add(row: T) {
        const id: UUID = uuid();
        this.data[id] = { ...row, id } as T;
        return this.data[id];
    }

    public get(id: UUID) {
        this.checkId(id);
        return this.data[id];
    }

    public getAll(): T[] {
        return Object.values(this.data);
    }

    public update(id: UUID, row: T): boolean {
        this.checkId(id);

        return this.data[id]
            ? (this.data[id] = { ...row, id } as T) !== undefined
            : false;
    }

    public delete(id: UUID): boolean {
        this.checkId(id);

        return this.data[id] ? delete this.data[id] : false;
    }
}
