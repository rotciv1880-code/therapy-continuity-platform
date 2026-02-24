import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Heart,
  Loader2,
  MessageSquare,
  Phone,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CRISIS_RESOURCES = [
  { name: "988 Suicide & Crisis Lifeline", action: "Call or text 988", urgent: true },
  { name: "Crisis Text Line", action: "Text HOME to 741741", urgent: true },
  { name: "Emergency Services", action: "Call 911", urgent: true },
];

const CHECK_IN_QUESTIONS: Record<string, { label: string; type: "text" | "scale" }[]> = {
  daily: [
    { label: "How are you feeling right now?", type: "text" },
    { label: "What has been on your mind most today?", type: "text" },
    { label: "Did you use any coping strategies today? If so, which ones?", type: "text" },
    { label: "Is there anything you'd like your therapist to know before your next session?", type: "text" },
  ],
  pre_session: [
    { label: "What do you most want to focus on in today's session?", type: "text" },
    { label: "How have you been since your last session?", type: "text" },
    { label: "Did you complete your homework? How did it go?", type: "text" },
    { label: "Is there anything urgent you need to address today?", type: "text" },
  ],
  post_session: [
    { label: "What was most helpful about today's session?", type: "text" },
    { label: "What are you taking away from today?", type: "text" },
    { label: "How are you feeling now compared to before the session?", type: "text" },
    { label: "What do you want to remember to work on before next session?", type: "text" },
  ],
};

