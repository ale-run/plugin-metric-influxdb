"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
class Utils {
    static isEmpty(s) {
        if (s === undefined)
            return true;
        if (s === null)
            return true;
        if (s.trim() === '')
            return true;
        return false;
    }
    static isArrayEmpty(arr) {
        if (arr === undefined)
            return true;
        if (arr === null)
            return true;
        if (arr.length === 0)
            return true;
        return false;
    }
}
exports.Utils = Utils;
//# sourceMappingURL=Utils.js.map