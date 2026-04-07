import React from 'react'
import ProductCard from './productCard';

function products() {
  return (
    <div className="grid gap-2 grid-cols-4 grid-rows-2 w-fit">
    <ProductCard
    name="capuchino"
    price={200}
    />
    <ProductCard
    name="capuchino"
    price={200}
    />
    <ProductCard
    name="capuchino"
    price={200}
    />
    <ProductCard
    name="capuchino"
    price={200}
    />
     <ProductCard
    name="capuchino"
    price={200}
    />
    <ProductCard
    name="capuchino"
    price={200}
    />
    <ProductCard
    name="capuchino"
    price={200}
    />
    <ProductCard
    name="capuchino"
    price={200}
    />
    
    </div>
 
  )
}

export default products