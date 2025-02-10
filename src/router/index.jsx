import { createHashRouter } from "react-router-dom";
import Layout from "../layouts/Layout";
import Home from "../pages/Home";
import Cart from "../pages/Cart";
import Products from "../pages/products";
import ProductItem from "../pages/ProductItem";
import NotFound from "../pages/NotFound";

 const router = createHashRouter([
    {
        path :'/',
        element : <Layout/>,
        children:[
            {
                path :'',
                element : <Home />,
            },
            {
                path :'/cart',
                element : <Cart />,
            },
            {
                path :'/products',
                element : <Products />,
            },
            {
                path :'/products/:id',
                element : <ProductItem />,
            },
        ]
    },
    {
        path :'/*',
        element : <NotFound />,
    }

])

export default router;