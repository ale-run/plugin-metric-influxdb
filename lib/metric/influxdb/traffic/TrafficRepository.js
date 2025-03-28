"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrafficRepository = void 0;
const runtime_1 = require("@ale-run/runtime");
const Utils_1 = require("../../Utils");
const TrafficMapper_1 = require("./TrafficMapper");
const logger = runtime_1.Logger.getLogger('metric:TrafficRepository');
class TrafficRepository {
    getGroupColumns(controller, pod) {
        let groupColumns = ['"namespace", "_field"'];
        if (!Utils_1.Utils.isEmpty(controller))
            groupColumns.push('"controller_name"');
        if (!Utils_1.Utils.isEmpty(pod))
            groupColumns.push('"pod_name"');
        return groupColumns;
    }
    getFilterQuery(client, namespace, s, e, gress, controller, pod) {
        let query = `
        from(bucket: "${client.api_bucket}")
            |> range(start: ${s.toISOString()}, stop: ${e.toISOString()})
            |> filter(fn: (r) => r["_measurement"] == "kubernetes_controller_network")`;
        if (gress === 'i') {
            query += `
            |> filter(fn: (r) => r["_field"] == "rx_bytes")`;
        }
        else if (gress === 'e') {
            query += `
            |> filter(fn: (r) => r["_field"] == "tx_bytes")`;
        }
        else {
            query += `
            |> filter(fn: (r) => r["_field"] == "rx_bytes" or r["_field"] == "tx_bytes")`;
        }
        if (!Utils_1.Utils.isEmpty(namespace)) {
            query += `
            |> filter(fn: (r) => r["namespace"] == "${namespace}")`;
        }
        if (!Utils_1.Utils.isEmpty(controller)) {
            query += `
            |> filter(fn: (r) => r["controller_name"] == "${controller}")`;
        }
        if (!Utils_1.Utils.isEmpty(pod)) {
            query += `
            |> filter(fn: (r) => r["pod_name"] == "${pod}")`;
        }
        return query;
    }
    getTrafficUsage(client, namespace, s, e, u, gress, desc, controller, pod) {
        let query = this.getFilterQuery(client, namespace, s, e, gress, controller, pod);
        let groupColumns = this.getGroupColumns(controller, pod);
        //query += this.getGroupQuery(this.getInterval(u), groupColumns)
        query += `
            |> truncateTimeColumn(unit: 1m)
            |> group(columns: [${groupColumns}])  
            |> aggregateWindow(every: ${u} , fn: sum, createEmpty: true)
            |> sort(columns: ["_time"], desc: ${desc})
            |> map(fn: (r) => ({r with _value: if exists r._value then r._value else 0,}))
            |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
            |> drop(columns: ["_start", "_stop"])`;
        const p = client.collectRows(query, TrafficMapper_1.TrafficMapper.rowMapper);
        return p;
    }
    getTrafficUsageCount(client, namespace, s, e, u, gress, controller, pod) {
        let query = this.getFilterQuery(client, namespace, s, e, gress, controller, pod);
        let groupColumns = this.getGroupColumns(controller, pod);
        query += `
            |> truncateTimeColumn(unit: 1m)
            |> group(columns: [${groupColumns}])  
            |> aggregateWindow(every: ${u} , fn: last, createEmpty: true)
            |> count()
            |> keep(columns: ["_value"])`;
        const p = client.collectRows(query, (values, tableMeta) => tableMeta.get(values, '_value'));
        return p;
    }
}
exports.TrafficRepository = TrafficRepository;
//# sourceMappingURL=TrafficRepository.js.map