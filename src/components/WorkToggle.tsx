import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const WorkToggle = () => {
  const [isWorking, setIsWorking] = useState(false);
  const [workHours, setWorkHours] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchWorkStatus();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorking) {
      interval = setInterval(() => {
        setWorkHours((prev) => prev + 1);
      }, 60000); // Update every minute
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorking]);

  const fetchWorkStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_working, work_hours_today")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setIsWorking(data.is_working || false);
        setWorkHours(data.work_hours_today || 0);
      }
    } catch (error) {
      console.error("Error fetching work status:", error);
    }
  };

  const toggleWorkStatus = async (checked: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_working: checked,
          last_toggle_time: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setIsWorking(checked);
      toast({
        title: checked ? "Work mode ON" : "Work mode OFF",
        description: checked
          ? "You are now available for alerts"
          : "You are on break. Alerts will go to other drivers.",
      });
    } catch (error) {
      console.error("Error toggling work status:", error);
      toast({
        title: "Error",
        description: "Failed to update work status",
        variant: "destructive",
      });
    }
  };

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch
            id="work-toggle"
            checked={isWorking}
            onCheckedChange={toggleWorkStatus}
            className="data-[state=checked]:bg-success"
          />
          <div>
            <Label htmlFor="work-toggle" className="text-base font-semibold cursor-pointer">
              {isWorking ? "ON DUTY" : "ON BREAK"}
            </Label>
            <p className="text-sm text-muted-foreground">
              {isWorking ? "Receiving alerts" : "Not receiving alerts"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">Today: {formatHours(workHours)}</span>
      </div>
    </Card>
  );
};
