import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'; // 引入 CSS
import {  RouterProvider } from 'react-router-dom';
import router from './router';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
