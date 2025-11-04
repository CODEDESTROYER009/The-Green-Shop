import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Leaf, Recycle, Award, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string | null;
  eco_tags: string[];
  is_verified: boolean;
  co2_saved: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCartCount();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, title, price, image, eco_tags, is_verified, co2_saved")
      .limit(4);
    
    if (!error && data) {
      setFeaturedProducts(data);
    }
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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Leaf className="h-4 w-4" />
              <span className="text-sm font-medium">Certified Eco-Friendly Products</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Shop Sustainable,
              <br />
              Save the Planet
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Every purchase reduces carbon footprint. Earn green points and track your environmental impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View My Impact
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-gradient-eco p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">100% Eco-Friendly</h3>
              <p className="text-muted-foreground">
                All products are sustainably sourced and environmentally certified
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-gradient-eco p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Recycle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Track Your Impact</h3>
              <p className="text-muted-foreground">
                See exactly how much CO₂ and plastic you've saved with every purchase
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-gradient-eco p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Earn Green Points</h3>
              <p className="text-muted-foreground">
                Get rewarded for sustainable shopping and redeem for discounts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Eco Products</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Handpicked sustainable products that make a real difference
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map((product) => (
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

          <div className="text-center">
            <Link to="/products">
              <Button size="lg" className="bg-gradient-eco">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Your Eco Journey Today
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of eco-conscious shoppers making a positive impact on the environment
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
