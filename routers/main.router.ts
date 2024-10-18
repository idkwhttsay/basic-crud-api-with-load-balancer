import Database from "../services/db.service";
import UserInterface from "../models/user.model";
import { IncomingMessage, ServerResponse } from "http";
import UserController from "../controllers/user.controller";

export default class Router {
    database: Database<UserInterface>;
    controller: UserController;

    constructor(database: Database<UserInterface>) {
        this.database = database;
        this.controller = new UserController(database);
    }

    handleHttpRequest(req: IncomingMessage, res: ServerResponse) {
        let data: string = "";

        req.on("data", (chunk) => {
            data += chunk.toString();
        });

        req.on("end", () => {
            try {
                this.proceed(req, res, data ? JSON.parse(data) : {});
            } catch (error) {
                req.emit("error", error);
            }
        });
    }

    proceed(req: IncomingMessage, res: ServerResponse, data: object) {
        const requestUrl = <string>req.url;

        const splitUrl = <string[]>requestUrl.split("/");
        const method = req.method;

        let result;

        if (
            splitUrl[0] === "api" &&
            splitUrl[1] === "users" &&
            splitUrl[2] &&
            method === "GET"
        ) {
            result = this.controller.handleGet(splitUrl[2]);
        } else if (
            splitUrl[0] === "api" &&
            splitUrl[1] === "users" &&
            method === "GET"
        ) {
            result = this.controller.handleGetAll();
        } else if (
            splitUrl[0] === "api" &&
            splitUrl[1] === "users" &&
            method === "POST"
        ) {
            result = this.controller.handleAdd(data);
        } else if (
            splitUrl[0] === "api" &&
            splitUrl[1] === "users" &&
            splitUrl[2] &&
            method === "PUT"
        ) {
            result = this.controller.handleUpdate(splitUrl[2], data);
        } else if (
            splitUrl[0] === "api" &&
            splitUrl[1] === "users" &&
            method === "DELETE"
        ) {
            result = this.controller.handleDelete(splitUrl[2]);
        } else {
            result = { status: 404, message: "Given endpoint doesn't exist." };
        }

        res.setHeader("Content-Type", "application/json");
        res.writeHead(result.status);
        res.end(JSON.stringify(result));
    }
}
