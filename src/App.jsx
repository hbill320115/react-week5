import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {  Modal } from "bootstrap";
import { useForm } from "react-hook-form";
import ReactLoading from 'react-loading';
const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  const [products, setProducts] = useState([]);  //產品列表@@
  const [tempProduct, setTempProduct] = useState([]); // 儲存暫存產品資料

//  ============================================================================== 取得購物車
  const [cart,setCart] = useState({});
  const getCart = async()=>{
    try{
      const res = await axios.get(`${BASE_URL}/v2/api/${API_PATH}/cart`)
      setCart(res.data.data);
    }catch(error){
      alert("取得購物車失敗");
    }
  }

// ============================================================================== 取得產品API @@
  useEffect(() => {
    const getProducts = async () => {
      setIsScreenLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/v2/api/${API_PATH}/products`);
        setProducts(res.data.products);
      } catch (error) {
        alert("取得產品失敗");
      }finally{
        setIsScreenLoading(false);
      }
    };
    getProducts();
    getCart(); //取得購物車
  }, []);

// ============================================================================== 【Modal】
  const productModalRef = useRef(null); // Modal DOM
  useEffect(() => {
    new Modal(productModalRef.current, { backdrop: false });
  }, []);
// ------------- 開啟 Modal ------------- 
  const openModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.show();
  };
// ------------- 「查看更多」(儲存當前選中的產品並開啟 Modal)
  const handleSeeMore = (product) => {
    setTempProduct(product);
    openModal();
  };
  const [qtySelect, setQtySelect] = useState(1);  // 選擇的數量 (預設 1)

// ============================================================================== 【購物車】
// ------------- 加入購物車@@ -------------
const addCartItem = async(product_id,qty)=>{
  setIsBtnLoading(true);
  try{
    await axios.post(`${BASE_URL}/v2/api/${API_PATH}/cart`,{
        data: {
          product_id,
          qty: Number(qty)
        }
    })
    getCart(); //更新購物車列表
  }catch(error){
    alert("加入購物失敗")
  }finally{
    setIsBtnLoading(false);
  }
}
// ------------- 清空購物車(全部) ------------- 
const removeCart = async()=>{
  setIsScreenLoading(true);
  try{
    await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/carts`)
    getCart(); //更新購物車列表
  }catch(error){
    alert("清空購物車失敗")
  }finally{
    setIsScreenLoading(false);
  }
}
// ------------- 購物車-刪除(單一) ------------- 
const removeCartItem = async(cartItem_id) => {
  setIsScreenLoading(true);
  try{
    await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/cart/${cartItem_id}`);
    getCart(); //更新購物車列表
  }catch(error){
    alert("刪除失敗")
  }finally{
    setIsScreenLoading(false);
  }
}
// ------------- 購物車-數量變更 ------------- 
const updateCartItem = async(cartItem_id,product_id,qty) => {
  setIsScreenLoading(true);
  try{
    await axios.put(`${BASE_URL}/v2/api/${API_PATH}/cart/${cartItem_id}`,{
      data: {
        product_id,
        qty: Number(qty)
      }
    });
    getCart(); //更新購物車列表
  }catch(error){
    alert("更新數量失敗")
  }finally{
    setIsScreenLoading(false);
  }
}

// ============================================================================== 【表單 + 結帳】
  const {register,handleSubmit,formState:{errors},reset} =useForm()
  const startSubmit = (data)=>{
    console.log(data)
    const {message,...user} =data; //結帳API須符合格式，解構出message 和 user
    const userInfo = {
      data:{
        user,
        message,
      }
    }
    checkout(userInfo); // 結帳
  }
  const checkout = async(userInfo) => {
    setIsScreenLoading(true);
    try{
      await axios.post(`${BASE_URL}/v2/api/${API_PATH}/order`,userInfo)
      alert("結帳成功")
      reset() //清空表單
      getCart(); //更新購物車列表
    }catch(error){
      alert("購物車無商品")
    }finally{
      setIsScreenLoading(false);
    }
  }

// ============================================================================== 【Loading】
  const [isScreenLoading,setIsScreenLoading] = useState(false);
  const [isBtnLoading,setIsBtnLoading] = useState(false);


  return (
    <div className="container">
      {/* 商品列表 + modal + 購物車列表 */}
      <div className="mt-4">
        <h3 className="text-center">菜單</h3>
        {/* 商品列表 @@@*/}
        <table className="table align-middle table-striped">
          <thead className="table-primary">
            <tr className="text-center">
              <th>圖片</th>
              <th>商品名稱</th>
              <th>價格</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr className="text-center" key={product.id}>
                <td>
                  <img
                    className="img-fluid"
                    src={product.imageUrl}
                    alt={product.title}
                    style={{objectFit: "cover",height:"100px",width: "100px"}}
                  />
                </td>
                <td className="fw-bold">{product.title}</td>
                <td>
                  <del className="h7">原價 {product.origin_price} 元</del>
                  <div className="h6 fw-bold text-danger">特價 {product.price}元</div>
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <button
                      onClick={() => handleSeeMore(product)}
                      type="button"
                      className="btn btn-outline-secondary"
                    >
                      查看更多
                    </button>
                    {/* 列表的購物車點一次加1，所以"數量"參數只要寫入數字1 */}
                    <button type="button" className="btn btn-danger d-flex align-items-center gap-2"
                            onClick={()=>addCartItem(product.id,1)} disabled={isBtnLoading}> 
                            加到購物車{isBtnLoading && (<ReactLoading type={"spin"} color={"#000"} height={"1.5rem"} width={"1.5rem"}/>)}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* 商品modal */}
        <div
          ref={productModalRef}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          className="modal fade"
          id="productModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title fs-5">
                  {tempProduct.title}
                </h2>
                <button
                  // onClick={closeModal}
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <img
                  src={tempProduct.imageUrl}
                  alt={tempProduct.title}
                  className="img-fluid mx-auto d-block"
                  style={{width:"200px"}}
                />
                <p>內容：{tempProduct.content}</p>
                <p>描述：{tempProduct.description}</p>
                <p>
                  價錢：<del>{tempProduct.origin_price}</del>{" "}
                        {tempProduct.price}元
                </p>
                <div className="input-group align-items-center">
                  <label htmlFor="qtySelect">數量：</label>
                  <select
                    value={qtySelect}
                    onChange={(e) => setQtySelect(e.target.value)}
                    id="qtySelect"
                    className="form-select"
                  >
                    {Array.from({ length: 10 }).map((_, index) => (
                      <option key={index} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary d-flex align-items-center gap-2" 
                        onClick={()=>addCartItem(tempProduct.id,qtySelect)}
                        disabled={isBtnLoading}>
                  加入購物車 {isBtnLoading && (<ReactLoading type={"spin"} color={"#000"} height={"1.5rem"} width={"1.5rem"}/>)}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* 購物車列表 */}
        {cart.carts?.length >0 && (
          <div>
            <h3 className="text-center">購物車</h3>
            <div className="text-end py-3">
            <button onClick={removeCart} className="btn btn-outline-danger" type="button">
              清空購物車
            </button>
            </div>
            <table className="table align-middle">
              <thead>
                <tr>
                  <th></th>
                  <th>品名</th>
                  <th style={{ width: "150px" }}>數量/單位</th>
                  <th className="text-end">總價</th>
                </tr>
              </thead>
              <tbody>
                {cart.carts?.map((cartItem)=>{
                  return (
                  <tr key={cartItem.id}>
                    <td>
                      <button onClick={()=>removeCartItem(cartItem.id)} type="button" className="btn btn-outline-danger btn-sm">
                        x
                      </button>
                    </td>
                    <td>{cartItem.product.title}</td>
                    <td style={{ width: "150px" }}>
                      <div className="d-flex align-items-center">
                        <div className="btn-group me-2" role="group">
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            disabled={cartItem.qty === 1}
                            onClick={()=>updateCartItem(cartItem.id,cartItem.product_id,cartItem.qty -1 )}
                          >
                            -
                          </button>
                          <span
                            className="btn border border-dark"
                            style={{ width: "50px", cursor: "auto" }}
                          >{cartItem.qty}</span>
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={()=>updateCartItem(cartItem.id,cartItem.product_id,cartItem.qty +1 )}
                          >
                            +
                          </button>
                        </div>
                        <span className="input-group-text bg-transparent border-0">
                          {cartItem.product.unit}
                        </span>
                      </div>
                    </td>
                    <td className="text-end">{cartItem.total}</td>
                  </tr>)
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end">
                    總計：
                  </td>
                  <td className="text-end" style={{ width: "130px" }}>{cart.final_total}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
      {/* Loading @@ */}
      {isScreenLoading && (      
        <div className="d-flex justify-content-center align-items-center"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(255,255,255,0.5)",
            zIndex: 999,
          }}>
          <ReactLoading type="spokes" color="black" width="4rem" height="4rem" />
        </div>)
      }

      {/* 表單 */}
      <div className="my-5 row justify-content-center">
        <h3 className="text-center">結帳資訊</h3>
        <form className="col-md-6 bg-light p-4 rounde" onSubmit={handleSubmit(startSubmit)}>
          {/* email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input id="email" type="email" placeholder="請輸入 Email"
              className={`form-control ${errors.email && "is-invalid"}`}
              {...register("email",{
                required:"email欄位必填",
                pattern:{
                  value:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message:"email格式錯誤"
                }
              })}/>
            {errors.email && (<p className="text-danger my-2">{errors.email.message}</p>)}
          </div>
          {/* 姓名 */}
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              收件人姓名
            </label>
            <input id="name" placeholder="請輸入姓名"
              className={`form-control ${errors.name && "is-invalid"}`}
              {...register("name",{
                required:"姓名欄位必填"
              })}/>
            {errors.name && (<p className="text-danger my-2">{errors.name.message}</p>)}
          </div>
          {/* 電話 */}
          <div className="mb-3">
            <label htmlFor="tel" className="form-label">
              收件人電話
            </label>
            <input id="tel" type="text" placeholder="請輸入電話"
              className={`form-control ${errors.tel && "is-invalid"}`}
              {...register("tel",{
                required:"電話欄位必填",
                pattern:{
                  value:/^(0[2-8]\d{7}|09\d{8})$/,
                  message:"電話格式不正確"
            }})}/>
              {errors.tel && (<p className="text-danger my-2">{errors.tel.message}</p>)}
          </div>
          {/* 地址 */}
          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              收件人地址
            </label>
            <input id="address" type="text" placeholder="請輸入地址"
              className={`form-control ${errors.address && "is-invalid"}`}
              {...register("address",{
                required:"地址欄位必填"
            })}/>
            {errors.address && (<p className="text-danger my-2">{errors.address.message}</p>)}
          </div>
          {/* 留言 */}
          <div className="mb-3">
            <label htmlFor="message" className="form-label"> 留言 </label>
            <textarea id="message" cols="30" rows="10" className="form-control" {...register("message")}></textarea>
          </div>
          <div className="text-end">
            <button type="submit" className="btn btn-danger">
              送出訂單
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
