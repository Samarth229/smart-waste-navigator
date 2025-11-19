import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LocationPermission } from "@/components/LocationPermission";
import { WorkToggle } from "@/components/WorkToggle";
import { AlertCard } from "@/components/AlertCard";
import { Menu, Bell, History, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";

const Home = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAlerts();
      subscribeToAlerts();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchAlerts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("alerts")
        .select(`
          *,
          dustbins (
            id,
            name,
            address,
            latitude,
            longitude
          )
        `)
        .eq("driver_id", user.id)
        .in("status", ["assigned", "accepted"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const subscribeToAlerts = () => {
    const channel = supabase
      .channel("alerts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts",
          filter: `driver_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log("Alert change:", payload);
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAcceptAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("alerts")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) throw error;
      fetchAlerts();
    } catch (error) {
      console.error("Error accepting alert:", error);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src={profile?.profile_image_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {profile?.full_name?.charAt(0) || "D"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{profile?.full_name || "Driver"}</p>
              <p className="text-xs text-muted-foreground">ID: {profile?.id_number}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/last-work")}>
                <History className="mr-2 h-4 w-4" />
                Last Work
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/alerts")}>
                <Bell className="mr-2 h-4 w-4" />
                Latest Alerts
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        <LocationPermission />

        <WorkToggle />

        {/* Map Placeholder */}
        <Card className="p-6 bg-muted/50 border-dashed min-h-[300px] flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-4xl">🗺️</div>
            <p className="text-muted-foreground font-medium">Interactive Map</p>
            <p className="text-sm text-muted-foreground">
              Shows dustbins and your real-time location
            </p>
          </div>
        </Card>

        {/* Active Alerts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Active Alerts</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/alerts")}
            >
              View All
            </Button>
          </div>

          {alerts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No active alerts</p>
              <p className="text-sm text-muted-foreground mt-1">
                New alerts will appear here when available
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <AlertCard
                  key={alert.id}
                  id={alert.id}
                  dustbinName={alert.dustbins?.name || "Unknown Dustbin"}
                  dustbinAddress={alert.dustbins?.address || ""}
                  latitude={alert.dustbins?.latitude || 0}
                  longitude={alert.dustbins?.longitude || 0}
                  distance={alert.distance_km}
                  status={alert.status}
                  createdAt={alert.created_at}
                  onAccept={() => handleAcceptAlert(alert.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
