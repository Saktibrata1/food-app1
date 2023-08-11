import "./App.css";
import Header from "./component/Header";
import { Outlet } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { setDataProduct } from "./redux/productSlide";
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';

function App() {
  const dispatch = useDispatch()
  const productData = useSelector((state)=>state.product)
 
  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`http://food-app-backend-44jo.onrender.com/product`);
        const resData = response.data; // Use response.data to get the response JSON
        dispatch(setDataProduct(resData));
      } catch (error) {
        console.error(error);
        // Handle error, show an error message, etc.
      }
    })();
  }, []);
  

  return (
    <>
      <Toaster />
      <div>
        <Header />
        <main className="pt-16 bg-slate-100 min-h-[calc(100vh)]">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default App;
