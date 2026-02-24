import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Brain, ChevronRight, Heart, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function Onboarding() {
  const [, navigate] = useLocation();
  const [role, setRole] = useState<"therapist" | "client" | null>(null);
  const [therapistForm, setTherapistForm] = useState({
    licenseNumber: "",
    licenseState: "",
    specializations: "",
    bio: "",
  });
  const [inviteToken, setInviteToken] = useState("");

  const setupTherapist = trpc.onboarding.becomeTherapist.useMutation({
    onSuccess: () => {
      toast.success("Profile created! Welcome to TherapyContinuity.");
      navigate("/dashboard");
    },
    onError: (e) => toast.error(e.message),
  });

  const acceptInvite = trpc.onboarding.claimInvite.useMutation({
    onSuccess: () => {
      toast.success("Connected to your therapist! Welcome.");
      navigate("/client");
    },
    onError: (e) => toast.error(e.message),
  });

  if (!role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="text-center mb-10">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Lora', serif" }}>
              Welcome to TherapyContinuity
            </h1>
            <p className="text-muted-foreground mt-2">How will you be using the platform?</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setRole("therapist")}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border-2 border-border hover:border-primary hover:shadow-md transition-all text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-foreground">I'm a Therapist</p>
                <p className="text-xs text-muted-foreground mt-1">Manage clients, configure treatment, and receive AI session summaries</p>
              </div>
            </button>
            <button
              onClick={() => setRole("client")}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border-2 border-border hover:border-primary hover:shadow-md transition-all text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-foreground">I'm a Client</p>
                <p className="text-xs text-muted-foreground mt-1">Connect with your therapist and track your between-session progress</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (role === "therapist") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Set Up Your Therapist Profile
            </CardTitle>
            <CardDescription>This information helps personalize the platform for your practice.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">License Number</label>
                <Input
                  placeholder="e.g. LPC-12345"
                  value={therapistForm.licenseNumber}
                  onChange={(e) => setTherapistForm((p) => ({ ...p, licenseNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">License State</label>
                <Input
                  placeholder="e.g. CA"
                  value={therapistForm.licenseState}
                  onChange={(e) => setTherapistForm((p) => ({ ...p, licenseState: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Specializations (optional)</label>
              <Input
                placeholder="e.g. Anxiety, Trauma, DBT"
                value={therapistForm.specializations}
                onChange={(e) => setTherapistForm((p) => ({ ...p, specializations: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Brief Bio (optional)</label>
              <Textarea
                placeholder="Tell clients a bit about your approach..."
                value={therapistForm.bio}
                onChange={(e) => setTherapistForm((p) => ({ ...p, bio: e.target.value }))}
                rows={3}
              />
            </div>
            <Button
              className="w-full"
              onClick={() =>
                setupTherapist.mutate({
                  licenseNumber: therapistForm.licenseNumber || undefined,
                  licenseState: therapistForm.licenseState || undefined,
                  specialties: therapistForm.specializations || undefined,
                  bio: therapistForm.bio || undefined,
                })
              }
              disabled={setupTherapist.isPending}
            >
              {setupTherapist.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Complete Setup
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Connect with Your Therapist
          </CardTitle>
          <CardDescription>Enter the invite code your therapist sent you to get started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Invite Code</label>
            <Input
              placeholder="Enter your invite code"
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            Your therapist will provide this code. If you don't have one, ask your therapist to send you an invitation from their dashboard.
          </p>
          <Button
            className="w-full"
            onClick={() => acceptInvite.mutate({ token: inviteToken })}
            disabled={acceptInvite.isPending || !inviteToken.trim()}
          >
            {acceptInvite.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Connect & Get Started
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
