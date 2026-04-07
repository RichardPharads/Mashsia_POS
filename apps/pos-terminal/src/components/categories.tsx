import React from 'react'
import CategoryCard from "./categoryCard";
import crossant from '../assets/croissant.png'
function categoryPage() {
  return (
    <div className=" grid gap-2 grid-cols-4 grid-rows-2 w-fit">
     
    <CategoryCard
      title="Category 1"
      count={10}
      icon={<img src={crossant} alt="Crossant" />}
      color="BFFFD5"
      onClick={() => {}}
    />
    <CategoryCard
      title="Category 1"
      count={10}
      icon={<img src={crossant} alt="Crossant" />}
      color="BFFFD5"
      onClick={() => {}}
    />
    <CategoryCard
      title="Category 1"
      count={10}
      icon={<img src={crossant} alt="Crossant" />}
      color="BFFFD5"
      onClick={() => {}}
    />
      <CategoryCard
      title="Category 1"
      count={10}
      icon={<img src={crossant} alt="Crossant" />}
      color="BFFFD5"
      onClick={() => {}}
    />
<CategoryCard
      title="Category 1"
      count={10}
      icon={<img src={crossant} alt="Crossant" />}
      color="BFFFD5"
      onClick={() => {}}
    />
    <CategoryCard
      title="Category 1"
      count={10}
      icon={<img src={crossant} alt="Crossant" />}
      color="BFFFD5"
      onClick={() => {}}
    />
    <CategoryCard
      title="Category 1"
      count={10}
      icon={<img src={crossant} alt="Crossant" />}
      color="BFFFD5"
      onClick={() => {}}
    />
      <CategoryCard
      title="Category 1"
      count={10}
      icon={<img src={crossant} alt="Crossant" />}
      color="BFFFD5"
      onClick={() => {}}
    />
    </div>
  )
}

export default categoryPage