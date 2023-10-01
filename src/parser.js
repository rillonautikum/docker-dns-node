const regex = /com\.docker-dns\.(?<type>a{1,4}|cname|mx|srv|txt)(\.(?<options_index>pref|port|priority))?\.(?<name>.*)/;

export default (zone, data) => {
    //console.log(data.NetworkSettings);
    let keys = Object.keys(data.Labels);
    //extract IP Addresses here
    let ips = Object.keys(data.NetworkSettings.Networks).map((k) => {
        return data.NetworkSettings.Networks[k].IPAddress;
    });
    //console.log(ips);


    let final = ips.map((ip) => {
        //console.log(ip);
        return keys.filter((v) => {
            return regex.test(v);
        }).map((v, i) => {
            // let value_l = "";
            // let value_r = data[v];
            return new DnsEntry(zone, v, data.Labels[v], ip);
        });

    });

    return final;
}

export class DnsEntry {
    constructor(zone, key, value, ip) {
        let extra = regex.exec(key);
        this.zone = zone;

        // console.log(extra);
        this.type = extra?.groups.type;
        this.name = extra?.groups.name;

        if (this.type == "a" || this.type == "aaaa") {
            this.target = ip;
        } else {
            this.target = value;
        }
    }

    static fromObject(obj) {
        let {
            zone,
            type,
            name,
            target
        } = obj;

        return new DnsEntry(zone, "com.docker-dns." + type + "." + name, target, target);
    }

    toDnsmasqSetting() {
        switch (this.type) {
            case "a":
            case "aaaa":
                return `address=/${this.name}.${this.zone}/${this.target}`;

            case "cname":
                return `cname=/${this.name}.${this.zone},${this.target}`;

            case "mx":
                return `mx-host=${this.name}.${this.zone},${this.target}`;

            case "srv":
                return `srv-host=${this.name}.${this.zone},${this.target}`;

            case "txt":
                return `txt-record=${this.name}.${this.zone},\"${this.target}\"`;

            default:
                console.warn("encountered unimplemented " + this.type + " - uh oh");
                return "";
        }
    }
}