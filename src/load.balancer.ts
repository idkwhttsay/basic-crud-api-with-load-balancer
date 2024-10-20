import cluster from "cluster";
import { createServer, request, RequestOptions } from "http";
import { availableParallelism } from "os";
import dotenv from "dotenv";
import Database from "../services/db.service";
import Router from "../routers/main.router";
import UserInterface from "../models/user.model";

dotenv.config();

const MAIN_CLUSTER_PORT =
    process.env.MAIN_CLUSTER_PORT &&
    !isNaN(parseInt(process.env.MAIN_CLUSTER_PORT))
        ? parseInt(process.env.MAIN_CLUSTER_PORT)
        : 4000;

if (cluster.isPrimary) {
    const availableWorkers = availableParallelism() - 1;
    const database = new Database();

    console.log(
        `Primary process started, setting up ${availableWorkers} workers.`,
    );

    for (let i = 0; i < availableWorkers; i++) {
        const worker = cluster.fork();
        console.log(`Worker ${worker.process.pid} started.`);
    }

    cluster.on("message", (worker, message: { action: string; data?: any }) => {
        if (message.action === "syncDatabase") {
            database.merge(message.data);
            console.log(
                `Primary database updated by worker ${worker.process.pid}`,
            );

            for (const id in cluster.workers) {
                cluster.workers?.[id]?.send({
                    action: "updateDatabase",
                    data: database,
                });
            }
        }
    });

    let workerIndex = 0;
    const server = createServer((req, res) => {
        // @ts-ignore
        const workers = Object.values(cluster.workers) as cluster.Worker[];
        const worker = workers[workerIndex++ % workers.length];

        if (worker) {
            const options: RequestOptions = {
                hostname: "localhost",
                port: MAIN_CLUSTER_PORT + worker.id,
                path: req.url,
                method: req.method,
                headers: req.headers,
            };

            const proxy = request(options, (workerRes) => {
                res.writeHead(workerRes.statusCode || 500, workerRes.headers);
                workerRes.pipe(res, { end: true });
            });

            req.pipe(proxy);

            proxy.on("error", (err) => {
                console.error(`Error proxying request: ${err.message}`);
                res.statusCode = 500;
                res.end("Internal Server Error");
            });
        } else {
            res.statusCode = 503;
            res.end("No workers available");
        }
    });

    server.listen(MAIN_CLUSTER_PORT, () => {
        console.log(
            `Load balancer listening on port http://localhost:${MAIN_CLUSTER_PORT}`,
        );
    });
} else {
    const database = new Database<UserInterface>();
    const app = new Router(database);
    // @ts-ignore
    const WORKER_PORT = MAIN_CLUSTER_PORT + cluster.worker.id;

    const server = createServer((req, res) => {
        req.on("error", () => {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Request error");
        });

        app.handleHttpRequest(req, res);
    });

    server.listen(WORKER_PORT, () => {
        console.log(`Worker ${process.pid} listening on port ${WORKER_PORT}`);
    });

    process.on("message", (message: { action: string; data?: any }) => {
        if (message.action === "updateDatabase") {
            database.merge(message.data);
            console.log(
                `Worker ${process.pid} synced with the updated database`,
            );
        }
    });

    // Notify primary process of database updates
    server.on("request", (_, res) => {
        res.on("finish", () => {
            process.send?.({ action: "syncDatabase", data: database });
        });
    });
}
