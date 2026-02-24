import { useDemo } from "@/contexts/DemoContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  CheckCircle2,
  ChevronRight,
  Heart,
  LineChart,
  ListChecks,
  Sparkles,
  Users,
} from "lucide-react";
import { useLocation } from "wouter";

const THERAPIST_FEATURES = [
  { icon: Users, text: "Manage 3 demo clients with full profiles" },
  { icon: Brain, text: "AI session prep summaries (CBT, DBT, Trauma)" },
  { icon: ListChecks, text: "Assign and review homework" },
  { icon: Sparkles, text: "Configure treatment modality per client" },
];

const CLIENT_FEATURES = [
  { icon: Heart, text: "Complete a guided daily check-in" },
  { icon: LineChart, text: "View your mood timeline over 2 weeks" },
  { icon: Sparkles, text: "Receive AI reflection prompts" },
  { icon: ListChecks, text: "View and complete homework assignments" },
];

export default function Demo() {
  const { enterDemo } = useDemo();
  const [, navigate] = useLocation();

  const handleEnter = (persona: "therapist" | "client") => {
    enterDemo(persona);
    navigate(persona === "therapist" ? "/demo/dashboard" : "/demo/client");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7f8] via-background to-[#f5f0ff] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/80 backdrop-blur">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">TherapyContinuity</span>
        </button>
        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
          Interactive Demo
        </Badge>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            No sign-up required
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "'Lora', serif" }}>
            Explore the Platform
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Choose a perspective to explore. All data is pre-populated with realistic scenarios so you can experience the full platform immediately.
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Therapist Card */}
          <Card className="border-2 border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer group overflow-hidden"
            onClick={() => handleEnter("therapist")}>
            <div className="h-2 bg-gradient-to-r from-primary to-teal-400" />
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Try as Therapist</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Dr. Sarah Chen, LPC</p>
                  <Badge variant="secondary" className="mt-1.5 text-xs">Professional Plan</Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Experience the therapist dashboard with 3 active clients across CBT, DBT, and trauma-informed modalities. Review AI session summaries, manage homework, and configure treatment plans.
              </p>

              <ul className="space-y-2.5 mb-6">
                {THERAPIST_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {f.text}
                  </li>
                ))}
              </ul>

              <Button className="w-full group-hover:shadow-md transition-all">
                Explore as Therapist
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Client Card */}
          <Card className="border-2 border-border hover:border-violet-400/50 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 cursor-pointer group overflow-hidden"
            onClick={() => handleEnter("client")}>
            <div className="h-2 bg-gradient-to-r from-violet-400 to-pink-400" />
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0 group-hover:bg-violet-200 transition-colors">
                  <Heart className="w-7 h-7 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Try as Client</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Marcus T., CBT Program</p>
                  <Badge variant="secondary" className="mt-1.5 text-xs bg-violet-100 text-violet-700">Active Client</Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Experience the client side — complete a guided check-in, log your mood, explore AI reflection prompts tailored to CBT, and view your progress timeline.
              </p>

              <ul className="space-y-2.5 mb-6">
                {CLIENT_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-violet-500 shrink-0" />
                    {f.text}
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                className="w-full border-violet-300 text-violet-700 hover:bg-violet-50 group-hover:shadow-md transition-all bg-background"
                onClick={(e) => { e.stopPropagation(); handleEnter("client"); }}
              >
                Explore as Client
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground mt-10 text-center max-w-lg">
          All data shown in the demo is fictional and for illustrative purposes only. No real patient data is used. AI features in demo mode show pre-generated example content.
        </p>
      </div>
    </div>
  );
}
