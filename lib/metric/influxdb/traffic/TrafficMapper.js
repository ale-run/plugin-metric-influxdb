"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrafficMapper = void 0;
const Traffic_1 = require("./Traffic");
const Utils_1 = require("../../Utils");
class TrafficMapper {
    static rowMapper(values, tableMeta) {
        const traffic = new Traffic_1.Traffic();
        traffic.date = tableMeta.get(values, '_time');
        traffic.name = tableMeta.get(values, 'pod_name');
        if (Utils_1.Utils.isEmpty(traffic.name)) {
            traffic.name = tableMeta.get(values, 'controller_name');
        }
        if (Utils_1.Utils.isEmpty(traffic.name)) {
            traffic.name = tableMeta.get(values, 'namespace');
        }
        traffic.egress = tableMeta.get(values, 'tx_bytes');
        traffic.ingress = tableMeta.get(values, 'rx_bytes');
        //traffic.namespace = tableMeta.get(values, "namespace");
        //traffic.controller_name = tableMeta.get(values, "controller_name");
        return traffic;
    }
}
exports.TrafficMapper = TrafficMapper;
//# sourceMappingURL=TrafficMapper.js.map