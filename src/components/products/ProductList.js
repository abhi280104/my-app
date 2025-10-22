import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import ProductCard from "../../components/products/ProductCard";
import { FaHome } from "react-icons/fa";

const ProductList = () => {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");
  const searchQuery = searchParams.get("search");
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        // Fetch products based on category or search query
        let query = supabase.from("products").select("*");

        if (categoryId) query = query.eq("category_id", categoryId);
        if (searchQuery) query = query.ilike("name", `%${searchQuery}%`);

        const { data: productsData, error: productsError } = await query;

        if (productsError) console.error(productsError);
        else setProducts(productsData || []);

        // Fetch category name if categoryId exists
        if (categoryId) {
          const { data: categoryData, error: categoryError } = await supabase
            .from("categories")
            .select("name")
            .eq("id", categoryId)
            .single();

          if (!categoryError && categoryData) setCategoryName(categoryData.name);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }

      setLoading(false);
    };

    fetchProducts();
  }, [categoryId, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-0">
          {categoryId
            ? `Products in "${categoryName}"`
            : searchQuery
            ? `Search results for "${searchQuery}"`
            : "All Products"}
        </h1>
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          <FaHome /> <span>Back to Home</span>
        </button>
      </div>

      {/* Product Grid */}
      {loading ? (
        <p className="text-gray-700 text-center mt-10">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">
          No products found{categoryId ? " in this category" : searchQuery ? ` for "${searchQuery}"` : ""}.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
