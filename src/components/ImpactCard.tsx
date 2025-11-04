import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ImpactCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle: string;
  iconColor?: string;
}

const ImpactCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  iconColor = "text-eco-verified",
}: ImpactCardProps) => {
  return (
    <Card className="p-6 bg-gradient-card hover:shadow-card-eco transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-secondary ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </Card>
  );
};

export default ImpactCard;
