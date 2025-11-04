import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2, Award, Leaf } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    title: string;
    price: number;
    image: string | null;
    green_points: number;
    co2_saved: number;
  };
}

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [donationAmount, setDonationAmount] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchCartItems();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchCartItems = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        product_id,
        quantity,
        products (
          title,
          price,
          image,
          green_points,
          co2_saved
        )
      `)
      .eq("user_id", session.user.id);
    
    if (error) {
      toast.error("Failed to load cart");
      console.error(error);
    } else {
      setCartItems(data || []);
    }
    setLoading(false);
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to remove item");
    } else {
      setCartItems(cartItems.filter((item) => item.id !== id));
      toast.success("Item removed from cart");
    }
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to update quantity");
    } else {
      setCartItems(
        cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
      );
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.products.price * item.quantity, 0);
  const totalGreenPoints = cartItems.reduce(
    (sum, item) => sum + item.products.green_points * item.quantity,
    0
  );
  const totalCO2Saved = cartItems.reduce((sum, item) => sum + item.products.co2_saved * item.quantity, 0);
  const total = subtotal + donationAmount;

  const handleCheckout = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Mock payment confirmation
      const confirmed = window.confirm(
        `Mock Payment Gateway\n\nTotal Amount: ₹${total.toFixed(2)}\nGreen Points to Earn: ${totalGreenPoints}\nCO₂ to Save: ${totalCO2Saved.toFixed(1)}kg\n\nClick OK to complete mock payment.`
      );

      if (!confirmed) {
        toast.info('Payment cancelled');
        return;
      }

      const orderNumber = `ORD-${Date.now()}`;
      
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          order_number: orderNumber,
          subtotal: subtotal,
          donation_amount: donationAmount,
          total: total,
          green_points_earned: totalGreenPoints,
          co2_saved: totalCO2Saved,
          status: 'completed'
        })
        .select()
        .single();

      if (orderError || !orderData) {
        toast.error('Failed to create order');
        return;
      }

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Failed to create order items:', itemsError);
      }

      // Update user stats
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (currentStats) {
        const plasticSaved = cartItems.reduce((sum, item) => {
          // Fetch plastic_saved from products if needed, or calculate based on product data
          return sum;
        }, 0);

        const waterSaved = cartItems.reduce((sum, item) => {
          // Fetch water_saved from products if needed
          return sum;
        }, 0);

        await supabase
          .from('user_stats')
          .update({
            total_orders: currentStats.total_orders + 1,
            green_points: currentStats.green_points + totalGreenPoints,
            co2_saved: Number(currentStats.co2_saved) + totalCO2Saved,
          })
          .eq('user_id', session.user.id);
      }

      // Clear cart
      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', session.user.id);

      if (clearError) {
        toast.error('Failed to clear cart');
      } else {
        setCartItems([]);
        toast.success('Order placed successfully!', {
          description: `Order ${orderNumber} | Green Points: ${totalGreenPoints}`,
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error('Payment failed', {
        description: error.message
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar cartItemsCount={0} />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartItemsCount={cartItems.length} />

      <div className="container mx-auto px-4 py-8">
        <Link to="/products">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-xl text-muted-foreground mb-4">Your cart is empty</p>
            <Link to="/products">
              <Button className="bg-gradient-eco">Browse Products</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.products.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                      alt={item.products.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.products.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          <Leaf className="h-3 w-3 mr-1" />
                          {item.products.co2_saved}kg CO₂ saved
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {item.products.green_points} pts
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-primary">₹{item.products.price}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24 space-y-4">
                <h2 className="text-2xl font-bold">Order Summary</h2>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Plant a tree donation</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDonationAmount(Math.max(0, donationAmount - 10))}
                      >
                        -
                      </Button>
                      <span className="font-medium w-12 text-center">₹{donationAmount}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDonationAmount(donationAmount + 10)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>

                {/* Impact Summary */}
                <Card className="p-4 bg-gradient-card">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-eco-verified" />
                    Your Impact
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CO₂ Saved</span>
                      <span className="font-medium text-eco-verified">
                        {totalCO2Saved.toFixed(1)}kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Green Points</span>
                      <span className="font-medium text-eco-badge">{totalGreenPoints}</span>
                    </div>
                  </div>
                </Card>

                <Button
                  size="lg"
                  className="w-full bg-gradient-eco hover:opacity-90"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Mock Payment Gateway (Test Mode)
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
