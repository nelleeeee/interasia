import React from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

export function ShippingListsHeader({
  handelHiddenAll,
  // handleSelectedUser,
  // users,
}) {
  return (
    <div
      className="grid grid-cols-12 grid-flow-col text-center 
       bg-gray-800 text-gray-100 py-1 rounded-sm text-xs items-center"
    >
      <div className="">Shipping No.</div>
      <div className="">Ship Date</div>
      <div className="">배송지</div>
      <div className="">
        Tracking No.
        <ExpandMoreIcon
          className="h-5 cursor-pointer"
          onClick={() => handelHiddenAll()}
        />
      </div>
      <div className="">
        {/* <select
          onChange={e => handleSelectedUser(e)}
          className="bg-transparent items-center outline-none"
        >
          <option value="Nick Name">Nick Name</option>
          {users.map((user, i) => (
            <option key={i} value={user.data.nickName || user.id}>
              {user.data.nickName || user.id}
            </option>
          ))}
        </select> */}
        Nick Name
      </div>
      <div className="">Type</div>

      <div className="">Country</div>

      <div className="">Sorts</div>

      <div className="">Item Price</div>

      <div className="col-span-2">Shipping Fee</div>
      <div className="">Total Amount</div>
    </div>
  );
}
