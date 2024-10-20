import * as dotenv from "dotenv";
import Database from "../services/db.service";
import * as http from "http";
import Router from "../routers/main.router";
import UserInterface from "../models/user.model";

dotenv.config();

const PORT = process.env.PORT || 3000;

const database = new Database<UserInterface>();
const router = new Router(database);

const server = http.createServer((req, res) => {
    req.on("error", (error) => {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(error.message);
    });

    router.handleHttpRequest(req, res);
});

server.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
