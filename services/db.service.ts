import { v4 as uuid, validate } from "uuid";
import messages from "../exceptions/api.messages";

export type UUID = ReturnType<typeof uuid>;

export default class Database<T> {
    protected data: { [key: UUID]: T };

    constructor(data?: { [key: UUID]: T }) {
        this.data = data || {};
    }

    public add(row: T) {
        const id: UUID = uuid();
        this.data[id] = { id, ...row } as T;
        return { status: 201, ...this.data[id] };
    }

    public get(id: UUID) {
        if (!validate(id)) {
            return messages.invalidId;
        }

        if (this.data[id]) {
            return { status: 200, ...this.data[id] };
        } else {
            return messages.recordNotFound;
        }
    }

    public getAll() {
        const usersData = Object.entries(this.data).map(([id, value]) => ({
            id,
            ...value,
        }));

        return {
            status: 200,
            data: usersData,
        };
    }

    public update(id: UUID, row: T) {
        if (!validate(id)) {
            return messages.invalidId;
        }

        if (this.data[id]) {
            this.data[id] = { id, ...row } as T;
            return { status: 200, ...this.data[id] };
        } else {
            return messages.recordNotFound;
        }
    }

    public delete(id: UUID) {
        if (!validate(id)) {
            return messages.invalidId;
        }

        if (this.data[id]) {
            delete this.data[id];
            return messages.userDeleted;
        } else {
            return messages.recordNotFound;
        }
    }
}
