"use client";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks/useRedux";
import React, { useState } from "react";

const AllProducts = () => {
  const { products } = useAppSelector((state) => state.product);
  const [visibleCount, setVisibleCount] = useState(8);

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  const activeProducts = products?.filter(
    (product) => product.status === "active"
  );

  const displayedProducts = activeProducts?.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < activeProducts?.length;

  return (
    <div className="container mx-auto py-5 pb-32 px-4">
      <div className="flex justify-between items-center mb-2 lg:mb-4">
        <h2 className="text-xl lg:text-2xl font-bold">Best selling products</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {displayedProducts?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      {hasMoreProducts && (
        <div className="flex justify-center mt-4">
          <Button className="" type="button" onClick={handleSeeMore}>
            See more products
          </Button>
        </div>
      )}
    </div>
  );
};

export default AllProducts;
