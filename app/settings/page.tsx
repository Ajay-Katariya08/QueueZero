"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, Shield, Navigation, Moon, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const [notifyDrop, setNotifyDrop] = useState(true);
  const [anonMode, setAnonMode] = useState(true);
  const [geoRadius, setGeoRadius] = useState(5);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 flex flex-col gap-6">
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Preferences & Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure queue alerts, privacy options, and operational notifications.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Bell className="size-4 text-primary" />
              Real-Time Push Notifications
            </CardTitle>
            <CardDescription className="text-xs">
              Receive background alerts when queues drop below critical thresholds.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold block text-foreground">Queue Drop Alerts</span>
                <span className="text-muted-foreground text-[11px]">
                  Notify when a watched clinic or counter wait time drops by 50%
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyDrop}
                onChange={(e) => setNotifyDrop(e.target.checked)}
                className="size-4 accent-primary cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              Privacy & Crowdsourcing
            </CardTitle>
            <CardDescription className="text-xs">
              Manage how your observations are published to the network.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold block text-foreground">Default Anonymous Reporting</span>
                <span className="text-muted-foreground text-[11px]">
                  Strip username and IP metadata from all submitted queue observations
                </span>
              </div>
              <input
                type="checkbox"
                checked={anonMode}
                onChange={(e) => setAnonMode(e.target.checked)}
                className="size-4 accent-primary cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Navigation className="size-4 text-primary" />
              Geolocation Radar Radius
            </CardTitle>
            <CardDescription className="text-xs">
              Default perimeter for finding nearby live places.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex flex-col gap-2 text-xs">
            <div className="flex justify-between items-center font-semibold">
              <span>Perimeter distance</span>
              <span className="text-primary font-mono">{geoRadius} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              value={geoRadius}
              onChange={(e) => setGeoRadius(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Moon className="size-4 text-primary" />
              Display Theme
            </CardTitle>
            <CardDescription className="text-xs">
              Toggle between light and dark modes via @wrksz/themes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Toggle Color Scheme</span>
            <ThemeToggle />
          </CardContent>
        </Card>

        <Button onClick={handleSave} size="lg" className="w-full gap-2 text-xs font-semibold">
          {saved ? <CheckCircle className="size-4" /> : null}
          {saved ? "Preferences Saved!" : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
}
