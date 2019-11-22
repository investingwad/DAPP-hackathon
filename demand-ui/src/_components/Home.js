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
import axios from "axios";
import { mid } from "../_helpers/Images";

const endpoint = "https://api.kylin.alohaeos.com";
let data = [];

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
        staketo: "",
        bandwith: "",
        duration: "",
        offer: null
      },
      loggedIn: false,
      contractAccount: "leaseconacc1",
      connected: false,
      resource_needed: "",
      userBalance: null
    };
  }

  componentDidMount() {
    this.getUserBalance();
  }

  connect = async () => {
    const { user } = this.state;
    const requiredFields = {
      accounts: [kylinN]
    };
    try {
      await ScatterJS.scatter.connect("hack").then(async connected => {
        // User does not have Scatter Desktop, Mobile or Classic installed.
        if (!connected) {
          return console.log("Issue Connecting!!");
        } else {
          this.setState({ connected: true });
          console.log("stateset", this.state.connected);
          const scatter = ScatterJS.scatter;

          const requiredFields = {
            accounts: [kylinN]
          };
          await ScatterJS.scatter.getIdentity(requiredFields).then(() => {
            // Always use the accounts you got back from Scatter. Never hardcode them even if you are prompting
            // the user for their account name beforehand. They could still give you a different account.

            this.account = ScatterJS.scatter.identity.accounts.find(
              x => x.blockchain === "eos"
            );

            localStorage.setItem("user", this.account.name);
            const user1 = localStorage.getItem("user");
            console.log("hey-->", user1);

            this.setState({ loggedIn: true, connected: true });
            this.setState({
              user: {
                ...user,
                name: this.account.name,
                publicKey: this.account.publicKey
              }
            });

            // Get a proxy reference to eosjs which you can use to sign transactions with a user's Scatter.
            const rpc = new JsonRpc(endpoint);
            this.eos = ScatterJS.eos(kylinN, Api, { rpc, beta3: true });
          });

          window.ScatterJS = null;
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  transfer = async (action, data) => {
    // console.log("data--->", data);

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
          .catch(err => {
            console.log(err);
          })
          .catch(e => console.log(e))
      : null;
  };

  getUserBalance = async () => {
    // e.preventDefault()
    console.log("here");

    const rpc = new JsonRpc(endpoint);
    const bal = await rpc
      .get_currency_balance("eosio.token", this.state.user.name, "EOS")
      .then(res => {
        if (res[0] !== "") {
          this.setState({ userBalance: res[0] });
        }
      });
  };

  handleSubmit = async e => {
    e.preventDefault();
    const { bandwidth, duration, offer, staketo } = this.state.order;
    const resource_needed = this.state.resource_needed;
    const memo = `2:${bandwidth},${staketo},${duration},${resource_needed}`;
    const data = {
      authorizer: this.state.user.name,
      stake_to: staketo,
      rent_amount: bandwidth,
      rent_offer: offer,
      duration: duration,
      resource_type: resource_needed
    };

    this.transfer("transfer", {
      from: this.account.name,
      to: "leaseconacc1",
      quantity: offer,
      memo: memo
    }).then(async res => {
      if (res.transaction_id !== "") {
        await axios
          .post("http://dappapi.zero2pi.com/api/v1/create_order", data)
          .then(res => {
            if (res.data.message.authorizer !== "") {
              alert("Your order has been succesfully created!!");
            }
          });
      }
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
    if (e.target.value === "cpu") {
      this.setState({
        resource_needed: "cpu"
      });
    } else {
      this.setState({
        resource_needed: "net"
      });
    }
  };

  logout = async () => {
    await ScatterJS.forgetIdentity();
    this.setState({ loggedIn: false });
  };

  render() {
    const { staketo, duration, offer, bandwidth } = this.state.order;
    const User = this.state.user;
    return this.state.loggedIn ? (
      <div className="main-wrapper">
        <div>
          <Navbar
            login={this.connect}
            logout={this.logout}
            loggedIn={this.state.loggedIn}
          />
        </div>
        <div className="content-wrapper">
          <div className="row">
            <div className="col-lg">
              <div className="card custom-card">
                <span className="main-heading">User information</span>
                <span>Account name: {User.name}</span>
                <br />
                <div>Create your order:</div>
                <br />
                <div>
                  <form>
                    <label>Stake to:</label>
                    <input
                      type="text"
                      name="staketo"
                      placeholder="Name..."
                      value={staketo}
                      onChange={this.handleChange}
                      className="in"
                    />
                    <br />
                    <br />
                    <div className="row action">
                      <span style={{ marginLeft: "15px" }}>
                        Choose the Resource you would like to order:
                      </span>
                      <DropdownButton
                        id="dropdown-item-button"
                        title="Actions"
                        className="dd-button"
                      >
                        <Dropdown.Item
                          as="button"
                          value="cpu"
                          onClick={this.handleDrop}
                        >
                          CPU
                        </Dropdown.Item>
                        <Dropdown.Item
                          as="button"
                          value="net"
                          onClick={this.handleDrop}
                        >
                          NET
                        </Dropdown.Item>
                      </DropdownButton>
                    </div>
                    {this.state.resource_needed && (
                      <div>
                        <label>
                          {this.state.resource_needed.toUpperCase()} Bandwidth:
                        </label>
                        <input
                          type="text"
                          name="bandwidth"
                          placeholder="0.0000 EOS"
                          value={bandwidth}
                          onChange={this.handleChange}
                          className="in"
                        />
                        <br />
                        <br />
                      </div>
                    )}
                    <label>Duration of lease:</label>
                    <input
                      type="number"
                      name="duration"
                      placeholder="0 days"
                      value={duration}
                      onChange={this.handleChange}
                      className="in"
                    />
                    <br />
                    <br />
                    <label>Offer of rent:</label>
                    <input
                      type="text"
                      name="offer"
                      placeholder="0.0000 EOS"
                      value={offer}
                      onChange={this.handleChange}
                      className="in"
                    />{" "}
                    <br />
                    <br />
                    <button
                      className="btn btn-success submit"
                      onClick={this.handleSubmit}
                    >
                      Submit
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg">
              <div className="card custom-card">
                <div className="balance">
                  <div>
                    User Wallet balance:
                    {!this.state.userBalance ? (
                      <button
                        className="btn btn-primary ubal"
                        onClick={this.getUserBalance}
                      >
                        Check Balance
                      </button>
                    ) : (
                      <span> {this.state.userBalance}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="wrap-tables">
            <div className="row">Your Orders:</div>
            <div className="row order">
              <OrdersTable />
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="main-wrapper">
        <div>
          <Navbar
            login={this.connect}
            logout={this.logout}
            loggedIn={this.state.loggedIn}
          />
        </div>
        <div className="backgr"></div>
      </div>
    );
  }
}

export default Home;
