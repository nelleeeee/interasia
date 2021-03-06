import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { OrderListInShippingsRow } from "./OrderListInShippingsRow";

export function HiddenRowRow({ li }) {
  return (
    <div className="grid grid-cols-20 text-gray-800 items-center py-1">
      <div className="col-span-9"></div>

      <div
        className="col-span-10 text-left cursor-pointer"
        onClick={() =>
          window.open(
            `https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id=${li}`,
            "_blank"
          )
        }
      >
        {li}
      </div>
    </div>
  );
}

export function HiddenRow({ shipping }) {
  const [orderListInShippings, setOrderListInShippings] = useState([]);
  useEffect(() => {
    db.collection("accounts")
      .doc(shipping.data.customer || shipping.data.userId)
      .collection("shippingsInAccount")
      .doc(shipping.id)
      .collection("orderListInShippings")
      .orderBy("title", "asc")
      .onSnapshot((snapshot) =>
        setOrderListInShippings(
          snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }))
        )
      );
  }, [shipping]);

  return (
    <div
      className="grid-flow-col text-center
    py-2 text-xs bg-white"
    >
      {shipping && shipping?.data?.trackingNumber?.split(",")?.length > 1 && (
        <div className="border-b">
          {shipping?.data?.trackingNumber?.split(",")?.map((li, i) => (
            <HiddenRowRow key={i} li={li} />
          ))}
        </div>
      )}
      {orderListInShippings &&
        orderListInShippings?.map((li, i) => (
          <OrderListInShippingsRow
            li={li}
            i={i}
            shipping={shipping}
            orderListInShippings={orderListInShippings}
          />
        ))}
    </div>
  );
}
