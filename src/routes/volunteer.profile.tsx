import { createFileRoute } from "@tanstack/react-router";
import { ProfileSettings } from "./rescue.profile";
export const Route = createFileRoute("/volunteer/profile")({
  head: () => ({ meta: [{ title: "Profile — ResQNet" }] }),
  component: () => <ProfileSettings role="volunteer" />,
});
