"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Call, Device as VoiceDevice } from "@twilio/voice-sdk";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Clock3,
  Loader2,
  Mic,
  MicOff,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  Plus,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { useToast } from "@/components/Toaster";

type Workspace = {
  id: string;
  status: string;
  phoneNumber: string | null;
  phoneCountry: string | null;
  monthlyPriceCents: number | null;
  priceCurrency: string | null;
  consentAcceptedAt: string | null;
  lastError: string | null;
};

type CallHistory = {
  id: string;
  direction: string;
  from: string;
  to: string;
  status: string;
  durationSeconds: number | null;
  createdAt: string;
  outcome: string | null;
};

type AvailableNumber = {
  phoneNumber: string;
  friendlyName: string;
  locality: string;
  region: string;
  country: string;
  capabilities: { voice?: boolean; SMS?: boolean; MMS?: boolean };
  monthlyPriceCents: number;
  currency: string;
  quote: string;
};

type PhonePurchase = {
  id: string;
  phoneNumber: string;
  monthlyPriceCents: number;
  currency: string;
  status: string;
  subscriptionStatus: string | null;
  testMode: boolean;
  renewsAt: string | null;
  endsAt: string | null;
  lastError: string | null;
};

type OwnedNumber = {
  id: string;
  phoneNumber: string;
  country: string | null;
  monthlyPriceCents: number | null;
  currency: string | null;
  primary: boolean;
  callable: boolean;
};

async function api(body?: object) {
  const response = await fetch("/api/softphone/workspace", body ? {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  } : undefined);
  const data = await response.json() as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Softphone request failed");
  return data;
}

function money(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100);
}

