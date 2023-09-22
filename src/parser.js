const regex = /com\.docker-dns\.(?<type>a{1,4}|cname|mx|srv|txt)(\.(?<options_index>pref|port|priority))?\.(?<name>.*)/;

export default (data) => {
    let keys = Object.keys(data);
    // console.log(keys);
    let v = keys.filter((v) => {
        return regex.test(v);
    }).map((v, i) => {
        // let value_l = "";
        // let value_r = data[v];
        return new DnsEntry(v, data[v]);
    });

    return v;
}

class DnsEntry {
    constructor(key, value) {
        let extra = regex.exec(key);

        // console.log(extra);
        this.type = extra?.groups.type;
        this.name = extra?.groups.name;
        this.target = value;
    }
}