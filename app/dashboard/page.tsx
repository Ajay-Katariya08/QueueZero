"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { type VenueItem, type ServicePointItem } from "@/lib/venue-types";
import { Button } from "@/components/ui/button";
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
  Activity,
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

  const activeVenue =
    userVenues.find((v) => v.slug === selectedSlug) || userVenues[0] || null;
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
          const venues: VenueItem[] = rawVenues
            .filter((v) => v.ownerId === user.id)
            .map((v) => ({
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
          } else {
            setSelectedSlug("");
            setServicePoints([]);
            setAlertText("");
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
          ownerId: user?.id,
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
          (
            sp: {
              _id?: string;
              id?: string;
              name: string;
              type?: ServicePointItem["type"];
            },
            i: number,
          ) => ({
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
        <div className="size-8 border-2 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-charcoal/70">
          Loading operator console...
        </p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 flex flex-col items-center text-center gap-6">
        <div className="size-16 rounded-[14px] bg-keylime flex items-center justify-center text-forest">
          <Lock className="size-8" />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-forest border border-border-mist mb-3">
            <Lock className="size-3 text-forest" />
            Authorized Personnel Only
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-[-0.02em] text-forest">
            Verified Facility Operator Portal
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/75 mt-2 max-w-lg mx-auto leading-relaxed">
            Public citizens can observe and report queues anonymously. Official
            counter telemetry and broadcast announcements require an
            authenticated business account verified with 15-digit GSTIN.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <SignInButton mode="modal">
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2 text-sm font-normal rounded-[14px] bg-forest text-cream hover:bg-forest-shadow border-0 h-11 px-7"
            >
              <ShieldCheck className="size-4" />
              Sign In to Your Facility
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gap-2 text-sm font-normal rounded-[14px] border border-border-mist bg-cream text-forest hover:bg-mint h-11 px-7"
            >
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
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-[14px] bg-forest text-cream px-4 py-2.5 text-xs font-normal border border-forest">
            <CheckCircle className="size-4 shrink-0 text-sage" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="rounded-[14px] bg-keylime p-8 text-center flex flex-col items-center">
          <div className="size-14 rounded-full bg-mint flex items-center justify-center text-forest mx-auto mb-3">
            <Building2 className="size-7" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-light tracking-[-0.02em] text-forest">
            Welcome, {user?.firstName || "Facility Operator"}!
          </h2>
          <p className="text-xs sm:text-sm text-charcoal/80 max-w-md mx-auto mt-2 mb-6 leading-relaxed">
            You haven&apos;t registered any facilities yet. Complete the
            15-digit GSTIN verification to publish live queue counters to
            citizens.
          </p>

          <Button
            size="lg"
            onClick={() => setRegisterModalOpen(true)}
            className="rounded-[14px] bg-forest hover:bg-forest-shadow text-cream px-6 h-11 gap-2 text-xs font-normal border-0"
          >
            <Building2 className="size-4" />
            Register & Publish Facility Now
          </Button>

          <p className="text-[11px] text-charcoal/60 mt-4">
            Verification is instantaneous with a valid GSTIN format.
          </p>
        </div>

        <Dialog open={registerModalOpen} onOpenChange={setRegisterModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Building2 className="size-4 text-primary" />
                Register & Publish Facility
              </DialogTitle>
              <DialogDescription className="text-xs">
                Provide official business credentials including 15-character
                GSTIN to gain authorized telemetry control.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleRegisterSubmit}
              className="flex flex-col gap-3 mt-2 text-xs"
            >
              {registerError && (
                <div className="p-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-[11px]">
                  {registerError}
                </div>
              )}

              <div>
                <label className="font-semibold block mb-1">
                  Facility Name *
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, name: e.target.value })
                  }
                  placeholder="e.g. Apex Multispecialty Clinic"
                  className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Category *</label>
                  <select
                    value={registerForm.category}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        category: e.target.value as VenueItem["category"],
                      })
                    }
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
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, city: e.target.value })
                    }
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
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        gstNumber: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. 27AAPFU0939L1ZV"
                    className="w-full h-8 rounded-md border border-input bg-background px-3 font-mono uppercase text-xs"
                  />
                  {GST_REGEX.test(
                    registerForm.gstNumber.trim().toUpperCase(),
                  ) && (
                    <CheckCircle className="size-3.5 text-emerald-500 absolute right-2.5 top-2.5" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Format: 2-digit State + 10-char PAN + 1 Entity + Z + 1 Check
                  digit
                </span>
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Business Phone / Contact
                </label>
                <input
                  type="tel"
                  value={registerForm.businessPhone}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      businessPhone: e.target.value,
                    })
                  }
                  placeholder="+91 98200 12345"
                  className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Full Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.address}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      address: e.target.value,
                    })
                  }
                  placeholder="e.g. 420 MG Road, Sector 5"
                  className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Initial Service Counters (comma-separated)
                </label>
                <input
                  type="text"
                  value={registerForm.counters}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      counters: e.target.value,
                    })
                  }
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-8 bg-cream">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-[14px] bg-forest text-cream px-4 py-3 text-xs font-normal border border-forest animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="size-4 shrink-0 text-sage" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-mist">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-forest border border-border-mist">
              <Activity className="size-3.5 text-forest" />
              Operator Telemetry Console
            </span>

            {activeVenue.isVerified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-keylime px-3 py-1 text-[11px] font-normal text-forest">
                <ShieldCheck className="size-3.5 text-forest" />
                GSTIN: {activeVenue.gstNumber}
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-[11px] font-normal text-forest">
              <span className="size-2 rounded-full bg-forest animate-pulse" />
              Live Radar Connected
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-[-0.02em] text-forest">
              {activeVenue.name}
            </h1>
            <Link
              href={`/venue/${activeVenue.slug}`}
              target="_blank"
              className="inline-flex items-center justify-center size-8 rounded-[14px] bg-cream border border-border-mist text-forest hover:bg-mint transition-colors"
              title="View Public Live Page"
            >
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
          <p className="text-xs text-charcoal/70 mt-1.5">
            {activeVenue.address}, {activeVenue.city} • Official facility control room
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {userVenues.length > 1 && (
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="h-10 rounded-[14px] border border-border-mist bg-cream px-3.5 text-xs text-forest focus:outline-none"
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
            className="rounded-[14px] bg-cream hover:bg-mint border border-border-mist text-forest px-4 h-10 gap-2 text-xs font-normal"
          >
            <Building2 className="size-3.5" />
            Register Another Facility
          </Button>

          <Button
            onClick={handlePublishChanges}
            disabled={saving}
            size="sm"
            className="rounded-[14px] bg-forest hover:bg-forest-shadow text-cream px-5 h-10 gap-2 text-xs font-normal border-0"
          >
            {saved ? (
              <CheckCircle className="size-4" />
            ) : (
              <Save className="size-4" />
            )}
            {saving
              ? "Publishing..."
              : saved
                ? "Published Live!"
                : "Publish Changes"}
          </Button>
        </div>
      </div>

      <div className="rounded-[14px] bg-keylime p-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-mint text-forest">
              <Radio className="size-4" />
            </span>
            <div>
              <h3 className="font-serif text-lg font-light text-forest">
                Live Citizen Broadcast Banner
              </h3>
              <p className="text-[11px] text-charcoal/70">
                Displayed prominently across live radar & prediction views for this facility
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={alertText}
                onChange={(e) => setAlertText(e.target.value)}
                placeholder="e.g. Operational • Doctor running 20m late due to emergency surgery"
                className="w-full h-11 rounded-[14px] border border-border-mist bg-cream px-4 text-xs sm:text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none"
              />
            </div>
            <Button
              onClick={handlePublishChanges}
              disabled={saving}
              className="w-full sm:w-auto h-11 rounded-[14px] bg-forest hover:bg-forest-shadow text-cream px-6 text-xs font-normal shrink-0 border-0"
            >
              Broadcast
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-light tracking-[-0.02em] text-forest">
            Active Service Counters
          </h2>
          <p className="text-xs text-charcoal/70 mt-0.5">
            Manage queue counts, doctor delays, and counter operational status.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={addCounter}
          className="rounded-[14px] bg-cream hover:bg-mint border border-border-mist text-forest px-4 h-9 gap-1.5 text-xs font-normal"
        >
          <PlusCircle className="size-3.5" />
          Add Counter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {servicePoints.map((sp, idx) => {
          const spKey = String(sp.id || sp._id || `sp-${idx}`);
          return (
            <div
              key={spKey}
              className="rounded-[14px] bg-mint p-6 flex flex-col gap-5 text-forest"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-serif text-xl font-light text-forest">
                    {sp.name}
                  </h4>
                  <p className="text-xs text-charcoal/70 capitalize mt-0.5">
                    Counter Type: {sp.type}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleStatus(spKey)}
                    className="cursor-pointer"
                  >
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-normal capitalize ${
                        sp.status === "open"
                          ? "bg-cream text-forest border border-border-mist"
                          : sp.status === "delayed"
                            ? "bg-keylime text-forest border border-sage"
                            : "bg-slate-hush text-forest"
                      }`}
                    >
                      Status: {sp.status}
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0 rounded-[14px] text-forest/50 hover:text-forest hover:bg-cream/50"
                    onClick={() => removeCounter(spKey)}
                    title="Remove Counter"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-[14px] bg-cream p-4 text-xs">
                <div>
                  <span className="text-[11px] text-charcoal/70 font-normal flex items-center gap-1.5">
                    <Users className="size-3.5 text-forest" /> Waiting in Line
                  </span>
                  <div className="flex items-center gap-2.5 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="size-8 p-0 rounded-[14px] bg-cream border-border-mist text-forest hover:bg-mint"
                      onClick={() => updateCount(spKey, -1)}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="text-lg font-light font-mono text-forest min-w-6 text-center">
                      {sp.currentQueueCount}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="size-8 p-0 rounded-[14px] bg-cream border-border-mist text-forest hover:bg-mint"
                      onClick={() => updateCount(spKey, 1)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-charcoal/70 font-normal flex items-center gap-1.5">
                    <Clock className="size-3.5 text-forest" /> Duration Forecast
                  </span>
                  <p className="text-lg font-light font-mono text-forest mt-2">
                    {sp.estimatedWaitMinutes} min
                  </p>
                </div>
              </div>

              {sp.status === "delayed" && (
                <div className="flex items-center gap-2 text-xs bg-keylime text-forest p-3 rounded-[14px] border border-sage">
                  <AlertTriangle className="size-3.5 shrink-0 text-forest" />
                  <span>
                    Counter delayed: +{sp.delayMinutes || 15}m added to visitor wait times
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={registerModalOpen} onOpenChange={setRegisterModalOpen}>
        <DialogContent className="max-w-md rounded-[14px] border border-border-mist bg-cream p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif text-xl font-light text-forest">
              <Building2 className="size-5 text-forest" />
              Register & Publish Facility
            </DialogTitle>
            <DialogDescription className="text-xs text-charcoal/70">
              Provide official business credentials including 15-character GSTIN
              to gain authorized telemetry control.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleRegisterSubmit}
            className="flex flex-col gap-3.5 mt-3 text-xs"
          >
            {registerError && (
              <div className="p-3 rounded-[14px] bg-mint text-forest text-xs">
                {registerError}
              </div>
            )}

            <div>
              <label className="font-normal block mb-1 text-xs text-forest">
                Facility Name *
              </label>
              <input
                type="text"
                required
                value={registerForm.name}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, name: e.target.value })
                }
                placeholder="e.g. Apex Multispecialty Clinic"
                className="w-full h-10 rounded-[14px] border border-border-mist bg-cream px-3.5 text-xs text-charcoal focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-normal block mb-1 text-xs text-forest">
                  Category *
                </label>
                <select
                  value={registerForm.category}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      category: e.target.value as VenueItem["category"],
                    })
                  }
                  className="w-full h-10 rounded-[14px] border border-border-mist bg-cream px-3 text-xs text-charcoal focus:outline-none"
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
                <label className="font-normal block mb-1 text-xs text-forest">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.city}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, city: e.target.value })
                  }
                  placeholder="e.g. Mumbai"
                  className="w-full h-10 rounded-[14px] border border-border-mist bg-cream px-3.5 text-xs text-charcoal focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-normal block mb-1 text-xs text-forest">
                15-Digit GST Number (GSTIN) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={registerForm.gstNumber}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      gstNumber: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g. 27AAPFU0939L1ZV"
                  className="w-full h-10 rounded-[14px] border border-border-mist bg-cream px-3.5 font-mono uppercase text-xs text-charcoal focus:outline-none"
                />
                {GST_REGEX.test(
                  registerForm.gstNumber.trim().toUpperCase(),
                ) && (
                  <CheckCircle className="size-4 text-forest absolute right-3 top-3" />
                )}
              </div>
              <span className="text-[10px] text-charcoal/60 mt-1 block">
                Format: 2-digit State + 10-char PAN + 1 Entity + Z + 1 Check digit
              </span>
            </div>

            <div>
              <label className="font-normal block mb-1 text-xs text-forest">
                Business Phone / Contact
              </label>
              <input
                type="tel"
                value={registerForm.businessPhone}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    businessPhone: e.target.value,
                  })
                }
                placeholder="+91 98200 12345"
                className="w-full h-10 rounded-[14px] border border-border-mist bg-cream px-3.5 text-xs text-charcoal focus:outline-none"
              />
            </div>

            <div>
              <label className="font-normal block mb-1 text-xs text-forest">
                Full Street Address *
              </label>
              <input
                type="text"
                required
                value={registerForm.address}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, address: e.target.value })
                }
                placeholder="e.g. 420 MG Road, Sector 5"
                className="w-full h-10 rounded-[14px] border border-border-mist bg-cream px-3.5 text-xs text-charcoal focus:outline-none"
              />
            </div>

            <div>
              <label className="font-normal block mb-1 text-xs text-forest">
                Initial Service Counters (comma-separated)
              </label>
              <input
                type="text"
                value={registerForm.counters}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, counters: e.target.value })
                }
                placeholder="Registration, Doctor OPD, Pathology, Billing"
                className="w-full h-10 rounded-[14px] border border-border-mist bg-cream px-3.5 text-xs text-charcoal focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 mt-3 pt-3 border-t border-border-mist">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRegisterModalOpen(false)}
                className="rounded-[14px] border border-border-mist bg-cream hover:bg-mint text-forest px-4 h-9 text-xs font-normal"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={registerLoading}
                className="rounded-[14px] bg-forest hover:bg-forest-shadow text-cream px-5 h-9 text-xs font-normal gap-1.5 border-0"
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
