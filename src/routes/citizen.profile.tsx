import { createFileRoute } from "@tanstack/react-router";
import { ProfileSettings } from "./rescue.profile";
export const Route = createFileRoute("/citizen/profile")({
  head: () => ({ meta: [{ title: "Profile — ResQNet" }] }),
  component: () => <ProfileSettings role="citizen" />,
});
