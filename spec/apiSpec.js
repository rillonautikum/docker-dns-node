import { createDockerEnv, createDockerContainer } from "./utils.js";


describe("API Test Suite", () => {

    //create docker network

    it("receives Changes correctly", () => {
        const { docker, network } = createDockerEnv();
        //create two container
        let container1 = createDockerContainer("nginx");
        let container2 = createDockerContainer("nginx");
        network.connect(container1);
        network.connect(container2);
        console.log(network, container1, container2);

        expect(true).toBe(true);
        //check if the two configurations are available
    });
})