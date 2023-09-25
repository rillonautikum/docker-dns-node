import { isMainThread, Worker, parentPort } from "worker_threads";
import { spawn } from "child_process";
import URL from 'url';
import tmp from 'tmp';
import { DnsEntry } from "./parser.js";
import fs from 'fs';
import { open } from 'node:fs/promises';

let exitsignal = {
    "type": "exit"
};

if (!isMainThread) {
    const tmpobj = tmp.fileSync();

    let dnsmasq = start_dnsmasq();

    /*parentPort.on("message", (m) => {

        let msg = JSON.parse(m);
        switch (msg.type) {
            case "data":
                //write data to file
                //restart dnsmasq
                break;
        }
    });*/

    parentPort.on("message", msg => {
        let m = JSON.parse(msg);
        switch (m.type) {
            case "exit":
                console.debug("Stopping DNSMasq");
                parentPort.close();
                stop_dnsmasq();
                break;

            case "data":
                //write data here
                console.log("Received Data", m.payload);
                let config = m.payload.map((v) => {
                    return DnsEntry.fromObject(v).toDnsmasqSetting();
                }).join("\n");

                console.log("Updating DNS Config");
                clear_file(tmpobj.name).then(() => {
                    fs.writeFileSync(tmpobj.fd, config);
                    //restart dnsmasq
                    stop_dnsmasq();
                    dnsmasq = start_dnsmasq();
                });
                break;
        }
    });

    parentPort.on("close", () => {
        stop_dnsmasq();
        tmpobj.removeCallback();
    })

    function start_dnsmasq() {
        return spawn("dnsmasq", [
            "--keep-in-foreground",
            "-d",
            "-q",
            "--port=5354",
            "--conf-file=" + tmpobj.name
        ]);
    }

    function stop_dnsmasq() {
        dnsmasq.kill();
    }

    async function clear_file(path) {
        let filehandle = null;
        try {
            filehandle = await open(path, 'r+');
            await filehandle.truncate(0);
        } finally {
            await filehandle?.close();
        }
    }
}

export default {
    worker: null,
    start: function () {
        this.worker = new Worker(URL.fileURLToPath(import.meta.url), {

        });
        return this.worker;
    },
    stop: function () {
        if (!this.worker) throw new Error("No running worker was found");

        this.worker.postMessage(JSON.stringify(exitsignal));
    },
    update: function (data) {
        if (!this.worker) throw new Error("No running worker was found");
        // console.log(data);
        this.worker.postMessage(JSON.stringify(data));
    }
}