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
        res.setHeader("Content-Type", "application/json");

        const requestUrl = <string>req.url;

        const splitUrl = <string[]>requestUrl.split("/");
        const method = req.method;

        if (
            splitUrl[0] === "api" &&
            splitUrl[1] === "users" &&
            splitUrl[2] &&
            method === "GET"
        ) {
            this.controller.handleGet(splitUrl[2], data);
        } else if (
            splitUrl[0] === "api" &&
            splitUrl[1] === "users" &&
            method === "GET"
        ) {
            this.controller.handleGetAll();
        } else if (
            splitUrl[0] === "api" &&
            splitUrl[1] === "users" &&
            method === "POST"
        ) {
            this.controller.handleAdd();
        } else if (
            splitUrl[0] === "api" &&
            splitUrl[1] === "users" &&
            method === "PUT"
        ) {
            this.controller.handleUpdate();
        } else if (
            splitUrl[0] === "api" &&
            splitUrl[1] === "users" &&
            method === "DELETE"
        ) {
            this.controller.handleDelete();
        } else {
            // TODO: write a code and error message to response
        }
    }
}
