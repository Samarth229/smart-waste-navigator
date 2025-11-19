import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AlertCardProps {
  id: string;
  dustbinName: string;
  dustbinAddress: string;
  latitude: number;
  longitude: number;
  distance?: number;
  status: string;
  createdAt: string;
  onAccept?: () => void;
  onNavigate?: () => void;
}

export const AlertCard = ({
  dustbinName,
  dustbinAddress,
  latitude,
  longitude,
  distance,
  status,
  createdAt,
  onAccept,
  onNavigate,
}: AlertCardProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning">Pending</Badge>;
      case "assigned":
        return <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary">Assigned</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary">Accepted</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-success/10 text-success border-success">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, "_blank");
    onNavigate?.();
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{dustbinName}</h3>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{dustbinAddress || "Location unavailable"}</span>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="flex items-center justify-between text-sm">
          {distance && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Navigation className="h-4 w-4" />
              <span>{distance.toFixed(1)} km away</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        {status === "assigned" && onAccept && (
          <Button onClick={onAccept} className="flex-1">
            Accept Alert
          </Button>
        )}
        {(status === "accepted" || status === "assigned") && (
          <Button
            onClick={openGoogleMaps}
            variant="outline"
            className="flex-1"
          >
            <Navigation className="mr-2 h-4 w-4" />
            Navigate
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
