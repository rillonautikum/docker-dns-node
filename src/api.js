import { parentPort, workerData, isMainThread, Worker } from "node:worker_threads";
import { createHash } from "node:crypto";
import Dockerode from 'dockerode';
import extract from './parser.js';
import URL from 'url';

if (!isMainThread) {

    let lastHash = null;
    let docker = getDockerSocket(workerData);

    async function getContainers() {
        return await docker.listContainers();
    }

    const interval = setInterval(() => {
        getContainers().then(e => {
            //No running container found
            if (!e.length) return;

            const type = "data";

            let payload = e.filter(isIncluded).map(container => {
                // console.log(Object.keys(container.Labels));
                // return container;
                const zone = container.Labels["com.docker-dns.domain"];
                return extract(zone, container.Labels);
            });

            
            // hash each container config
            let calcHash = hashEntries(payload);
            // console.log(calcHash, payload);
            if (calcHash != lastHash) {
                // console.log("matches", lastHash);
                // console.log("PAYLOAD", payload);
                //post new message if hashes dont match
                //because it indicates an update
                parentPort.postMessage(JSON.stringify({
                    type,
                    payload: payload[0] ?? [],
                }));
                lastHash = calcHash;
            }
        })
    }, 1000);

    parentPort.on("message", msg => {

        switch (msg) {
            case "exit":
                console.debug("Stopping API Server");
                clearInterval(interval);
                parentPort.close();
                break;
        }
    });
}

function hashEntries(data) {
    let json = JSON.stringify(data);
    return createHash("sha256").update(json).digest("hex");
}

function isIncluded(container) {
    return (
        (Boolean(container.Labels["com.docker-dns.enabled"]) || container.Labels["com.docker-dns.enabled"] === "")
        && (Boolean(container.Labels["com.docker-dns.domain"]) || container.Labels["com.docker-dns.domain"] !== "")
        )
}

export function getDockerSocket(url) {
    // URL.
    let dockerUri = new URL.urlToHttpOptions(url);
    return new Dockerode({
        ...dockerUri
    });
}

export default {
    worker: null,
    start: function (socketPath) {
        // console.log();

        this.worker = new Worker(URL.fileURLToPath(import.meta.url), {
            //Docker API Socket Path
            // workerData: "/var/run/docker.sock"
            workerData: socketPath
        });
        return this.worker;
    },
    stop: function () {
        if (!this.worker) throw new Error("No running worker was found");

        this.worker.postMessage("exit");
    }
}