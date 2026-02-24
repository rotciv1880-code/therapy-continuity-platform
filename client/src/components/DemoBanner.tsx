import { useDemo } from "@/contexts/DemoContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Heart, RotateCcw, X } from "lucide-react";
import { useLocation } from "wouter";

export default function DemoBanner() {
  const { isDemoMode, demoPersona, exitDemo, enterDemo } = useDemo();
  const [, navigate] = useLocation();

  if (!isDemoMode) return null;

  const isTherapist = demoPersona === "therapist";

  const handleExit = () => {
    exitDemo();
    navigate("/");
  };

  const handleSwitch = () => {
    const next = isTherapist ? "client" : "therapist";
    enterDemo(next);
    navigate(next === "therapist" ? "/demo/dashboard" : "/demo/client");
  };

  return (
    <div className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-sm font-medium z-50 ${isTherapist ? "bg-primary text-primary-foreground" : "bg-violet-600 text-white"}`}>
      <div className="flex items-center gap-2.5 min-w-0">
        {isTherapist ? (
          <Brain className="w-4 h-4 shrink-0" />
        ) : (
          <Heart className="w-4 h-4 shrink-0" />
        )}
        <span className="truncate">
          Demo Mode —{" "}
          <span className="font-semibold">
            {isTherapist ? "Dr. Sarah Chen (Therapist)" : "Marcus T. (Client)"}
          </span>
        </span>
        <Badge
          variant="outline"
          className={`text-xs border-white/40 shrink-0 hidden sm:inline-flex ${isTherapist ? "text-primary-foreground" : "text-white"}`}
        >
          No real data
        </Badge>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="ghost"
          className={`h-7 text-xs gap-1.5 hidden sm:flex ${isTherapist ? "text-primary-foreground hover:bg-white/20" : "text-white hover:bg-white/20"}`}
          onClick={handleSwitch}
        >
          <RotateCcw className="w-3 h-3" />
          Switch to {isTherapist ? "Client" : "Therapist"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={`h-7 text-xs gap-1.5 ${isTherapist ? "text-primary-foreground hover:bg-white/20" : "text-white hover:bg-white/20"}`}
          onClick={handleExit}
        >
          <X className="w-3 h-3" />
          Exit Demo
        </Button>
      </div>
    </div>
  );
}
