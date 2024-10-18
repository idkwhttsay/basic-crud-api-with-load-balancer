import { v4 as uuid, validate } from "uuid";

export type UUID = ReturnType<typeof uuid>;

export default class Database<T> {
    protected data: { [key: UUID]: T };

    constructor(data?: { [key: UUID]: T }) {
        this.data = data || {};
    }

    public add(row: T) {
        const id: UUID = uuid();
        this.data[id] = { ...row, id } as T;
        return { status: 201, data: this.data[id] };
    }

    public get(id: UUID) {
        if (!validate(id)) {
            return { status: 400, message: "UserId is invalid (not uuid)." };
        }

        if (this.data[id]) {
            return { data: this.data[id], status: 200 };
        } else {
            return {
                status: 404,
                message: `Record with UserId ${id} doesn't exist.`,
            };
        }
    }

    public getAll() {
        return { status: 200, data: Object.values(this.data) };
    }

    public update(id: UUID, row: T) {
        if (!validate(id)) {
            return { status: 400, message: "UserId is invalid (not uuid)." };
        }

        if (this.data[id]) {
            this.data[id] = { ...row, id } as T;
            return {
                status: 200,
                message: "User was successfully updated.",
            };
        } else {
            return {
                status: 404,
                message: "Record with UserId ${id} doesn't exist.",
            };
        }
    }

    public delete(id: UUID) {
        if (!validate(id)) {
            return { status: 400, message: "UserId is invalid (not uuid)." };
        }

        if (this.data[id]) {
            delete this.data[id];
            return { status: 204, message: "User was successfully deleted." };
        } else {
            return {
                status: 404,
                message: "Record with UserId ${id} doesn't exist.",
            };
        }
    }
}
