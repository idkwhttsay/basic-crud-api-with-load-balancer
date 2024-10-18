import Database from "../services/db.service";
import UserInterface from "../models/user.model";

export default class UserController {
    database: Database<UserInterface>;

    constructor(database: Database<UserInterface>) {
        this.database = database;
    }

    handleGet(id: string, data: object) {}
    handleGetAll() {}
    handleUpdate(id: string, data: object) {}
    handleDelete(id: string) {}
    handleAdd(id: string, data: object) {}
}
