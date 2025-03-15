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
import { ButtonProps } from "@heroui/button";
import { useClipboard } from "@heroui/use-clipboard";
import { memo } from "react";

import { PreviewButton } from "./preview-button.tsx";

import { CheckLinearIcon, CopyLinearIcon } from "@/components/icons";

export interface CopyButtonProps extends ButtonProps {
  value?: string | number;
}

export const CopyButton = memo<CopyButtonProps>(
  ({ value, className, ...buttonProps }) => {
    if (typeof value === "number") {
      value = value.toString();
    }
    const { copy, copied } = useClipboard();

    const icon = copied ? (
      <CheckLinearIcon
        className="opacity-0 scale-50 data-[visible=true]:opacity-100 data-[visible=true]:scale-100 transition-transform-opacity"
        data-visible={copied}
        size={16}
      />
    ) : (
      <CopyLinearIcon
        className="opacity-0 scale-50 data-[visible=true]:opacity-100 data-[visible=true]:scale-100 transition-transform-opacity"
        data-visible={!copied}
        size={16}
      />
    );

    const handleCopy = () => {
      copy(value);
    };

    return (
      <PreviewButton
        className={className ?? "-top-1 left-0.5"}
        icon={icon}
        onPress={handleCopy}
        {...buttonProps}
      />
    );
  },
);

CopyButton.displayName = "CopyButton";
