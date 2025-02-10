import { useEffect, useState } from "react";
import axios from "axios";
import ReactLoading from 'react-loading';
import { Link } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

export default function Products(){
    const [products, setProducts] = useState([]);  //產品列表
    const [isScreenLoading,setIsScreenLoading] = useState(false);
    const [isBtnLoading,setIsBtnLoading] = useState(false);
    // ============================================================================== 取得產品API
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
    }, []);

    // ------------- 加入購物車 -------------
    const addCartItem = async(product_id,qty)=>{
        setIsBtnLoading(true);
        try{
        await axios.post(`${BASE_URL}/v2/api/${API_PATH}/cart`,{
            data: {
                product_id,
                qty: Number(qty)
            }
        })
        }catch(error){
        alert("加入購物失敗")
        }finally{
        setIsBtnLoading(false);
        }
    }



    return(
        <>
            <div className="container">
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
                                    <Link
                                    to={`/products/${product.id}`}
                                    className="btn btn-outline-secondary"
                                    >
                                    查看更多
                                    </Link>
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
            </div>
            {/* Loading */}
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
        </>

        
    )
}