"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NginxMapper = void 0;
const Nginx_1 = require("./Nginx");
class NginxMapper {
    static rowMapper(values, tableMeta) {
        const nginx = new Nginx_1.Nginx();
        nginx.date = tableMeta.get(values, '_time');
        nginx.map = new Map();
        for (const column of tableMeta.columns) {
            if (column.label === '_time' || column.label === 'result' || column.label === 'table') {
                //skip
            }
            else if (column.dataType === 'long') {
                nginx.map.set(column.label, tableMeta.get(values, column.label));
            }
        }
        return nginx;
    }
}
exports.NginxMapper = NginxMapper;
//# sourceMappingURL=NginxMapper.js.map