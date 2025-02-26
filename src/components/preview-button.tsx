import type React from "react";

import { forwardRef } from "react";
import { Button, type ButtonProps } from "@heroui/button";
import { clsx } from "@heroui/shared-utils";

export interface PreviewButtonProps extends ButtonProps {
  icon: React.ReactNode;
}

export const PreviewButton = forwardRef<
  // eslint-disable-next-line no-undef
  HTMLButtonElement | null,
  PreviewButtonProps
>((props, ref) => {
  const { icon, className, ...buttonProps } = props;

  return (
    <Button
      ref={ref}
      isIconOnly
      className={clsx("relative z-50 text-zinc-300 top-8", className)}
      size="sm"
      variant={props.variant ?? "light"}
      {...buttonProps}
    >
      {icon}
    </Button>
  );
});

PreviewButton.displayName = "PreviewButton";
