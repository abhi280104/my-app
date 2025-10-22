import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import ProductCard from "../../components/products/ProductCard";

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*");

      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products whenever a category is selected
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", selectedCategory.id);

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Top bar: title + back home button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-indigo-600 text-center flex-1">
          Categories
        </h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          onClick={() => navigate("/")}
        >
          Back Home
        </button>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-12">
        {categories.map((category) => (
          <div
            key={category.id}
            className="cursor-pointer border p-4 rounded-lg text-center hover:shadow-lg transition"
            onClick={() => setSelectedCategory(category)}
          >
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-32 object-cover mb-2 rounded"
              />
            ) : (
              <img
                src={`https://picsum.photos/300/300?random=1`}
                alt={category.name}
                className="w-full h-32 object-cover mb-2 rounded"
              />
            )}
            <p className="font-semibold">{category.name}</p>
          </div>
        ))}
      </div>

      {/* Products for selected category */}
      {selectedCategory && (
        <>
          <h2 className="text-2xl font-bold mb-6 text-center">
            Products in {selectedCategory.name}
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-500">No products found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Categories;
