import { createFileRoute } from "@tanstack/react-router";
import { ProfileSettings } from "./rescue.profile";
export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — ResQNet" }] }),
  component: () => <ProfileSettings role="admin" title="Platform settings"/>,
});
