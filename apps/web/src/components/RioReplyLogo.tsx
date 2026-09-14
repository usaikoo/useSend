"use client";

import Image from "next/image";
import { useTheme } from "@usesend/ui";
import { cn } from "@usesend/ui/lib/utils";
import {
  APP_NAME,
  LOGO_DARK_SRC,
  LOGO_LIGHT_SRC,
} from "~/lib/brand";

export function RioReplyLogo({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const src = resolvedTheme === "dark" ? LOGO_DARK_SRC : LOGO_LIGHT_SRC;

  return (
    <Image
      src={src}
      alt={APP_NAME}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    />
  );
}

export function RioReplyBrand({
  size = 28,
  showName = true,
  className,
  nameClassName,
}: {
  size?: number;
  showName?: boolean;
  className?: string;
  nameClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <RioReplyLogo size={size} />
      {showName ? (
        <span
          className={cn(
            "text-lg font-semibold text-foreground font-mono",
            nameClassName,
          )}
        >
          {APP_NAME}
        </span>
      ) : null}
    </div>
  );
}
