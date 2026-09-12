"use client";
import { useState, useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Search, Filter, Loader2 } from "lucide-react";
import Image from "next/image";
import type { ICategory, IProduct } from "@/types";
import CreateProductForm from "@/components/forms/create-product-form";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import GlobalPagination from "@/components/paginations";

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const pathName = usePathname();
  const [categories, setCategories] = useState<ICategory[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      const response = await fetch(`/api/categories?${params}`);
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (selectedStatus !== "all") params.append("status", selectedStatus);

      const response = await fetch(`/api/products?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      } else {
        console.error("Failed to fetch products:", result.error);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on component mount and when filters change
  useEffect(() => {
    if (categories?.length === 0) {
      fetchCategories();
    }
    fetchProducts();
  }, [searchTerm, selectedCategory, selectedStatus]);

  // Client-side filtered products for immediate UI feedback
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "all" || product.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus]);

  const handleEdit = (product: IProduct) => {
    setEditingProduct(product);

    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        fetchProducts();
        toast("Product deleted successfully!");
      } else {
        alert(result.error || "Failed to delete product");
      }
    } catch (error) {
      alert("Failed to delete product");
      console.error("Delete error:", error);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
  };

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page: number, limit: number) => {
    setCurrentPage(page);
    setItemsPerPage(limit);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <CreateProductForm
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          fetchProducts={fetchProducts}
        />
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category?._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {(searchTerm ||
            selectedCategory !== "all" ||
            selectedStatus !== "all") && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
        <div className="text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
          {(searchTerm ||
            selectedCategory !== "all" ||
            selectedStatus !== "all") && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="mt-4 bg-transparent"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {paginatedReviews.map((product) => (
            <Card
              key={product._id}
              className="hover:shadow-lg transition-shadow p-2"
            >
              <CardHeader className="p-0">
                <div className="aspect-square relative mb-4">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <CardTitle className="flex justify-between items-start">
                  <span className="line-clamp-2 text-sm md:text-base 2xl:text-lg">
                    {product.name}
                  </span>
                  <div className="flex space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-primary">
                    ৳{product.price.toFixed(2)}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">
                      {categories.find((c) => c._id === product.category)
                        ?.name || product.category}
                    </Badge>
                    <Badge
                      variant={
                        product.status === "active" ? "default" : "secondary"
                      }
                    >
                      {product.status}
                    </Badge>
                  </div>
                  {product.link && (
                    <a
                      href={`/product/${product?.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Product
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div>
        <GlobalPagination
          totalItems={filteredProducts?.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
