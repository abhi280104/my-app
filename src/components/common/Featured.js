import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import ProductCard from "../../components/products/ProductCard";

const Featured = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("featured_products")
        .select(`product:product_id(*)`); // fetch related products

      if (error) {
        console.error("Error fetching featured products:", error);
      } else {
        // Extract the actual product objects
        const products = data.map((item) => item.product);
        setFeaturedProducts(products);
        console.log("Featured products:", products);
      }

      setLoading(false);
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-indigo-600 mb-8 text-center">
        Featured Products
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading featured products...</p>
      ) : featuredProducts.length === 0 ? (
        <p className="text-center text-gray-500">No featured products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Featured;
