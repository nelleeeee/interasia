import React, { useContext, useEffect, useState } from "react";
import firebase from "firebase";
import { useHistory } from "react-router";
import { InitDataContext } from "../../../App";
import { db } from "../../../firebase";
import OrderDetailRow from "./OrderDetailRow";
import ShippingList from "../shipping/ShippingList";
import useInputs from "../../../hooks/useInput";
import CancelIcon from "@material-ui/icons/Cancel";
import UndoIcon from "@material-ui/icons/Undo";
import LocalAirportIcon from "@material-ui/icons/LocalAirport";
import { useCallback } from "react";

const OrderDetail = ({ match }) => {
  const { id } = match.params;
  const state = useContext(InitDataContext);
  const { orders, user, shippings, exchangeRate, dhlShippingFee } = state;
  const { z } = dhlShippingFee;

  const order = orders.find(order => order.id === id);
  const shipping = shippings.filter(arr => arr.data.orderId === id);
  const history = useHistory();

  const [form, onChange] = useInputs({
    orderState: order?.data.orderState,
    paymentMethod: order?.data.paymentMethod,
    shippingType: order?.data.shippingType,
    recipientEmail: order?.data.recipientEmail,
    recipientPhoneNumber: order?.data.recipientPhoneNumber,
    street: order?.data.street,
    city: order?.data.city,
    states: order?.data.states,
    country: order?.data.country,
    zipcode: order?.data.zipcode,
    recipient: order?.data.recipient,
    shippingMessage: order?.data.shippingMessage,
    orderNumberSelect: "",
    memo: order?.data.memo,
  });

  const {
    orderState,
    paymentMethod,
    shippingType,
    recipientEmail,
    recipientPhoneNumber,
    street,
    city,
    states,
    country,
    zipcode,
    recipient,
    shippingMessage,
    orderNumberSelect,
    memo,
  } = form;

  const saveDetails = () => {
    db.collection("orders").doc("b2b").collection("b2borders").doc(id).update({
      orderState,
      paymentMethod,
      shippingType,
      recipientEmail,
      recipientPhoneNumber,
      street,
      city,
      states,
      country,
      zipcode,
      recipient,
      shippingMessage,
      memo,
    });
    alert("저장 완료");
  };

  const [checkedInputs, setCheckedInputs] = useState([]);

  const changeHandler = (checked, id) => {
    if (checked) {
      setCheckedInputs([...checkedInputs, id]);
    } else {
      // 체크 해제
      setCheckedInputs(checkedInputs.filter(el => el !== id));
    }
  };

  // 배송국가 전체 for select option
  const countries = [].concat(
    ...z
      ?.map(zo => Object.values(zo).map(co => co.country))
      .map(doc => [].concat(...doc))
  );
  // 전체상품

  // 운임, 총무게
  const totalWeight =
    order.data.list &&
    order.data.list
      .filter(
        list =>
          list.canceled === false &&
          list.moved === false &&
          list.shipped === false
      )
      .reduce((i, c) => {
        return i + c.weight * c.quan;
      }, 0) / 1000;
  // 체크된 상품 총무게
  const checkedWeight =
    order.data.list
      .filter(item => checkedInputs.includes(item.childOrderNumber))
      .filter(
        list =>
          list.canceled === false &&
          list.moved === false &&
          list.shipped === false
      )
      .reduce((i, c) => {
        return i + c.weight * c.quan;
      }, 0) / 1000;

  // 몇번재 구간에 걸리는지 num 에서 1빼야함
  let num = 1;
  for (let i = 1; i < 31; i++) {
    let j = i * 0.5;
    if (j > totalWeight) {
      break;
    }
    num++;
  }

  let num2 = 1;
  for (let i = 1; i < 31; i++) {
    let j = i * 0.5;
    if (j > checkedWeight) {
      break;
    }
    num2++;
  }
  // 어느나라에 걸리는지
  const zone =
    z &&
    country.length > 0 &&
    Object.keys(
      z.find(doc =>
        Object.values(doc).find(asd => asd.country.includes(country))
      )
    );

  // 배송비 가격
  const [preFee, setPreFee] = useState(order?.data.shippingFee);
  const handleFee = e => {
    setPreFee(Number(e.target.value));
  };

  // 재계산 배송비
  const fee =
    z && country.length > 0 && totalWeight < 30 && totalWeight > 0
      ? Number(
          Object.values(z.find(doc => Object.keys(doc)[0] === zone[0]))[0]
            .fee[num - 1].split(",")
            .join("")
        ) / exchangeRate[order.data.currency]
      : totalWeight === 0
      ? 0
      : (totalWeight * order.data.shippingRate[shippingType]) /
        exchangeRate[order.data.currency];

  // 체크된 상품 배송비
  const [checkedItemsFee, setCheckedItemsFee] = useState("");
  const handleCheckedItemFee = e => {
    setCheckedItemsFee(Number(e.target.value));
  };

  // 상품 total price
  const [preTotalPrice, setPreTotalPrice] = useState(order?.data.totalPrice);
  const handlePreTotalPrice = e => {
    setPreTotalPrice(Number(e.target.value));
  };

  // 재계산 totalPrice
  const totalPrice = order.data.list
    .filter(
      list =>
        list.canceled === false &&
        list.moved === false &&
        list.shipped === false
    )
    .reduce((i, c) => {
      return i + c.price * c.quan;
    }, 0);

  // 체크된 상품 가격
  const [checkedItemPrice, setCheckedItemPrice] = useState("");
  const handleCheckedItemPrice = e => {
    setCheckedItemPrice(Number(e.target.value));
  };

  // amount price
  const [preAmountPrice, setPreAmountPrice] = useState(order?.data.amountPrice);
  const handlePreAmountPrice = e => {
    setPreAmountPrice(Number(e.target.value));
  };

  // 재계산 amount
  const amountPrice = totalPrice + fee;
  // 체크된 아이템 총액
  const checkItemAmountPrice = checkedItemPrice + checkedItemsFee;
  // 재계산 버튼
  const saveRecal = () => {
    setPreTotalPrice(totalPrice);
    setPreFee(fee);
    setPreAmountPrice(amountPrice);
    db.collection("orders")
      .doc("b2b")
      .collection("b2borders")
      .doc(id)
      .update({
        shippingType,
        country,
        shippingFee: Number(fee.toFixed(2)),
        amountPrice: Number(amountPrice.toFixed(2)),
        totalPrice: Number(totalPrice.toFixed(2)),
      });
    alert("재계산 완료");
  };
  // 직접 입력 수정
  const savePre = () => {
    db.collection("orders")
      .doc("b2b")
      .collection("b2borders")
      .doc(id)
      .update({
        shippingType,
        country,
        shippingFee: Number(preFee.toFixed(2)),
        amountPrice: Number(preAmountPrice.toFixed(2)),
        totalPrice: Number(preTotalPrice.toFixed(2)),
      });
    alert("직접 수정 완료");
  };

  // 주문간 상품 이동
  const moveList = async e => {
    e.preventDefault();
    if (orderNumberSelect.length <= 0) {
      return alert("Please select the correct order number");
    }

    await db
      .collection("orders")
      .doc("b2b")
      .collection("b2borders")
      .doc(orders.find(arr => arr.data.orderNumber === orderNumberSelect).id)
      .update({
        list: [
          ...checkedInputs.map(doc =>
            order.data.list.find(arr => arr.childOrderNumber === doc)
          ),
          ...orders.find(arr => arr.data.orderNumber === orderNumberSelect).data
            .list,
        ],
      });
    // 기존엔 이동된 상품들은 기존 주문에서 지움 -> moved true로 바꿔서 취소선 그어지고 체크박스 못쓰게
    await db
      .collection("orders")
      .doc("b2b")
      .collection("b2borders")
      .doc(id)
      .update({
        list: [
          ...order.data.list.filter(
            item => !checkedInputs.includes(item.childOrderNumber)
          ),
          ...checkedInputs
            .map(doc =>
              order.data.list.find(arr => arr.childOrderNumber === doc)
            )
            .map(doc2 => {
              doc2.moveTo = orderNumberSelect;
              doc2.moved = true;
              return doc2;
            }),
        ],
      });

    await setCheckedInputs([]);
    await alert("이동되었습니다");
    history.replace(
      `/orderdetail/${
        orders.find(arr => arr.data.orderNumber === orderNumberSelect).id
      }`
    );
    // await reset();
  };
  // 부분 최소
  const makeCancel = async () => {
    await db
      .collection("orders")
      .doc("b2b")
      .collection("b2borders")
      .doc(id)
      .update({
        list: [
          ...order.data.list.filter(
            item => !checkedInputs.includes(item.childOrderNumber)
          ),
          ...checkedInputs
            .map(doc =>
              order.data.list.find(arr => arr.childOrderNumber === doc)
            )
            .map(doc2 => {
              doc2.canceled = true;
              return doc2;
            }),
        ],
      });
    // await reset();
    await setCheckedInputs([]);
    await alert("취소되었습니다");
  };
  // TODO:  쉬핑 넘버 없이 카운츠로 넘버만들어서 저장-> 되면 오더에도 적용
  const makeShipping = async e => {
    e.preventDefault();
    await db
      .collection("shipping")
      .doc()
      .set({
        orderId: id,
        orderNumber: order.data.orderNumber,
        shippingNumber: order.data.orderNumber,
        shippedDate: new Date(),
        shippingType,
        customer: order.data.customer,
        orderCreatedAt: order.data.createdAt,
        recipientEmail,
        recipientPhoneNumber,
        street,
        city,
        states,
        country,
        zipcode,
        recipient,
        shippingMessage,
        shippingRate: order.data.shippingRate,
        list: order.data.list.filter(item =>
          checkedInputs.includes(item.childOrderNumber)
        ),
        checkedItemsFee,
        checkedItemPrice,
        checkItemAmountPrice,
      });
    await db
      .collection("accounts")
      .doc(user.email)
      .update({
        credit: user.credit - checkItemAmountPrice,
        creditDetails: firebase.firestore.FieldValue.arrayUnion({
          type: "makeOrder",
          currency: user.currency,
          amount: Number(checkItemAmountPrice),
          date: new Date(),
          totalAmount: Number(user.credit) - Number(checkItemAmountPrice),
        }),
      });
    await db
      .collection("orders")
      .doc("b2b")
      .collection("b2borders")
      .doc(id)
      .update({
        list: [
          ...order.data.list.filter(
            item => !checkedInputs.includes(item.childOrderNumber)
          ),
          ...checkedInputs
            .map(doc =>
              order.data.list.find(arr => arr.childOrderNumber === doc)
            )
            .map(doc2 => {
              doc2.shipped = true;
              return doc2;
            }),
        ],
      });

    await setCheckedInputs([]);
  };

  const ItemPrice = useCallback(async () => {
    setCheckedItemPrice(() =>
      Number(
        order.data.list
          .filter(item => checkedInputs.includes(item.childOrderNumber))
          .filter(
            list =>
              list.canceled === false &&
              list.moved === false &&
              list.shipped === false
          )
          .reduce((i, c) => {
            return i + c.price * c.quan;
          }, 0)
      )
    );
  }, [checkedInputs, order.data.list]);

  useEffect(() => {
    ItemPrice();

    setCheckedItemsFee(() =>
      z && country.length > 0 && checkedWeight < 30 && checkedWeight > 0
        ? Number(
            Object.values(z.find(doc => Object.keys(doc)[0] === zone[0]))[0]
              .fee[num2 - 1].split(",")
              .join("")
          ) / exchangeRate[order.data.currency]
        : checkedWeight === 0
        ? 0
        : (checkedWeight * order.data.shippingRate[shippingType]) /
          exchangeRate[order.data.currency]
    );
  }, [
    z,
    country.length,
    checkedWeight,
    zone,
    num2,
    order.data.currency,
    exchangeRate,
    order.data.shippingRate,
    shippingType,
    ItemPrice,
  ]);
  return (
    // dep-1
    <div className="w-full h-full flex justify-center">
      {/* dep-2 */}
      <div className="w-11/12 flex-col mt-20">
        {/* dep-3-1 */}
        <div
          className="text-center text-md bg-gray-800 
        rounded-sm text-gray-100 mb-5 w-full"
        >
          Order Details{" "}
        </div>

        {user && order && (
          <>
            <div className="flex flex-row justify-evenly">
              {/* 주문내용 확인 */}
              <div
                className="flex-col mb-10 flex space-y-2 text-sm w-5/12
                "
              >
                <div className="grid grid-cols-2 items-center h-8">
                  <div className="text-right pr-5">No.</div>
                  <div>{order.data.orderNumber}</div>
                </div>
                <div className="grid grid-cols-2 items-center h-8">
                  <div className="text-right pr-5">Status</div>
                  <select
                    name="orderState"
                    value={orderState}
                    onChange={onChange}
                    className="border p-1"
                  >
                    <option value="makeOrder">주문서작성중</option>
                    <option value="confirmOrder">주문완료</option>
                    <option value="packaging">포장중</option>
                    <option value="shipping">배송중</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 items-center h-8">
                  <div className="text-right pr-5">Email</div>
                  <div>{order.data.customer}</div>
                </div>
                <div className="grid grid-cols-2 items-center h-8">
                  <div className="text-right pr-5">Date</div>
                  {new Date(order.data.createdAt.toDate()).toLocaleString()}
                </div>
                <div className="grid grid-cols-2 items-center h-8">
                  <div className="text-right pr-5">PaymentMethod</div>

                  <select
                    name="paymentMethod"
                    value={paymentMethod}
                    onChange={onChange}
                    className="border p-1"
                  >
                    <option value="credit">transfer(credit)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 items-center h-8">
                  <div className="text-right pr-5">ShippingType</div>
                  <select
                    name="shippingType"
                    value={shippingType}
                    onChange={onChange}
                    className="border p-1"
                  >
                    <option value="dhl">DHL</option>
                    <option value="ems">EMS</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 h-8 items-center">
                  <div className="text-right pr-5">Phone Number</div>
                  {user?.phoneNumber}
                </div>
                <div className="grid grid-cols-2 h-30">
                  <div className="text-right pr-5">Staff Memo</div>
                  <textarea
                    rows="5"
                    cols="19"
                    name="memo"
                    value={memo}
                    onChange={onChange}
                    className="border p-1 pl-2"
                  />{" "}
                </div>
                {/* 할인율 */}
                <div className="grid grid-cols-1 ">
                  <div className="text-center my-1 font-semibold">DC Rates</div>
                  <div
                    className="grid grid-cols-6 bg-gray-600 text-center 
                  text-xs text-gray-100 rounded-sm px-1"
                  >
                    {Object.keys(order?.data.dcRates).map((doc, index) => (
                      <div key={index}>{doc.toUpperCase()}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-6 text-center border-b px-1 border-l border-r text-sm">
                    {Object.values(order?.data.dcRates).map((doc, index) => (
                      <div key={index}>{doc * 100} %</div>
                    ))}
                  </div>
                  <div className="text-center my-1 font-semibold mt-3">
                    Shipping Fee
                  </div>
                  <div
                    className="grid grid-cols-6 bg-gray-600 text-center 
                  text-xs text-gray-100 rounded-sm px-1"
                  >
                    {" "}
                    {Object.keys(order?.data.shippingRate).map((doc, index) => (
                      <div key={index}>{doc.toUpperCase()}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-6 text-center border-b px-1 border-l border-r text-sm">
                    {Object.values(order?.data.shippingRate).map(
                      (doc, index) => (
                        <div key={index}>{doc} 원</div>
                      )
                    )}
                  </div>
                </div>
              </div>
              {/* 수령인 파트 */}

              <div
                className="flex-col mb-10 flex space-y-2 text-sm 
               w-6/12 items-center"
              >
                <div className="grid grid-cols-2 w-3/4 items-center">
                  <div className="text-right pr-5">Email</div>
                  <input
                    name="recipientEmail"
                    value={recipientEmail}
                    onChange={onChange}
                    className="border p-1 pl-2"
                  />{" "}
                </div>
                <div className="grid grid-cols-2 w-3/4 items-center">
                  <div className="text-right pr-5">PhoneNumber</div>
                  <input
                    name="recipientPhoneNumber"
                    value={recipientPhoneNumber}
                    onChange={onChange}
                    className="border p-1 pl-2"
                  />{" "}
                </div>
                <div className="grid grid-cols-2 w-3/4 items-center">
                  <div className="text-right pr-5">Street</div>
                  <input
                    name="street"
                    value={street}
                    onChange={onChange}
                    className="border p-1 pl-2"
                  />{" "}
                </div>
                <div className="grid grid-cols-2 w-3/4 items-center">
                  <div className="text-right pr-5">City</div>
                  <input
                    name="city"
                    value={city}
                    onChange={onChange}
                    className="border p-1 pl-2"
                  />{" "}
                </div>
                <div className="grid grid-cols-2 w-3/4 items-center">
                  <div className="text-right pr-5">State</div>
                  <input
                    name="states"
                    value={states}
                    onChange={onChange}
                    className="border p-1 pl-2"
                  />{" "}
                </div>
                <div className="grid grid-cols-2 w-3/4 items-center">
                  <div className="text-right pr-5">Country</div>
                  <select
                    name="country"
                    value={country}
                    onChange={onChange}
                    className="border p-1 pl-2"
                  >
                    {countries.sort().map((co, i) => (
                      <option key={i} value={co}>
                        {co}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 w-3/4 items-center">
                  <div className="text-right pr-5">Zipcode</div>
                  <input
                    name="zipcode"
                    value={zipcode}
                    onChange={onChange}
                    className="border p-1 pl-2"
                  />{" "}
                </div>
                <div className="grid grid-cols-2 w-3/4 items-center">
                  <div className="text-right pr-5">Recipient</div>
                  <input
                    name="recipient"
                    value={recipient}
                    onChange={onChange}
                    className="border p-1 pl-2"
                  />{" "}
                </div>
                <div className="grid grid-cols-2 w-3/4 items-center">
                  <div className="text-right pr-5">Shipping Message</div>
                  <textarea
                    rows="5"
                    cols="19"
                    name="shippingMessage"
                    value={shippingMessage}
                    onChange={onChange}
                    className="border p-1 pl-2"
                  />{" "}
                </div>
                <button
                  onClick={saveDetails}
                  className="bg-gray-800 rounded text-gray-200 w-1/3 items-center py-2"
                >
                  FIX
                </button>
              </div>
            </div>
            {/* // dep-3-2 */}
            <div className="w-full text-center mb-1 font-semibold">
              Ordered Items
            </div>
            <div className="flex flex-col items-end text-xs mb-3 rounded-md">
              <div className="bg-red-200 w-44 pl-3 rounded-md mb-1">
                &nbsp;&nbsp;&nbsp;&nbsp;: Items not yet released{" "}
              </div>
              <div className="bg-gray-300 w-44 pl-3 rounded-md  mb-1">
                <CancelIcon style={{ fontSize: "small" }} />: canceled item
              </div>
              <div className="bg-gray-300 w-44 pl-3 rounded-md  mb-1">
                <UndoIcon style={{ fontSize: "small" }} />: moved item
              </div>
              <div className="bg-blue-300 w-44 pl-3 rounded-md  mb-1">
                <LocalAirportIcon style={{ fontSize: "small" }} />: shipped item
              </div>
            </div>
            {/* dep-3-3 */}
            <div
              className="grid grid-cols-28 text-center bg-gray-800
            text-sm font-semibold rounded-sm text-gray-100"
            >
              <div></div>
              <div>No.</div>
              <div className="col-span-3">DATE</div>
              <div className="col-span-3">RELEASE</div>
              <div className="col-span-12">TITLE</div>
              <div className="col-span-2">PRICE</div>
              <div className="col-span-2">EA</div>
              <div className="col-span-2">WEIGHT</div>

              <div className="col-span-2">AMOUNT</div>
            </div>
            {/* dep-3-4 */}
            {order.data.list
              .filter(list => new Date(list.relDate.toDate()) < new Date())
              .sort()
              .map((doc, i) => (
                <OrderDetailRow
                  key={i}
                  id={doc.childOrderNumber}
                  title={doc.title}
                  createdAt={new Date(
                    order.data.createdAt.toDate()
                  ).toLocaleDateString()}
                  relDate={doc.relDate}
                  price={doc.price}
                  quan={doc.quan}
                  weight={doc.weight}
                  totalWeight={doc.weight * doc.quan}
                  dcRate={doc.dcRate}
                  changeHandler={changeHandler}
                  checkedInputs={checkedInputs}
                  order={order}
                  aList={doc}
                />
              ))}
            {order.data.list
              .filter(list => new Date(list.relDate.toDate()) >= new Date())
              .sort()
              .map((doc, i) => (
                <OrderDetailRow
                  key={i}
                  id={doc.childOrderNumber}
                  title={doc.title}
                  createdAt={new Date(
                    order.data.createdAt.toDate()
                  ).toLocaleDateString()}
                  relDate={doc.relDate}
                  price={doc.price}
                  quan={doc.quan}
                  weight={doc.weight}
                  totalWeight={doc.weight * doc.quan}
                  dcRate={doc.dcRate}
                  changeHandler={changeHandler}
                  checkedInputs={checkedInputs}
                  order={order}
                  aList={doc}
                />
              ))}

            {/* dep-3-5 */}
            <div className="text-center items-center justify-between flex flex-row mt-6 text-sm">
              <div>
                <button
                  onClick={makeCancel}
                  className="bg-gray-800 text-gray-200 px-2 py-1 ml-5 rounded-sm"
                >
                  CANCEL{" "}
                </button>
              </div>
              <div>
                <select
                  name="orderNumberSelect"
                  value={orderNumberSelect}
                  onChange={onChange}
                  className="p-1 border"
                >
                  {/* 해당 주문자의 미발송 주문 가져와서 이동 */}
                  <option value="">NO.</option>
                  {orders
                    .filter(
                      doc =>
                        doc.data.customer === order.data.customer &&
                        doc.data.orderState === "confirmOrder"
                    )
                    .slice(1)
                    .map((doc, index) => (
                      <option key={index} value={doc.data.orderNumber}>
                        {doc.data.orderNumber}
                      </option>
                    ))}
                </select>
                <button
                  onClick={moveList}
                  className="bg-gray-800 text-gray-200 px-2 py-1 ml-1 rounded-sm"
                >
                  MOVE
                </button>
              </div>
            </div>

            {/* dep-3-6 */}

            <div className="flex flex-row justify-between">
              {/* ship 하는(체크됨) 상품들 가격들 */}
              <div className="text-right flex flex-col items-end mt-6 text-lg">
                <div className="grid grid-cols-2 mb-3 items-center">
                  <div>PRICE</div>
                  <div className="flex flex-row items-center justify-end w-64">
                    <div
                      className="border flex flex-row bg-white w-2/3
                   items-center justify-end text-sm p-1"
                    >
                      <input
                        type="number"
                        value={checkedItemPrice}
                        onChange={handleCheckedItemPrice}
                        className="w-full text-center outline-none text-sm"
                      />
                      {order?.data.currency}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 mb-3 items-center">
                  <div>SHIPPING FEE</div>
                  <div className="flex flex-row items-center justify-end w-64">
                    <div
                      className="border flex flex-row bg-white w-2/3
                   items-center justify-end text-sm p-1"
                    >
                      <input
                        type="number"
                        value={checkedItemsFee}
                        onChange={handleCheckedItemFee}
                        className="w-full text-center outline-none text-sm"
                      />
                      {order?.data.currency}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 w-96 ">
                  <div>AMOUNT</div>
                  <div className="flex flex-row items-center justify-end">
                    <div>
                      {checkItemAmountPrice?.toLocaleString("ko-KR")}{" "}
                      {order?.data.currency}
                    </div>
                  </div>
                </div>
                <button
                  onClick={makeShipping}
                  className="bg-gray-800 text-gray-200 px-2 
                 text-sm p-1 mt-3 rounded-sm"
                >
                  SHIP
                </button>
                {/* 남아있는 상품 가격 */}
              </div>
              <div className="text-right flex flex-col items-end mt-6 text-lg">
                <div className="grid grid-cols-2 mb-3 items-center">
                  <div>PRICE</div>
                  <div className="flex flex-row items-center justify-end w-64">
                    <div
                      className="border flex flex-row bg-white
                   items-center justify-end text-sm p-1 w-2/3"
                    >
                      <input
                        type="number"
                        value={preTotalPrice}
                        onChange={handlePreTotalPrice}
                        className="w-full text-center outline-none text-sm"
                      />
                      {order?.data.currency}
                    </div>
                    <div className="text-xs">
                      ({totalPrice.toLocaleString("ko-KR")}{" "}
                      {order?.data.currency})
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 mb-3 items-center">
                  <div>SHIPPING FEE</div>
                  <div className="flex flex-row items-center justify-end w-64">
                    <div
                      className="border flex flex-row bg-white
                   items-center justify-end text-sm p-1 w-2/3"
                    >
                      <input
                        type="number"
                        value={preFee}
                        onChange={handleFee}
                        className="w-full text-center outline-none text-sm"
                      />
                      {order?.data.currency}
                    </div>
                    <div className="text-xs">
                      ({fee.toLocaleString("ko-KR")} {order?.data.currency})
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 mb-3 items-center">
                  <div>AMOUNT</div>
                  <div className="flex flex-row items-center justify-end w-64">
                    <div
                      className="border flex flex-row bg-white
                   items-center justify-end text-sm p-1 w-2/3"
                    >
                      <input
                        type="number"
                        value={preAmountPrice}
                        onChange={handlePreAmountPrice}
                        className="w-full text-center outline-none text-sm"
                      />
                      {order?.data.currency}
                    </div>
                    <div className="text-xs">
                      ({amountPrice.toLocaleString("ko-KR")}{" "}
                      {order?.data.currency})
                    </div>
                  </div>
                </div>
                <div className="flex flex-row">
                  <button
                    onClick={savePre}
                    className="cursor-pointer bg-gray-800 p-1 px-2 rounded-sm
                     text-gray-200 text-sm mr-10 mt-3"
                  >
                    수정하기
                  </button>{" "}
                  <button
                    onClick={saveRecal}
                    className="cursor-pointer bg-gray-800 p-1 px-2 rounded-sm
                     text-gray-200 text-sm mt-3"
                  >
                    재계산
                  </button>{" "}
                </div>
              </div>
            </div>

            <ShippingList shipping={shipping} from="detail" />
          </>
        )}

        {/*  */}
      </div>
    </div>
  );
};

export default OrderDetail;
