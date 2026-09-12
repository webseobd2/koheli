"use client";
import { useAppSelector } from "@/hooks/useRedux";
import { ICategory } from "@/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import CategoryCard from "../category/category-card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const CategorySection = () => {
  const { categories } = useAppSelector((state) => state.category);
  const { products } = useAppSelector((state) => state.product);

  const getCategories = (categories: ICategory[]) => {
    return categories?.filter((cat) =>
      products?.some((prod) => prod?.category === cat?._id)
    ).filter(item => item.status === 'active');
  };

  return (
    <section className="py-5">
      <div className="container mx-auto px-4">
        <h2 className="text-xl lg:text-2xl font-bold text-center mb-1 md:mb-4">
          Shop by Category
        </h2>

        {/* Slider Implementation */}
        <div className="mb-6">
          <Carousel
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {getCategories(categories)
                ?.slice(0, 12) // More categories for better sliding experience
                ?.map((category, index) => (
                  <CarouselItem
                    key={category?._id || index}
                    className="pl-2 md:pl-4 basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                  >
                    <div className="p-1">
                      <CategoryCard category={category} />
                    </div>
                  </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="ml-8" />
            <CarouselNext className="mr-8" />
          </Carousel>
        </div>

        {/* See All Category Button */}
        <div className="flex justify-center">
          <Link href={"/category"}>
            <Button className="" type="button">
              See all category
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
