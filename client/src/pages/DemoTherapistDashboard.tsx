import { useState } from "react";
import DemoBanner from "@/components/DemoBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DEMO_THERAPIST,
  DEMO_CLIENTS,
  DEMO_GOALS,
  DEMO_HOMEWORK,
  DEMO_AI_SUMMARIES,
  DEMO_MOOD_ENTRIES,
  DEMO_EMOTIONAL_EVENTS,
} from "@/lib/demoData";
import {
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Heart,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const MODALITY_LABELS: Record<string, string> = {
  cbt: "CBT",
  dbt: "DBT",
  trauma_informed: "Trauma-Informed",
  emdr: "EMDR",
  general: "General",
};

const MODALITY_COLORS: Record<string, string> = {
  cbt: "bg-blue-100 text-blue-800",
  dbt: "bg-purple-100 text-purple-800",
  trauma_informed: "bg-amber-100 text-amber-800",
  emdr: "bg-teal-100 text-teal-800",
  general: "bg-gray-100 text-gray-800",
};

export default function DemoTherapistDashboard() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [showingSummary, setShowingSummary] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const selectedClient = DEMO_CLIENTS.find((c) => c.id === selectedClientId);
  const clientGoals = DEMO_GOALS.filter((g) => g.clientId === selectedClientId);
  const clientHomework = DEMO_HOMEWORK.filter((h) => h.clientId === selectedClientId);
  const clientSummary = DEMO_AI_SUMMARIES.find((s) => s.clientId === selectedClientId);
  const clientMoods = DEMO_MOOD_ENTRIES.filter((m) => m.clientId === selectedClientId);
  const clientEvents = DEMO_EMOTIONAL_EVENTS.filter((e) => e.clientId === selectedClientId);

  const moodChartData = clientMoods.map((m) => ({
    date: new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    mood: m.moodScore,
    anxiety: m.anxietyLevel,
  }));

  const handleGenerateSummary = () => {
    setLoadingSummary(true);
    setTimeout(() => {
      setLoadingSummary(false);
      setShowingSummary(true);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DemoBanner />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card shrink-0 flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm text-foreground">TherapyContinuity</span>
            </div>
          </div>

          <div className="p-3 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">Navigation</p>
            {[
              { icon: Users, label: "Clients", active: true },
              { icon: Calendar, label: "Sessions", active: false },
              { icon: ClipboardList, label: "Audit Log", active: false },
            ].map((item) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${item.active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                SC
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{DEMO_THERAPIST.name}</p>
                <p className="text-xs text-muted-foreground truncate">{DEMO_THERAPIST.practiceName}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Client list */}
          <div className="w-72 border-r border-border bg-background flex flex-col shrink-0">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Active Clients
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">{DEMO_CLIENTS.length} of {DEMO_THERAPIST.maxClients} seats used</p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {DEMO_CLIENTS.map((client) => {
                  const lastMood = DEMO_MOOD_ENTRIES.filter((m) => m.clientId === client.id).slice(-1)[0];
                  const isSelected = selectedClientId === client.id;
                  return (
                    <button
                      key={client.id}
                      onClick={() => { setSelectedClientId(client.id); setShowingSummary(false); }}
                      className={`w-full text-left p-3 rounded-xl transition-all ${isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50 border border-transparent"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center font-semibold text-primary text-sm shrink-0">
                          {client.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-foreground truncate">{client.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${MODALITY_COLORS[client.primaryModality]}`}>
                              {MODALITY_LABELS[client.primaryModality]}
                            </span>
                          </div>
                        </div>
                        {lastMood && (
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">Mood</p>
                            <p className={`text-sm font-bold ${lastMood.moodScore >= 7 ? "text-green-600" : lastMood.moodScore >= 5 ? "text-amber-600" : "text-red-500"}`}>
                              {lastMood.moodScore}/10
                            </p>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Client detail */}
          <div className="flex-1 overflow-auto">
            {!selectedClient ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a Client</h3>
                <p className="text-muted-foreground text-sm max-w-xs">Choose a client from the list to view their profile, progress, and session preparation summary.</p>
              </div>
            ) : (
              <div className="p-6">
                {/* Client header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                      {selectedClient.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{selectedClient.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MODALITY_COLORS[selectedClient.primaryModality]}`}>
                          {MODALITY_LABELS[selectedClient.primaryModality]}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">{selectedClient.sessionFrequency} sessions</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 max-w-md">{selectedClient.treatmentGoalsSummary}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleGenerateSummary}
                    disabled={loadingSummary}
                    className="shrink-0"
                  >
                    {loadingSummary ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    {loadingSummary ? "Generating..." : "Session Prep Summary"}
                  </Button>
                </div>

                {/* AI Summary */}
                {showingSummary && clientSummary && (
                  <Card className="border-primary/20 bg-primary/5 mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI Session Preparation Summary
                      </CardTitle>
                      <CardDescription>Generated {new Date(clientSummary.createdAt).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                        {clientSummary.content}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                    <TabsTrigger value="homework">Homework</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4">
                    {/* Mood Chart */}
                    {moodChartData.length > 0 && (
                      <Card className="border-border">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            Mood & Anxiety Trend
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={160}>
                            <LineChart data={moodChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                              <Tooltip />
                              <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Mood" />
                              <Line type="monotone" dataKey="anxiety" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Anxiety" />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Avg Mood", value: clientMoods.length ? (clientMoods.reduce((s, m) => s + m.moodScore, 0) / clientMoods.length).toFixed(1) : "—", color: "text-green-600" },
                        { label: "Events Logged", value: clientEvents.length, color: "text-foreground" },
                        { label: "Active Goals", value: clientGoals.filter((g) => g.status === "active").length, color: "text-primary" },
                      ].map((stat) => (
                        <Card key={stat.label} className="border-border">
                          <CardContent className="pt-4 pb-4 text-center">
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Goals Tab */}
                  <TabsContent value="goals" className="space-y-3">
                    {clientGoals.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No goals set yet.</p>
                    ) : (
                      clientGoals.map((goal) => (
                        <Card key={goal.id} className="border-border">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-start gap-3">
                              <Target className={`w-4 h-4 mt-0.5 shrink-0 ${goal.status === "completed" ? "text-green-500" : "text-primary"}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${goal.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                  {goal.goalText}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <Badge variant={goal.status === "completed" ? "secondary" : "default"} className="text-xs capitalize">
                                    {goal.status}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  {/* Homework Tab */}
                  <TabsContent value="homework" className="space-y-3">
                    {clientHomework.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No homework assigned yet.</p>
                    ) : (
                      clientHomework.map((hw) => (
                        <Card key={hw.id} className="border-border">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${hw.status === "completed" ? "text-green-500" : "text-muted-foreground"}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{hw.title}</p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{hw.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant={hw.status === "completed" ? "default" : "secondary"} className="text-xs capitalize">
                                    {hw.status.replace("_", " ")}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">Due {new Date(hw.dueDate).toLocaleDateString()}</span>
                                </div>
                                {hw.completionNotes && (
                                  <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-100">
                                    <p className="text-xs text-green-800 font-medium mb-0.5">Client notes:</p>
                                    <p className="text-xs text-green-700">{hw.completionNotes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  {/* Events Tab */}
                  <TabsContent value="events" className="space-y-3">
                    {clientEvents.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No events logged yet.</p>
                    ) : (
                      clientEvents.map((ev) => (
                        <Card key={ev.id} className="border-border">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ev.eventType === "positive_moment" ? "bg-green-500" : ev.eventType === "anxiety_spike" ? "bg-amber-500" : "bg-red-400"}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-foreground capitalize">{ev.eventType.replace(/_/g, " ")}</span>
                                  <span className="text-xs text-muted-foreground">Intensity {ev.intensity}/10</span>
                                  <span className="text-xs text-muted-foreground">{new Date(ev.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-foreground">{ev.description}</p>
                                {ev.copingUsed && (
                                  <p className="text-xs text-muted-foreground mt-1">Coping: {ev.copingUsed}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
