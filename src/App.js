import React, { useEffect, useReducer } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Spinner from "react-spinkit";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router-dom";
import { auth, db } from "./firebase";
import { initState, dataReducer } from "./reducer/Reducer";
// import OrderList from "./components/admin/orderlist/OrderList";
import Sidebar from "./components/sidebar/Sidebar";
import Login from "./components/login/Login";
import ListProduct from "./components/products/listproduct/ListProduct";
import AddProduct from "./components/products/addproduct/AddProduct";
import DetailProduct from "./components/products/detailproduct/DetailProduct";
// import OrderDetail from "./components/admin/orderlist/OrderDetail";
// import Unshiped from "./components/admin/unshipped/Unshiped";
// import ShippingList from "./components/admin/shipping/ShippingList";
// import UnshipedDetail from "./components/admin/unshipped/UnshippedDetail";
import OrderProductList from "./components/teamjangnim/OrderProductList";
import Dev from "./dev/Dev";
import Header from "./components/header/Header";
import Invoice from "./components/invoice/Invoice";
// import InAdminChat from "./components/chat/InAdminChat";
import { CustomerIndex } from "./components/admin/customer/CustomerIndex";
import { CustomerDetails } from "./components/admin/customer/details/CustomerDetails";
import { OrderLists } from "./components/orderlist/index";
import { OrderListDetail } from "./components/orderlist/orderlistdetail/index";
import { ShippingLists } from "./components/shippinglist";
import { PickUpList2 } from "./components/pickuplist2";
import { DashBoard } from "./components/dashboard";
import { Invoice2 } from "./components/invoice2";
import ReceiptPrint from "./components/ReceiptPrint/ReceiptPrint";

export const InitDataContext = React.createContext(null);
export const InitDispatchContext = React.createContext(null);

