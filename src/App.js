import React, { Component } from "react";
import ScatterJS from "scatterjs-core";
import ScatterEOS from "scatterjs-plugin-eosjs2";
import { JsonRpc, Api, RpcError } from "eosjs";
import { network, requiredFields, eosOptions } from "./helpers/Config";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

const endpoint = "https://eos.greymass.com"; //Mainnet
let eos;

ScatterJS.plugins(new ScatterEOS());

class App extends Component {
  constructor(props) {
    super(props);
    ScatterJS.plugins(new ScatterEOS());

    this.state = {
      user: {
        name: "",
        publicKey: ""
      },
      order: {
        Bandwidth: "",
        stakeTo: "",
        Duration: 0,
        Offer: ""
      },
      loggedIn: false,
      contractAccount: "hehe",
      connected: false,
      resource_needed: ""
    };
  }

  connect = async () => {
    const result = await ScatterJS.scatter
      .connect("hack")
      .then(connected => {
        // User does not have Scatter Desktop, Mobile or Classic installed.
        if (!connected) return console.log("Issue Connecting");

        const scatter = ScatterJS.scatter;

        const requiredFields = {
          accounts: [network]
        };

        scatter.getIdentity(requiredFields).then(() => {
          // Always use the accounts you got back from Scatter. Never hardcode them even if you are prompting
          // the user for their account name beforehand. They could still give you a different account.

          console.log("acc", scatter.identity.accounts);

          this.account = scatter.identity.accounts.find(
            x => x.blockchain === "eos"
          );
          console.log("1--->", this.account);
          if (this.account) this.setState({ loggedIn: true, connected: true });

          // Get a proxy reference to eosjs which you can use to sign transactions with a user's Scatter.
          const rpc = new JsonRpc(endpoint);
          this.eos = ScatterJS.eos(network, Api, { rpc, beta3: true });
        });

        window.ScatterJS = null;
      })
      .catch(error => console.log(error));
  };

  transfer = async (action, data) => {
    return this.state.connected
      ? await this.eos
          .transact(
            {
              actions: [
                {
                  account: "eosio.token",
                  name: action,
                  authorization: [
                    {
                      actor: this.account.name,
                      permission: this.account.authority
                    }
                  ],
                  data: {
                    ...data
                  }
                }
              ]
            },
            {
              blocksBehind: 3,
              expireSeconds: 30
            }
          )
          .then(res => {
            alert("Task : " + this.state.taskName + " not done.");
          })
          .catch(err => {
            console.log(err);
          })
          .catch(e => console.log(e))
      : null;
  };

  handleSubmit = async e => {
    e.preventDefault();
    const { Bandwidth, Duration, Offer, stakeTo } = this.state.order;
    const resource_needed = this.state;
    const memo = `2:${Bandwidth},${stakeTo},${Duration},${resource_needed}`;

    console.log("memo--->", memo);

    this.transfer("transfer", {
      from: this.account.name,
      to: "leaseconacc1",
      quantity: Offer,
      memo: memo
    });
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

  handleDrop = e => {
    e.preventDefault();
    if (e.target.value === "CPU") {
      this.setState({
        resource_needed: "CPU"
      });
      return <div></div>;
    } else {
      this.setState({
        resource_needed: "NET"
      });
    }
  };
  componentDidMount() {
    this.connect();
  }

  logout = async () => {
    await ScatterJS.forgetIdentity();
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
        <form>
          <label>Choose the Resource you would like to order:</label>
          <br />
          <DropdownButton id="dropdown-item-button" title="Actions">
            <Dropdown.Item as="button" value="CPU" onClick={this.handleDrop}>
              CPU
            </Dropdown.Item>
            <Dropdown.Item as="button" onClick={this.handleDrop}>
              NET
            </Dropdown.Item>
          </DropdownButton>
          {this.state.resource_needed && (
            <div>
              <label>{this.state.resource_needed} Bandwidth:</label>
              <input
                type="text"
                type="text"
                name="Bandwidth"
                value={Order.Bandwidth}
                onChange={this.handleChange}
              />
            </div>
          )}
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
          <button onClick={this.handleSubmit}>Submit</button>
        </form>
        <div>
          <button onClick={this.logout}>Logout</button>
        </div>
      </div>
    ) : (
      <div>
        <button onClick={this.connect}>Login With Scatter</button>
      </div>
    );
  }
}

export default App;
