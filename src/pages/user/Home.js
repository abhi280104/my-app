import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/NavBar";
import Footer from "../../components/common/Footer";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import ProductCard from "../../components/products/ProductCard";
import { supabase } from "../../services/supabaseClient";


const sliderImages = [
  { id: 1, img: "https://picsum.photos/1200/400?random=1", title: "Upgrade Your Lifestyle", subtitle: "Discover the best products at amazing prices" },
  { id: 2, img: "https://picsum.photos/1200/400?random=2", title: "Trendy Electronics", subtitle: "Top gadgets just for you" },
  { id: 3, img: "https://picsum.photos/1200/400?random=3", title: "Fashionable Apparel", subtitle: "Look stylish everyday" },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const { data, error } = await supabase
        .from("featured_products")
        .select(`id, product_id, products (id, name, price, image_url)`);

      if (error) console.error("Error fetching featured products:", error);
      else {
        const products = data.map((item) => ({
          id: item.product_id,
          name: item.products?.name || "Unnamed Product",
          price: item.products?.price || 0,
          image_url: item.products?.image_url || "https://picsum.photos/300/300?random=1",
        }));
        setFeaturedProducts(products);
      }
      setLoadingFeatured(false);
    };

    fetchFeaturedProducts();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) console.error("Error fetching categories:", error);
      else setCategories(data);
      setLoadingCategories(false);
    };

    fetchCategories();
  }, []);

  // Slider autoplay
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);

  return (
    <>
      <Navbar />
      <div className="pt-24">

        {/* Slider */}
        <div
          className="relative overflow-hidden h-[400px] md:h-[500px] lg:h-[600px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {sliderImages.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
            >
              <img src={slide.img} alt={slide.title} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 flex flex-col justify-center items-start px-8 md:px-16">
                <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2">{slide.title}</h1>
                <p className="text-lg md:text-2xl text-gray-200 mb-4">{slide.subtitle}</p>
                <button
                  onClick={() => navigate("/products")}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:scale-105 transition-transform duration-300"
                >
                  Shop Now
                </button>
              </div>
            </div>
          ))}
          <button onClick={prevSlide} className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/70 hover:bg-white/90 text-gray-700 p-3 rounded-full shadow transition"><FaArrowLeft /></button>
          <button onClick={nextSlide} className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/70 hover:bg-white/90 text-gray-700 p-3 rounded-full shadow transition"><FaArrowRight /></button>
        </div>

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-6 my-12">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          {loadingCategories ? (
            <p>Loading categories...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="relative cursor-pointer overflow-hidden rounded-2xl shadow hover:scale-105 transform transition"
                  onClick={() => navigate(`/products?category=${cat.id}`)}
                >
                  <img src={cat.image_url || "https://picsum.photos/300/300?random=1"} alt={cat.name} className="w-full h-40 object-cover" loading="lazy" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-center py-2 font-semibold">
                    {cat.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Featured Products */}
        <section className="max-w-7xl mx-auto px-6 my-12">
          <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
          {loadingFeatured ? (
            <p>Loading featured products...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
