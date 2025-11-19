import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const LocationPermission = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    checkPermission();
  }, []);

  useEffect(() => {
    if (permissionStatus === "granted" && user) {
      startLocationTracking();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [permissionStatus, user]);

  const checkPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      setPermissionStatus(result.state);

      result.addEventListener("change", () => {
        setPermissionStatus(result.state);
      });
    } catch (error) {
      console.error("Error checking location permission:", error);
    }
  };

  const requestPermission = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermissionStatus("granted");
        updateLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        setPermissionStatus("denied");
      },
      { enableHighAccuracy: true }
    );
  };

  const startLocationTracking = () => {
    const id = navigator.geolocation.watchPosition(
      (position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Error watching location:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );
    setWatchId(id);
  };

  const updateLocation = async (latitude: number, longitude: number) => {
    if (!user) return;

    try {
      await supabase.from("driver_locations").insert({
        driver_id: user.id,
        latitude,
        longitude,
      });
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  if (permissionStatus === "granted") {
    return null;
  }

  return (
    <Alert variant={permissionStatus === "denied" ? "destructive" : "default"} className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Location Permission Required</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>
          Location access is required for assigning nearest alerts. The app needs "Allow location
          access all the time" so your location updates even when the app is minimized.
        </p>
        {permissionStatus !== "denied" && (
          <Button onClick={requestPermission} size="sm" className="mt-2">
            <MapPin className="mr-2 h-4 w-4" />
            Enable Location
          </Button>
        )}
        {permissionStatus === "denied" && (
          <p className="text-sm font-medium">
            Please enable location permission in your device settings.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
};
