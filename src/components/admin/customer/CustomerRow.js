import React from "react";
import { useHistory } from "react-router";

const CustomerRow = ({ account }) => {
  const history = useHistory();
  return (
    <div
      onClick={() => history.push(`/customerdetail/${account.data.uid}`)}
      className="grid grid-cols-4 text-center py-1 bg-white border"
    >
      <div className="col-span-2">{account.data.email}</div>
      <div>{account.data.displayName}</div>
      <div>{account.data.type}</div>
    </div>
  );
};

export default CustomerRow;