import Dockerode from 'dockerode';
import { getDockerSocket } from '../src/api.js';

import extract, { DnsEntry } from '../src/parser.js';

describe("Parser Test Suite", function () {
    it("converts correctly given labels", function () {
        // console.log(this);
        let obj = {
            "com.docker-dns.enabled": "",
            "com.docker-dns.domain": "example.net",
            "com.docker-dns.a.v4-test": "10.0.0.1"
        };

        let workingObj = DnsEntry.fromObject({
            zone: "example.net",
            type: "a",
            name: "v4-test",
            target: "10.0.0.1"
        });

        let converted = extract("example.net", obj);
        // console.log(converted);
        expect(converted).toEqual([workingObj]);
    });
});