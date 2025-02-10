import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import ReactLoading from 'react-loading';
const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

export default function Cart(){
    // ============================================================================== 【Loading】
    const [isScreenLoading,setIsScreenLoading] = useState(false);
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
        getCart(); //取得購物車
    }, []);
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

    return(
        <>
            <div>
                {/* 購物車列表 */}
                {cart.carts?.length >0 && (
                    <div className="container">
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
            <div className="container">
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

        </>
    )
}