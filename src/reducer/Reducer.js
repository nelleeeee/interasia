export const initState = {
  notices: [],
  products: [],
  shippings: [],
  orders: [],
  userType: "before",
  user: null,
  category: "cd",
  orderCounts: null,
  shippingCounts: null,
  shippingNumber: null,
  simpleLists: [],
  accounts: [],
  // 상품별 판매량
  allOrderProductsList: null,
  // 미발송 확인: 상태별 product_id:qty
  unShippedProductsIdandQty: "",
  // dhl shipping Fee
  dhlShippingFee: [],
  // 환율
  exchangeRate: [],
  // 재입고요청
  reStockRequests: [],
  // 채팅방
  rooms: [],
  // 검색어
  searchQuery: "",
  // 현재 페이지
  currentPage: 1,
  // 주문상태
  orderState: "",
  // 담당자
  inChargeState: "",
};

export function dataReducer(state, action) {
  switch (action.type) {
    case "NOTICES":
      return { ...state, notices: action.notice };
    case "PRODUCTS":
      return { ...state, products: action.product };
    case "ORDERS":
      return { ...state, orders: action.order };
    case "SHIPPINGS":
      return { ...state, shippings: action.shipping };
    case "ACCOUNTS":
      return { ...state, accounts: action.account };
    case "USERTYPE":
      return { ...state, userType: action.userType };
    case "USER":
      return { ...state, user: action.user };
    case "CATEGORY":
      return { ...state, category: action.category };
    case "ORDER_COUNTS":
      return { ...state, orderCounts: action.orderCounts };
    case "SHIPPING_COUNTS":
      return { ...state, shippingCounts: action.shippingCounts };
    case "SHIPPING_NUMBER":
      return { ...state, shippingNumber: action.shippingNumber };
    case "SIMPLELIST":
      return {
        ...state,
        simpleLists: action.simpleList,
      };
    case "ALL_ORDER_PRODUCTS_LIST":
      return { ...state, allOrderProductsList: action.allOrderProductsList };
    case "DHL_SHIPPING_FEE":
      return { ...state, dhlShippingFee: action.dhlShippingFee };
    case "EXCHANGE_RATE":
      return { ...state, exchangeRate: action.exchangeRate };
    case "UNSHIPPED_PRODUCTS_ID_QTY":
      return {
        ...state,
        unShippedProductsIdandQty: action.unShippedProductsIdandQty,
      };
    case "RESTOCK_REQUEST":
      return {
        ...state,
        reStockRequests: action.reStockRequest,
      };
    case "ROOMS":
      return {
        ...state,
        rooms: action.room,
      };
    case "SEARCH_QUERY":
      return {
        ...state,
        searchQuery: action.searchQuery,
      };
    case "CURRENT_PAGE":
      return {
        ...state,
        currentPage: action.currentPage,
      };
    case "ORDER_STATE":
      return {
        ...state,
        orderState: action.orderState,
      };
    case "INCHARGESTATE":
      return {
        ...state,
        inChargeState: action.inChargeState,
      };

    default:
      return state;
  }
}