export default function ClientDashboard() {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const [checkInType, setCheckInType] = useState<"daily" | "pre_session" | "post_session">("daily");
  const [checkInResponses, setCheckInResponses] = useState<Record<string, string>>({});
  const [checkInMood, setCheckInMood] = useState(5);
  const [checkInResult, setCheckInResult] = useState<{ aiReflection: string | null; crisisDetected: boolean; crisisResponse?: string } | null>(null);
  const [crisisAlert, setCrisisAlert] = useState<string | null>(null);

  // Event form
  const [eventForm, setEventForm] = useState({
    eventType: "anxiety" as const,
    intensity: 5,
    description: "",
    triggers: "",
    copingStrategiesUsed: "",
    sharedWithTherapist: true,
  });

  // Mood form
  const [moodForm, setMoodForm] = useState({
    moodScore: 5,
    energyLevel: 5,
    anxietyLevel: 5,
    sleepHours: 7,
    notes: "",
  });

  const utils = trpc.useUtils();

  const { data: dashboard, isLoading } = trpc.clientApp.getDashboard.useQuery();
  const { data: moodTimeline } = trpc.clientApp.getMoodTimeline.useQuery();
  const { data: reflectionPrompts } = trpc.clientApp.getReflectionPrompts.useQuery();

  const completeCheckIn = trpc.clientApp.completeCheckIn.useMutation({
    onSuccess: (data) => {
      if (data.crisisDetected) {
        setCrisisAlert(data.crisisResponse ?? null);
        setCheckInOpen(false);
      } else {
        setCheckInResult({ aiReflection: data.aiReflection, crisisDetected: false });
        toast.success("Check-in completed!");
        utils.clientApp.getDashboard.invalidate();
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const logEvent = trpc.clientApp.logEmotionalEvent.useMutation({
    onSuccess: (data) => {
      if (data.crisisDetected) {
        setCrisisAlert(data.crisisResponse ?? null);
        setEventOpen(false);
      } else {
        toast.success("Event logged.");
        setEventOpen(false);
        setEventForm({ eventType: "anxiety", intensity: 5, description: "", triggers: "", copingStrategiesUsed: "", sharedWithTherapist: true });
        utils.clientApp.getDashboard.invalidate();
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const logMood = trpc.clientApp.logMood.useMutation({
    onSuccess: () => {
      toast.success("Mood logged!");
      setMoodOpen(false);
      setMoodForm({ moodScore: 5, energyLevel: 5, anxietyLevel: 5, sleepHours: 7, notes: "" });
      utils.clientApp.getDashboard.invalidate();
      utils.clientApp.getMoodTimeline.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateHomework = trpc.clientApp.updateHomeworkStatus.useMutation({
    onSuccess: () => {
      toast.success("Homework updated!");
      utils.clientApp.getDashboard.invalidate();
    },
  });

  const handleCheckInSubmit = () => {
    completeCheckIn.mutate({
      checkInType,
      responses: checkInResponses,
      moodAtCheckIn: checkInMood,
    });
  };

  const moodChartData = moodTimeline?.slice().reverse().map((m) => ({
    date: new Date(m.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    mood: m.moodScore,
    energy: m.energyLevel,
    anxiety: m.anxietyLevel,
  })) ?? [];

  const pendingHomework = dashboard?.homework.filter((h) => h.status === "assigned" || h.status === "in_progress") ?? [];
  const activeGoals = dashboard?.goals.filter((g) => g.status === "active") ?? [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboard?.profile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Heart className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Waiting for your therapist</h3>
          <p className="text-muted-foreground text-sm max-w-sm">Your therapist will send you an invitation to connect. Once connected, you'll be able to complete check-ins and track your progress here.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Crisis Alert */}
        {crisisAlert && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-2">Important: Crisis Resources</h3>
                  <div className="prose prose-sm max-w-none text-foreground">
                    <Streamdown>{crisisAlert}</Streamdown>
                  </div>
                  <div className="mt-4 grid sm:grid-cols-3 gap-3">
                    {CRISIS_RESOURCES.map((r) => (
                      <div key={r.name} className="p-3 bg-card rounded-lg border border-destructive/20">
                        <p className="text-sm font-medium text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.action}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-4 bg-background" onClick={() => setCrisisAlert(null)}>
                    I understand
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Reflection Result */}
        {checkInResult?.aiReflection && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Your Reflection Prompts
              </CardTitle>
              <CardDescription>Based on your check-in — bring these to your next session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-foreground">
                <Streamdown>{checkInResult.aiReflection}</Streamdown>
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                These prompts are for personal reflection only. They are not therapy or clinical advice.
              </p>
              <Button variant="outline" size="sm" className="mt-3 bg-background" onClick={() => setCheckInResult(null)}>Dismiss</Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Daily Check-in", icon: <CheckCircle2 className="w-5 h-5" />, action: () => { setCheckInType("daily"); setCheckInOpen(true); }, color: "bg-primary/10 text-primary" },
            { label: "Log Mood", icon: <TrendingUp className="w-5 h-5" />, action: () => setMoodOpen(true), color: "bg-green-100 text-green-700" },
            { label: "Log Event", icon: <Heart className="w-5 h-5" />, action: () => setEventOpen(true), color: "bg-amber-100 text-amber-700" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={a.action}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all text-center"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${a.color}`}>{a.icon}</div>
              <span className="text-sm font-medium text-foreground">{a.label}</span>
            </button>
          ))}
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mood">Mood Timeline</TabsTrigger>
            <TabsTrigger value="homework">Homework</TabsTrigger>
            <TabsTrigger value="goals">My Goals</TabsTrigger>
            <TabsTrigger value="reflections">Reflections</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Current Mood", value: dashboard.recentMood[0] ? `${dashboard.recentMood[0].moodScore}/10` : "—", icon: <Heart className="w-4 h-4" /> },
                { label: "Active Goals", value: activeGoals.length, icon: <Target className="w-4 h-4" /> },
                { label: "Pending Homework", value: pendingHomework.length, icon: <BookOpen className="w-4 h-4" /> },
              ].map((s) => (
                <Card key={s.label} className="border-border">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      {s.icon}
                      <span className="text-xs">{s.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pending homework preview */}
            {pendingHomework.length > 0 && (
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Pending Homework
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingHomework.slice(0, 3).map((h) => (
                    <div key={h.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">{h.title}</p>
                        {h.dueDate && <p className="text-xs text-muted-foreground">Due: {new Date(h.dueDate).toLocaleDateString()}</p>}
                      </div>
                      <Button size="sm" variant="outline" className="bg-background" onClick={() => updateHomework.mutate({ homeworkId: h.id, status: "in_progress" })}>
                        Start
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recent events */}
            {dashboard.recentEvents.length > 0 && (
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    Recent Emotional Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dashboard.recentEvents.map((e) => (
                    <div key={e.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground capitalize">{e.eventType}</p>
                        <p className="text-xs text-muted-foreground">Intensity {e.intensity}/10 · {new Date(e.occurredAt).toLocaleDateString()}</p>
                        {e.description && <p className="text-xs text-muted-foreground mt-1">{e.description}</p>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Mood Timeline */}
          <TabsContent value="mood" className="mt-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Mood Timeline (Last 30 Days)</CardTitle>
                <CardDescription>Track your emotional patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                {moodChartData.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No mood data yet. Start logging your mood daily to see your timeline.</p>
                    <Button size="sm" className="mt-4" onClick={() => setMoodOpen(true)}>Log First Mood</Button>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={moodChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <YAxis domain={[1, 10]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <Tooltip
                        contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                      />
                      <Line type="monotone" dataKey="mood" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} name="Mood" />
                      <Line type="monotone" dataKey="energy" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 3 }} name="Energy" strokeDasharray="4 2" />
                      <Line type="monotone" dataKey="anxiety" stroke="var(--chart-5)" strokeWidth={2} dot={{ r: 3 }} name="Anxiety" strokeDasharray="2 2" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Homework */}
          <TabsContent value="homework" className="space-y-4 mt-4">
            {dashboard.homework.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No homework assigned yet. Your therapist will assign tasks here.</p>
              </div>
            ) : (
              dashboard.homework.map((h) => (
                <Card key={h.id} className="border-border">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground text-sm">{h.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            h.status === "completed" ? "bg-green-100 text-green-800" :
                            h.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                            h.status === "skipped" ? "bg-gray-100 text-gray-800" :
                            "bg-orange-100 text-orange-800"
                          }`}>{h.status.replace("_", " ")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{h.description}</p>
                        {h.dueDate && <p className="text-xs text-muted-foreground mt-1">Due: {new Date(h.dueDate).toLocaleDateString()}</p>}
                        {h.therapistReviewNotes && (
                          <div className="mt-2 p-2 bg-primary/5 rounded text-xs text-foreground">
                            <strong>Therapist feedback:</strong> {h.therapistReviewNotes}
                          </div>
                        )}
                      </div>
                      {h.status !== "completed" && h.status !== "skipped" && (
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline" className="bg-background text-xs" onClick={() => updateHomework.mutate({ homeworkId: h.id, status: "completed" })}>
                            Complete
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => updateHomework.mutate({ homeworkId: h.id, status: "skipped" })}>
                            Skip
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Goals */}
          <TabsContent value="goals" className="space-y-4 mt-4">
            {activeGoals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No active goals yet. Your therapist will set therapy goals here.</p>
              </div>
            ) : (
              activeGoals.map((g) => (
                <Card key={g.id} className="border-border">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-sm font-medium text-foreground">{g.goalText}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">{g.status}</span>
                      {g.targetDate && <span className="text-xs text-muted-foreground">Target: {new Date(g.targetDate).toLocaleDateString()}</span>}
                    </div>
                    {g.progressNotes && <p className="text-xs text-muted-foreground mt-2">{g.progressNotes}</p>}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Reflections */}
          <TabsContent value="reflections" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">AI Reflection Prompts</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Generated after your check-ins to support between-session reflection</p>
              </div>
            </div>
            {!reflectionPrompts || reflectionPrompts.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Complete a check-in to receive personalized reflection prompts.</p>
                <Button size="sm" className="mt-4" onClick={() => { setCheckInType("daily"); setCheckInOpen(true); }}>Start Check-in</Button>
              </div>
            ) : (
              reflectionPrompts.map((r) => (
                <Card key={r.id} className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Reflection Prompts
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-foreground">
                      <Streamdown>{r.content}</Streamdown>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 italic">For personal reflection only — not clinical advice.</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Check-in Dialog */}
        <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                {checkInType === "daily" ? "Daily Check-in" : checkInType === "pre_session" ? "Pre-Session Check-in" : "Post-Session Check-in"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Check-in Type</label>
                <Select value={checkInType} onValueChange={(v) => setCheckInType(v as typeof checkInType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Check-in</SelectItem>
                    <SelectItem value="pre_session">Pre-Session</SelectItem>
                    <SelectItem value="post_session">Post-Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">How is your mood right now? ({checkInMood}/10)</label>
                <Slider
                  min={1} max={10} step={1}
                  value={[checkInMood]}
                  onValueChange={([v]) => setCheckInMood(v)}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Very low</span><span>Neutral</span><span>Very high</span>
                </div>
              </div>

              {(CHECK_IN_QUESTIONS[checkInType] ?? CHECK_IN_QUESTIONS.daily).map((q, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="text-sm font-medium">{q.label}</label>
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={checkInResponses[`q${i}`] ?? ""}
                    onChange={(e) => setCheckInResponses((p) => ({ ...p, [`q${i}`]: e.target.value }))}
                    rows={2}
                  />
                </div>
              ))}

              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                Your responses are shared with your therapist to support your care. If you are in crisis, please contact 988 or emergency services immediately.
              </p>

              <Button className="w-full" onClick={handleCheckInSubmit} disabled={completeCheckIn.isPending}>
                {completeCheckIn.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Complete Check-in
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Emotional Event Dialog */}
        <Dialog open={eventOpen} onOpenChange={setEventOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Log Emotional Event
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Event Type</label>
                <Select value={eventForm.eventType} onValueChange={(v) => setEventForm((p) => ({ ...p, eventType: v as typeof eventForm.eventType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["anxiety", "depression", "anger", "grief", "joy", "fear", "shame", "other"].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Intensity ({eventForm.intensity}/10)</label>
                <Slider min={1} max={10} step={1} value={[eventForm.intensity]} onValueChange={([v]) => setEventForm((p) => ({ ...p, intensity: v }))} className="py-2" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description (optional)</label>
                <Textarea placeholder="What happened?" value={eventForm.description} onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))} rows={2} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Triggers (optional)</label>
                <Textarea placeholder="What triggered this?" value={eventForm.triggers} onChange={(e) => setEventForm((p) => ({ ...p, triggers: e.target.value }))} rows={2} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Coping strategies used (optional)</label>
                <Textarea placeholder="What helped?" value={eventForm.copingStrategiesUsed} onChange={(e) => setEventForm((p) => ({ ...p, copingStrategiesUsed: e.target.value }))} rows={2} />
              </div>
              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                If you are experiencing a crisis, please call 988 or emergency services immediately.
              </p>
              <Button className="w-full" onClick={() => logEvent.mutate(eventForm)} disabled={logEvent.isPending}>
                {logEvent.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Log Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mood Dialog */}
        <Dialog open={moodOpen} onOpenChange={setMoodOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Log Your Mood
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-2">
              {[
                { key: "moodScore", label: "Overall Mood" },
                { key: "energyLevel", label: "Energy Level" },
                { key: "anxietyLevel", label: "Anxiety Level" },
              ].map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-sm font-medium">{field.label} ({moodForm[field.key as keyof typeof moodForm]}/10)</label>
                  <Slider
                    min={1} max={10} step={1}
                    value={[moodForm[field.key as keyof typeof moodForm] as number]}
                    onValueChange={([v]) => setMoodForm((p) => ({ ...p, [field.key]: v }))}
                    className="py-2"
                  />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Sleep last night (hours): {moodForm.sleepHours}</label>
                <Slider min={0} max={12} step={0.5} value={[moodForm.sleepHours]} onValueChange={([v]) => setMoodForm((p) => ({ ...p, sleepHours: v }))} className="py-2" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea placeholder="Anything you'd like to note about today?" value={moodForm.notes} onChange={(e) => setMoodForm((p) => ({ ...p, notes: e.target.value }))} rows={2} />
              </div>
              <Button className="w-full" onClick={() => logMood.mutate(moodForm)} disabled={logMood.isPending}>
                {logMood.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Mood Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
