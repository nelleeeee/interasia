import React, { useContext } from "react";
import { InitDataContext } from "../../../App";
import ShippingListRow from "./ShippingListRow";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const ShippingList = ({ shipping, from }) => {
  const state = useContext(InitDataContext);
  const { shippings } = state;
  return (
    <div className="w-full flex justify-center mb-20">
      <div
        className={`${
          from === "detail" || from === "myorder" ? "w-full" : "w-11/12"
        } flex-col mt-20`}
      >
        <div
          className="w-full text-center my-4 
        text-gray-800 font-semibold"
        >
          Shipped Items{" "}
        </div>
        <div
          className="grid grid-cols-28  grid-flow-col text-center 
           bg-gray-800 text-gray-100 py-1 rounded-sm text-xs"
        >
          <div className="col-span-3">Shipping No.</div>
          <div className="col-span-3">Ship Date</div>
          <div className="col-span-3">Order No.</div>
          <div className="col-span-3">Order Date</div>
          <div className="col-span-2">Tracking No.</div>
          <div>
            <ExpandMoreIcon
              style={{ color: "white", marginRight: "10px" }}
              className="cursor-pointer"
            />
          </div>
          <div className="col-span-3">Email</div>
          <div>Company</div>
          <div className="col-span-2">Country</div>
          <div className="col-span-1">Sorts</div>
          <div className="col-span-1">EA</div>
          {from !== "myorder" && <div className="col-span-1">Weight</div>}
          <div className="col-span-2">Fee</div>
          <div className="col-span-2">Amount</div>
        </div>
        <div>
          {from === "detail" && shipping
            ? shipping.map(ship => (
                <ShippingListRow
                  key={ship.id}
                  id={shipping.id}
                  shipping={ship}
                />
              ))
            : from === "myorder" && shipping
            ? shipping.map(ship => (
                <ShippingListRow
                  key={ship.id}
                  id={shipping.id}
                  shipping={ship}
                  from="myorder"
                />
              ))
            : !from && shippings
            ? shippings.map(shipping => (
                <ShippingListRow
                  key={shipping.id}
                  id={shipping.id}
                  shipping={shipping}
                />
              ))
            : ""}
        </div>
      </div>
      {/* 디테일 페이지 만들어서 인보이스 발행기능, 수량 수정가능하게, 목록 삭제도 가능하게 삭제나 수정했을때 기존인보이스에 취소선? 주문에 list를 orderlist 랑 confirmlist 로 분화? */}
    </div>
  );
};

export default ShippingList;
