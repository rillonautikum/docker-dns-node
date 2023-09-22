import Dockerode from 'dockerode';
import { getDockerSocket } from '../src/api.js';

describe("Parser Test Suite", function() {

    beforeEach(function() {
        this.docker = getDockerSocket();
    })

    it("contains spec with an expectation", function() {
        expect(true).toBe(true);
    })
})