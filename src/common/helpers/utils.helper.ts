export class UtilsHelper {
  /**
   * Generates a label from a given name.
   * Example: "Product Name Example" -> "product-name-example"
   *
   * @param name - The input name to convert.
   * @returns The generated label string.
   */
  static getLabel(name: string): string {
    if (!name) return '';

    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  }
}
