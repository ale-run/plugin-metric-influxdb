"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfluxdbMetricDriver = void 0;
const runtime_1 = require("@ale-run/runtime");
const CpuService_1 = require("./influxdb/cpu/CpuService");
const MemoryService_1 = require("./influxdb/memory/MemoryService");
const TrafficService_1 = require("./influxdb/traffic/TrafficService");
const NginxService_1 = require("./influxdb/nginx/NginxService");
const logger = runtime_1.Logger.getLogger('metric:InfluxdbMetricDriver');
class InfluxdbMetricDriver extends runtime_1.ClusterMetricDriver {
    constructor() {
        super(...arguments);
        this.cpuService = new CpuService_1.CpuService();
        this.memoryService = new MemoryService_1.MemoryService();
        this.trafficService = new TrafficService_1.TrafficService();
        this.nginxService = new NginxService_1.NginxService();
    }
    getMetricItems(deployment) {
        return __awaiter(this, void 0, void 0, function* () {
            return [
                {
                    name: 'cpu',
                    title: 'vCPU',
                    unit: 'm'
                },
                {
                    name: 'cpu-limit',
                    title: 'vCPU Limit',
                    unit: 'm'
                },
                {
                    name: 'memory',
                    title: 'Memory',
                    unit: 'MB'
                },
                {
                    name: 'memory-limit',
                    title: 'Memory Limit',
                    unit: 'MB'
                },
                {
                    name: 'inbound',
                    title: 'Network In',
                    unit: 'b',
                    options: {
                        mode: 'sum'
                    }
                },
                {
                    name: 'outbound',
                    title: 'Network Out',
                    unit: 'b',
                    options: {
                        mode: 'sum'
                    }
                },
                {
                    name: 'statusCode',
                    title: 'statusCode',
                    unit: ''
                }
            ];
        });
    }
    // deploymnet.stat.objects
    // [
    //   { kind: 'Namespace', name: 'ale-ns-abcdefg' },
    //   {
    //     kind: 'Deployment',
    //     name: 'deploy-httpbin-httpbin',
    //     namespace: 'ale-ns-abcdefg'
    //   },
    //   {
    //     kind: 'Pod',
    //     name: 'deploy-httpbin-httpbin-abcdefghi-12345',
    //     namespace: 'ale-ns-abcdefg'
    //   },
    //   {
    //     kind: 'Service',
    //     name: 'httpbin',
    //     namespace: 'ale-ns-abcdefg'
    //   }
    // ]
    getMetric(deployment, name, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            logger.debug(`[METRIC][${deployment.name}]metricName=${name}`);
            if (this.cluster.env['INFLUX_URL'] === undefined || this.cluster.env['INFLUX_TOKEN'] === undefined || this.cluster.env['INFLUX_ORG'] === undefined) {
                throw new Error(`[METRIC]environments(INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG) are required`);
            }
            let statObjects = [];
            if (name === 'statusCode') {
                statObjects = (_b = (_a = deployment.stat) === null || _a === void 0 ? void 0 : _a.objects) === null || _b === void 0 ? void 0 : _b.filter((o) => o.kind === 'Service' && o.internal == true);
            }
            else {
                statObjects = (_d = (_c = deployment.stat) === null || _c === void 0 ? void 0 : _c.objects) === null || _d === void 0 ? void 0 : _d.filter((o) => o.kind === 'Deployment');
            }
            if (statObjects === undefined || statObjects.length === 0) {
                logger.warn(`[METRIC][${name}]deploymentName=${deployment.name} MetricObjects not found!`);
                return;
            }
            const statObject = statObjects[0];
            //임시변경 //////////////////////////////////
            // object = {
            //   namespace: "cloudtype-monitoring",
            //   name: "influxdb-influxdb2",
            //   kind: "Deployment"
            // }
            //임시변경 //////////////////////////////////
            logger.info(`[METRIC][${deployment.name}]metricName=${name} statObject=`, statObject);
            logger.info(`[METRIC][${deployment.name}]metricName=${name} options=`, options);
            let metricData = undefined;
            switch (name) {
                case 'cpu':
                    metricData = yield this.cpuService.getCpuUsage(this.cluster.env, statObject, options);
                    break;
                case 'cpu-limit':
                    metricData = yield this.cpuService.getCpuLimit(this.cluster.env, statObject, options);
                    break;
                case 'memory':
                    metricData = yield this.memoryService.getMemoryUsage(this.cluster.env, statObject, options);
                    break;
                case 'memory-limit':
                    metricData = yield this.memoryService.getMemoryLimit(this.cluster.env, statObject, options);
                    break;
                case 'inbound':
                    metricData = yield this.trafficService.getNetworkInUsage(this.cluster.env, statObject, options);
                    break;
                case 'outbound':
                    metricData = yield this.trafficService.getNetworkOutUsage(this.cluster.env, statObject, options);
                    break;
                case 'statusCode':
                    metricData = yield this.nginxService.getStatusCodeAggregate(this.cluster.env, statObject, options);
                    break;
                default:
                    logger.warn(`[METRIC][${deployment.name}]metricName=${name} undefined item`);
                    return;
            }
            logger.debug(`[METRIC]`, metricData);
            return metricData;
        });
    }
    getStartDate() {
        let date = new Date();
        //date.setDate(date.getDate() - 1);
        date.setHours(date.getHours() - 3);
        //date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }
}
exports.InfluxdbMetricDriver = InfluxdbMetricDriver;
//# sourceMappingURL=InfluxdbMetricDriver.js.map