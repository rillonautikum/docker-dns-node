import Api from "./api.js";
import Dns from './process.js';

let api_worker = Api.start("tcp://localhost:2375");

api_worker.on("message", m => {
    let msg = JSON.parse(m);
    switch (msg.type) {
        case "data":
            console.log("Change Detected");
            Dns.update(msg);
            break;
    }
});

api_worker.on("exit", console.debug);
api_worker.on("error", console.error);

//let dns_server = Dns.start();
let dns_server = Dns.start();
dns_server.on("exit", console.debug);
dns_server.on("error", console.error);

process.on("SIGINT", () => {
    Dns.stop();
    Api.stop();
});

process.on("SIGUSR2", () => {
    Dns.stop();
    Api.stop();
});