import React, { useContext, useState } from "react";
import firebase from "firebase";
import { InitDataContext } from "../../../App";
import { db } from "../../../firebase";
import CreditDetails from "./CreditDetails";
import Modal from "../../modal/Modal";
import useInputs from "../../../hooks/useInput";

const CustomerDetail = ({ match }) => {
  const { uid } = match.params;
  const state = useContext(InitDataContext);
  const { accounts, dhlShippingFee } = state;
  const { z } = dhlShippingFee;

  const user = accounts.find(account => account.data.uid === uid);
  const inCharges = accounts.filter(account => account.data.type === "admin");
  const { creditDetails } = user.data;
  const [modalOpen, setModalOpen] = useState(false);

  const countries = [].concat(
    ...z
      ?.map(zo => Object.values(zo).map(co => co.country))
      .map(doc => [].concat(...doc))
  );
  const openModal = () => {
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
  };

  const [form, onChange, reset, credit_reset] = useInputs({
    type: user?.data.type,
    recipientEmail: user?.data.recipientEmail,
    recipientPhoneNumber: user?.data.recipientPhoneNumber,
    street: user?.data.street,
    city: user?.data.city,
    states: user?.data.states,
    country: user?.data.country,
    zipcode: user?.data.zipcode,
    recipient: user?.data.recipient,
    shippingMessage: user?.data.shippingMessage,
    taxId: user.data.taxId || "",
    companyName: user.data.companyName || "",
    // 담당자
    inCharge: user?.data.inCharge,
    // 정률법
    cd: user?.data.dcRates.cd * 100,
    dvdBlueRay: user?.data.dcRates.dvdBlueRay * 100,
    goods: user?.data.dcRates.goods * 100,
    photoBook: user?.data.dcRates.photoBook * 100,
    officialStore: user?.data.dcRates.officialStore * 100,
    beauty: user?.data.dcRates.beauty * 100,
    specialOrder: 0,
    // 정액법
    cdA: user?.data?.dcAmount?.cdA,
    dvdBlueRayA: user?.data?.dcAmount?.dvdBlueRayA,
    goodsA: user?.data?.dcAmount?.goodsA,
    photoBookA: user?.data?.dcAmount?.photoBookA,
    officialStoreA: user?.data?.dcAmount?.officialStoreA,
    beautyA: user?.data?.dcAmount?.beautyA,
    specialOrderA: 0,
    // 추후 기입
    dhl: user?.data.shippingRate.dhl,
    nickName: user?.data.nickName,
    memo: user?.data.memo,
    // 크레딧
    handleCredit: "",
    creditType: "Store-Credit",
    // 커런시
    currency: user?.data.currency,
    // alias
    alias: user?.data.alias,
  });

  const {
    type,
    recipientEmail,
    recipientPhoneNumber,
    street,
    city,
    states,
    country,
    zipcode,
    recipient,
    shippingMessage,
    inCharge,
    cd,
    dvdBlueRay,
    goods,
    photoBook,
    officialStore,
    beauty,
    cdA,
    dvdBlueRayA,
    goodsA,
    photoBookA,
    officialStoreA,
    beautyA,
    specialOrder,
    specialOrderA,
    dhl,
    nickName,
    memo,
    handleCredit,
    creditType,
    currency,
    alias,
    taxId,
    companyName,
  } = form;

  const dcValues = {
    cd,
    dvdBlueRay,
    goods,
    photoBook,
    officialStore,
    beauty,
    specialOrder,
  };
  const dcAValues = {
    beautyA,
    cdA,
    dvdBlueRayA,
    goodsA,
    officialStoreA,
    photoBookA,
    specialOrderA,
  };
  const shippingRate = { dhl };

  const saveDetails = () => {
    db.collection("accounts")
      .doc(user.id)
      .update({
        recipientEmail,
        recipientPhoneNumber,
        street,
        city,
        states,
        country,
        zipcode,
        recipient,
        shippingMessage,
        dcRates: {
          cd: Number(cd) / 100,
          dvdBlueRay: Number(dvdBlueRay) / 100,
          photoBook: Number(goods) / 100,
          goods: Number(photoBook) / 100,
          officialStore: Number(officialStore) / 100,
          beauty: Number(beauty) / 100,
          specialOrder: Number(specialOrder) / 100,
        },
        dcAmount: {
          cdA: Number(cdA),
          dvdBlueRayA: Number(dvdBlueRayA),
          goodsA: Number(goodsA),
          photoBookA: Number(photoBookA),
          officialStoreA: Number(officialStoreA),
          beautyA: Number(beautyA),
          specialOrderA: Number(specialOrderA),
        },
        shippingRate: { dhl },
        nickName,
        inCharge,
        memo,
        type,
        currency,
        alias,
        taxId,
        companyName,
      });
    alert("수정 완료");
  };

  const saveCredit = () => {
    db.collection("accounts")
      .doc(user.id)
      .update({
        credit: Number(user.data.credit) + Number(handleCredit),
        creditDetails: firebase.firestore.FieldValue.arrayUnion({
          type: creditType,
          amount: Number(handleCredit),
          currency: user.data.currency,
          date: new Date(),
          totalAmount: Number(user.data.credit) + Number(handleCredit),
        }),
      });
    credit_reset();
  };

  return (
    <div className="w-full h-full flex justify-center">
      <div className="w-11/12 flex-col mt-20 flex items-center">
        <div
          className="text-center text-md bg-gray-800 
        rounded-sm text-gray-100 mb-5 w-full"
        >
          USER DETAILS{" "}
        </div>
        {type === "none" ||
        inCharge.length < 1 ||
        nickName.length < 1 ||
        shippingRate.dhl < 1 ? (
          <div className="flex flex-col items-end text-xs mb-3 rounded-md">
            <div className="bg-red-100 w-auto px-2 py-1 rounded-sm mb-1">
              Permission, In Charge, Nick name, 배송요율을 설정해주세요
            </div>
          </div>
        ) : (
          ""
        )}

        <div className="flex flex-row justify-evenly">
          {/* 주문내용 확인 */}
          <div className="flex-col flex space-y-2 w-1/2">
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Email</div>
              <div>{user.id}</div>
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Permission</div>
              <select
                name="type"
                className={`${type === "none" ? "bg-red-100" : ""} border p-1`}
                value={type}
                onChange={onChange}
              >
                <option value="">권한선택</option>
                <option value="none">none</option>
                <option value="customer">customer</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Name</div>
              <div>{user.data.displayName}</div>
            </div>

            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Number</div>
              {user.data.phoneNumber}
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Member since</div>
              {user?.data?.createdAt &&
                new Date(user?.data?.createdAt.toDate()).toLocaleString()}
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">In Charge</div>
              <select
                name="inCharge"
                className={`${
                  inCharge.length < 1 ? "bg-red-100" : ""
                } border p-1`}
                value={inCharge}
                onChange={onChange}
              >
                <option>담당자선택</option>
                {inCharges &&
                  inCharges.map((inCharge, index) => (
                    <option key={index} value={inCharge.id}>
                      {inCharge.id}
                    </option>
                  ))}
              </select>
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Currency</div>
              <select
                name="currency"
                value={currency}
                onChange={onChange}
                className="border p-1"
              >
                <option value="KRW">KRW</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="SGD">SGD</option>
                <option value="JPY">JPY</option>
                <option value="CNY">CNY</option>
              </select>
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Nick name</div>
              <input
                name="nickName"
                value={nickName}
                onChange={onChange}
                className={`${
                  nickName.length < 1 ? "bg-red-100" : ""
                } border p-1`}
              />{" "}
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Alias</div>
              <input
                name="alias"
                value={alias}
                onChange={onChange}
                className="border p-1"
              />{" "}
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Memo About Customer</div>
              <textarea
                name="memo"
                cols="40"
                rows="5"
                value={memo}
                onChange={onChange}
                className="border p-1"
              />{" "}
            </div>

            {/* 할인율 */}
            <div className="grid grid-cols-1">
              <div className="text-center my-1 font-semibold">
                DC Rate {`[ % ]`}
              </div>
              <div
                className={`grid grid-cols-${
                  Object.keys(user.data.dcRates).length
                } border mb-10`}
              >
                {Object.keys(user.data.dcRates)
                  .sort()
                  .map((doc, index) => (
                    <div key={index} className="grid grid-cols-1  text-center">
                      <div className="text-gray-100 bg-gray-600">{doc}</div>
                      <input
                        type="number"
                        name={doc}
                        value={dcValues[doc]}
                        onChange={onChange}
                        className="text-center text-gray-800 text-sm py-1  border-r border-b"
                      />
                      {user.data.dcAmount && (
                        <div className="w-full flex flex-row items-center bg-white py-1 border-r">
                          <input
                            type="number"
                            name={Object.keys(user.data.dcAmount).sort()[index]}
                            value={dcAValues[`${doc}A`]}
                            onChange={onChange}
                            className="text-center pl-3 text-gray-800 w-2/3 text-sm outline-none"
                          />
                          <div className=" bg-white text-xs text-center w-1/3">
                            {user.data.currency}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              <div className="text-center my-1 font-semibold">
                배송요율 {`[ 원 ]`}
              </div>
              <div
                className={`grid grid-cols-${
                  Object.keys(user.data.shippingRate).length
                } border mb-10`}
              >
                {Object.keys(user.data.shippingRate)
                  .sort()
                  .map((doc, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1  bg-gray-600 text-center  "
                    >
                      <div className="text-gray-100">{doc}</div>
                      <input
                        type="number"
                        name={doc}
                        value={shippingRate[doc]}
                        onChange={onChange}
                        className={`${
                          shippingRate[doc] < 1 ? "bg-red-100" : ""
                        } text-center text-gray-800 outline-none`}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
          {/* 수령인 파트 */}

          <div className="flex-col flex space-y-2">
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Company Name</div>
              <input
                name="companyName"
                value={companyName}
                onChange={onChange}
                className="border p-1"
              />{" "}
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Tax Id</div>
              <input
                name="taxId"
                value={taxId}
                onChange={onChange}
                className="border p-1"
                placeholder="Optional"
              />{" "}
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Recipient Email</div>
              <input
                name="recipientEmail"
                value={recipientEmail}
                onChange={onChange}
                className="border p-1"
              />{" "}
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Recipient PhoneNumber</div>
              <input
                name="recipientPhoneNumber"
                value={recipientPhoneNumber}
                onChange={onChange}
                className="border p-1"
              />{" "}
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Street</div>
              <input
                name="street"
                value={street}
                onChange={onChange}
                className="border p-1"
              />{" "}
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">City</div>
              <input
                name="city"
                value={city}
                onChange={onChange}
                className="border p-1"
              />{" "}
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">State</div>
              <input
                name="states"
                value={states}
                onChange={onChange}
                className="border p-1"
              />{" "}
            </div>
            <div className="grid grid-cols-2 items-center">
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
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Zipcode</div>
              <input
                name="zipcode"
                value={zipcode}
                onChange={onChange}
                className="border p-1"
              />{" "}
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Recipient</div>
              <input
                name="recipient"
                value={recipient}
                onChange={onChange}
                className="border p-1"
              />{" "}
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="text-right pr-5">Shipping Message</div>
              <textarea
                rows="5"
                cols="30"
                name="shippingMessage"
                value={shippingMessage}
                onChange={onChange}
                className="border p-1"
              ></textarea>
            </div>
          </div>
        </div>
        <button
          onClick={saveDetails}
          className="bg-gray-600 text-white py-1 px-12 rounded mb-12"
        >
          수정하기
        </button>

        <div className="w-1/2 mb-12 flex flex-col items-center">
          <div
            className="text-center text-md bg-gray-800 
          rounded text-gray-100 mb-5 mt-5 w-full py-1"
          >
            CREDIT
          </div>
          <div className="grid grid-cols-2 text-center mb-3">
            <div>CREDIT :</div>
            <div>
              {Math.round(user.data.credit).toLocaleString("ko-KR")}{" "}
              {user.data.currency}
            </div>
          </div>
          <div className="grid grid-cols-2 mb-6">
            <Modal
              open={modalOpen}
              close={closeModal}
              header={"CREDIT DETAILS"}
            >
              <CreditDetails creditDetails={creditDetails} reset={reset} />
            </Modal>

            <select
              name="creditType"
              className="border p-1 m-1"
              value={creditType}
              onChange={onChange}
            >
              <option value="Store-Credit">Store-Credit</option>
              <option value="Shipped-Amount">Shipped-Amount</option>
              <option value="Refund">Refund</option>
              <option value="Compensate">Compensate</option>
            </select>
            <input
              name="handleCredit"
              value={handleCredit}
              onChange={onChange}
              placeholder="Amount"
              className="border p-1 m-1 outline-none"
              onKeyPress={e => {
                if (e.key === "Enter") {
                  saveCredit();
                }
              }}
            />
          </div>
          <button
            className="bg-gray-600 p-1 rounded text-gray-200 m-2 w-52"
            onClick={openModal}
          >
            Credit Details
          </button>
        </div>
        {user.data.survay && (
          <div className="w-1/2 mb-12">
            <div
              className="text-center text-md bg-gray-800 
          rounded text-gray-100 mb-5 mt-5 w-full py-1"
            >
              SURVAY
            </div>
            <div>
              {Object.keys(user?.data?.survay).map((sur, i) => (
                <div key={i} className="grid grid-cols-3 p-1 text-gray-800">
                  <div className="text-right pr-2">{sur} :</div>
                  <div className="col-span-2">
                    {Object.values(user?.data?.survay)[i]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
