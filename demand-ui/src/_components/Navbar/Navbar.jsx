import React from "react";
import "../../global.scss";
import { Logo, Hey } from "../../_helpers/Images";

console.log("logog--->", Logo);

export default function Navbar(props) {
  console.log("props--->", props.loggedIn);

  return (
    // <div className="Wrapper">
    //   <div className="Panel">
    //     <div>
    //       <span className="logotxt">Coinbase</span>
    //     </div>
    //     {props.loggedIn ? (
    //       <button
    //         className="btn btn-primary btn-md active"
    //         onClick={props.logout}
    //       >
    //         Logout with Scatter
    //       </button>
    //     ) : (
    //       <button
    //         className="btn btn-primary btn-md active"
    //         onClick={props.login}
    //       >
    //         Login with Scatter
    //       </button>
    //     )}
    //   </div>
    // </div>
    <div>
      <div className="custom-navbar">
        <span>Coinbase</span>
        {props.loggedIn ? (
          <button
            className="btn btn-primary btn-md active"
            onClick={props.logout}
          >
            Logout with Scatter
          </button>
        ) : (
          <button
            className="btn btn-primary btn-md active"
            onClick={props.login}
          >
            Login with Scatter
          </button>
        )}
      </div>
    </div>
  );
}
