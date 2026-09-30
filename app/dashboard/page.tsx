"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { type VenueItem, type ServicePointItem } from "@/lib/venue-types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Radio,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  Save,
  Users,
  Clock,
  ShieldCheck,
  Building2,
  Lock,
  ExternalLink,
  PlusCircle,
  FileCheck2,
  Trash2,
} from "lucide-react";

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export default function BusinessDashboard() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [userVenues, setUserVenues] = useState<VenueItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeVenue = userVenues.find((v) => v.slug === selectedSlug) || userVenues[0] || null;
  const [servicePoints, setServicePoints] = useState<ServicePointItem[]>([]);
  const [alertText, setAlertText] = useState("");

  const [registerForm, setRegisterForm] = useState({
    name: "",
    category: "clinic" as VenueItem["category"],
    address: "",
    city: "Mumbai",
    gstNumber: "",
    businessPhone: "",
    counters: "Patient Registration, Consultation Desk, Billing & Pharmacy",
  });
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  const [claimForm, setClaimForm] = useState({
    slug: "",
    gstNumber: "",
    businessPhone: "",
  });
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimLoading, setClaimLoading] = useState(false);

  useEffect(() => {
    async function fetchUserVenues() {
      if (!isSignedIn || !user) {
        setLoadingVenues(false);
        return;
      }

      setLoadingVenues(true);
      try {
        const res = await fetch(`/api/venues?ownerId=${user.id}`);
        if (res.ok) {
          const json = await res.json();
          const rawVenues: VenueItem[] = json.data || [];
          const venues: VenueItem[] = rawVenues.map((v) => ({
            ...v,
            id: v._id || v.id,
            servicePoints: (v.servicePoints || []).map((sp, i) => ({
              ...sp,
              id: String(sp._id || sp.id || `sp-${i}`),
              _id: String(sp._id || sp.id || `sp-${i}`),
            })),
          }));
          setUserVenues(venues);
          if (venues.length > 0) {
            setSelectedSlug(venues[0].slug);
            setServicePoints(venues[0].servicePoints || []);
            setAlertText(venues[0].statusText || "");
          }
        }
      } catch {
      } finally {
        setLoadingVenues(false);
      }
    }

    if (isLoaded) {
      fetchUserVenues();
    }
  }, [isSignedIn, isLoaded, user]);

  useEffect(() => {
    if (activeVenue) {
      const normalizedSPs = (activeVenue.servicePoints || []).map((sp, i) => ({
        ...sp,
        id: String(sp.id || sp._id || `sp-${i}`),
        _id: String(sp._id || sp.id || `sp-${i}`),
      }));
      setServicePoints(normalizedSPs);
      setAlertText(activeVenue.statusText || "");
    }
  }, [activeVenue]);

  const showFeedback = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const updateCount = (id: string, delta: number) => {
    setServicePoints((prev) =>
      prev.map((sp) => {
        const currentId = String(sp.id || sp._id);
        if (currentId !== id) return sp;
        const newCount = Math.max(0, (sp.currentQueueCount || 0) + delta);
        return {
          ...sp,
          currentQueueCount: newCount,
          estimatedWaitMinutes: Math.max(0, Math.round(newCount * 2.2)),
        };
      }),
    );
  };

  const toggleStatus = (id: string) => {
    setServicePoints((prev) =>
      prev.map((sp) => {
        const currentId = String(sp.id || sp._id);
        if (currentId !== id) return sp;
        const nextStatus =
          sp.status === "open"
            ? "delayed"
            : sp.status === "delayed"
              ? "busy"
              : "open";
        return { ...sp, status: nextStatus };
      }),
    );
  };

  const addCounter = () => {
    const newId = `sp-${Date.now()}`;
    const nextName = `Counter ${servicePoints.length + 1}`;
    setServicePoints((prev) => [
      ...prev,
      {
        id: newId,
        name: nextName,
        type: "counter",
        currentQueueCount: 0,
        estimatedWaitMinutes: 0,
        status: "open",
        delayMinutes: 0,
      },
    ]);
    showFeedback(`Added new counter: ${nextName}`);
  };

  const removeCounter = (id: string) => {
    if (servicePoints.length <= 1) {
      showFeedback("A facility must have at least one counter.");
      return;
    }
    setServicePoints((prev) =>
      prev.filter((sp) => String(sp.id || sp._id) !== id),
    );
    showFeedback("Counter removed. Publish changes to sync.");
  };

  const handlePublishChanges = async () => {
    if (!activeVenue) return;
    setSaving(true);
    const totalWaiting = servicePoints.reduce(
      (sum, p) => sum + p.currentQueueCount,
      0,
    );
    const avgWait = Math.round(
      servicePoints.reduce((sum, p) => sum + p.estimatedWaitMinutes, 0) /
        (servicePoints.length || 1),
    );

    try {
      await fetch(`/api/venues/${activeVenue.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statusText: alertText,
          totalWaitingCount: totalWaiting,
          averageWaitMinutes: avgWait,
          servicePoints,
        }),
      });

      setUserVenues((prev) =>
        prev.map((v) =>
          v.slug === activeVenue.slug
            ? {
                ...v,
                statusText: alertText,
                totalWaitingCount: totalWaiting,
                averageWaitMinutes: avgWait,
                servicePoints,
              }
            : v,
        ),
      );

      setSaved(true);
      showFeedback("Live counter telemetry published to citizen radar!");
      setTimeout(() => setSaved(false), 2500);
    } catch {
      showFeedback("Failed to publish telemetry");
    } finally {
      setSaving(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    const gstClean = registerForm.gstNumber.trim().toUpperCase();
    if (!GST_REGEX.test(gstClean)) {
      setRegisterError("Enter a valid 15-digit GSTIN (e.g. 27AAPFU0939L1ZV).");
      return;
    }

    setRegisterLoading(true);
    try {
      const countersArray = registerForm.counters
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerForm.name,
          category: registerForm.category,
          address: registerForm.address,
          city: registerForm.city,
          gstNumber: gstClean,
          businessPhone: registerForm.businessPhone,
          counters: countersArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register facility");
      }

      const created: VenueItem = {
        id: data.data._id || data.data.id,
        slug: data.data.slug,
        name: data.data.name,
        category: data.data.category,
        address: data.data.address,
        city: data.data.city,
        totalWaitingCount: 0,
        averageWaitMinutes: 0,
        statusText: "Operational",
        isVerified: true,
        isPublished: true,
        gstNumber: gstClean,
        businessPhone: registerForm.businessPhone,
        ownerId: user?.id,
        servicePoints: (data.data.servicePoints || []).map(
          (sp: { _id?: string; id?: string; name: string; type?: ServicePointItem["type"] }, i: number) => ({
            id: sp._id || sp.id || `sp-${i}`,
            _id: sp._id || sp.id || `sp-${i}`,
            name: sp.name,
            type: sp.type || "counter",
            currentQueueCount: 0,
            estimatedWaitMinutes: 0,
            status: "open",
            delayMinutes: 0,
          }),
        ),
      };

      setUserVenues((prev) => [created, ...prev]);
      setSelectedSlug(created.slug);
      setServicePoints(created.servicePoints);
      setAlertText(created.statusText);
      setRegisterModalOpen(false);
      setRegisterForm({
        name: "",
        category: "clinic",
        address: "",
        city: "Mumbai",
        gstNumber: "",
        businessPhone: "",
        counters: "Patient Registration, Consultation Desk, Billing & Pharmacy",
      });
      showFeedback(`Facility "${created.name}" registered and published live!`);
    } catch (err) {
      setRegisterError((err as Error).message);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError(null);

    const gstClean = claimForm.gstNumber.trim().toUpperCase();
    if (!GST_REGEX.test(gstClean)) {
      setClaimError("Enter a valid 15-digit GSTIN (e.g. 27AAPFU0939L1ZV).");
      return;
    }

    setClaimLoading(true);
    try {
      const res = await fetch(`/api/venues/${claimForm.slug}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gstNumber: gstClean,
          businessPhone: claimForm.businessPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Claim verification failed");
      }

      const claimedVenue = data.data;
      setUserVenues((prev) => [claimedVenue, ...prev]);
      setSelectedSlug(claimedVenue.slug);
      setClaimModalOpen(false);
      showFeedback("Facility claimed and verified with GST!");
    } catch (err) {
      setClaimError((err as Error).message);
    } finally {
      setClaimLoading(false);
    }
  };

  if (!isLoaded || loadingVenues) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-muted-foreground font-medium">Loading operator console...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 flex flex-col items-center text-center gap-6">
        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
          <Lock className="size-8" />
        </div>
        <div>
          <Badge variant="outline" className="mb-2 text-[10px] text-primary border-primary/30">
            Authorized Personnel Only
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Verified Facility Operator Portal
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Public citizens can observe and report queues anonymously. Official counter telemetry and broadcast announcements require an authenticated business account verified with 15-digit GSTIN.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <SignInButton mode="modal">
            <Button size="lg" className="w-full sm:w-auto gap-2 text-xs font-semibold">
              <ShieldCheck className="size-4" />
              Sign In to Your Facility
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-xs font-semibold">
              <Building2 className="size-4" />
              Register New Business Account
            </Button>
          </SignUpButton>
        </div>
      </div>
    );
  }

  if (userVenues.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 flex flex-col gap-6">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle className="size-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <Card className="border-border">
          <CardHeader className="text-center pb-2">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-2 shadow-xs">
              <Building2 className="size-7" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black">
              Welcome, {user?.firstName || "Facility Operator"}!
            </CardTitle>
            <CardDescription className="text-xs max-w-md mx-auto">
              You haven&apos;t registered any facilities yet. Complete the 15-digit GSTIN verification to publish live queue counters to citizens.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => setRegisterModalOpen(true)}
              className="gap-2 text-xs font-semibold shadow-sm"
            >
              <Building2 className="size-4" />
              Register & Publish Facility Now
            </Button>

            <p className="text-[11px] text-muted-foreground">
              Verification is instantaneous with a valid GSTIN format.
            </p>
          </CardContent>
        </Card>

        <Dialog open={registerModalOpen} onOpenChange={setRegisterModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Building2 className="size-4 text-primary" />
                Register & Publish Facility
              </DialogTitle>
              <DialogDescription className="text-xs">
                Provide official business credentials including 15-character GSTIN to gain authorized telemetry control.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3 mt-2 text-xs">
              {registerError && (
                <div className="p-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-[11px]">
                  {registerError}
                </div>
              )}

              <div>
                <label className="font-semibold block mb-1">Facility Name *</label>
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder="e.g. Apex Multispecialty Clinic"
                  className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Category *</label>
                  <select
                    value={registerForm.category}
                    onChange={(e) => setRegisterForm({ ...registerForm, category: e.target.value as VenueItem["category"] })}
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="clinic">Clinic / Hospital</option>
                    <option value="bank">Bank / Financial</option>
                    <option value="government">Government Office</option>
                    <option value="passport">Passport / Visa</option>
                    <option value="salon">Salon / Spa</option>
                    <option value="repair">Device Care / Repair</option>
                    <option value="restaurant">Restaurant</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={registerForm.city}
                    onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  15-Digit GST Number (GSTIN) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={registerForm.gstNumber}
                    onChange={(e) => setRegisterForm({ ...registerForm, gstNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. 27AAPFU0939L1ZV"
                    className="w-full h-8 rounded-md border border-input bg-background px-3 font-mono uppercase text-xs"
                  />
                  {GST_REGEX.test(registerForm.gstNumber.trim().toUpperCase()) && (
                    <CheckCircle className="size-3.5 text-emerald-500 absolute right-2.5 top-2.5" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Format: 2-digit State + 10-char PAN + 1 Entity + Z + 1 Check digit
                </span>
              </div>

              <div>
                <label className="font-semibold block mb-1">Business Phone / Contact</label>
                <input
                  type="tel"
                  value={registerForm.businessPhone}
                  onChange={(e) => setRegisterForm({ ...registerForm, businessPhone: e.target.value })}
                  placeholder="+91 98200 12345"
                  className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Full Street Address *</label>
                <input
                  type="text"
                  required
                  value={registerForm.address}
                  onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                  placeholder="e.g. 420 MG Road, Sector 5"
                  className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Initial Service Counters (comma-separated)</label>
                <input
                  type="text"
                  value={registerForm.counters}
                  onChange={(e) => setRegisterForm({ ...registerForm, counters: e.target.value })}
                  placeholder="Registration, Doctor OPD, Pathology, Billing"
                  className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRegisterModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={registerLoading}
                  className="text-xs font-semibold gap-1.5"
                >
                  <ShieldCheck className="size-3.5" />
                  {registerLoading ? "Verifying..." : "Verify GST & Publish"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 flex flex-col gap-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="size-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="text-[10px] text-primary border-primary/30"
            >
              Operator Telemetry Console
            </Badge>

            {activeVenue.isVerified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                <ShieldCheck className="size-3" />
                GSTIN Verified: {activeVenue.gstNumber}
              </span>
            )}

            <span className="flex items-center gap-1.5 text-[11px] text-emerald-950 dark:text-emerald-200 font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full">
              <Radio className="size-3 animate-pulse text-emerald-600 dark:text-emerald-400" />
              Live Broadcast Active
            </span>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {activeVenue.name}
            </h1>
            <Link
              href={`/venue/${activeVenue.slug}`}
              target="_blank"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
              title="View Public Live Page"
            >
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeVenue.address}, {activeVenue.city} • Official facility control room
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userVenues.length > 1 && (
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs max-w-[200px]"
            >
              {userVenues.map((v) => (
                <option key={v.slug} value={v.slug}>
                  {v.name}
                </option>
              ))}
            </select>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setRegisterModalOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Building2 className="size-3.5" />
            Register Another Facility
          </Button>

          <Button
            onClick={handlePublishChanges}
            disabled={saving}
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            {saved ? (
              <CheckCircle className="size-3.5" />
            ) : (
              <Save className="size-3.5" />
            )}
            {saving ? "Publishing..." : saved ? "Published Live!" : "Publish Changes"}
          </Button>
        </div>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <AlertTriangle className="size-5 text-amber-500 shrink-0" />
          <div className="flex-1 w-full">
            <label className="text-xs font-bold block mb-1">
              Live Citizen Broadcast Banner (Displayed prominently on Radar & Predictions):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={alertText}
                onChange={(e) => setAlertText(e.target.value)}
                placeholder="e.g. Doctor running 20m late due to emergency surgery"
                className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handlePublishChanges}
                className="text-xs shrink-0 h-8"
              >
                Broadcast
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight">Active Service Counters</h2>
          <p className="text-xs text-muted-foreground">
            Manage queue counts, doctor delays, and counter operational status.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={addCounter}
          className="gap-1.5 text-xs font-semibold"
        >
          <PlusCircle className="size-3.5" />
          Add Counter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {servicePoints.map((sp, idx) => {
          const spKey = String(sp.id || sp._id || `sp-${idx}`);
          return (
            <Card key={spKey} className="border-border">
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">{sp.name}</CardTitle>
                  <CardDescription className="text-xs capitalize">
                    Counter Type: {sp.type}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleStatus(spKey)}
                    className="cursor-pointer"
                  >
                    <Badge
                      variant={
                        sp.status === "open"
                          ? "success"
                          : sp.status === "delayed"
                            ? "warning"
                            : "destructive"
                      }
                      className="capitalize text-[10px]"
                    >
                      Status: {sp.status}
                    </Badge>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeCounter(spKey)}
                    title="Remove Counter"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                      <Users className="size-3" /> Waiting in Line
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="size-7 p-0"
                        onClick={() => updateCount(spKey, -1)}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="text-base font-black font-mono">
                        {sp.currentQueueCount}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="size-7 p-0"
                        onClick={() => updateCount(spKey, 1)}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>

                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                    <Clock className="size-3" /> Duration Forecast
                  </span>
                  <p className="text-base font-black font-mono text-primary mt-2">
                    {sp.estimatedWaitMinutes} min
                  </p>
                </div>
              </div>

              {sp.status === "delayed" && (
                <div className="flex items-center gap-2 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 p-2 rounded-md">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  <span>
                    Counter delayed: +{sp.delayMinutes || 15}m added to visitor wait times
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
          );
        })}
      </div>

      <Dialog open={registerModalOpen} onOpenChange={setRegisterModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4 text-primary" />
              Register & Publish Facility
            </DialogTitle>
            <DialogDescription className="text-xs">
              Provide official business credentials including 15-character GSTIN to gain authorized telemetry control.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3 mt-2 text-xs">
            {registerError && (
              <div className="p-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-[11px]">
                {registerError}
              </div>
            )}

            <div>
              <label className="font-semibold block mb-1">Facility Name *</label>
              <input
                type="text"
                required
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                placeholder="e.g. Apex Multispecialty Clinic"
                className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold block mb-1">Category *</label>
                <select
                  value={registerForm.category}
                  onChange={(e) => setRegisterForm({ ...registerForm, category: e.target.value as VenueItem["category"] })}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="clinic">Clinic / Hospital</option>
                  <option value="bank">Bank / Financial</option>
                  <option value="government">Government Office</option>
                  <option value="passport">Passport / Visa</option>
                  <option value="salon">Salon / Spa</option>
                  <option value="repair">Device Care / Repair</option>
                  <option value="restaurant">Restaurant</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={registerForm.city}
                  onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                  placeholder="e.g. Mumbai"
                  className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">
                15-Digit GST Number (GSTIN) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={registerForm.gstNumber}
                  onChange={(e) => setRegisterForm({ ...registerForm, gstNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. 27AAPFU0939L1ZV"
                  className="w-full h-8 rounded-md border border-input bg-background px-3 font-mono uppercase text-xs"
                />
                {GST_REGEX.test(registerForm.gstNumber.trim().toUpperCase()) && (
                  <CheckCircle className="size-3.5 text-emerald-500 absolute right-2.5 top-2.5" />
                )}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Format: 2-digit State + 10-char PAN + 1 Entity + Z + 1 Check digit
              </span>
            </div>

            <div>
              <label className="font-semibold block mb-1">Business Phone / Contact</label>
              <input
                type="tel"
                value={registerForm.businessPhone}
                onChange={(e) => setRegisterForm({ ...registerForm, businessPhone: e.target.value })}
                placeholder="+91 98200 12345"
                className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Full Street Address *</label>
              <input
                type="text"
                required
                value={registerForm.address}
                onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                placeholder="e.g. 420 MG Road, Sector 5"
                className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Initial Service Counters (comma-separated)</label>
              <input
                type="text"
                value={registerForm.counters}
                onChange={(e) => setRegisterForm({ ...registerForm, counters: e.target.value })}
                placeholder="Registration, Doctor OPD, Pathology, Billing"
                className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRegisterModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={registerLoading}
                className="text-xs font-semibold gap-1.5"
              >
                <ShieldCheck className="size-3.5" />
                {registerLoading ? "Verifying..." : "Verify GST & Publish"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
