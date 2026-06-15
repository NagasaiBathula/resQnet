import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { GraduationCap, BookOpen, Award, Plus } from "lucide-react";

const courses = [
  {
    id: "c-1",
    code: "FA-101",
    name: "First aid essentials",
    level: "Foundational",
    duration: "2h",
    progress: 100,
    status: "completed",
  },
  {
    id: "c-2",
    code: "CPR-200",
    name: "CPR & AED certification",
    level: "Intermediate",
    duration: "4h",
    progress: 100,
    status: "completed",
  },
  {
    id: "c-3",
    code: "FLD-110",
    name: "Flood rescue basics",
    level: "Foundational",
    duration: "3h",
    progress: 60,
    status: "in-progress",
  },
  {
    id: "c-4",
    code: "INC-220",
    name: "Incident command system",
    level: "Intermediate",
    duration: "6h",
    progress: 30,
    status: "in-progress",
  },
  {
    id: "c-5",
    code: "TRG-310",
    name: "Trauma triage",
    level: "Advanced",
    duration: "5h",
    progress: 0,
    status: "enrolled",
  },
  {
    id: "c-6",
    code: "PSY-120",
    name: "Psychological first aid",
    level: "Foundational",
    duration: "2h",
    progress: 0,
    status: "available",
  },
  {
    id: "c-7",
    code: "DRN-410",
    name: "Drone-assisted SAR",
    level: "Advanced",
    duration: "8h",
    progress: 0,
    status: "available",
  },
  {
    id: "c-8",
    code: "WTR-150",
    name: "Swift water operations",
    level: "Intermediate",
    duration: "5h",
    progress: 0,
    status: "available",
  },
];

export const Route = createFileRoute("/volunteer/training")({
  head: () => ({ meta: [{ title: "Training — ResQNet" }] }),
  component: () => (
    <FeaturePage
      title="Training center"
      subtitle="Build skills, earn certifications, and unlock higher-impact missions."
      stats={[
        { label: "Courses available", value: "24", icon: BookOpen, accent: "primary" },
        { label: "Completed", value: "2", icon: Award, accent: "success" },
        { label: "In progress", value: "2", icon: GraduationCap, accent: "info" },
        { label: "Hours logged", value: "32h", icon: BookOpen, accent: "warning" },
      ]}
      primaryAction={{ label: "Enroll in course", icon: Plus }}
      filters={["All", "Foundational", "Intermediate", "Advanced", "Completed", "In progress"]}
      tableTitle="Catalog"
      tableCols={[
        {
          key: "code",
          label: "Code",
          render: (r) => <span className="font-mono text-xs">{r.code}</span>,
        },
        {
          key: "name",
          label: "Course",
          render: (r) => <span className="text-sm font-medium">{r.name}</span>,
        },
        { key: "level", label: "Level" },
        { key: "duration", label: "Duration" },
        {
          key: "progress",
          label: "Progress",
          render: (r) => (
            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${r.progress}%` }} />
            </div>
          ),
        },
        {
          key: "status",
          label: "Status",
          render: (r) => (
            <PillBadge
              tone={
                r.status === "completed"
                  ? "success"
                  : r.status === "in-progress"
                    ? "info"
                    : r.status === "enrolled"
                      ? "warning"
                      : "muted"
              }
            >
              {r.status}
            </PillBadge>
          ),
        },
      ]}
      tableRows={courses}
    />
  ),
});
