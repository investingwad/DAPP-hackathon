import ScatterJS from "scatterjs-core";

export const network = ScatterJS.Network.fromJson({
  blockchain: "eos",
  chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
  host: "eos.greymass.com",
  port: 443,
  protocol: "https"
});

export const kylinN = ScatterJS.Network.fromJson({
  blockchain: "eos",
  chainId: "5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191",
  host: "api.kylin.alohaeos.com",
  port: 443,
  protocol: "https"
});

export const requiredFields = {
  accounts: [
    {
      blockchain: "eos",
      host: "eos.greymass.com",
      port: 443,
      chainId:
        "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"
    }
  ]
};

export const eosOptions = {
  chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"
};
