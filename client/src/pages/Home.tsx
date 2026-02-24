import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Heart,
  LineChart,
  Lock,
  MessageSquare,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";

const PRICING_TIERS = [
  {
    name: "Starter",
    price: "$19",
    period: "/month",
    description: "Perfect for solo practitioners getting started.",
    features: [
      "Up to 5 active clients",
      "Guided client check-ins",
      "Mood & event tracking",
      "Basic AI reflection prompts",
      "Homework assignment tools",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlight: false,
    tier: "starter",
  },
  {
    name: "Professional",
    price: "$49",
    period: "/month",
    description: "For established therapists who want full continuity.",
    features: [
      "Up to 25 active clients",
      "All Starter features",
      "AI session prep summaries",
      "Post-session continuity messages",
      "Modality-specific prompts (CBT, DBT, EMDR)",
      "Audit logging & compliance tools",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlight: true,
    tier: "professional",
  },
  {
    name: "Practice Plan",
    price: "$149",
    period: "/month",
    description: "For group practices and multi-therapist teams.",
    features: [
      "Up to 100 active clients",
      "All Professional features",
      "Multi-therapist team access",
      "Practice-level analytics",
      "Custom modality configuration",
      "Dedicated account manager",
      "HIPAA Business Associate Agreement",
    ],
    cta: "Contact Sales",
    highlight: false,
    tier: "practice",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Therapist Configures",
    description:
      "You set up each client's treatment modality — CBT, DBT, trauma-informed, or EMDR — and assign homework and goals. The platform learns your clinical approach.",
    icon: <Brain className="w-6 h-6" />,
  },
  {
    step: "02",
    title: "Client Engages Between Sessions",
    description:
      "Clients complete guided daily check-ins, log emotional events, track their mood, and receive modality-aligned reflection prompts — all without clinical overreach.",
    icon: <Heart className="w-6 h-6" />,
  },
  {
    step: "03",
    title: "You Arrive Prepared",
    description:
      "Before each session, receive an AI-generated summary of your client's between-session activity: mood trends, key events, homework status, and suggested focus areas.",
    icon: <Sparkles className="w-6 h-6" />,
  },
];

const BENEFITS = [
  { icon: <LineChart className="w-5 h-5" />, title: "Measurable Progress", desc: "Structured emotional timelines give both you and your client visible evidence of growth." },
  { icon: <Clock className="w-5 h-5" />, title: "Session Readiness", desc: "Clients arrive emotionally prepared. You arrive clinically informed. Sessions become more productive from minute one." },
  { icon: <CheckCircle2 className="w-5 h-5" />, title: "Homework Adherence", desc: "Structured between-session engagement increases homework completion rates significantly." },
  { icon: <MessageSquare className="w-5 h-5" />, title: "Therapeutic Momentum", desc: "Maintain continuity between weekly appointments so progress doesn't stall." },
  { icon: <Shield className="w-5 h-5" />, title: "HIPAA-Conscious Design", desc: "Built with security and compliance at the architecture level — not as an afterthought." },
  { icon: <Zap className="w-5 h-5" />, title: "Zero Admin Overhead", desc: "AI handles the synthesis. You get actionable insight without spending extra time on notes." },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [demoForm, setDemoForm] = useState({ name: "", email: "", practiceName: "", practiceSize: "", message: "" });
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const submitDemo = trpc.demo.submit.useMutation({
    onSuccess: () => {
      setDemoSubmitted(true);
      toast.success("Demo request received! We'll be in touch within 24 hours.");
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoForm.name || !demoForm.email) return;
    submitDemo.mutate(demoForm);
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-['Inter']">
      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground text-lg">TherapyContinuity</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#benefits" className="hover:text-foreground transition-colors">Benefits</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#demo" className="hover:text-foreground transition-colors">Request Demo</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")} size="sm">
                Go to Dashboard <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = getLoginUrl()}>Sign In</Button>
                <Button size="sm" onClick={handleGetStarted}>Get Started Free</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10 pointer-events-none" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 text-sm font-medium px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI-Assisted Clinical Continuity
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6" style={{ fontFamily: "'Lora', serif" }}>
              Therapy should not pause{" "}
              <span className="text-primary">between sessions.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              A therapist-led platform that maintains therapeutic momentum between appointments. Structured client engagement, AI-powered insights, and session preparation — without replacing your clinical judgment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="text-base px-8 h-12">
                Start Free Trial
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 h-12 bg-background" onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}>
                Request a Demo
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">No credit card required · HIPAA-conscious architecture · Cancel anytime</p>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            {[
              { value: "3×", label: "Higher homework adherence" },
              { value: "40%", label: "More session-ready clients" },
              { value: "0", label: "Extra admin hours required" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem Statement ─────────────────────────────────────────────── */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4">The Problem</Badge>
                <h2 className="text-3xl font-bold text-foreground mb-6" style={{ fontFamily: "'Lora', serif" }}>
                  The gap between sessions is where progress stalls.
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You spend 50 minutes building momentum — then your client leaves, and six days pass before you see them again. Homework goes uncompleted. Emotional events go unprocessed. You arrive at the next session starting from scratch.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Traditional therapy has no infrastructure for the 167 hours between appointments. TherapyContinuity changes that — without adding to your administrative workload.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { pct: "68%", text: "of clients report losing therapeutic momentum between sessions" },
                  { pct: "52%", text: "of homework assignments go uncompleted without structured follow-up" },
                  { pct: "15 min", text: "average time therapists spend re-establishing context at session start" },
                ].map((item) => (
                  <div key={item.pct} className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                    <span className="text-2xl font-bold text-primary shrink-0">{item.pct}</span>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Lora', serif" }}>
              Therapist-led. AI-assisted. Client-engaged.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              You remain the clinical authority. The platform extends your reach between sessions — within the boundaries you define.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="relative">
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {step.icon}
                  </div>
                  <span className="text-5xl font-bold text-border mb-3">{step.step}</span>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ──────────────────────────────────────────────────────── */}
      <section id="benefits" className="py-24 bg-secondary/20">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Benefits</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Lora', serif" }}>
              Built for clinical outcomes, not just engagement.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {BENEFITS.map((b) => (
              <Card key={b.title} className="border-border hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {b.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modalities ────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Modality Support</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-6" style={{ fontFamily: "'Lora', serif" }}>
              Aligned with your clinical approach.
            </h2>
            <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
              AI prompts and reflection questions are constrained to your configured modality — so every interaction reinforces your therapeutic framework.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "CBT", desc: "Cognitive Behavioral Therapy", color: "bg-blue-50 border-blue-200 text-blue-800" },
                { name: "DBT", desc: "Dialectical Behavior Therapy", color: "bg-purple-50 border-purple-200 text-purple-800" },
                { name: "Trauma-Informed", desc: "Trauma-Informed Care", color: "bg-amber-50 border-amber-200 text-amber-800" },
                { name: "EMDR", desc: "EMDR Preparation & Stabilization", color: "bg-green-50 border-green-200 text-green-800" },
              ].map((m) => (
                <div key={m.name} className={`p-4 rounded-xl border ${m.color} text-center`}>
                  <div className="font-bold text-lg mb-1">{m.name}</div>
                  <div className="text-xs opacity-80">{m.desc}</div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              All AI interactions are strictly bounded — no diagnosis, no crisis intervention, no therapy replacement.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-secondary/20">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Lora', serif" }}>
              Simple, transparent pricing.
            </h2>
            <p className="text-muted-foreground mt-4">Start free for 14 days. No credit card required.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING_TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={`relative flex flex-col ${tier.highlight ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary" : "border-border"}`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-8 flex-1">
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
                    onClick={tier.name === "Practice Plan" ? () => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" }) : handleGetStarted}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Enterprise licensing available for clinics and healthcare systems.{" "}
            <button onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })} className="text-primary underline underline-offset-4">
              Contact us.
            </button>
          </p>
        </div>
      </section>

      {/* ── Security & Compliance ─────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Security & Compliance</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-6" style={{ fontFamily: "'Lora', serif" }}>
              Built with clinical data responsibility in mind.
            </h2>
            <div className="grid sm:grid-cols-3 gap-6 mt-10">
              {[
                { icon: <Lock className="w-6 h-6" />, title: "Encrypted Data", desc: "All data encrypted in transit and at rest. JWT-secured sessions." },
                { icon: <Shield className="w-6 h-6" />, title: "HIPAA-Conscious", desc: "Architecture designed with HIPAA principles. BAA available on Practice Plan." },
                { icon: <Users className="w-6 h-6" />, title: "Audit Logging", desc: "Complete audit trail of all therapist and system actions for accountability." },
              ].map((item) => (
                <div key={item.title} className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Demo Request ──────────────────────────────────────────────────── */}
      <section id="demo" className="py-24 bg-primary/5">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <Badge variant="secondary" className="mb-4">Request a Demo</Badge>
              <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Lora', serif" }}>
                See it in action with your practice.
              </h2>
              <p className="text-muted-foreground mt-3">
                We'll walk you through a personalized demo tailored to your clinical approach and client population.
              </p>
            </div>
            {demoSubmitted ? (
              <Card className="border-primary/20 bg-card text-center p-10">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Request received!</h3>
                <p className="text-muted-foreground">We'll reach out within 24 hours to schedule your personalized demo.</p>
              </Card>
            ) : (
              <Card className="border-border">
                <CardContent className="pt-6">
                  <form onSubmit={handleDemoSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Your Name *</label>
                        <Input
                          placeholder="Dr. Jane Smith"
                          value={demoForm.name}
                          onChange={(e) => setDemoForm((p) => ({ ...p, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Email Address *</label>
                        <Input
                          type="email"
                          placeholder="jane@practice.com"
                          value={demoForm.email}
                          onChange={(e) => setDemoForm((p) => ({ ...p, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Practice Name</label>
                        <Input
                          placeholder="Mindful Therapy Associates"
                          value={demoForm.practiceName}
                          onChange={(e) => setDemoForm((p) => ({ ...p, practiceName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Practice Size</label>
                        <select
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          value={demoForm.practiceSize}
                          onChange={(e) => setDemoForm((p) => ({ ...p, practiceSize: e.target.value }))}
                        >
                          <option value="">Select size</option>
                          <option value="solo">Solo practitioner</option>
                          <option value="small">2–5 therapists</option>
                          <option value="medium">6–20 therapists</option>
                          <option value="large">20+ therapists</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Tell us about your practice</label>
                      <Textarea
                        placeholder="What modalities do you use? What challenges are you hoping to address?"
                        value={demoForm.message}
                        onChange={(e) => setDemoForm((p) => ({ ...p, message: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <Button type="submit" className="w-full h-11" disabled={submitDemo.isPending}>
                      {submitDemo.isPending ? "Submitting..." : "Request My Demo"}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">TherapyContinuity</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>© 2026 TherapyContinuity</span>
              <button className="hover:text-foreground transition-colors" onClick={() => toast.info("Privacy Policy coming soon.")}>Privacy Policy</button>
              <button className="hover:text-foreground transition-colors" onClick={() => toast.info("Terms of Service coming soon.")}>Terms of Service</button>
              <button className="hover:text-foreground transition-colors" onClick={() => toast.info("HIPAA information coming soon.")}>HIPAA</button>
            </div>
            <p className="text-xs text-muted-foreground text-center md:text-right max-w-xs">
              This platform is a clinical support tool. It does not provide therapy, diagnosis, or crisis intervention.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
