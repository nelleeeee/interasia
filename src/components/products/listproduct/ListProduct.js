import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { InitDataContext, InitDispatchContext } from "../../../App";
import ListProductRow from "./ListProductRow";
const ListProduct = () => {
  const state = useContext(InitDataContext);
  const dispatch = useContext(InitDispatchContext);
  const { products, orders, shippings, user, exchangeRate } = state;

  // 로딩관리
  const [loading, setLoading] = useState("미발송 정보를 불러오는 중입니다.");
  // 헤더 항목
  const headers = [
    "BTN",
    "BARCODE",
    "SKU",
    "COVER",
    "TITLE",
    "PRICE",
    "STOCK",
    "SALE",
    "UNSHIPPED",
    "RELEASE",
    "DEADLINE",
  ];

  useEffect(() => {
    // FIXME:여기다가 미발송 건수 요청하는 함수 넣어서 랜더링 되면
    // 실행해서 디스패치로 스테이트에 넣기
    // 로딩관리

    const callLast = async () => {
      await axios
        .get(
          `https://us-central1-interasiastock.cloudfunctions.net/app/big/callOrdersByStatusId/9`
        )
        .then(r =>
          dispatch({
            type: "UNSHIPPED_PRODUCTS_ID_QTY",
            unShippedProductsIdandQty: r.data,
          })
        )
        .catch(e => console.log(e));

      setLoading("미발송 정보를 불러왔습니다.");
    };
    callLast();
  }, [dispatch]);
  return (
    <div className="flex flex-col w-full">
      <div className="ml-28 mt-32 text-gray-800 text-xl">
        PRODUCT LIST{loading}
      </div>
      <div className="border w-11/12 m-auto mt-4 mb-12">
        <div className="grid grid-cols-36 text-center border-b p-1 bg-gray-100 sticky top-0 text-sm">
          {headers.map((header, index) => (
            <div
              key={index}
              className={
                header === "TITLE"
                  ? "col-span-14"
                  : header === "BARCODE" || header === "SKU"
                  ? "col-span-3"
                  : "col-span-2"
              }
            >
              {header}
            </div>
          ))}
        </div>

        {products.map(product => (
          <ListProductRow
            key={product.id}
            id={product.id}
            sku={product.data.sku}
            thumbNail={product.data.thumbNail}
            title={product.data.title}
            price={product.data.price}
            barcode={product.data.barcode}
            stock={product.data.stock}
            totalSell={product.data.totalSell}
            unShipped={product.data.unShipped}
            relDate={product.data.relDate}
            preOrderDeadline={product.data.preOrderDeadline}
            bigcProductId={product?.data?.bigC?.id}
            orders={orders}
            shippings={shippings}
            user={user}
            exchangeRate={exchangeRate}
          />
        ))}
      </div>
    </div>
  );
};

export default ListProduct;
