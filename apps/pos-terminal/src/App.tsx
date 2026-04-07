import CategoryPage from "./components/categories";
import NavBar from "./components/navBar";
import Products from "./components/products";

function App() {
  return (
   <div className="h-lvh gap-2 flex flex-row bg-[#181818] ">
    <NavBar/>
    <div className="flex flex-col gap-2">
       <CategoryPage/>
        <Products/>
    </div>
   
   </div>
    
    
    )
}

export default App;
