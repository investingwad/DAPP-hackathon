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

  console.log("table---->", rows);
  // Render the UI for your table
  return (
    <table className="table" {...getTableProps()}>
      <thead>
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

export default function OrdersTable(props) {
  console.log("table->", <Table />);

  const table_api = `http://192.168.0.33:8081/api/v1/get_orderdet/${props.username}`;
  console.log("result---->", table_api);
  console.log("props---->", props.username);
  const [expired, setExpired] = useState(false);
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
      Cell: ({ row }) => (
        // console.log("cell--->", row)

        <div>
          <button onClick={props.withdraw} className="btn btn-danger">
            Withdraw
          </button>
        </div>
      )
    }
  ]);

  const getTable = async () => {
    const result = await axios.get(table_api);

    setData(result.data);
  };

  useEffect(() => {
    getTable();
  }, []);

  return (
    <div>
      <Table columns={columns} data={data} />
    </div>
  );
}


