import React, { Component } from "react";
import ScatterJS from "scatterjs-core";
import ScatterEOS from "scatterjs-plugin-eosjs2";
import { JsonRpc, Api, RpcError } from "eosjs";
import {
  network,
  kylinN,
  requiredFields,
  eosOptions
} from "../_helpers/Config";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import OrdersTable from "./OrdersTable";
import "../global.scss";
import Navbar from "./Navbar/Navbar";

const endpoint = "api.kylin.alohaeos.com";

ScatterJS.plugins(new ScatterEOS());

class Home extends Component {
  constructor(props) {
    super(props);
    ScatterJS.plugins(new ScatterEOS());

    this.state = {
      user: {
        name: "",
        publicKey: ""
      },
      order: {
        stakeTo: "",
        bandwidth: "",
        offer: "",
        duration: 0
      },
      loggedIn: true,
      contractAccount: "leaseconacc1",
      connected: false,
      resource_needed: ""
    };
  }

  connect = async () => {
    const { user } = this.state;
    const result = await ScatterJS.scatter
      .connect("hack")
      .then(connected => {
        // User does not have Scatter Desktop, Mobile or Classic installed.
        if (!connected) return console.log("Issue Connecting!!");
        const scatter = ScatterJS.scatter;

        const requiredFields = {
          accounts: [kylinN]
        };

        scatter.getIdentity(requiredFields).then(() => {
          // Always use the accounts you got back from Scatter. Never hardcode them even if you are prompting
          // the user for their account name beforehand. They could still give you a different account.

          console.log("acc", scatter.identity.accounts);

          this.account = scatter.identity.accounts.find(
            x => x.blockchain === "eos"
          );
          console.log("1--->", this.account);
          if (this.account) {
            this.setState({ loggedIn: true, connected: true });
            this.setState({
              user: {
                ...user,
                name: this.account.name,
                publicKey: this.account.publicKey
              }
            });
          }

          // Get a proxy reference to eosjs which you can use to sign transactions with a user's Scatter.
          const rpc = new JsonRpc(endpoint);
          this.eos = ScatterJS.eos(kylinN, Api, { rpc, beta3: true });
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
    const { bandwidth, duration, offer, stakeTo } = this.state.order;
    const resource_needed = this.state;
    const memo = `2:${bandwidth},${stakeTo},${duration},${resource_needed}`;

    console.log("memo--->", memo);

    this.transfer("transfer", {
      from: this.account.name,
      to: "leaseconacc1",
      quantity: offer,
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

  logout = async () => {
    await ScatterJS.forgetIdentity();
    this.setState({ loggedIn: false });
  };

  render() {
    const Order = this.state.order;
    const User = this.state.user;
    console.log("name---->", User);

    return this.state.loggedIn ? (
      <div class="container-fluid">
        <div class="row-nav">
          <Navbar
            login={this.connect}
            logout={this.logout}
            loggedIn={this.state.loggedIn}
          />
        </div>
        <div class="row-info">
          <div>
            User info:
            <br />
            <span>Account name: {User.name}</span>
          </div>
        </div>
        <div class="row-order">
          <form>
            <label>Stake to:</label>
            <input
              type="text"
              name="Stake_to"
              value={Order.Bandwidth}
              onChange={this.handleChange}
            />
            <br />
            <div class="row">
              Choose the Resource you would like to order:
              <DropdownButton
                id="dropdown-item-button"
                title="Actions"
                className="dd-button"
              >
                <Dropdown.Item
                  as="button"
                  value="CPU"
                  onClick={this.handleDrop}
                >
                  CPU
                </Dropdown.Item>
                <Dropdown.Item as="button" onClick={this.handleDrop}>
                  NET
                </Dropdown.Item>
              </DropdownButton>
            </div>
            {this.state.resource_needed && (
              <div>
                <label>{this.state.resource_needed} Bandwidth:</label>
                <input
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
        </div>

        <div class="row-table">
          <OrdersTable />
        </div>
      </div>
    ) : (
      <div class="container-fluid">
        <div class="row">
          <Navbar
            login={this.connect}
            logout={this.logout}
            loggedIn={this.state.loggedIn}
          />
        </div>
      </div>
    );
  }
}

export default Home;
