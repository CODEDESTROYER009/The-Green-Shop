import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Leaf, CheckCircle } from "lucide-react";
import { productImages } from "@/assets/products";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  ecoTags: string[];
  isVerified?: boolean;
  co2Saved: number;
  onAddToCart?: () => void;
}

const ProductCard = ({
  id,
  title,
  price,
  image,
  ecoTags,
  isVerified = false,
  co2Saved,
  onAddToCart,
}: ProductCardProps) => {
  const imageUrl = productImages[image as keyof typeof productImages] || image;
  
  return (
    <Card className="group overflow-hidden hover:shadow-eco transition-all duration-300">
      <Link to={`/product/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-gradient-card">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isVerified && (
            <div className="absolute top-3 right-3 bg-eco-verified text-white p-2 rounded-full shadow-lg">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-3">
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1">
          {ecoTags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Leaf className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-eco-verified">↓ {co2Saved}kg CO₂</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl font-bold text-foreground">₹{price}</span>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.();
            }}
            size="sm"
            className="bg-gradient-eco hover:opacity-90"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
