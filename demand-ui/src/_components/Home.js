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
      resource_needed: ""
    };

    try {
      ScatterJS.scatter.connect("hack").then(connected => {
        // User does not have Scatter Desktop, Mobile or Classic installed.
        if (!connected) return console.log("Issue Connecting");

        const scatter = ScatterJS.scatter;

        const requiredFields = {
          accounts: [kylinN]
        };

        window.ScatterJS = null;
      });
    } catch (error) {
      console.log(error);
    }
  }

  connect = async () => {
    const { user } = this.state;
    const result = await ScatterJS.scatter
      .getIdentity(requiredFields)
      .then(() => {
        // Always use the accounts you got back from Scatter. Never hardcode them even if you are prompting
        // the user for their account name beforehand. They could still give you a different account.

        console.log("acc", ScatterJS.scatter.identity.accounts);

        this.account = ScatterJS.scatter.identity.accounts.find(
          x => x.blockchain === "eos"
        );

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

    console.log("memo--->", resource_needed);
    console.log("data--->", data);

    this.transfer("transfer", {
      from: this.account.name,
      to: "leaseconacc1",
      quantity: offer,
      memo: memo
    }).then(async res => {
      if (res.transaction_id !== "") {
        console.log("hetre");

        await axios
          .post(process.env.REACT_APP_API, data)
          .then(res => console.log("res---->", res));
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
      return <div></div>;
    } else {
      this.setState({
        resource_needed: "net"
      });
    }
  };

  handleWithdraw = async id => {
    const result = await axios
      .post(process.env.REACT_APP_WITHDRAW_API, { order_id: id })
      .then(res => {
        console.log("response--->", res);

        // alert("Your order has been withdrawn!!")
      });
  };

  logout = async () => {
    await ScatterJS.forgetIdentity();
    this.setState({ loggedIn: false });
  };

  render() {
    const { staketo, duration, offer, bandwidth } = this.state.order;
    const User = this.state.user;
    console.log("funk---->");

    return this.state.loggedIn ? (
      <div className="container-fluid">
        <div className="row-nav">
          <Navbar
            login={this.connect}
            logout={this.logout}
            loggedIn={this.state.loggedIn}
          />
        </div>
        <div className="row-info">
          <div className="col-lg">
            User information
            <br />
            <span>Account name: {User.name}</span>
          </div>
          <div className="col-lg">
            balance: <Balance name={this.state.user.name} />
          </div>
        </div>
        <div className="row-order">
          <form>
            <label>Stake to:</label>
            <input
              type="text"
              name="staketo"
              placeholder="0.0000 EOS"
              value={staketo}
              onChange={this.handleChange}
            />
            <br />
            <div className="row-action">
              <span>Choose the Resource you would like to order:</span>
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
                />
              </div>
            )}
            <label>Duration of lease:</label>
            <input
              type="number"
              name="duration"
              placeholder="0"
              value={duration}
              onChange={this.handleChange}
            />{" "}
            days <br />
            <label>Offer of rent:</label>
            <input
              type="text"
              name="offer"
              placeholder="0.0000 EOS"
              value={offer}
              onChange={this.handleChange}
            />{" "}
            <br />
            <button className="btn btn-success" onClick={this.handleSubmit}>
              Submit
            </button>
          </form>
        </div>

        <div className="row-table">
          <OrdersTable username={User.name} />
        </div>
      </div>
    ) : (
      <div className="container-fluid">
        <div className="row">
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

function Balance(props) {
  const rpc = new JsonRpc(endpoint);
  const balance = async () =>
    await rpc.get_currency_balance("eosio.token", props.name, "EOS");

  const newBalance = balance.toString();

  return <div>{data}</div>;
}

export default Home;
