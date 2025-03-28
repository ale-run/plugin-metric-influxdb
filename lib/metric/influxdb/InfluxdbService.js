"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfluxdbService = void 0;
const InfluxdbClient_1 = require("./InfluxdbClient");
class InfluxdbService {
    getInfluxdbClient(env) {
        const url = env['INFLUX_URL'];
        const token = env['INFLUX_TOKEN'];
        const org = env['INFLUX_ORG'];
        return new InfluxdbClient_1.InfluxdbClient(url, token, org);
    }
    getInterval(u) {
        if (u === 'm') {
            return '10m';
        }
        else if (u === 'h') {
            return '1h';
        }
        else if (u === 'd') {
            return '1d';
        }
        else {
            return u;
        }
    }
}
exports.InfluxdbService = InfluxdbService;
//# sourceMappingURL=InfluxdbService.js.map