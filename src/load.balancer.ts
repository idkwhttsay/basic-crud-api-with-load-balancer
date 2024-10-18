import cluster, { Worker } from "node:cluster";

import dotenv from "dotenv";

import { createServer, request, RequestOptions } from "node:http";
import { availableParallelism } from "node:os";

import Database from "../services/db.service";
import Router from "../routers/main.router";
import UserInterface from "../models/user.model";

dotenv.config();

if (cluster.isPrimary) {
    const CLUSTER_PORT =
        process.env.CLUSTER_PORT && isNaN(parseInt(process.env.CLUSTER_PORT))
            ? parseInt(process.env.CLUSTER_PORT)
            : 4000;

    const available_workers = availableParallelism() - 1;
    const database = new Database();

    console.log(`Cluster created`);
    for (let i = 0; i <= available_workers; i++) {
        const port = CLUSTER_PORT + 1 + i;
        const worker = cluster.fork({ HOST_PORT: port });
        console.log(`Worker run on the port: ${port}`);
        worker.send(database);

        worker.on("exit", (code) => {
            console.error(
                `Worker on the port ${port} existed with the code: ${code}`,
            );
            cluster.fork({ HOST_PORT: port });
            worker.send(database);

            console.log(`Worker run on the port: ${port}`);
        });
    }

    cluster.on("message", (messagedWorker: Worker, workerDatabase: object) => {
        if (!workerDatabase || !workerDatabase.hasOwnProperty("data")) {
            return;
        }

        database.merge(workerDatabase as Database<any>);
        for (const worker_id in cluster.workers) {
            const worker = cluster.workers[worker_id];
            if (worker && worker !== messagedWorker) {
                worker.send(database);
            }
        }
        console.log(`Database updated from the worker`);
    });

    let worker_index: number;
    const clusterServer = createServer((req, res) => {
        worker_index = ((worker_index || 0) % available_workers) + 1;

        console.log(`Cluster get a request`);

        new Promise(() => {
            const WORKER_PORT = CLUSTER_PORT + worker_index;

            console.log(
                `Cluster creates a request to the port: ${WORKER_PORT}`,
            );
            const requestToWorker = request(
                {
                    port: WORKER_PORT,
                    host: req.headers.host?.split(":")[0],
                    path: req.url,
                    method: req.method,
                    headers: req.headers,
                } as RequestOptions,
                (workerResponce) => {
                    console.log(
                        `Cluster proxied a request to the port: ${WORKER_PORT}`,
                    );
                    res.writeHead(
                        workerResponce.statusCode ?? 500,
                        workerResponce.headers,
                    );
                    workerResponce.pipe(res);
                },
            );

            req.pipe(requestToWorker);
            res.on("finish", () => {
                console.log(
                    `Cluster finished a request on the port: ${WORKER_PORT}`,
                );
            });

            requestToWorker.on("error", () => {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Internal Server Error");
            });
        });
    });

    clusterServer.listen(CLUSTER_PORT, () => {
        console.log(`Cluster listening on the port: ${CLUSTER_PORT}`);
    });
} else {
    const HOST_PORT =
        process.env.HOST_PORT && isNaN(parseInt(process.env.HOST_PORT))
            ? parseInt(process.env.HOST_PORT)
            : 4000;

    const database = new Database<UserInterface>();
    const app = new Router(database);

    const server = createServer((req, res) => {
        req.on("error", () => {
            res.writeHead(500);
        });

        app.handleHttpRequest(req, res);
    });

    server.on("request", ({}, res) => {
        res.on("finish", () => {
            process.send ? process.send(database) : null;
        });
    });

    server.listen(process.env.HOST_PORT ?? 4000);
    console.log(`Worker listening on the port: ${HOST_PORT}`);

    process.on("message", (parentDatabase: Database<any>) => {
        database.merge(parentDatabase);
        console.log(`Worker database updated on the port: ${HOST_PORT}`);
    });
}
