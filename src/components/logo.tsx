import logoUrl from "@/assets/resqnet-logo.png";
import { cn } from "@/lib/utils";

export function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <img
      src={logoUrl}
      alt="ResQNet logo"
      width={size}
      height={size}
      className={cn("rounded-lg object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}
