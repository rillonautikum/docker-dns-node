import Api from "./api.js";
import Dns from './dns.js';

let api_worker = Api.start("tcp://localhost:2375");

api_worker.on("message", m => {
    console.log(m);

    let msg = JSON.parse(m);
    switch (msg.type) {
        case "data":
            Dns.update(msg);
            break;
    }
});

api_worker.on("exit", console.debug);
api_worker.on("error", console.error);

let dns_server = Dns.start();
dns_server.on("exit", console.debug);
dns_server.on("error", console.error);

/* setTimeout(() => {
    Api.stop();
    Dns.stop();
}, 5000); */