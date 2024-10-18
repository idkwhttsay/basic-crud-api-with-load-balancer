import Database from "../services/db.service";
import UserInterface from "../models/user.model";
import { IncomingMessage, ServerResponse } from "http";
import UserController from "../controllers/user.controller";
import messages from "../exceptions/api.messages";

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

        let splitUrl = <string[]>requestUrl.split("/");
        const method = req.method;

        splitUrl = splitUrl.filter((value: string) => value.length > 0);

        let result;

        if (
            splitUrl.length == 3 &&
            splitUrl[0] === "api" &&
            splitUrl[1] === "users" &&
            method === "GET"
        ) {
            result = this.controller.handleGet(splitUrl[2]);
        } else if (
            splitUrl.length == 2 &&
            splitUrl[0] === "api" &&
            splitUrl[1] === "users" &&
            method === "GET"
        ) {
            result = this.controller.handleGetAll();
        } else if (
            splitUrl.length == 2 &&
            splitUrl[0] === "api" &&
            splitUrl[1] === "users" &&
            method === "POST"
        ) {
            result = this.controller.handleAdd(data);
        } else if (
            splitUrl.length == 3 &&
            splitUrl[0] === "api" &&
            splitUrl[1] === "users" &&
            method === "PUT"
        ) {
            result = this.controller.handleUpdate(splitUrl[2], data);
        } else if (
            splitUrl.length == 3 &&
            splitUrl[0] === "api" &&
            splitUrl[1] === "users" &&
            method === "DELETE"
        ) {
            result = this.controller.handleDelete(splitUrl[2]);
        } else {
            result = messages.endpointNotFound;
        }

        res.setHeader("Content-Type", "application/json");
        res.writeHead(result.status);
        res.end(JSON.stringify(result));
    }
}