function App() {
  const [user, loading] = useAuthState(auth);
  const [state, dispatch] = useReducer(dataReducer, initState);
  const { userType } = state;
  // TODO: 유저타입을 -> user.userType 으로 대체가능한가?
  const history = useHistory();

  useEffect(() => {
    db.collection("accounts")
      .doc(user?.email)
      .onSnapshot((doc) =>
        dispatch({ type: "USERTYPE", userType: doc?.data()?.type })
      );
  }, [user]);

  useEffect(() => {
    db.collection("accounts")
      .doc(user?.email)
      .onSnapshot((doc) => dispatch({ type: "USER", user: doc?.data() }));
  }, [user]);

  // FIXME: account type -> customer 만 가져오게
  useEffect(() => {
    db.collection("accounts").onSnapshot((snapshot) =>
      dispatch({
        type: "ACCOUNTS",
        account: snapshot.docs.map((doc) => ({
          id: doc?.id,
          data: doc?.data(),
        })),
      })
    );
  }, [dispatch]);

  // useEffect(() => {
  //   db.collection("orders")
  //     .doc("b2b")
  //     .collection("b2borders")
  //     .orderBy("createdAt", "desc")
  //     .onSnapshot(snapshot =>
  //       dispatch({
  //         type: "ORDERS",
  //         order: snapshot.docs.map(doc => ({
  //           id: doc?.id,
  //           data: doc?.data(),
  //         })),
  //       })
  //     );
  // }, [dispatch]);

  useEffect(() => {
    db.collection("products").onSnapshot((snapshot) =>
      dispatch({
        type: "PRODUCTS",
        product: snapshot.docs.map((doc) => ({
          id: doc?.id,
          data: doc?.data(),
        })),
      })
    );
  }, [dispatch]);

  // useEffect(() => {
  //   db.collection("rooms").onSnapshot(snapshot =>
  //     dispatch({
  //       type: "ROOMS",
  //       room: snapshot.docs.map(doc => ({ id: doc?.id, data: doc?.data() })),
  //     })
  //   );
  // }, [dispatch]);

  // useEffect(() => {
  //   db.collection("shipping")
  //     .orderBy("shippedDate", "desc")
  //     .onSnapshot(snapshot =>
  //       dispatch({
  //         type: "SHIPPINGS",
  //         shipping: snapshot.docs.map(doc => ({
  //           id: doc?.id,
  //           data: doc?.data(),
  //         })),
  //       })
  //     );
  // }, [dispatch]);

  // useEffect(() => {
  //   db.collection("notice")
  //     .orderBy("index", "desc")
  //     .onSnapshot(snapshot =>
  //       dispatch({
  //         type: "NOTICES",
  //         notice: snapshot.docs.map(doc => ({
  //           id: doc?.id,
  //           data: doc?.data(),
  //         })),
  //       })
  //     );
  // }, [dispatch]);

  //
  // useEffect(() => {
  //   db.collection("reStockRequests")
  //     .orderBy("title", "desc")
  //     .onSnapshot(snapshot =>
  //       dispatch({
  //         type: "RESTOCK_REQUEST",
  //         reStockRequest: snapshot.docs.map(doc => ({
  //           id: doc?.id,
  //           data: doc?.data(),
  //         })),
  //       })
  //     );
  // }, [dispatch]);

  // useEffect(() => {
  //   db.collection("forNumberedId")
  //     .doc("b2bOrder")
  //     .onSnapshot(snapshot =>
  //       dispatch({
  //         type: "ORDER_COUNTS",
  //         orderCounts: snapshot.data().counts,
  //       })
  //     );
  // }, [dispatch]);

  // useEffect(() => {
  //   db.collection("forNumberedId")
  //     .doc("shipping")
  //     .onSnapshot(snapshot =>
  //       dispatch({
  //         type: "SHIPPING_COUNTS",
  //         shippingCounts: snapshot.data().counts,
  //       })
  //     );
  // }, [dispatch]);

  useEffect(() => {
    db.collection("shippingFee")
      .doc("dhl")
      .onSnapshot((snapshot) =>
        dispatch({
          type: "DHL_SHIPPING_FEE",
          dhlShippingFee: snapshot.data(),
        })
      );
  }, [dispatch]);

  useEffect(() => {
    db.collection("exchangeRate")
      .doc("rates")
      .onSnapshot((snapshot) =>
        dispatch({
          type: "EXCHANGE_RATE",
          exchangeRate: snapshot.data(),
        })
      );
  }, [dispatch]);

  if (loading) {
    return (
      <div className="grid place-items-center h-screen w-full">
        <div className="text-center pb-24 flex flex-col justify-center items-center">
          <Spinner name="ball-spin-fade-loader" color="gray" fadeIn="none" />
        </div>
      </div>
    );
  }
  if (user && userType === "none") {
    return (
      <div className="grid place-items-center h-screen w-full">
        <div className="flex h-auto text-lg">
          We are checking the contents of the survey.
        </div>
        <div
          onClick={async () => {
            await auth.signOut();
            await history.replace("/");
          }}
          className="font-mono font-bold text-center rounded-sm text-lg
                    text-gray-100 bg-blue-900 py-3 px-5 cursor-pointer"
        >
          Logout
        </div>
      </div>
    );
  }

  if (user && userType === "admin") {
    return (
      <Router>
        <div className="flex flex-col bg-gray-50 h-auto min-h-screen w-screen">
          <InitDispatchContext.Provider value={dispatch}>
            <InitDataContext.Provider value={state}>
              <Header />
              <div className="flex flex-row h-auto min-h-screen">
                <Sidebar />
                <Switch>
                  {/* 개발 */}
                  {auth.currentUser.email === "interasiadev@gmail.com" ? (
                    <Route path="/fordev" component={Dev} />
                  ) : (
                    ""
                  )}
                  {/* New */}
                  <Route
                    path="/orderlistdetail/:id"
                    component={OrderListDetail}
                  />
                  <Route path="/orderlists" component={OrderLists} />
                  <Route path="/shippinglists" component={ShippingLists} />
                  <Route path="/dashboard" component={DashBoard} />
                  <Route path="/receiptprint" component={ReceiptPrint} />

                  {/* 석팀장님 */}
                  <Route
                    path="/orderproductslist"
                    component={OrderProductList}
                  />

                  {/* order */}
                  {/* <Route path="/orderdetail/:id" component={OrderDetail} />
                  <Route path="/orderlist" component={OrderList} /> */}

                  {/* shipping */}
                  {/* <Route path="/unshipped/:uid" component={UnshipedDetail} />
                  <Route path="/unshipped" component={Unshiped} />
                  <Route path="/shippinglist" component={ShippingList} /> */}

                  {/* product */}
                  <Route
                    exact
                    path="/detailproduct/:id"
                    component={DetailProduct}
                  />
                  <Route path="/listproduct" component={ListProduct} />
                  <Route path="/addproduct" component={AddProduct} />
                  {/* customer */}
                  <Route
                    exact
                    path="/customerdetail/:uid"
                    component={CustomerDetails}
                  />
                  <Route path="/customerlist" component={CustomerIndex} />

                  {/* b2b */}
                  <Route path="/pickuplist2" component={PickUpList2} />
                  <Route path="/invoice2" component={Invoice2} />
                  <Route path="/invoice" component={Invoice} />
                  {/* <Route path="/chat" component={InAdminChat} /> */}
                  <Route path="/" component={DashBoard} />
                </Switch>
              </div>
            </InitDataContext.Provider>
          </InitDispatchContext.Provider>
        </div>
      </Router>
    );
  }

  if (!user) {
    return (
      <InitDataContext.Provider value={state}>
        <Login />
      </InitDataContext.Provider>
    );
  }
  return (
    <>
      <div className="grid place-items-center h-screen w-full">
        <div className="text-center pb-24 flex flex-col justify-center items-center">
          <Spinner name="ball-spin-fade-loader" color="gray" fadeIn="none" />
        </div>
      </div>
    </>
  );
}

export default App;
