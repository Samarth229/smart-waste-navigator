import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Clock, Image as ImageIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

const LastWork = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [workHistory, setWorkHistory] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchWorkHistory();
    }
  }, [user]);

  const fetchWorkHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("work_history")
        .select(`
          *,
          dustbins (
            name,
            address,
            latitude,
            longitude
          )
        `)
        .eq("driver_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setWorkHistory(data || []);
    } catch (error) {
      console.error("Error fetching work history:", error);
    } finally {
      setLoadingData(false);
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
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Last Work</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-4">
        {workHistory.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No work history yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Completed work will appear here
            </p>
          </Card>
        ) : (
          workHistory.map((work) => (
            <Card key={work.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold">
                      {work.dustbins?.name || "Unknown Location"}
                    </h3>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">
                        {work.dustbins?.address || "Address unavailable"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(work.completed_at), "MMM dd, yyyy HH:mm")}
                    </span>
                  </div>
                  {work.work_duration_minutes && (
                    <span>Duration: {work.work_duration_minutes} min</span>
                  )}
                </div>

                {work.photo_url && (
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={work.photo_url}
                      alt="Work completion photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {!work.photo_url && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    <ImageIcon className="h-4 w-4" />
                    <span>Photo not available</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
};

export default LastWork;
