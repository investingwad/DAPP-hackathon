import React, { Component } from "react";
import axios from "axios";

import Spinner from "../Spinner/Spinner";

import "./leaseeos.css";

class LeaseEos extends Component {
  constructor() {
    super();

    this.state = {
      account_name: "",
      lease_amount: "10.0000 EOS",
      lease_period: "30",
      vote_choice: "leaseproxy22",
      isLeased: false,
      isLoading: false
    };

    this.leaseEos = this.leaseEos.bind(this);
    this.unregister = this.unregister.bind(this);
  }

  onChangeHandler(evt, key) {
    this.setState({
      [key]: evt.target.value
    });
  }

  onChangeLeasePeriod(e) {
    this.setState({
      lease_period: e.target.value
    });
    // console.log(this.state.lease_period);
    // console.log(e.target.value);
  }

  onChangeVotingChoice(e) {
    this.setState({
      vote_choice: e.target.value
    });
    // console.log(this.state.vote_choice);
  }

  unregister() {
    // account name to use - vinqgnvanvis
    console.log("unregister api is being called.");

    let accountNameSelected = this.state.account_name.toString();
    axios
      .post(`http://dappapi.zero2pi.com/api/v1/withdraw`, {
        account_name: accountNameSelected
      })
      .then(response => {
        console.log(response.data);
      })
      .catch(e => {
        // this.setState({
        //   status: "Status : " + e.response.data.message
        // });
        console.log(e.response.data.message);
      });

    // END
  }

  leaseEos() {
    //     console.log(this.state.lease_period);
    // console.log(this.state.vote_choice);

    console.log("api is being called.");
    // First Api Call to Register the USER

    let leaseAmountSelected = this.state.lease_amount.toString();
    let leasePeriodSelected = this.state.lease_period.toString();
    let voteChoiceSelected = this.state.vote_choice.toString();
    let accountNameSelected = this.state.account_name.toString();

    this.setState({
      isLoading: true
    });

    axios
      .post(`http://dappapi.zero2pi.com/api/v1/register_user`, {
        lease_amount: leaseAmountSelected,
        lease_period: leasePeriodSelected,
        vote_choice: voteChoiceSelected,
        account_name: accountNameSelected
      })
      .then(response => {
        console.log(response);
        console.log(response.data.message);

        this.setState({
          status: "Status : Successfully Registered User!"
        });

        // On Success of first API Call
        // Calling second API
        axios
          .post(`http://dappapi.zero2pi.com/api/v1/lease_transfer`, {
            account_name: accountNameSelected,
            amount: leaseAmountSelected
          })
          .then(response => {
            console.log(response.data);
            this.setState({
              status: "Status : Succesfully Leased EOS"
            });
            // On Success of second API Call
            // Calling THIRD  API
            axios
              .post(`http://dappapi.zero2pi.com/api/v1/match_order`, {
                account_name: accountNameSelected
              })
              .then(response => {
                console.log(response.data);
                console.log("3rd api call successfull");
                this.setState({
                  status: "Status : Order is matched.",
                  isLeased: true,
                  isLoading: false
                });
              })
              .catch(e => {
                // this.setState({
                //   status: "Status : " + e.response.data.message
                // });
                console.log(e.response.data.message);
                this.setState({
                  isLoading: false
                });
              });
          })

          .catch(e => {
            // this.setState({
            //   status: "Status : " + e.response.data.message
            // });
            console.log(e.response.data.message);
            this.setState({
              isLoading: false
            });
          });
      })
      .catch(e => {
        // this.setState({
        //   status: "Status : " + e.response.data.message
        // });
        console.log(e.response.data.message);
        this.setState({
          isLoading: false
        });
      });
  }

  render() {
    // const { coinDetails } = this.props;

    return (
      <section className="leaseeos">
        <h3>Lease EOS</h3>
        <br />
        <div className="form-group">
          <label htmlFor="order-title">
            Enter liquid account name{" "}
            <span className="highlight_text">( Check availability )</span>
          </label>
          <input
            type="text"
            id="order-name"
            name="order-name"
            value={this.state.account_name}
            onChange={evt => this.onChangeHandler(evt, "account_name")}
          />
        </div>

        <div className="form-group">
          <label htmlFor="order-title">Enter Amount To Lease</label>
          <input
            type="text"
            id="order-name"
            name="order-name"
            value={this.state.lease_amount}
            onChange={evt => this.onChangeHandler(evt, "lease_amount")}
          />
        </div>

        <div className="form-group">
          <label htmlFor="order-title">Enter your Voting Choice</label>
          <select
            className="form-control"
            onChange={this.onChangeVotingChoice.bind(this)}
          >
            <option value="leaseconacc1" selected>
              No Vote
            </option>
            <option value="leaseproxy11">Proxy 1</option>
            <option value="leaseproxy22">Proxy 2</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="order-title">Enter Maximum Lockup Period</label>
          <select
            className="form-control"
            onChange={this.onChangeLeasePeriod.bind(this)}
          >
            <option value="30" selected>
              30 days
            </option>
            <option value="60">60 days</option>
            <option value="90">90 days</option>
          </select>
        </div>

        {this.state.isLoading ? (
          <Spinner />
        ) : (
          <button
            className="lease_button"
            disabled={this.state.isLoading}
            onClick={() => this.leaseEos()}
          >
            {/* {this.state.isLoading && <i className="fa fa-refresh fa-spin"></i>} */}
            Lease
          </button>
        )}
        <br />
        <br />
        <h6>{this.state.status}</h6>
        <br />
        <hr />
        <h3>Unregister</h3>
        <br />

        {this.state.isLeased ? (
          <button className="withdraw_button" onClick={() => this.unregister()}>
            Withdraw EOS
          </button>
        ) : (
          <button className="disabled_button">Withdraw EOS</button>
        )}
        <br />
      </section>
    );
  }
}

export default LeaseEos;

// // Backup Lease EOS function below.

// leaseEos() {
//   //     console.log(this.state.lease_period);
//   // console.log(this.state.vote_choice);

//   console.log("api is being called.");
//   // First Api Call to Register the USER

//   let leaseAmountSelected = this.state.lease_amount.toString();
//   let leasePeriodSelected = this.state.lease_period.toString();
//   let voteChoiceSelected = this.state.vote_choice.toString();
//   let accountNameSelected = this.state.account_name.toString();

//   axios
//     .post(`http://dappapi.zero2pi.com/api/v1/register_user`, {
//       lease_amount: leaseAmountSelected,
//       lease_period: leasePeriodSelected,
//       vote_choice: voteChoiceSelected,
//       account_name: accountNameSelected
//     })
//     .then(function(response) {
//       console.log(response);
//       console.log(response.data);

//       // On Success of first API Call
//       // Calling second API
//       axios
//         .post(`http://dappapi.zero2pi.com/api/v1/lease_transfer`, {
//           account_name: accountNameSelected,
//           amount: leaseAmountSelected
//         })
//         .then(function(response) {
//           console.log(response.data);
//           this.setState({
//             stateus: response.data.message
//           });
//           // On Success of second API Call
//           // Calling THIRD  API
//           axios
//             .post(`http://dappapi.zero2pi.com/api/v1/match_order`, {
//               account_name: accountNameSelected
//             })
//             .then(response => {
//               console.log(response.data);
//               console.log("3rd api call successfull");
//               this.setState({
//                 isLeased: true
//               });
//             })
//             .catch(e => {
//               console.error(e);
//             });

//         })
//         .catch(function(error) {
//           console.log(error);
//         });
//     })
//     .catch(function(error) {
//       console.log(error);
//     });
// }
