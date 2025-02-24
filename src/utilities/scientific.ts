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
   * @param value - The number to convert to scientific notation
   * @param precision - The number of significant figures to keep
   */
  export function toScientificNotation(
    value: number,
    precision: number = 3,
  ): ScientificNotationNumber {
    if (value === 0) {
      return { mantissa: 0, exponent: 0 };
    }

    // Calculate the exposure standardized by steps of 3
    const exp = Math.floor(Math.log10(Math.abs(value)));
    const normalizedExp = Math.floor(exp / 3) * 3;

    // Calculate the mantissa
    const mantissa = value / Math.pow(10, normalizedExp);

    // Adjust precision to have the good number of significant figures
    const factor = Math.pow(
      10,
      precision - 1 - Math.floor(Math.log10(Math.abs(mantissa))),
    );
    const roundedMantissa = Math.round(mantissa * factor) / factor;

    return { mantissa: roundedMantissa, exponent: normalizedExp };
  }

  /**
   * Convert a mantissa number to a string representation with the correct number of significant figures
   * @param mantissa - The mantissa number to convert to a string
   * @param precision - The number of significant figures to keep
   * @returns a string representation of the mantissa with the correct number of significant figures
   * @example
   * ```ts
   * ScientificNotation.toMantissaString(1.23, 4)
   * // returns "1.230"
   * ```
   * @example
   * ```ts
   * ScientificNotation.toMantissaString(123, 4)
   * // returns "123.0"
   * ```
   * @example
   * ```ts
   * ScientificNotation.toMantissaString(123, 3)
   * // returns "123"
   * ```
   * @example
   * ```ts
   * ScientificNotation.toMantissaString(123, 2)
   * // returns "1.2"
   * ```
   */
  export function toMantissaString(
    mantissa: number,
    precision?: number,
  ): string {
    if (precision === undefined) {
      precision = 3;
    }
    const mantissaString = mantissa.toPrecision(precision);
    // Compute the total number of digits
    const totalDigits = mantissaString.replace(".", "").length;

    // if totalDigits is less than precision, add zeros
    if (totalDigits < precision) {
      if (mantissaString.includes(".")) {
        return mantissaString + "0".repeat(precision - totalDigits + 1);
      } else {
        return mantissaString + "." + "0".repeat(precision - totalDigits);
      }
    }

    return mantissaString;
  }

  /**
   * Convert a number to scientific notation and return a string representation
   * @param value - The number to convert to scientific notation
   * @param precision - The number of significant numbers to keep
   * @returns a string representation of the number in scientific notation
   * @example
   * ```ts
   * ScientificNotation.toScientificNotationString(1234567890.1234567890, 3)
   * // returns "1.23e9"
   * ```
   * @example
   * ```ts
   * ScientificNotation.toScientificNotationString(1230017890.1234567890, 5)
   * // returns "1.2300e9"
   * ```
   */
  export function toScientificNotationString(
    value: number,
    precision?: number,
  ): string {
    const { mantissa, exponent } = toScientificNotation(value, precision);

    return `${mantissa}e${exponent}`;
  }

  /**
   * Convert a number to scientific notation and return a LaTeX representation
   * @param value - The number to convert to scientific notation
   * @param precision - The number of significant numbers to keep
   * @returns a LaTeX representation of the number in scientific notation
   * @example
   * ```ts
   * ScientificNotation.toScientificNotationLatex(1234567890.1234567890, 3)
   * // returns "1.23 \times 10^{9}"
   * ```
   * @example
   * ```ts
   * ScientificNotation.toScientificNotationLatex(1230017890.1234567890, 5)
   * // returns "1.2300 \times 10^{9}"
   * ```
   */
  export function toScientificNotationLatex(
    value: number,
    precision?: number,
  ): string {
    const { mantissa, exponent } = toScientificNotation(value, precision);

    if (exponent === 0) {
      return toMantissaString(mantissa, precision);
    } else if (exponent === 1) {
      return `${toMantissaString(mantissa * 10, precision)}`;
    } else {
      return `${toMantissaString(mantissa, precision)} \\times 10^{${exponent}}`;
    }
  }

  /**
   * Convert a number to scientific notation and return a MathML representation
   * @param value - The number to convert to scientific notation
   * @param precision - The number of significant numbers to keep
   * @returns a MathML representation of the number in scientific notation
   * @example
   * ```ts
   * ScientificNotation.toScientificNotationMathML(1234567890.1234567890, 3)
   * // returns "<math><mrow><mn>1.23</mn><mo>×</mo><msup><mn>10</mn><mn>9</mn></msup></mrow></math>"
   * ```
   * @example
   * ```ts
   * ScientificNotation.toScientificNotationMathML(1230017890.1234567890, 5)
   * // returns "<math><mrow><mn>1.2300</mn><mo>×</mo><msup><mn>10</mn><mn>9</mn></msup></mrow></math>"
   * ```
   */
  export function toScientificNotationMathML(
    value: number,
    precision?: number,
  ): string {
    const { mantissa, exponent } = toScientificNotation(value, precision);

    if (exponent === 0) {
      return `<math><mrow><mn>${toMantissaString(mantissa, precision)}</mn></mrow></math>`;
    } else if (exponent === 1) {
      return `<math><mrow><mn>${toMantissaString(mantissa * 10, precision)}</mn></mrow></math>`;
    } else {
      return `<math><mrow><mn>${toMantissaString(mantissa, precision)}</mn><mo>×</mo><msup><mn>10</mn><mn>${exponent}</mn></msup></mrow></math>`;
    }
  }

  /**
   * Convert a number to scientific notation and return an HTML representation
   * @param value - The number to convert to scientific notation
   * @param precision - The number of significant numbers to keep
   * @returns an HTML representation of the number in scientific notation
   * @example
   * ```ts
   * ScientificNotation.toScientificNotationHTML(1234567890.1234567890, 3)
   * // returns "1.23 × 10<sup>9</sup>"
   * ```
   * @example
   * ```ts
   * ScientificNotation.toScientificNotationHTML(1230017890.1234567890, 5)
   * // returns "1.2300 × 10<sup>9</sup>"
   * ```
   */
  export function toScientificNotationHTML(
    value: number,
    precision?: number,
  ): string {
    const { mantissa, exponent } = toScientificNotation(value, precision);

    if (exponent === 0) {
      return toMantissaString(mantissa, precision);
    } else if (exponent === 1) {
      return `${toMantissaString(mantissa * 10, precision)}`;
    } else {
      return `${toMantissaString(mantissa, precision)} × 10<sup>${exponent}</sup>`;
    }
  }
}
