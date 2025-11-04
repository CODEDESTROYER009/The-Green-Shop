import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string | null;
  category: string;
  eco_tags: string[];
  is_verified: boolean;
  co2_saved: number;
}

const Products = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["all", "Kitchen", "Personal Care", "Accessories", "Electronics", "Stationery"];
  const ecoTags = ["Plastic-Free", "Biodegradable", "Vegan", "Reusable", "Zero Waste", "Organic", "Fair Trade", "Renewable Energy", "Zero Emissions", "Recycled"];

  useEffect(() => {
    checkAuth();
    fetchProducts();
    fetchCartCount();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*");
    
    if (error) {
      toast.error("Failed to load products");
      console.error(error);
      setProducts([]);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const fetchCartCount = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("user_id", session.user.id);
    
    if (!error && data) {
      const total = data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    }
  };

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === "all" || product.category === selectedCategory;
    const tagMatch = selectedTags.length === 0 || selectedTags.some(tag => product.eco_tags.includes(tag));
    const searchMatch = searchQuery === "" || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && tagMatch && searchMatch;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddToCart = async (productId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);
      
      if (error) {
        toast.error("Failed to update cart");
        return;
      }
    } else {
      const { error } = await supabase
        .from("cart_items")
        .insert({
          user_id: session.user.id,
          product_id: productId,
          quantity: 1,
        });
      
      if (error) {
        toast.error("Failed to add to cart");
        return;
      }
    }

    setCartCount(prev => prev + 1);
    toast.success("Added to cart!", {
      description: "You earned green points!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartItemsCount={cartCount} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2 text-foreground">Eco-Friendly Products</h1>
        <p className="text-muted-foreground mb-4">Shop sustainable products that make a difference</p>
        
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {loading && <p className="text-center">Loading products...</p>}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-foreground">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-foreground">Sustainability Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {ecoTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No products found matching your filters</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedTags([]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image={product.image || ''}
                    ecoTags={product.eco_tags}
                    isVerified={product.is_verified}
                    co2Saved={Number(product.co2_saved)}
                    onAddToCart={() => handleAddToCart(product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
