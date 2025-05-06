/**
 * @copyright Copyright (c) 2024-2025 Ronan LE MEILLAT
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import type React from "react";

import { forwardRef } from "react";
import { Button, type ButtonProps } from "@heroui/button";
import { clsx } from "@heroui/shared-utils";

export interface PreviewButtonProps extends ButtonProps {
  icon: React.ReactNode;
}

export const PreviewButton = forwardRef<
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
