export class Utils {
  static isEmpty(s: string): boolean {
    if (s === undefined) return true;
    if (s === null) return true;
    if (s.trim() === '') return true;
    return false;
  }

  static isArrayEmpty(arr: []): boolean {
    if (arr === undefined) return true;
    if (arr === null) return true;
    if (arr.length === 0) return true;
    return false;
  }
}
