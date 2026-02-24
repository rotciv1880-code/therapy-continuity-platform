import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Sparkles, Users, Zap } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const TIERS = [
  {
    id: "starter" as const,
    name: "Starter",
    price: "$19",
    period: "/month",
    description: "For solo practitioners getting started.",
    maxClients: 5,
    features: [
      "Up to 5 active clients",
      "Guided client check-ins",
      "Mood & event tracking",
      "Basic AI reflection prompts",
      "Homework assignment tools",
      "Email support",
    ],
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: "professional" as const,
    name: "Professional",
    price: "$49",
    period: "/month",
    description: "For established therapists who want full continuity.",
    maxClients: 25,
    features: [
      "Up to 25 active clients",
      "All Starter features",
      "AI session prep summaries",
      "Post-session continuity messages",
      "Modality-specific prompts (CBT, DBT, EMDR)",
      "Audit logging & compliance tools",
      "Priority support",
    ],
    icon: <Zap className="w-5 h-5" />,
    highlight: true,
  },
  {
    id: "practice" as const,
    name: "Practice Plan",
    price: "$149",
    period: "/month",
    description: "For group practices and multi-therapist teams.",
    maxClients: 100,
    features: [
      "Up to 100 active clients",
      "All Professional features",
      "Multi-therapist team access",
      "Practice-level analytics",
      "Custom modality configuration",
      "Dedicated account manager",
      "HIPAA Business Associate Agreement",
    ],
    icon: <Users className="w-5 h-5" />,
  },
];

export default function Subscription() {
  const utils = trpc.useUtils();
  const { data: subscription, isLoading } = trpc.subscription.get.useQuery();

  const upgrade = trpc.subscription.upgrade.useMutation({
    onSuccess: () => {
      toast.success("Subscription updated successfully!");
      utils.subscription.get.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const currentTier = subscription?.tier ?? "starter";

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Subscription</h1>
          <p className="text-muted-foreground mt-1">Manage your plan and billing</p>
        </div>

        {/* Current Plan Banner */}
        {subscription && (
          <Card className="border-primary/20 bg-primary/5 mb-8">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-xl font-bold text-foreground capitalize mt-0.5">{subscription.tier.replace("_", " ")}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={subscription.status === "active" ? "default" : "secondary"} className="capitalize">
                      {subscription.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Renews {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Clients allowed</p>
                  <p className="text-2xl font-bold text-foreground">
                    {TIERS.find((t) => t.id === currentTier)?.maxClients ?? "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {TIERS.map((tier) => {
              const isCurrent = currentTier === tier.id;
              const isDowngrade = TIERS.findIndex((t) => t.id === currentTier) > TIERS.findIndex((t) => t.id === tier.id);

              return (
                <Card
                  key={tier.id}
                  className={`relative flex flex-col ${tier.highlight ? "border-primary ring-2 ring-primary shadow-lg shadow-primary/10" : "border-border"} ${isCurrent ? "bg-primary/5" : ""}`}
                >
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3">Most Popular</Badge>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 right-4">
                      <Badge variant="outline" className="bg-background border-primary text-primary">Current Plan</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tier.highlight ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                        {tier.icon}
                      </div>
                      <CardTitle className="text-lg">{tier.name}</CardTitle>
                    </div>
                    <CardDescription>{tier.description}</CardDescription>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                      <span className="text-muted-foreground text-sm">{tier.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={tier.highlight ? "default" : "outline"}
                      className={`w-full ${!tier.highlight ? "bg-background" : ""}`}
                      disabled={isCurrent || upgrade.isPending}
                      onClick={() => {
                        if (!isCurrent) {
                          upgrade.mutate({ tier: tier.id });
                        }
                      }}
                    >
                      {upgrade.isPending && !isCurrent ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      {isCurrent ? "Current Plan" : isDowngrade ? "Downgrade" : "Upgrade"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8">
          Need a custom enterprise plan?{" "}
          <a href="/#demo" className="text-primary underline underline-offset-4">Contact us</a>.
        </p>
      </div>
    </DashboardLayout>
  );
}
