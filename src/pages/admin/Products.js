import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { Loader2, Trash2, Plus, Check } from "lucide-react";

const Products = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category_id: "",
    img: "",
    description: "",
    stock: "",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [editedProduct, setEditedProduct] = useState({
    name: "",
    price: "",
    img: "",
    description: "",
    stock: "",
  });

  // Fetch categories and products
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (categoriesError || productsError) throw categoriesError || productsError;

      setCategories(categoriesData);
      setProducts(productsData);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setActionLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .insert([{ name: newCategory }])
      .select();
    if (error) console.error(error);
    else setCategories([data[0], ...categories]);
    setNewCategory("");
    setActionLoading(false);
  };

  // Add product
  const handleAddProduct = async () => {
    const { name, price, category_id, img, description, stock } = newProduct;
    if (!name || !price || !category_id) return;
    setActionLoading(true);
    const { data, error } = await supabase
      .from("products")
      .insert([{ name, price, category_id, img, description, stock }])
      .select();
    if (error) console.error(error);
    else setProducts([data[0], ...products]);
    setNewProduct({ name: "", price: "", category_id: "", img: "", description: "", stock: "" });
    setActionLoading(false);
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    setActionLoading(true);
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) console.error(error);
    else setCategories(categories.filter((c) => c.id !== id));
    setActionLoading(false);
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setActionLoading(true);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) console.error(error);
    else setProducts(products.filter((p) => p.id !== id));
    setActionLoading(false);
  };

  // Update category
  const handleUpdateCategory = async (id) => {
    if (!editedCategoryName.trim()) return;
    setActionLoading(true);
    const { error } = await supabase
      .from("categories")
      .update({ name: editedCategoryName })
      .eq("id", id);
    if (error) console.error(error);
    else {
      setCategories(
        categories.map((c) => (c.id === id ? { ...c, name: editedCategoryName } : c))
      );
      setEditingCategoryId(null);
    }
    setActionLoading(false);
  };

  // Update product
  const handleUpdateProduct = async (id) => {
  const { name, price, image_url, description, stock } = editedProduct;
  if (!name || !price) return;
  setActionLoading(true);
  const { data, error } = await supabase
    .from("products")
    .update({ name, price, image_url, description, stock })
    .eq("id", id)
    .select(); // select to get updated record

  if (error) console.error("Error updating product:", error);
  else {
    // Update UI with the new product from DB
    setProducts(products.map(p => p.id === id ? data[0] : p));
    setEditingProductId(null);
    setEditedProduct({ name: "", price: "", img: "", description: "", stock: "" });
  }
  setActionLoading(false);
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-12 h-12 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-indigo-700 mb-8 text-center">Products & Categories</h1>

      {/* Add Category */}
      <div className="mb-8 flex flex-col md:flex-row gap-2 items-center">
        <input
          type="text"
          placeholder="New Category Name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="p-3 rounded-xl border border-gray-300 flex-1 focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <button
          onClick={handleAddCategory}
          disabled={actionLoading}
          className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Category
        </button>
      </div>

      {/* Add Product */}
      <div className="mb-10 grid grid-cols-1 md:grid-cols-6 gap-3">
        <input
          type="text"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <select
          value={newProduct.category_id}
          onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
          className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Image URL"
          value={newProduct.img}
          onChange={(e) => setNewProduct({ ...newProduct, img: e.target.value })}
          className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <input
          type="text"
          placeholder="Description"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <input
          type="number"
          placeholder="Stock"
          value={newProduct.stock}
          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
          className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <button
          onClick={handleAddProduct}
          disabled={actionLoading}
          className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Product
        </button>
      </div>

      {/* Categories & Products */}
      {categories.map((category) => (
        <div key={category.id} className="mb-10">
          <div className="flex justify-between items-center mb-4">
            {editingCategoryId === category.id ? (
              <div className="flex gap-2 items-center">
                <input
                  value={editedCategoryName}
                  onChange={(e) => setEditedCategoryName(e.target.value)}
                  className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                />
                <button
                  onClick={() => handleUpdateCategory(category.id)}
                  disabled={actionLoading}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-indigo-600">{category.name}</h2>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => {
                      setEditingCategoryId(category.id);
                      setEditedCategoryName(category.name);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={actionLoading}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products
              .filter((p) => p.category_id === category.id)
              .map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition flex flex-col justify-between"
                >
                  <img
                    src={p.img || `https://picsum.photos/200?random=${p.id}`}
                    alt={p.name}
                    className="w-full h-36 object-cover rounded-xl mb-3"
                  />
                  {editingProductId === p.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        value={editedProduct.name}
                        onChange={(e) =>
                          setEditedProduct({ ...editedProduct, name: e.target.value })
                        }
                        className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                      />
                      <input
                        type="number"
                        value={editedProduct.price}
                        onChange={(e) =>
                          setEditedProduct({ ...editedProduct, price: e.target.value })
                        }
                        className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                      />
                      <input
                        value={editedProduct.image_url}
                        onChange={(e) =>
                          setEditedProduct({ ...editedProduct, image_url: e.target.value })
                        }
                        className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                      />
                      <input
                        value={editedProduct.description}
                        onChange={(e) =>
                          setEditedProduct({ ...editedProduct, description: e.target.value })
                        }
                        placeholder="Description"
                        className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                      />
                      <input
                        type="number"
                        value={editedProduct.stock}
                        onChange={(e) =>
                          setEditedProduct({ ...editedProduct, stock: e.target.value })
                        }
                        placeholder="Stock"
                        className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                      />
                      <button
                        onClick={() => handleUpdateProduct(p.id)}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                      >
                        save
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-lg">{p.name}</p>
                      <p className="text-indigo-600 font-bold">₹{p.price}</p>
                      <p className="text-gray-600 text-sm">Stock: {p.stock || 0}</p>
                      <p className="text-gray-600 text-sm">{p.description || "No description"}</p>
                      <div className="flex justify-between mt-2">
                        <button
                          onClick={() => {
                            setEditingProductId(p.id);
                            setEditedProduct({
                              name: p.name,
                              price: p.price,
                              img: p.img,
                              description: p.description,
                              stock: p.stock,
                            });
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Products;
