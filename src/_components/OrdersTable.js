import React, { useState } from "react";
import axios from "axios";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";

export default function OrdersTable() {
  const [expired, setExpired] = useState(false);

  const data = [ //should return an array
    { eos: "200.0000 EOS", name: "yo" }
    // { name: "aditya" },
    // { status: "active" },
    // { fee: "20.0000 EOS" },
    // { lease_time: "20 days" }
  ];

  return (
    <div>
      <BootstrapTable data={data}>
        <TableHeaderColumn isKey dataField="serialnumber">
          Serial number
        </TableHeaderColumn>
        <TableHeaderColumn dataField="EOSborrowed">
          {" "}
          EOS borrowed
        </TableHeaderColumn>
        <TableHeaderColumn dataField="accountname">
          Account name
        </TableHeaderColumn>
        <TableHeaderColumn dataField="status">Status</TableHeaderColumn>
        <TableHeaderColumn dataField="fee">Fee</TableHeaderColumn>
        <TableHeaderColumn dataField="End time for Lease">
          End time for lease
        </TableHeaderColumn>
      </BootstrapTable>
    </div>
  );
}
