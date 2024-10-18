import Database from "../services/db.service";
import UserInterface from "../models/user.model";

export default class UserController {
    database: Database<UserInterface>;

    constructor(database: Database<UserInterface>) {
        this.database = database;
    }

    hasRequiredFields(obj: object): obj is UserInterface {
        return (
            typeof (obj as any).name === "string" &&
            typeof (obj as any).age === "number" &&
            Array.isArray((obj as any).hobbies) &&
            (obj as any).hobbies.every(
                (hobby: any) => typeof hobby === "string",
            )
        );
    }

    handleGet(id: string) {
        return this.database.get(id);
    }

    handleGetAll() {
        return this.database.getAll();
    }

    handleUpdate(id: string, data: object) {
        if (!this.hasRequiredFields(data)) {
            return {
                status: 400,
                message:
                    "Request body doesn't contain required fields or has non-required fields.",
            };
        }

        const userData: UserInterface = data as UserInterface;
        return this.database.update(id, userData);
    }

    handleDelete(id: string) {
        return this.database.delete(id);
    }

    handleAdd(data: object) {
        if (!this.hasRequiredFields(data)) {
            return {
                status: 400,
                message:
                    "Request body doesn't contain required fields or has non-required fields.",
            };
        }

        const userData: UserInterface = data as UserInterface;
        return this.database.add(userData);
    }
}
