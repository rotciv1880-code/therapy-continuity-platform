import { useState } from "react";
import DemoBanner from "@/components/DemoBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  DEMO_CLIENT_PERSONA,
  DEMO_THERAPIST,
  DEMO_GOALS,
  DEMO_HOMEWORK,
  DEMO_MOOD_ENTRIES,
  DEMO_EMOTIONAL_EVENTS,
  DEMO_CHECKINS,
  DEMO_REFLECTION_PROMPTS,
} from "@/lib/demoData";
import {
  CheckCircle2,
  ChevronRight,
  Heart,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";

const MOOD_LABELS: Record<number, string> = {
  1: "Very Low", 2: "Low", 3: "Below Average", 4: "Slightly Low",
  5: "Neutral", 6: "Slightly Good", 7: "Good", 8: "Very Good",
  9: "Excellent", 10: "Outstanding",
};

export default function DemoClientDashboard() {
  const client = DEMO_CLIENT_PERSONA;
  const goals = DEMO_GOALS.filter((g) => g.clientId === client.id);
  const homework = DEMO_HOMEWORK.filter((h) => h.clientId === client.id);
  const moods = DEMO_MOOD_ENTRIES.filter((m) => m.clientId === client.id);
  const lastCheckin = DEMO_CHECKINS.find((c) => c.clientId === client.id);

  const [checkInStep, setCheckInStep] = useState(0);
  const [checkInData, setCheckInData] = useState({ mood: 7, energy: 6, anxiety: 4, highlight: "", challenge: "" });
  const [checkInDone, setCheckInDone] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  const modality = client.primaryModality as keyof typeof DEMO_REFLECTION_PROMPTS;
  const prompts = DEMO_REFLECTION_PROMPTS[modality] ?? DEMO_REFLECTION_PROMPTS.general;

  const moodChartData = moods.map((m) => ({
    date: new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    mood: m.moodScore,
    anxiety: m.anxietyLevel,
  }));

  const handleNextPrompt = () => {
    setLoadingPrompt(true);
    setTimeout(() => {
      setPromptIndex((i) => (i + 1) % prompts.length);
      setLoadingPrompt(false);
    }, 800);
  };

  const handleCompleteCheckin = () => {
    toast.success("Check-in saved! Your therapist will see this before your next session.");
    setCheckInDone(true);
  };

  const avgMood = moods.length ? (moods.reduce((s, m) => s + m.moodScore, 0) / moods.length).toFixed(1) : "—";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DemoBanner />

      <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Welcome header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Lora', serif" }}>
              Hello, {client.name.split(" ")[0]} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Working with {DEMO_THERAPIST.name} · CBT Program
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Last check-in</p>
            <p className="text-sm font-medium text-foreground">
              {lastCheckin ? new Date(lastCheckin.completedAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Avg Mood", value: avgMood, sub: "last 2 weeks", color: "text-green-600" },
            { label: "Goals Active", value: goals.filter((g) => g.status === "active").length, sub: "in progress", color: "text-primary" },
            { label: "Homework", value: homework.filter((h) => h.status === "completed").length + "/" + homework.length, sub: "completed", color: "text-foreground" },
          ].map((s) => (
            <Card key={s.label} className="border-border">
              <CardContent className="pt-4 pb-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                <p className="text-xs text-muted-foreground/60">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="checkin">
          <TabsList className="w-full">
            <TabsTrigger value="checkin" className="flex-1">Daily Check-In</TabsTrigger>
            <TabsTrigger value="mood" className="flex-1">Mood Timeline</TabsTrigger>
            <TabsTrigger value="prompts" className="flex-1">Reflection</TabsTrigger>
            <TabsTrigger value="homework" className="flex-1">Homework</TabsTrigger>
          </TabsList>

          {/* ── Check-In Tab ── */}
          <TabsContent value="checkin" className="mt-4">
            {checkInDone ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-8 pb-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Check-In Complete!</h3>
                  <p className="text-sm text-muted-foreground">Your mood and reflections have been saved. Dr. Chen will review them before your next session.</p>
                  <Button variant="outline" className="mt-4 bg-background" onClick={() => { setCheckInDone(false); setCheckInStep(0); }}>
                    Start Another Check-In
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    How are you doing today?
                  </CardTitle>
                  <CardDescription>Step {checkInStep + 1} of 3</CardDescription>
                  <div className="flex gap-1 mt-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= checkInStep ? "bg-primary" : "bg-muted"}`} />
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {checkInStep === 0 && (
                    <>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Mood</label>
                            <span className="text-sm text-primary font-semibold">{checkInData.mood}/10 — {MOOD_LABELS[checkInData.mood]}</span>
                          </div>
                          <Slider min={1} max={10} step={1} value={[checkInData.mood]} onValueChange={([v]) => setCheckInData((p) => ({ ...p, mood: v }))} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Energy Level</label>
                            <span className="text-sm text-primary font-semibold">{checkInData.energy}/10</span>
                          </div>
                          <Slider min={1} max={10} step={1} value={[checkInData.energy]} onValueChange={([v]) => setCheckInData((p) => ({ ...p, energy: v }))} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Anxiety Level</label>
                            <span className="text-sm text-amber-600 font-semibold">{checkInData.anxiety}/10</span>
                          </div>
                          <Slider min={1} max={10} step={1} value={[checkInData.anxiety]} onValueChange={([v]) => setCheckInData((p) => ({ ...p, anxiety: v }))} />
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => setCheckInStep(1)}>
                        Next <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </>
                  )}

                  {checkInStep === 1 && (
                    <>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">What went well today or this week?</label>
                          <Textarea
                            placeholder="e.g. I used a breathing exercise before a stressful meeting..."
                            value={checkInData.highlight}
                            onChange={(e) => setCheckInData((p) => ({ ...p, highlight: e.target.value }))}
                            rows={3}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">What was challenging?</label>
                          <Textarea
                            placeholder="e.g. I had trouble sleeping and felt anxious about..."
                            value={checkInData.challenge}
                            onChange={(e) => setCheckInData((p) => ({ ...p, challenge: e.target.value }))}
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="bg-background" onClick={() => setCheckInStep(0)}>Back</Button>
                        <Button className="flex-1" onClick={() => setCheckInStep(2)}>
                          Next <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </>
                  )}

                  {checkInStep === 2 && (
                    <>
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">Review your check-in</h3>
                        <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Mood</span><span className="font-medium">{checkInData.mood}/10</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Energy</span><span className="font-medium">{checkInData.energy}/10</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Anxiety</span><span className="font-medium">{checkInData.anxiety}/10</span></div>
                          {checkInData.highlight && <div><span className="text-muted-foreground">Highlight: </span><span>{checkInData.highlight}</span></div>}
                          {checkInData.challenge && <div><span className="text-muted-foreground">Challenge: </span><span>{checkInData.challenge}</span></div>}
                        </div>
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                          <p className="text-xs text-primary font-medium mb-1">Your AI reflection prompt:</p>
                          <p className="text-sm text-foreground italic">"{prompts[promptIndex]}"</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="bg-background" onClick={() => setCheckInStep(1)}>Back</Button>
                        <Button className="flex-1" onClick={handleCompleteCheckin}>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Complete Check-In
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Mood Timeline Tab ── */}
          <TabsContent value="mood" className="mt-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Your Mood & Anxiety — Last 2 Weeks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={moodChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} name="Mood" />
                    <Line type="monotone" dataKey="anxiety" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Anxiety" strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary inline-block rounded" /> Mood</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-500 inline-block rounded" /> Anxiety</span>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 space-y-2">
              {moods.slice().reverse().map((m) => (
                <Card key={m.id} className="border-border">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${m.moodScore >= 7 ? "bg-green-100 text-green-700" : m.moodScore >= 5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                          {m.moodScore}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{MOOD_LABELS[m.moodScore]}</p>
                          {m.notes && <p className="text-xs text-muted-foreground">{m.notes}</p>}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Reflection Prompts Tab ── */}
          <TabsContent value="prompts" className="mt-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Your Reflection Prompt
                </CardTitle>
                <CardDescription>Tailored to your CBT treatment approach</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 min-h-[120px] flex items-center">
                  {loadingPrompt ? (
                    <div className="flex items-center gap-2 text-muted-foreground mx-auto">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Generating prompt...</span>
                    </div>
                  ) : (
                    <p className="text-lg text-foreground font-medium leading-relaxed text-center w-full" style={{ fontFamily: "'Lora', serif" }}>
                      "{prompts[promptIndex]}"
                    </p>
                  )}
                </div>
                <Button variant="outline" className="w-full bg-background" onClick={handleNextPrompt} disabled={loadingPrompt}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingPrompt ? "animate-spin" : ""}`} />
                  New Prompt
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  These prompts are designed to support reflection between sessions. They are not therapy or clinical advice.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Homework Tab ── */}
          <TabsContent value="homework" className="mt-4 space-y-3">
            {homework.map((hw) => (
              <Card key={hw.id} className={`border-border ${hw.status === "completed" ? "opacity-80" : ""}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${hw.status === "completed" ? "text-green-500" : "text-muted-foreground"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${hw.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {hw.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{hw.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={hw.status === "completed" ? "default" : "secondary"} className="text-xs capitalize">
                          {hw.status.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Due {new Date(hw.dueDate).toLocaleDateString()}</span>
                      </div>
                      {hw.completionNotes && (
                        <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-100">
                          <p className="text-xs text-green-700">{hw.completionNotes}</p>
                        </div>
                      )}
                      {hw.therapistReview && (
                        <div className="mt-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
                          <p className="text-xs text-primary font-medium mb-0.5">Therapist feedback:</p>
                          <p className="text-xs text-foreground">{hw.therapistReview}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Your Therapy Goals
              </h3>
              {goals.map((goal) => (
                <Card key={goal.id} className="border-border mb-2">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${goal.status === "completed" ? "bg-green-500" : "bg-primary"}`} />
                      <p className={`text-sm ${goal.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {goal.goalText}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
