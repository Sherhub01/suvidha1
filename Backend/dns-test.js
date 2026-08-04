import dns from "node:dns";

dns.resolveSrv(
  "_mongodb._tcp.cluster0.vywjpnb.mongodb.net",
  (err, records) => {
    console.log(err);
    console.log(records);
  }
);