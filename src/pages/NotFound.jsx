import { Link } from "react-router-dom"


export default function NotFound(){
    return(
        <>
            <h1>404不存在的頁面</h1>
            <Link to="/">點此回到首頁</Link>
        </>
    )
}