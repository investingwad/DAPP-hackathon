import React, { Component } from "react";
import ScatterJS from "@scatterjs/core";
import ScatterEOS from "@scatterjs/eosjs2";
import { Api, JsonRpc } from "eosjs2";
import { network, requiredFields, eosOptions } from "./helpers/Config";
const rpc = new JsonRpc(network.fullhost());
const eos = ScatterJS.eos(network, Api, { rpc, beta3: true });

ScatterJS.plugins(new ScatterEOS());

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        name: "",
        publicKey: ""
      },
      order: {
        CPU: "",
        NET: "",
        Duration: 0,
        Offer: ""
      },
      loggedIn: false,
      contractAccount: "hehe"
    };
  }

  handleSubmit = async e => {
    e.preventDefault();
    console.log("order submitted!!", this.state.order);
    const contractAccount = this.state.contractAccount;
    const order = this.state.order;
    const user = this.state.user;
    const rentAmount = order.CPU + order.NET;

    const result = await eos.transact(
      {
        actions: [
          {
            account: "eosio.token",
            name: "transfer",
            authorization: [
              {
                actor: user.name,
                permission: "active"
              }
            ],
            data: {
              from: user.name,
              to: contractAccount,
              quantity: order.Offer,
              memo: `2:${rentAmount}, ${order.Duration}`
            }
          }
        ]
      },
      {
        blocksBehind: 3,
        expireSecond: 30
      }
    );
    console.log("result--->", result);
  };
  handleChange = e => {
    const { name, value } = e.target;
    const { order } = this.state;
    e.preventDefault();
    this.setState({
      order: {
        ...order,
        [name]: value
      }
    });
  };
  componentDidMount() {
    // this.loginWithScatter();
  }

  loginWithScatter = async e => {
    try {
      let connected = await ScatterJS.scatter.connect("hack", { network });
      if (connected) {
        ScatterJS.login().then(accounts => {
          if (accounts.accounts[0]) {
            this.setState({
              user: {
                name: accounts.accounts[0].name,
                publicKey: accounts.accounts[0].publicKey
              }
            });

            this.setState({ loggedIn: true });
          }
        });
      } else {
        console.log("Issue Connecting!!");
      }
    } catch (error) {
      alert(error);
    }
  };
  logoutWithScatter = async () => {
    await ScatterJS.scatter.forgetIdentity();
    this.setState({ loggedIn: false });
  };
  render() {
    const Order = this.state.order;
    const User = this.state.user;

    return this.state.loggedIn ? (
      <div>
        <div>
          User info:
          <br /> <span>name: {User.name}</span>
        </div>
        <form onSubmit={this.handleSubmit}>
          <label>Amount of EOS needed:</label>
          <br />
          <label>CPU bandwidth:</label>
          <input
            type="text"
            name="CPU"
            value={Order.CPU}
            onChange={this.handleChange}
          />{" "}
          <br />
          <label>NET bandwidth:</label>
          <input
            type="text"
            name="NET"
            value={Order.NET}
            onChange={this.handleChange}
          />{" "}
          <br />
          <label>Duration of lease:</label>
          <input
            type="number"
            name="Duration"
            value={Order.Duration}
            onChange={this.handleChange}
          />{" "}
          <br />
          <label>Offer of rent:</label>
          <input
            type="text"
            name="Offer"
            value={Order.Offer}
            onChange={this.handleChange}
          />{" "}
          <br />
          <button>Submit</button>
        </form>
        <div>
          <button onClick={this.logoutWithScatter}>Logout</button>
        </div>
      </div>
    ) : (
      <div>
        <button onClick={this.loginWithScatter}>Login With Scatter</button>
      </div>
    );
  }
}

export default App;
