import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useTable } from "react-table";

function Table({ columns, data }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data
  });

  return (
    <table className="table table-hover table-responsive" {...getTableProps()}>
      <thead className="thead-dark">
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th scope="col" {...column.getHeaderProps()}>
                {column.render("Header")}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
const getDate = e => {
  Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  const date = new Date();
  const newDate = date.addDays(e.values.lease_period);

  return newDate.toString().slice(0, 24);
};

const handleWithdraw = row => {
  const API = "http://dappapi.zero2pi.com/api/v1/cancelorder";
  let data = {
    order_id: row.values.order_id
  };

  const withdraw = async () => {
    await axios.post(API, data).then(res => console.log("res---->", res));
  };

  return (
    <button onClick={withdraw} className="btn btn-danger">
      Withdraw
    </button>
  );
};

export default function OrdersTable(props) {
  const user = localStorage.getItem("user");
  const table_api = `http://dappapi.zero2pi.com/api/v1/get_orderdet/${user}`;
  const [data, setData] = useState([]);
  const columns = useMemo(() => [
    {
      Header: "Serial Number",
      accessor: "order_id"
    },
    {
      Header: "EOS borrowed",
      accessor: "rent_amount"
    },
    {
      Header: "Account name",
      accessor: "stake_to"
    },
    {
      Header: "Status",
      accessor: "order_stat"
    },
    {
      Header: "Fee",
      accessor: "rent_offer"
    },
    {
      Header: "End time for lease",
      accessor: "lease_period",
      Cell: ({ row }) => getDate(row)
    },
    {
      Header: "Actions",
      accessor: "authorizer",
      Cell: ({ row }) =>
        row.values.order_stat ? (
          handleWithdraw(row)
        ) : (
          <span>Cannot Withdraw</span>
        )
    }
  ]);

  const getTable = async () => {
    return await axios.get(table_api).then(res => {
      setData(res.data.message);
    });
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user !== "") {
      getTable();
    }
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <Table columns={columns} data={data} />
    </div>
  );
}
