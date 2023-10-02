import Api from "./api.js";

import DnsmasqProc from './process.js';
import BuiltinDns from './dns.js';

import dotenv from 'dotenv';
dotenv.config();

let api_worker = Api.start(process.env.DOCKER);

api_worker.on("message", m => {
    let msg = JSON.parse(m);
    switch (msg.type) {
        case "data":
            console.log("Change Detected");
            if (useBuiltinServer()) {
                BuiltinDns.update(msg);
            } else {
                DnsmasqProc.update(msg);
            }
            break;
    }
});

// api_worker.on("exit", console.debug);
api_worker.on("error", console.error);


let dns_server;
if (useBuiltinServer()) {
    
//    console.log("builtin", process.env.USE_BULTIN_SERVER);
    //let dns_server = Dns.start();
    dns_server = BuiltinDns.start();
} else {
    dns_server = DnsmasqProc.start();
}
// dns_server.on("exit", console.debug);
dns_server.on("error", console.error);

process.on("SIGINT", () => {
    if (useBuiltinServer()) {
        BuiltinDns.stop();
    } else {
        DnsmasqProc.stop();
    }
    Api.stop();
});

process.on("SIGUSR2", () => {
    if (useBuiltinServer()) {
        BuiltinDns.stop();
    } else {
        DnsmasqProc.stop();
    }
    Api.stop();
});

function useBuiltinServer() {
    return process.env.USE_BULTIN_SERVER == "true";
}