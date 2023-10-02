import { getDockerSocket } from "../src/api.js";

let docker = getDockerSocket();

function mockDockerLabels() {}

export async function createDockerEnv() {
    let network = await createDockerNetwork();
    return {
        docker, network
    }
}

export async function createDockerContainer(image) {
    return await docker.createContainer({
        "Image": "nginx"
    })
}

async function createDockerNetwork() {
    let network = await docker.createNetwork({
        "Name": "TestNetwork",
        "Driver": "ipvlan",
        "Options": {
            "parent": "eth0"    //fix
        }
    });

    return network;
}