import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const ACTION_COLORS: Record<string, string> = {
  CREATE_CLIENT: "bg-green-100 text-green-800",
  UPDATE_MODALITY: "bg-blue-100 text-blue-800",
  CREATE_GOAL: "bg-purple-100 text-purple-800",
  CREATE_HOMEWORK: "bg-amber-100 text-amber-800",
  REVIEW_HOMEWORK: "bg-teal-100 text-teal-800",
  GENERATE_SESSION_PREP: "bg-indigo-100 text-indigo-800",
  UPGRADE_SUBSCRIPTION: "bg-orange-100 text-orange-800",
  COMPLETE_CHECKIN: "bg-green-100 text-green-800",
  LOG_EMOTIONAL_EVENT: "bg-rose-100 text-rose-800",
  LOG_MOOD: "bg-cyan-100 text-cyan-800",
  UPDATE_GOAL: "bg-blue-100 text-blue-800",
  UPDATE_HOMEWORK: "bg-amber-100 text-amber-800",
};

export default function AuditLog() {
  const { data: logs, isLoading } = trpc.audit.getLogs.useQuery({});

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
          </div>
          <p className="text-muted-foreground">
            A complete record of all actions taken in your account for compliance and accountability.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !logs || logs.length === 0 ? (
          <Card className="border-border">
            <CardContent className="pt-8 pb-8 text-center">
              <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No audit log entries yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Activity History</CardTitle>
              <CardDescription>{logs.length} entries</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-800"}`}>
                          {log.action.replace(/_/g, " ")}
                        </span>
                        {log.resourceType && (
                          <span className="text-xs text-muted-foreground capitalize">{log.resourceType}</span>
                        )}
                        {log.resourceId && (
                          <span className="text-xs text-muted-foreground">#{log.resourceId}</span>
                        )}
                      </div>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{log.details}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString()}{" "}
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1 capitalize">{log.userRole}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-muted-foreground mt-6 text-center">
          Audit logs are retained for compliance purposes. Contact support for extended retention options.
        </p>
      </div>
    </DashboardLayout>
  );
}
