import React from "react";
import axios from "axios";

export default function OrderTable(props) {
  const getTable = async () => {
    const result = await axios
      .get(process.env.REACT_APP_TABLE_API)
      .then(res => {
        console.log("response---->", res);
      });

    console.log("res---->", result);
  };
  return <div>React Table</div>;
}
