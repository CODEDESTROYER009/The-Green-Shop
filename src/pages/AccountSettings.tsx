import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { productImages } from "@/assets/products";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product_id: string;
  products: {
    title: string;
    image: string | null;
  };
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  subtotal: number;
  donation_amount: number;
  status: string;
  green_points_earned: number;
  co2_saved: number;
  order_items?: OrderItem[];
}

const AccountSettings = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchUserProfile();
    fetchOrders();
    fetchCartCount();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();
    
    if (error) {
      console.error("Failed to load profile:", error);
    } else if (data) {
      setFullName(data.full_name || "");
      setEmail(data.email);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          product_id,
          products (
            title,
            image
          )
        )
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Failed to load orders:", error);
    } else {
      setOrders(data || []);
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", session.user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error("Failed to change password");
    } else {
      toast.success("Password changed successfully");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar cartItemsCount={cartCount} />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartItemsCount={cartCount} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Account Settings</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
              <Separator className="mb-6" />
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>
                <Button type="submit" className="bg-gradient-eco">
                  Update Profile
                </Button>
              </form>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Change Password</h2>
              <Separator className="mb-6" />
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button type="submit" className="bg-gradient-eco">
                  Change Password
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Order History</h2>
              <Separator className="mb-4" />
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No orders yet</p>
                  <Button onClick={() => navigate("/products")} className="bg-gradient-eco">
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <Card key={order.id} className="p-6 bg-gradient-card">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg mb-1">Order {order.order_number}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Badge className="bg-eco-verified capitalize">{order.status}</Badge>
                      </div>

                      <Separator className="my-4" />

                      {/* Order Items */}
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="space-y-3 mb-4">
                          <h4 className="font-semibold text-sm text-muted-foreground">Products</h4>
                          {order.order_items.map((item) => {
                            const imageUrl = item.products?.image 
                              ? (productImages[item.products.image as keyof typeof productImages] || item.products.image)
                              : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
                            
                            return (
                              <div key={item.id} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                                <img
                                  src={imageUrl}
                                  alt={item.products?.title || 'Product'}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              <div className="flex-1">
                                <p className="font-medium">{item.products?.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  Quantity: {item.quantity} × ₹{item.price}
                                </p>
                              </div>
                                <p className="font-semibold">₹{(item.quantity * item.price).toFixed(2)}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <Separator className="my-4" />

                      {/* Price Breakdown */}
                      <div className="space-y-2 mb-4">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Price Breakdown</h4>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>₹{order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Plant a tree donation</span>
                          <span>₹{order.donation_amount.toFixed(2)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>₹{order.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      {/* Impact Summary */}
                      <div className="bg-background/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-3">Environmental Impact</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">CO₂ Saved</p>
                            <p className="text-lg font-bold text-eco-verified">
                              {order.co2_saved.toFixed(1)}kg
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Green Points Earned</p>
                            <p className="text-lg font-bold text-eco-badge">
                              +{order.green_points_earned}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountSettings;
