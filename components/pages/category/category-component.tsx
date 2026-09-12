"use client";
import { ProductCard } from "@/components/product-card";
import { useAppSelector } from "@/hooks/useRedux";

interface CategoryProps {
  slug: string;
}

export default function CategoryComponent({ slug }: CategoryProps) {
  const { categories } = useAppSelector((state) => state.category);
  const { products } = useAppSelector((state) => state.product);

  const category = categories.find((c) => c?.slug === slug);
  const activeProducts = products?.filter(
    (product) => product.status === "active"
  );

  const categoryProducts = activeProducts.filter(
    (p) => p?.category === category?._id
  ).filter(prod => prod.status === 'active');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-1">{category?.name}</h1>
        <p className="text-gray-600">
          Showing {categoryProducts?.length} products
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categoryProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
