import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Heart,
  Loader2,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

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
  emdr: "bg-green-100 text-green-800",
  general: "bg-gray-100 text-gray-800",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  achieved: "bg-blue-100 text-blue-800",
  paused: "bg-yellow-100 text-yellow-800",
  archived: "bg-gray-100 text-gray-800",
  assigned: "bg-orange-100 text-orange-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  skipped: "bg-gray-100 text-gray-800",
};

export default function TherapistDashboard() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [hwOpen, setHwOpen] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // Invite form
  const [inviteForm, setInviteForm] = useState({ clientEmail: "", primaryModality: "general", treatmentGoalsSummary: "", sessionFrequency: "weekly" });
  // Goal form
  const [goalForm, setGoalForm] = useState({ goalText: "", modality: "general", targetDate: "" });
  // Homework form
  const [hwForm, setHwForm] = useState({ title: "", description: "", modality: "general", dueDate: "" });

  const utils = trpc.useUtils();

  const { data: clients, isLoading: loadingClients } = trpc.therapist.listClients.useQuery();
  const { data: clientDetail, isLoading: loadingDetail } = trpc.therapist.getClientDetail.useQuery(
    { clientId: selectedClientId! },
    { enabled: !!selectedClientId }
  );

  const inviteClient = trpc.therapist.inviteClient.useMutation({
    onSuccess: () => {
      toast.success("Client invited successfully!");
      setInviteOpen(false);
      setInviteForm({ clientEmail: "", primaryModality: "general", treatmentGoalsSummary: "", sessionFrequency: "weekly" });
      utils.therapist.listClients.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateModality = trpc.therapist.updateClientModality.useMutation({
    onSuccess: () => {
      toast.success("Modality updated.");
      utils.therapist.getClientDetail.invalidate({ clientId: selectedClientId! });
    },
    onError: (e) => toast.error(e.message),
  });

  const createGoal = trpc.therapist.createGoal.useMutation({
    onSuccess: () => {
      toast.success("Goal created.");
      setGoalOpen(false);
      setGoalForm({ goalText: "", modality: "general", targetDate: "" });
      utils.therapist.getClientDetail.invalidate({ clientId: selectedClientId! });
    },
    onError: (e) => toast.error(e.message),
  });

  const createHw = trpc.therapist.createHomework.useMutation({
    onSuccess: () => {
      toast.success("Homework assigned.");
      setHwOpen(false);
      setHwForm({ title: "", description: "", modality: "general", dueDate: "" });
      utils.therapist.getClientDetail.invalidate({ clientId: selectedClientId! });
    },
    onError: (e) => toast.error(e.message),
  });

  const updateGoal = trpc.therapist.updateGoal.useMutation({
    onSuccess: () => {
      toast.success("Goal updated.");
      utils.therapist.getClientDetail.invalidate({ clientId: selectedClientId! });
    },
  });

  const reviewHw = trpc.therapist.reviewHomework.useMutation({
    onSuccess: () => {
      toast.success("Homework reviewed.");
      utils.therapist.getClientDetail.invalidate({ clientId: selectedClientId! });
    },
  });

  const getSessionPrep = trpc.therapist.getSessionPrepSummary.useMutation({
    onSuccess: (data) => {
      setSessionSummary(data.summary);
      setGeneratingSummary(false);
    },
    onError: (e) => {
      toast.error(e.message);
      setGeneratingSummary(false);
    },
  });

  const handleGenerateSummary = () => {
    if (!selectedClientId) return;
    setGeneratingSummary(true);
    setSessionSummary(null);
    getSessionPrep.mutate({ clientId: selectedClientId });
  };

  const avgMood = clientDetail?.recentMood?.length
    ? (clientDetail.recentMood.reduce((a, b) => a + b.moodScore, 0) / clientDetail.recentMood.length).toFixed(1)
    : null;

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Client List Sidebar */}
        <aside className="w-72 border-r border-border bg-card flex flex-col shrink-0">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">My Clients</h2>
              <p className="text-xs text-muted-foreground">{clients?.length ?? 0} active</p>
            </div>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="bg-background">
                  <Plus className="w-4 h-4 mr-1" /> Invite
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite a Client</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Client Email</label>
                    <Input
                      type="email"
                      placeholder="client@email.com"
                      value={inviteForm.clientEmail}
                      onChange={(e) => setInviteForm((p) => ({ ...p, clientEmail: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Primary Modality</label>
                    <Select value={inviteForm.primaryModality} onValueChange={(v) => setInviteForm((p) => ({ ...p, primaryModality: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cbt">CBT</SelectItem>
                        <SelectItem value="dbt">DBT</SelectItem>
                        <SelectItem value="trauma_informed">Trauma-Informed</SelectItem>
                        <SelectItem value="emdr">EMDR</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Session Frequency</label>
                    <Select value={inviteForm.sessionFrequency} onValueChange={(v) => setInviteForm((p) => ({ ...p, sessionFrequency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Biweekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Treatment Goals Summary (optional)</label>
                    <Textarea
                      placeholder="Brief overview of treatment goals..."
                      value={inviteForm.treatmentGoalsSummary}
                      onChange={(e) => setInviteForm((p) => ({ ...p, treatmentGoalsSummary: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => inviteClient.mutate(inviteForm as Parameters<typeof inviteClient.mutate>[0])}
                    disabled={inviteClient.isPending || !inviteForm.clientEmail}
                  >
                    {inviteClient.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Send Invite
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loadingClients ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : clients?.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No clients yet. Invite your first client to get started.</p>
              </div>
            ) : (
              clients?.map(({ client, user }) => (
                <button
                  key={client.id}
                  onClick={() => { setSelectedClientId(client.id); setSessionSummary(null); }}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${selectedClientId === client.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                      {(user?.name ?? "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{user?.name ?? user?.email ?? "Unknown"}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${MODALITY_COLORS[client.primaryModality]}`}>
                        {MODALITY_LABELS[client.primaryModality]}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {!selectedClientId ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Brain className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Select a client to begin</h3>
              <p className="text-muted-foreground text-sm max-w-xs">Choose a client from the list to view their profile, session prep summary, goals, and homework.</p>
            </div>
          ) : loadingDetail ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : clientDetail ? (
            <div className="space-y-6 max-w-4xl">
              {/* Client Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    {(clientDetail.user?.name ?? "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{clientDetail.user?.name ?? clientDetail.user?.email}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MODALITY_COLORS[clientDetail.client.primaryModality]}`}>
                        {MODALITY_LABELS[clientDetail.client.primaryModality]}
                      </span>
                      <span className="text-xs text-muted-foreground">{clientDetail.client.sessionFrequency ?? "Session frequency not set"}</span>
                    </div>
                  </div>
                </div>
                <Button onClick={handleGenerateSummary} disabled={generatingSummary} className="gap-2">
                  {generatingSummary ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate Session Prep
                </Button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Avg Mood", value: avgMood ? `${avgMood}/10` : "—", icon: <Heart className="w-4 h-4" /> },
                  { label: "Active Goals", value: clientDetail.goals.filter((g) => g.status === "active").length, icon: <Target className="w-4 h-4" /> },
                  { label: "Homework Pending", value: clientDetail.homework.filter((h) => h.status === "assigned").length, icon: <FileText className="w-4 h-4" /> },
                  { label: "Check-ins", value: clientDetail.checkIns.length, icon: <CheckCircle2 className="w-4 h-4" /> },
                ].map((stat) => (
                  <Card key={stat.label} className="border-border">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        {stat.icon}
                        <span className="text-xs">{stat.label}</span>
                      </div>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Session Prep Summary */}
              {sessionSummary && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      AI Session Preparation Summary
                    </CardTitle>
                    <CardDescription>Generated now · {MODALITY_LABELS[clientDetail.client.primaryModality]} modality</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-foreground">
                      <Streamdown>{sessionSummary}</Streamdown>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 italic">
                      This summary is a clinical support tool only. It does not constitute a clinical assessment or treatment recommendation.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                  <TabsTrigger value="homework">Homework</TabsTrigger>
                  <TabsTrigger value="modality">Modality Config</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          Recent Mood (Last 7 entries)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {clientDetail.recentMood.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No mood entries yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {clientDetail.recentMood.slice(0, 5).map((m) => (
                              <div key={m.id} className="flex items-center gap-3">
                                <div className="w-16 text-xs text-muted-foreground shrink-0">
                                  {new Date(m.recordedAt).toLocaleDateString()}
                                </div>
                                <div className="flex-1 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${m.moodScore * 10}%` }}
                                  />
                                </div>
                                <div className="text-xs font-medium text-foreground w-8 text-right">{m.moodScore}/10</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Heart className="w-4 h-4 text-primary" />
                          Recent Emotional Events
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {clientDetail.recentEvents.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No emotional events logged.</p>
                        ) : (
                          <div className="space-y-2">
                            {clientDetail.recentEvents.map((e) => (
                              <div key={e.id} className="flex items-start gap-2 text-sm">
                                <span className="capitalize font-medium text-foreground shrink-0">{e.eventType}</span>
                                <span className="text-muted-foreground">· Intensity {e.intensity}/10</span>
                                {e.description && <span className="text-muted-foreground truncate">— {e.description}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Check-ins */}
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        Recent Check-ins
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {clientDetail.checkIns.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No check-ins completed yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {clientDetail.checkIns.map((c) => (
                            <div key={c.id} className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium capitalize text-foreground">{c.checkInType.replace("_", " ")}</span>
                                <span className="text-xs text-muted-foreground">{new Date(c.completedAt).toLocaleDateString()}</span>
                              </div>
                              {c.moodAtCheckIn && <p className="text-xs text-muted-foreground">Mood: {c.moodAtCheckIn}/10</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Goals Tab */}
                <TabsContent value="goals" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-foreground">Therapy Goals</h3>
                    <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="bg-background">
                          <Plus className="w-4 h-4 mr-1" /> Add Goal
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Add Therapy Goal</DialogTitle></DialogHeader>
                        <div className="space-y-4 pt-2">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">Goal</label>
                            <Textarea
                              placeholder="Describe the therapy goal..."
                              value={goalForm.goalText}
                              onChange={(e) => setGoalForm((p) => ({ ...p, goalText: e.target.value }))}
                              rows={3}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">Modality</label>
                            <Select value={goalForm.modality} onValueChange={(v) => setGoalForm((p) => ({ ...p, modality: v }))}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cbt">CBT</SelectItem>
                                <SelectItem value="dbt">DBT</SelectItem>
                                <SelectItem value="trauma_informed">Trauma-Informed</SelectItem>
                                <SelectItem value="emdr">EMDR</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">Target Date (optional)</label>
                            <Input type="date" value={goalForm.targetDate} onChange={(e) => setGoalForm((p) => ({ ...p, targetDate: e.target.value }))} />
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => createGoal.mutate({ clientId: selectedClientId!, goalText: goalForm.goalText, modality: goalForm.modality as "cbt" | "dbt" | "trauma_informed" | "emdr" | "general", targetDate: goalForm.targetDate || undefined })}
                            disabled={createGoal.isPending || !goalForm.goalText}
                          >
                            {createGoal.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Create Goal
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {clientDetail.goals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No goals set yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {clientDetail.goals.map((g) => (
                        <Card key={g.id} className="border-border">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-sm text-foreground font-medium">{g.goalText}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${MODALITY_COLORS[g.modality]}`}>{MODALITY_LABELS[g.modality]}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[g.status]}`}>{g.status}</span>
                                  {g.targetDate && <span className="text-xs text-muted-foreground">Target: {new Date(g.targetDate).toLocaleDateString()}</span>}
                                </div>
                              </div>
                              {g.status === "active" && (
                                <Button size="sm" variant="outline" className="bg-background shrink-0" onClick={() => updateGoal.mutate({ goalId: g.id, status: "achieved" })}>
                                  Mark Achieved
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Homework Tab */}
                <TabsContent value="homework" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-foreground">Homework Assignments</h3>
                    <Dialog open={hwOpen} onOpenChange={setHwOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="bg-background">
                          <Plus className="w-4 h-4 mr-1" /> Assign
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Assign Homework</DialogTitle></DialogHeader>
                        <div className="space-y-4 pt-2">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">Title</label>
                            <Input placeholder="e.g. Thought Record Worksheet" value={hwForm.title} onChange={(e) => setHwForm((p) => ({ ...p, title: e.target.value }))} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">Description / Instructions</label>
                            <Textarea placeholder="Describe the assignment..." value={hwForm.description} onChange={(e) => setHwForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">Modality</label>
                              <Select value={hwForm.modality} onValueChange={(v) => setHwForm((p) => ({ ...p, modality: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cbt">CBT</SelectItem>
                                  <SelectItem value="dbt">DBT</SelectItem>
                                  <SelectItem value="trauma_informed">Trauma-Informed</SelectItem>
                                  <SelectItem value="emdr">EMDR</SelectItem>
                                  <SelectItem value="general">General</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">Due Date</label>
                              <Input type="date" value={hwForm.dueDate} onChange={(e) => setHwForm((p) => ({ ...p, dueDate: e.target.value }))} />
                            </div>
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => createHw.mutate({ clientId: selectedClientId!, title: hwForm.title, description: hwForm.description, modality: hwForm.modality as "cbt" | "dbt" | "trauma_informed" | "emdr" | "general", dueDate: hwForm.dueDate || undefined })}
                            disabled={createHw.isPending || !hwForm.title || !hwForm.description}
                          >
                            {createHw.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Assign Homework
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {clientDetail.homework.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No homework assigned yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {clientDetail.homework.map((h) => (
                        <Card key={h.id} className="border-border">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{h.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">{h.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[h.status]}`}>{h.status.replace("_", " ")}</span>
                                  {h.dueDate && <span className="text-xs text-muted-foreground">Due: {new Date(h.dueDate).toLocaleDateString()}</span>}
                                </div>
                                {h.completionNotes && (
                                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                                    <strong>Client notes:</strong> {h.completionNotes}
                                  </div>
                                )}
                              </div>
                              {h.status === "completed" && !h.reviewedAt && (
                                <Button size="sm" variant="outline" className="bg-background shrink-0" onClick={() => reviewHw.mutate({ homeworkId: h.id })}>
                                  Mark Reviewed
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Modality Config Tab */}
                <TabsContent value="modality" className="space-y-4 mt-4">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-base">Modality Configuration</CardTitle>
                      <CardDescription>Configure the therapeutic modality and treatment parameters for this client.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Primary Modality</label>
                        <Select
                          value={clientDetail.client.primaryModality}
                          onValueChange={(v) => updateModality.mutate({ clientId: selectedClientId!, modality: v as "cbt" | "dbt" | "trauma_informed" | "emdr" | "general" })}
                        >
                          <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cbt">CBT — Cognitive Behavioral Therapy</SelectItem>
                            <SelectItem value="dbt">DBT — Dialectical Behavior Therapy</SelectItem>
                            <SelectItem value="trauma_informed">Trauma-Informed Care</SelectItem>
                            <SelectItem value="emdr">EMDR — Preparation & Stabilization</SelectItem>
                            <SelectItem value="general">General Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">About {MODALITY_LABELS[clientDetail.client.primaryModality]} Mode</p>
                        {clientDetail.client.primaryModality === "cbt" && <p>AI prompts will focus on thought patterns, cognitive distortions, and behavioral activation within CBT principles.</p>}
                        {clientDetail.client.primaryModality === "dbt" && <p>AI prompts will focus on the four DBT skill modules: Mindfulness, Distress Tolerance, Emotion Regulation, and Interpersonal Effectiveness.</p>}
                        {clientDetail.client.primaryModality === "trauma_informed" && <p>AI prompts will emphasize safety, grounding, window of tolerance, and nervous system regulation. No trauma processing will occur.</p>}
                        {clientDetail.client.primaryModality === "emdr" && <p>AI prompts will focus on stabilization, resourcing, and preparation only. EMDR processing is strictly reserved for in-session work.</p>}
                        {clientDetail.client.primaryModality === "general" && <p>AI prompts will provide general emotional support and self-awareness reflection without modality-specific framing.</p>}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </main>
      </div>
    </DashboardLayout>
  );
}
