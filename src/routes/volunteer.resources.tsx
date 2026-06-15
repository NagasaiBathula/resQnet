import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { Boxes, Download, BookOpen, FileText, Plus } from "lucide-react";

const resources = [
  {
    id: "r-1",
    title: "Volunteer field handbook",
    type: "PDF",
    category: "Handbook",
    size: "4.2 MB",
    updated: "2 days ago",
  },
  {
    id: "r-2",
    title: "Flood response checklist",
    type: "PDF",
    category: "Checklist",
    size: "180 KB",
    updated: "1 week ago",
  },
  {
    id: "r-3",
    title: "Family triage form (printable)",
    type: "PDF",
    category: "Form",
    size: "92 KB",
    updated: "3 days ago",
  },
  {
    id: "r-4",
    title: "Earthquake first response video",
    type: "MP4",
    category: "Training",
    size: "82 MB",
    updated: "5 days ago",
  },
  {
    id: "r-5",
    title: "Cyclone shelter SOP",
    type: "PDF",
    category: "SOP",
    size: "1.1 MB",
    updated: "1 day ago",
  },
  {
    id: "r-6",
    title: "ResQNet radio protocol card",
    type: "PDF",
    category: "Reference",
    size: "240 KB",
    updated: "today",
  },
  {
    id: "r-7",
    title: "Psychological first aid script",
    type: "DOCX",
    category: "Script",
    size: "320 KB",
    updated: "4 days ago",
  },
  {
    id: "r-8",
    title: "Incident report template",
    type: "DOCX",
    category: "Form",
    size: "120 KB",
    updated: "today",
  },
  {
    id: "r-9",
    title: "Drone SAR safety briefing",
    type: "MP4",
    category: "Training",
    size: "45 MB",
    updated: "1 week ago",
  },
];

export const Route = createFileRoute("/volunteer/resources")({
  head: () => ({ meta: [{ title: "Resources — ResQNet" }] }),
  component: () => (
    <FeaturePage
      title="Resources"
      subtitle="Handbooks, SOPs, and printable forms for the field."
      stats={[
        { label: "Documents", value: "84", icon: FileText, accent: "primary" },
        { label: "Videos", value: "22", icon: BookOpen, accent: "info" },
        { label: "Downloads (you)", value: "37", icon: Download, accent: "success" },
        { label: "Updated this week", value: "6", icon: Boxes, accent: "warning" },
      ]}
      primaryAction={{ label: "Upload resource", icon: Plus }}
      filters={["All", "Handbook", "SOP", "Checklist", "Form", "Training", "Reference"]}
      tableTitle="Library"
      tableCols={[
        {
          key: "title",
          label: "Title",
          render: (r) => <span className="text-sm font-medium">{r.title}</span>,
        },
        {
          key: "category",
          label: "Category",
          render: (r) => <PillBadge tone="info">{r.category}</PillBadge>,
        },
        { key: "type", label: "Type" },
        { key: "size", label: "Size" },
        { key: "updated", label: "Updated" },
      ]}
      tableRows={resources}
    />
  ),
});
