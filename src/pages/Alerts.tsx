import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Loader2 } from "lucide-react";
import { AlertCard } from "@/components/AlertCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Alerts = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAlerts();
      subscribeToAlerts();
    }
  }, [user]);

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
      .channel("alerts-page-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts",
          filter: `driver_id=eq.${user?.id}`,
        },
        () => {
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

  const activeAlerts = alerts.filter((a) =>
    ["assigned", "accepted"].includes(a.status)
  );
  const completedAlerts = alerts.filter((a) => a.status === "completed");
  const allAlerts = alerts;

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
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Alerts</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="active">
              Active ({activeAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({allAlerts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeAlerts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No active alerts</p>
              </Card>
            ) : (
              activeAlerts.map((alert) => (
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
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedAlerts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No completed alerts</p>
              </Card>
            ) : (
              completedAlerts.map((alert) => (
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
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {allAlerts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No alerts</p>
              </Card>
            ) : (
              allAlerts.map((alert) => (
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
                  onAccept={
                    alert.status === "assigned"
                      ? () => handleAcceptAlert(alert.id)
                      : undefined
                  }
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Alerts;
