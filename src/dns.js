import { isMainThread, parentPort, Worker } from "worker_threads";
import DNS2 from 'dns2';
import URL from 'url';
const { Packet } = DNS2;

if (!isMainThread) {
    let dataBuffer = [];

    const server = DNS2.createServer({
        udp: true,
        handle: (request, send, rinfo) => {
            const response = Packet.createResponseFromRequest(request);
            const [question] = request.questions;
            const { name, type } = question;
            console.log("q", name, type);
            let f = dataBuffer.filter((v, i) => {
                //console.log(type, v.type);
                console.log(type, String(v.name + "." + v.zone));
                return (strToPacketType(v.type) == type && String(v.name + "." + v.zone) == name)
            });

            // console.log(strToPacketType(question));

            //response.answers = 
            f.forEach((i) => {
                // Packet.TYPE.TXT

                let data = {
                    name: i.name,
                    type: strToPacketType(i.type),
                    class: Packet.CLASS.IN,
                    ttl: 300,
                    address: i.target,
                    target: i.target
                }

                response.answers.push(data);
            });
            console.log(response.answers);
            send(response);
        }
    });

    server.on('listening', () => {
        console.log(server.addresses());
    });

    server.listen({
        udp: {
            port: 5354,
            // address: "127.0.0.1",
            type: "udp4"
        },

        tcp: {
            port: 5354,
            // address: "127.0.0.1"
        }
    });

    server.on('close', () => {
        console.log('DNS server closed');
    });

    parentPort.on("message", m => {
        try {

            // console.log(m);
            let msg = JSON.parse(m);
            switch (msg.type) {

                case "data":
                    // console.log(msg.payload);
                    dataBuffer = msg.payload;
                    break;
            }
        } catch (e) {
            // catch (e) {
            switch (m) {
                case "exit":
                    // console.debug("Stopping DNS Server");
                    server.close();
                    parentPort.close();
            }
            // }
        }
        // console.log(msg);
    });

    function strToPacketType(t) {
        // let k = Object.keys(Packet.TYPE);
        console.log(Packet.TYPE[t.toUpperCase()], t);

        switch (t) {
            case "a":
                return Packet.TYPE.A;
            case "aaaa":
                return Packet.TYPE.AAAA;
            case "cname":
                return Packet.TYPE.CNAME;
            case "txt":
                return Packet.TYPE.TXT;
            case "mx":
                return Packet.TYPE.MX;
            case "srv":
                return Packet.TYPE.SRV;
        }
    }

    // parentPort.on("")
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

        this.worker.postMessage("exit");
    },
    update: function (data) {
        if (!this.worker) throw new Error("No running worker was found");
        // console.log(data);
        this.worker.postMessage(JSON.stringify(data));
    }
}