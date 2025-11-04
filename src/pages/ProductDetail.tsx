import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart, CheckCircle, Leaf, Recycle, Award } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { productImages } from "@/assets/products";

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string | null;
  category: string;
  eco_tags: string[];
  is_verified: boolean;
  co2_saved: number;
  plastic_saved: number;
  water_saved: number;
  green_points: number;
  vendor: string | null;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchProduct();
    fetchCartCount();
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (error) {
      toast.error("Failed to load product");
      console.error(error);
    } else if (!data) {
      toast.error("Product not found");
      navigate("/products");
    } else {
      setProduct(data as Product);
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

  const handleAddToCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    if (!product) return;

    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
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
          product_id: product.id,
          quantity: quantity,
        });
      
      if (error) {
        toast.error("Failed to add to cart");
        return;
      }
    }

    setCartCount(prev => prev + quantity);
    toast.success(`Added ${quantity} item(s) to cart!`, {
      description: `Total green points: ${product.green_points * quantity}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar cartItemsCount={cartCount} />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const imageUrl = product.image 
    ? (productImages[product.image as keyof typeof productImages] || product.image)
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartItemsCount={cartCount} />

      <div className="container mx-auto px-4 py-8">
        <Link to="/products">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gradient-card">
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.is_verified && (
              <div className="absolute top-4 right-4 bg-eco-verified text-white p-3 rounded-full shadow-lg">
                <CheckCircle className="h-6 w-6" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.is_verified && (
                  <Badge className="bg-eco-verified">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Eco-Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
              {product.vendor && <p className="text-sm text-muted-foreground mb-4">by {product.vendor}</p>}
              <p className="text-3xl font-bold text-primary mb-4">₹{product.price}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.eco_tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-sm">
                  <Leaf className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            <p className="text-foreground leading-relaxed">{product.description}</p>

            {/* Eco Metrics */}
            <Card className="p-4 bg-gradient-card space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Recycle className="h-5 w-5 text-eco-verified" />
                Environmental Impact per Purchase
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold text-eco-verified">
                    {product.co2_saved}kg
                  </p>
                  <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-eco-ocean">
                    {product.plastic_saved}kg
                  </p>
                  <p className="text-xs text-muted-foreground">Plastic Saved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-eco-earth">
                    {product.water_saved}L
                  </p>
                  <p className="text-xs text-muted-foreground">Water Saved</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-eco-badge" />
                  <span>
                    Earn <strong>{product.green_points}</strong> green points with this purchase
                  </span>
                </p>
              </div>
            </Card>

            {/* Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Quantity:</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-eco hover:opacity-90"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart - ₹{product.price * quantity}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
