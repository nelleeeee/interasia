import React, { useContext } from "react";
import { InitDataContext } from "../../../App";
import CustomerRow from "./CustomerRow";

const CustomerList = () => {
  const state = useContext(InitDataContext);
  const { accounts } = state;
  return (
    <div className="w-full flex justify-center mb-20">
      <div className=" w-11/12 flex-col mt-20">
        <div className="w-full text-center my-4 text-gray-800 text-lg">
          CUSTOMER LIST
        </div>
        <div
          className="grid grid-cols-6  grid-flow-col text-center 
       bg-gray-800 text-gray-100 py-1 rounded-sm text-xs"
        >
          <div className="col-span-2">E-mail</div>
          <div className="col-span-1">Name</div>
          <div className="col-span-1">Nick</div>
          <div className="col-span-1">alias</div>
          <div className="col-span-1">Type</div>
        </div>

        {accounts &&
          accounts.map(account => (
            <CustomerRow key={account.id} account={account} />
          ))}
      </div>
    </div>
  );
};
export default CustomerList;
