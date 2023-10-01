# docker-dns
> THIS IS PROTOTYPE SOFTWARE

> Easily manage your Application Network with Dockerlabels

### Background
I wanted to create a Subnet for Docker Apps which I wanted to map on a VLAN. But every DNS Tool felt so clunky in comparison to other edge tools (like [traefik](https://doc.traefik.io/traefik/)). I really liked the feature that you can assign your configs directly to the container with labels. Sadly I seemed to not find a good DNS Server which provided that feature so I prototyped my own!

### Goals
- [x] Get DNS entries from docker api with labels
- [x] Generate DNS Config for dnsmasq
- [x] Start/Stop Dnsmasq

### Features
- Pull DNS Configuration from Docker
- Automatic Restart of Dnsmasq

### Planned Features
- Swarm Integration
- Standalone Mode without neccessary Docker Environment

### Installation (Container)
Clone this Repo and run the following commands:
```bash
docker build -t docker-dns .
```

```bash
docker run --cap-add=NET_ADMIN --rm  -p 53:53/udp -p 53:53/tcp -v /var/run/docker.sock:/var/run/docker.sock docker-dns
```

Mount tests and run them inside the Container
```bash
docker run --cap-add=NET_ADMIN --rm  -p 53:53/udp -p 53:53/tcp -v /var/run/docker.sock:/var/run/docker.sock -v $PWD/src/tests:/usr/src/docker-dns-node/src/tests docker-dns yarn test
```

The Application will detect labels automatically and configure a dnsmasq instance for it. If any changes are made to the labels at runtime docker-dns will pick the changes up and reload the server.

### Labeldescription

|Label|Description|Value|
|-|-|-|
|`com.docker-dns.enabled`|Enables the generation of DNS Records through Docker DNS|any|
|`com.docker-dns.domain`|Parent Domain|any|
|`com.docker-dns.<type>.<subdomain_name>`|`<type>` = "a", "aaaa", "cname", "mx", "srv", "txt", `<subdomain_name>` = test|This Records content|

<!-- TODO Add Polling Interval to config file -->
The default Polling Interval for the Docker API is 1 second. You can change this in the Config Array in the `main.rs` file.

### Example
<!-- 
> Give your Container an explicit IP Address that is reachable from your computer
-->

```bash
# Create the network with VLAN ID 20 for parent interface eth0
docker network create -d ipvlan --subnet=192.168.20.0/24 --gateway=192.168.20.1 -o parent=eth0.20 ipvlan20
docker run -d --net=ipvlan20 -it --name nginx --rm --label com.docker-dns.enabled=yes --label com.docker-dns.domain=example.net --label com.docker-dns.a.nginx-test --ip 192.168.20.2 nginx
```