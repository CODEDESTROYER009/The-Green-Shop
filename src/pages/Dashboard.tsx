import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ImpactCard from "@/components/ImpactCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Leaf, Droplet, TreePine, Award, TrendingUp, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserStats {
  total_orders: number;
  green_points: number;
  co2_saved: number;
  plastic_reduced: number;
  water_saved: number;
  trees_funded: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [userStats, setUserStats] = useState<UserStats>({
    total_orders: 0,
    green_points: 0,
    co2_saved: 0,
    plastic_reduced: 0,
    water_saved: 0,
    trees_funded: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    checkAuth();
    fetchUserProfile();
    fetchUserStats();
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
      .select("full_name")
      .eq("id", session.user.id)
      .maybeSingle();
    
    if (!error && data) {
      setUserName(data.full_name || "User");
    }
  };

  const fetchUserStats = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();
    
    if (error) {
      toast.error("Failed to load stats");
      console.error(error);
    } else if (data) {
      setUserStats({
        total_orders: data.total_orders,
        green_points: data.green_points,
        co2_saved: Number(data.co2_saved),
        plastic_reduced: Number(data.plastic_reduced),
        water_saved: Number(data.water_saved),
        trees_funded: data.trees_funded,
      });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar cartItemsCount={cartCount} />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartItemsCount={cartCount} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Hi {userName}! 👋</h1>
          <p className="text-muted-foreground text-lg">
            Track your environmental contribution and green points
          </p>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ImpactCard
            icon={Leaf}
            title="CO₂ Saved"
            value={`${userStats.co2_saved}kg`}
            subtitle="Equivalent to planting trees"
            iconColor="text-eco-verified"
          />
          <ImpactCard
            icon={Droplet}
            title="Plastic Reduced"
            value={`${userStats.plastic_reduced}kg`}
            subtitle="Single-use plastic avoided"
            iconColor="text-eco-ocean"
          />
          <ImpactCard
            icon={TreePine}
            title="Trees Funded"
            value={userStats.trees_funded}
            subtitle="Through donation contributions"
            iconColor="text-eco-verified"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ImpactCard
            icon={Award}
            title="Green Points"
            value={userStats.green_points}
            subtitle="Available for redemption"
            iconColor="text-eco-badge"
          />
          <ImpactCard
            icon={Package}
            title="Total Orders"
            value={userStats.total_orders}
            subtitle="Eco-friendly purchases"
            iconColor="text-primary"
          />
          <ImpactCard
            icon={Droplet}
            title="Water Saved"
            value={`${userStats.water_saved}L`}
            subtitle="Through sustainable products"
            iconColor="text-eco-ocean"
          />
        </div>

        {/* Points & Rewards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Green Points</h2>
              <Badge className="bg-eco-badge text-lg px-3 py-1">
                {userStats.green_points} pts
              </Badge>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-4">
              <div className="p-4 bg-gradient-card rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">10% Off Next Purchase</span>
                  <Badge variant="outline">100 pts</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Get 10% discount on your next order
                </p>
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-eco"
                  disabled={userStats.green_points < 100}
                  onClick={() => toast.info("Reward redemption coming soon!")}
                >
                  {userStats.green_points >= 100 ? "Redeem Points" : `Need ${100 - userStats.green_points} more`}
                </Button>
              </div>
              <div className="p-4 bg-gradient-card rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Plant 5 Trees</span>
                  <Badge variant="outline">200 pts</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Fund tree plantation in your name
                </p>
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-eco"
                  disabled={userStats.green_points < 200}
                  onClick={() => toast.info("Reward redemption coming soon!")}
                >
                  {userStats.green_points >= 200 ? "Redeem Points" : `Need ${200 - userStats.green_points} more`}
                </Button>
              </div>
              <div className="p-4 bg-gradient-card rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Free Eco Product</span>
                  <Badge variant="outline">500 pts</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Get a free eco-friendly product
                </p>
                <Button 
                  size="sm" 
                  variant={userStats.green_points >= 500 ? "default" : "outline"}
                  className={userStats.green_points >= 500 ? "w-full bg-gradient-eco" : "w-full"}
                  disabled={userStats.green_points < 500}
                  onClick={() => toast.info("Reward redemption coming soon!")}
                >
                  {userStats.green_points >= 500 ? "Redeem Points" : `Need ${500 - userStats.green_points} more`}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-eco-verified" />
              <h2 className="text-2xl font-bold">Your Eco Journey</h2>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-4">
              {userStats.total_orders > 0 && (
                <div className="flex gap-4">
                  <div className="bg-eco-verified text-white p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                    <Leaf className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">First Eco Purchase</p>
                    <p className="text-sm text-muted-foreground">Started your journey!</p>
                  </div>
                </div>
              )}
              {userStats.total_orders >= 10 && (
                <div className="flex gap-4">
                  <div className="bg-eco-badge text-white p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Eco Warrior Badge</p>
                    <p className="text-sm text-muted-foreground">10+ sustainable purchases</p>
                  </div>
                </div>
              )}
              {userStats.trees_funded >= 5 && (
                <div className="flex gap-4">
                  <div className="bg-eco-verified text-white p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                    <TreePine className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Tree Planter</p>
                    <p className="text-sm text-muted-foreground">{userStats.trees_funded} trees funded</p>
                  </div>
                </div>
              )}
              {userStats.total_orders === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Start shopping to unlock achievements!</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
