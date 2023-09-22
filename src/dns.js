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

            let f = dataBuffer.filter((v, i) => {
                // console.log(type);
                return (strToPacketType(v.type) == type && v.name == name)
            });

            // console.log(strToPacketType(question));
            
            response.answers = f.map((i) => {
                console.log(strToPacketType(i.type));
                // Packet.TYPE.TXT
                return {
                    name: i.name,
                    type: strToPacketType(i.type),
                    class: Packet.CLASS.IN,
                    ttl: 300,
                    address: i.target,
                    target: i.target
                }
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
        return Packet.TYPE[t.toUpperCase()];
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