function duration(seconds: number | null) {
  if (!seconds) return "—";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function SoftphoneClient() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const deviceRef = useRef<VoiceDevice | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [ownedNumbers, setOwnedNumbers] = useState<OwnedNumber[]>([]);
  const [selectedFrom, setSelectedFrom] = useState("");
  const [showNumberSearch, setShowNumberSearch] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<PhonePurchase | null>(null);
  const [calls, setCalls] = useState<CallHistory[]>([]);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [country, setCountry] = useState<"US" | "GB" | "CA">("US");
  const [area, setArea] = useState("");
  const [numbers, setNumbers] = useState<AvailableNumber[]>([]);
  const [purchase, setPurchase] = useState<AvailableNumber | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [complianceAccepted, setComplianceAccepted] = useState(false);
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [deviceState, setDeviceState] = useState("Offline");
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [muted, setMuted] = useState(false);

  const refresh = useCallback(async () => {
    const data = await api();
    setConfigured(Boolean(data.configured));
    setWorkspace((data.workspace as Workspace | null) ?? null);
    const nextNumbers = (data.numbers as OwnedNumber[]) ?? [];
    setOwnedNumbers(nextNumbers);
    setSelectedFrom(current => (
      nextNumbers.some(number => number.callable && number.phoneNumber === current)
        ? current
        : nextNumbers.find(number => number.callable)?.phoneNumber || ""
    ));
    setPurchaseStatus((data.purchase as PhonePurchase | null) ?? null);
    setCalls((data.calls as CallHistory[]) ?? []);
  }, []);

  useEffect(() => {
    void refresh().catch(error => toast({ title: "Could not load softphone", description: error.message, type: "error" })).finally(() => setLoading(false));
    return () => {
      deviceRef.current?.disconnectAll();
      deviceRef.current?.destroy();
      deviceRef.current = null;
    };
  }, [refresh, toast]);

  useEffect(() => {
    if (searchParams.get("checkout") !== "success") return;
    let checks = 0;
    const timer = window.setInterval(() => {
      checks += 1;
      void refresh();
      if (checks >= 15) window.clearInterval(timer);
    }, 2_000);
    return () => window.clearInterval(timer);
  }, [refresh, searchParams]);

  function callEvents(call: Call) {
    call.on("ringing", () => setDeviceState("Ringing"));
    call.on("accept", () => setDeviceState("Connected"));
    call.on("disconnect", () => { setActiveCall(null); setDeviceState("Ready"); setMuted(false); void refresh(); });
    call.on("cancel", () => { setIncomingCall(null); setDeviceState("Ready"); void refresh(); });
    call.on("reject", () => { setIncomingCall(null); setDeviceState("Ready"); void refresh(); });
    call.on("error", error => {
      setActiveCall(null);
      setDeviceState("Ready");
      toast({ title: "Call failed", description: error.message, type: "error" });
    });
  }

  async function connectDevice() {
    if (deviceRef.current) return deviceRef.current;
    setBusy("device");
    try {
      const data = await api({ action: "token" });
      const { Device } = await import("@twilio/voice-sdk");
      const device = new Device(String(data.token), { closeProtection: true });
      deviceRef.current = device;
      device.on("registering", () => setDeviceState("Connecting"));
      device.on("registered", () => setDeviceState("Ready"));
      device.on("unregistered", () => setDeviceState("Offline"));
      device.on("error", error => toast({ title: "Phone connection error", description: error.message, type: "error" }));
      device.on("tokenWillExpire", async () => {
        try {
          const next = await api({ action: "token" });
          device.updateToken(String(next.token));
        } catch (error) {
          toast({ title: "Phone session expired", description: error instanceof Error ? error.message : "Reconnect the phone", type: "error" });
        }
      });
      device.on("incoming", call => {
        callEvents(call);
        setIncomingCall(call);
        setDeviceState("Incoming call");
      });
      await device.register();
      return device;
    } catch (error) {
      deviceRef.current?.destroy();
      deviceRef.current = null;
      setDeviceState("Offline");
      throw error;
    } finally {
      setBusy(null);
    }
  }

  async function provision() {
    setBusy("provision");
    try {
      const data = await api({ action: "provision" });
      setWorkspace(data.workspace as Workspace);
      toast({ title: "Calling workspace ready", description: "Your isolated calling workspace has been created.", type: "success" });
    } catch (error) {
      toast({ title: "Setup failed", description: error instanceof Error ? error.message : "Please try again", type: "error" });
    } finally { setBusy(null); }
  }

  async function searchNumbers() {
    setBusy("search");
    try {
      const data = await api({ action: "search-numbers", country, area });
      setNumbers(data.numbers as AvailableNumber[]);
      if (!(data.numbers as AvailableNumber[]).length) toast({ title: "No matching numbers", description: "Try another city or area code.", type: "info" });
    } catch (error) {
      toast({ title: "Number search failed", description: error instanceof Error ? error.message : "Please try again", type: "error" });
    } finally { setBusy(null); }
  }

  async function attachExistingNumber() {
    setBusy("attach-existing");
    try {
      const data = await api({ action: "attach-existing-admin-number" });
      setWorkspace(data.workspace as Workspace);
      setNumbers([]);
      await refresh();
      toast({
        title: "Twilio number attached",
        description: "The existing number is now connected to the admin softphone.",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Could not attach the number",
        description: error instanceof Error ? error.message : "Please try again",
        type: "error",
      });
    } finally {
      setBusy(null);
    }
  }

  async function buyNumber() {
    if (!purchase || confirmation !== "PURCHASE" || !complianceAccepted) return;
    setBusy("purchase");
    try {
      const data = await api({
        action: "checkout-number",
        quote: purchase.quote,
        confirmation: "PURCHASE",
        complianceAccepted: true,
      });
      const url = typeof data.url === "string" ? data.url : "";
      if (!url) throw new Error("Secure checkout did not return a payment link");
      window.location.assign(url);
    } catch (error) {
      toast({ title: "Checkout could not start", description: error instanceof Error ? error.message : "Please try again", type: "error" });
    } finally { setBusy(null); }
  }

  async function startCall() {
    setBusy("call");
    try {
      const device = await connectDevice();
      const call = await device.connect({ params: { To: phone, From: selectedFrom, LeadId: searchParams.get("leadId") || "" } });
      callEvents(call);
      setActiveCall(call);
      setDeviceState("Calling…");
    } catch (error) {
      toast({ title: "Could not start call", description: error instanceof Error ? error.message : "Please try again", type: "error" });
    } finally { setBusy(null); }
  }

  function pressKey(key: string) {
    if (activeCall) activeCall.sendDigits(key);
    else setPhone(value => value + key);
  }

  if (loading) return <div className="p-6 lg:p-8"><div className="h-72 rounded-lg border border-border bg-card animate-pulse" /></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-accent">
            <ShieldCheck className="h-4 w-4" /> Admin beta
          </div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Softphone</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Buy a dedicated business number, call leads inside iCloseLeads, receive callbacks, and keep a clean activity history.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <span className={`h-2 w-2 rounded-full ${deviceState === "Ready" || deviceState === "Connected" ? "bg-accent" : "bg-muted-foreground"}`} />
          <span className="font-medium text-foreground">{deviceState}</span>
        </div>
      </header>

      {purchaseStatus && ["PAYMENT_CONFIRMED", "PROVISIONING"].includes(purchaseStatus.status) && (
        <section className="rounded-lg border border-accent/30 bg-accent/5 p-4">
          <div className="flex items-start gap-3">
            <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-accent" />
            <div>
              <h2 className="font-semibold text-foreground">Payment confirmed. Connecting your number.</h2>
              <p className="mt-1 text-sm text-muted-foreground">Twilio is provisioning {purchaseStatus.phoneNumber}. This page refreshes automatically and the softphone will appear here.</p>
            </div>
          </div>
        </section>
      )}

      {purchaseStatus?.status === "PAID_TEST" && (
        <section className="rounded-lg border border-gold/30 bg-gold/5 p-4">
          <h2 className="font-semibold text-foreground">Test payment verified</h2>
          <p className="mt-1 text-sm text-muted-foreground">The Lemon Squeezy test webhook worked. No real Twilio number was purchased or charged.</p>
        </section>
      )}

      {purchaseStatus?.status === "PROVISION_FAILED" && (
        <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <h2 className="font-semibold text-foreground">Payment verified, but the number needs attention</h2>
          <p className="mt-1 text-sm text-muted-foreground">{purchaseStatus.lastError || "The selected number could not be connected. Support can retry or move the subscription to another number."}</p>
        </section>
      )}

      {!configured ? (
        <section className="rounded-lg border border-gold/30 bg-gold/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-gold" />
            <div><h2 className="font-semibold text-foreground">Twilio credentials are pending</h2><p className="mt-1 text-sm text-muted-foreground">Add the iCloseLeads Main API key and encryption secret to production before creating customer workspaces.</p></div>
          </div>
        </section>
      ) : !workspace ? (
        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-lg border border-border bg-card p-6">
            <PhoneCall className="h-8 w-8 text-primary-light" />
            <h2 className="mt-5 text-xl font-semibold text-foreground">Create your secure calling workspace</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">This creates an isolated calling workspace for your number, browser credentials, call logs, and usage. It does not buy a number or create a charge.</p>
            <button onClick={() => void provision()} disabled={busy === "provision"} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {busy === "provision" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Set up workspace
            </button>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground">Built-in safeguards</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {["No call recording", "30-minute call limit", "60 outbound calls per day", "Explicit number purchase approval"].map(item => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-accent" />{item}</li>)}
            </ul>
          </div>
        </section>
      ) : workspace.status !== "READY" ? (
        <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <h2 className="font-semibold text-foreground">Calling workspace setup needs attention</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                The previous setup attempt did not finish. Retry safely to continue from the existing Twilio workspace; this does not buy a number or create a charge.
              </p>
              {workspace.lastError && <p className="mt-3 text-xs text-destructive">{workspace.lastError}</p>}
              <button onClick={() => void provision()} disabled={busy === "provision"} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {busy === "provision" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Retry setup
              </button>
            </div>
          </div>
        </section>
      ) : !workspace.phoneNumber || showNumberSearch ? (
        <section className="space-y-5">
          {workspace.phoneNumber && (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-foreground">Add another business number</h2>
                <p className="mt-1 text-sm text-muted-foreground">Choose a second caller ID for another market, team, or campaign.</p>
              </div>
              <button onClick={() => { setShowNumberSearch(false); setNumbers([]); }} className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground">Back to softphone</button>
            </div>
          )}
          {!workspace.phoneNumber && <div className="flex flex-col gap-3 rounded-lg border border-accent/25 bg-accent/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Use the number already owned by Twilio</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Admin recovery only. This keeps messaging untouched, connects the existing number to iCloseLeads voice, and does not create another purchase.</p>
            </div>
            <button onClick={() => void attachExistingNumber()} disabled={Boolean(busy)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-accent/40 bg-background px-4 py-2.5 text-sm font-semibold text-accent disabled:opacity-50">
              {busy === "attach-existing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />} Attach owned number
            </button>
          </div>}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <label className="block md:w-48"><span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">Country</span><select value={country} onChange={event => setCountry(event.target.value as "US" | "GB" | "CA")} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground"><option value="US">United States</option><option value="GB">United Kingdom</option><option value="CA">Canada</option></select></label>
              <label className="block flex-1"><span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">City or area code</span><input value={area} onChange={event => setArea(event.target.value)} placeholder={country === "GB" ? "London" : "e.g. 415 or Toronto"} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" /></label>
              <button onClick={() => void searchNumbers()} disabled={busy === "search"} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy === "search" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search numbers</button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Only voice-enabled numbers without address-registration requirements are shown. Availability is checked live, and the displayed monthly price includes your iCloseLeads calling workspace.</p>
          </div>

          {numbers.length > 0 && <div className="grid gap-3 md:grid-cols-2">
            {numbers.map(number => <article key={number.phoneNumber} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
              <div><p className="font-semibold text-foreground">{number.friendlyName}</p><p className="mt-1 text-xs text-muted-foreground">{[number.locality, number.region, number.country].filter(Boolean).join(", ")}</p><p className="mt-2 text-sm font-medium text-accent">{money(number.monthlyPriceCents, number.currency)}/month</p></div>
              <button onClick={() => setPurchase(number)} className="rounded-lg border border-primary/40 px-3 py-2 text-sm font-semibold text-primary-light hover:bg-primary/10">Choose</button>
            </article>)}
          </div>}
        </section>
      ) : (
        <>
          <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <label className="min-w-0 flex-1">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Calling from</span>
                  {ownedNumbers.filter(number => number.callable).length > 1 ? (
                    <select value={selectedFrom} onChange={event => setSelectedFrom(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground">
                      {ownedNumbers.filter(number => number.callable).map(number => <option key={number.id} value={number.phoneNumber}>{number.phoneNumber}{number.primary ? " · Primary" : ""}</option>)}
                    </select>
                  ) : <p className="mt-1 text-lg font-semibold text-foreground">{selectedFrom || workspace.phoneNumber}</p>}
                </label>
                <div className="rounded-lg bg-accent/10 p-2.5"><Phone className="h-5 w-5 text-accent" /></div>
              </div>
              {ownedNumbers.length < 3 && <button onClick={() => setShowNumberSearch(true)} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary-light hover:underline"><Plus className="h-3.5 w-3.5" /> Add another number</button>}
              <label className="mt-6 block"><span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">Number to call</span><input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="+1 415 555 0123" className="w-full rounded-lg border border-border bg-background px-3 py-3 text-lg font-semibold text-foreground outline-none focus:border-primary" /></label>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {"123456789*0#".split("").map(key => <button key={key} onClick={() => pressKey(key)} aria-label={activeCall ? `Send ${key}` : `Enter ${key}`} className="h-11 rounded-lg border border-border bg-background text-sm font-semibold text-foreground hover:border-primary/40">{key}</button>)}
              </div>
              <div className="mt-4 flex gap-2">
                {!activeCall ? <button onClick={() => void startCall()} disabled={!phone.trim() || Boolean(busy)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-50">{busy === "call" || busy === "device" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />} Call</button> : <>
                  <button onClick={() => { activeCall.mute(!muted); setMuted(!muted); }} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground">{muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}{muted ? "Unmute" : "Mute"}</button>
                  <button onClick={() => activeCall.disconnect()} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-3 text-sm font-semibold text-white"><PhoneOff className="h-4 w-4" /> End</button>
                </>}
              </div>
              {deviceState === "Offline" && <button onClick={() => void connectDevice()} disabled={busy === "device"} className="mt-3 w-full text-center text-xs font-semibold text-primary-light hover:underline">Enable incoming calls</button>}
            </div>

            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 className="font-semibold text-foreground">Recent calls</h2><p className="mt-0.5 text-xs text-muted-foreground">The latest 20 calls for this workspace</p></div><Clock3 className="h-5 w-5 text-muted-foreground" /></div>
              {calls.length === 0 ? <div className="p-10 text-center text-sm text-muted-foreground">No calls yet.</div> : <div className="divide-y divide-border">{calls.map(call => <div key={call.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-3.5">
                <div className="rounded-lg bg-muted p-2">{call.direction === "INBOUND" ? <ArrowDownLeft className="h-4 w-4 text-accent" /> : <ArrowUpRight className="h-4 w-4 text-primary-light" />}</div>
                <div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{call.direction === "INBOUND" ? call.from : call.to}</p><p className="mt-0.5 text-xs text-muted-foreground">{new Date(call.createdAt).toLocaleString()} · {call.status}</p></div>
                <span className="text-xs font-medium text-muted-foreground">{duration(call.durationSeconds)}</span>
              </div>)}</div>}
            </div>
          </section>
        </>
      )}

      {workspace?.status === "READY" && workspace.lastError && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{workspace.lastError}</div>}

      {incomingCall && <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-4 sm:items-center">
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-2xl">
          <PhoneIncoming className="h-7 w-7 text-accent" /><h2 className="mt-4 text-lg font-semibold text-foreground">Incoming call</h2><p className="mt-1 text-sm text-muted-foreground">{incomingCall.parameters.From || "Caller"}</p>
          <div className="mt-6 grid grid-cols-2 gap-3"><button onClick={() => { incomingCall.reject(); setIncomingCall(null); }} className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/40 px-4 py-3 text-sm font-semibold text-destructive"><PhoneOff className="h-4 w-4" /> Decline</button><button onClick={() => { incomingCall.accept(); setActiveCall(incomingCall); setIncomingCall(null); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"><Phone className="h-4 w-4" /> Answer</button></div>
        </div>
      </div>}

      {purchase && <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 sm:items-center">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl">
          <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase text-gold">Recurring number subscription</p><h2 className="mt-1 text-xl font-semibold text-foreground">Confirm {purchase.friendlyName}</h2></div><button onClick={() => { setPurchase(null); setConfirmation(""); setComplianceAccepted(false); }} aria-label="Close" className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button></div>
          <div className="mt-5 rounded-lg border border-gold/25 bg-gold/5 p-4"><p className="text-2xl font-bold text-foreground">{money(purchase.monthlyPriceCents, purchase.currency)}<span className="text-sm font-medium text-muted-foreground"> / month</span></p><p className="mt-2 text-xs leading-5 text-muted-foreground">This recurring checkout covers the dedicated number and iCloseLeads calling workspace. Calling remains inside the private beta limits; no extra usage charge is silently added here.</p></div>
          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3 text-sm leading-5 text-muted-foreground"><input type="checkbox" checked={complianceAccepted} onChange={event => setComplianceAccepted(event.target.checked)} className="mt-1 h-4 w-4 accent-primary" /><span>I will call only lawful business contacts, honour opt-outs, and follow the calling rules that apply to my location and the recipient.</span></label>
          <label className="mt-5 block"><span className="mb-1.5 block text-sm font-medium text-foreground">Type PURCHASE to confirm</span><input value={confirmation} onChange={event => setConfirmation(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-gold" /></label>
          <button onClick={() => void buyNumber()} disabled={confirmation !== "PURCHASE" || !complianceAccepted || busy === "purchase"} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy === "purchase" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Continue to secure checkout</button>
        </div>
      </div>}
    </div>
  );
}
