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

export type ScientificNotationNumber = {
  mantissa: number;
  exponent: number;
};

export namespace ScientificNotation {
  /**
   * Convert a number to scientific notation
   */
  export function toScientificNotation(
    value: number,
    precision?: number,
  ): ScientificNotationNumber {
    if (precision === undefined) {
      precision = 3;
    } else if (precision < 1) {
      precision = 0;
    } else {
      precision = Math.floor(precision - 1);
    }

    if (value === 0) {
      return { mantissa: 0, exponent: 0 };
    }

    const exp = Math.floor(Math.log10(Math.abs(value)));
    const normalizedExp = Math.floor(exp / 3) * 3;
    let mantissa = value / Math.pow(10, normalizedExp);

    mantissa = Math.round(mantissa * 10 ** precision) / 10 ** precision;

    return { mantissa, exponent: normalizedExp };
  }

  export function toScientificNotationString(
    value: number,
    precision?: number,
  ): string {
    const { mantissa, exponent } = toScientificNotation(value, precision);

    return `${mantissa}e${exponent}`;
  }

  export function toScientificNotationLatex(
    value: number,
    precision?: number,
  ): string {
    const { mantissa, exponent } = toScientificNotation(value, precision);

    return `${mantissa} \\times 10^{${exponent}}`;
  }

  export function toScientificNotationMathML(
    value: number,
    precision?: number,
  ): string {
    const { mantissa, exponent } = toScientificNotation(value, precision);

    return `${mantissa} <msup><mn>10</mn><mn>${exponent}</mn></msup>`;
  }

  export function toScientificNotationHTML(
    value: number,
    precision?: number,
  ): string {
    const { mantissa, exponent } = toScientificNotation(value, precision);

    return `${mantissa} × 10<sup>${exponent}</sup>`;
  }
}
