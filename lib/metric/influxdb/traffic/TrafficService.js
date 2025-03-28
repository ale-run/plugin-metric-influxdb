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
exports.TrafficService = void 0;
const runtime_1 = require("@ale-run/runtime");
const InfluxdbService_1 = require("../InfluxdbService");
const TrafficRepository_1 = require("./TrafficRepository");
const logger = runtime_1.Logger.getLogger('metric:TrafficService');
class TrafficService extends InfluxdbService_1.InfluxdbService {
    constructor() {
        super(...arguments);
        this.trafficRepository = new TrafficRepository_1.TrafficRepository();
    }
    getNetworkOutUsage(env, deploy, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getTrafficUsage(env, deploy, options, 'e');
        });
    }
    getNetworkInUsage(env, deploy, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getTrafficUsage(env, deploy, options, 'i');
        });
    }
    /**
     * Traffic 사용량 조회 (Namespace, Controller, Pod)
     * @param object
     * @param options
     * @returns
     */
    getTrafficUsage(env, deploy, options, gress) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.getInfluxdbClient(env);
            const unit = this.getInterval(options.interval);
            const desc = false; //true 내림차순, false 오름차순 정렬
            //count
            const count = yield this.trafficRepository.getTrafficUsageCount(client, deploy.namespace, options.from, options.to, unit, gress, deploy.name);
            const total = count != null && count.length > 0 ? Number(count[0]) : 0;
            //data
            let dataPoints = undefined;
            if (total > 0) {
                dataPoints = yield this.trafficRepository.getTrafficUsage(client, deploy.namespace, options.from, options.to, unit, gress, desc, deploy.name);
            }
            return this.toMetricData(deploy, options, total, dataPoints, gress);
        });
    }
    toMetricData(deploy, options, total, dataPoints, gress) {
        const dates = [];
        const values = [];
        if (dataPoints != undefined) {
            for (const data of dataPoints) {
                dates.push(data.date);
                if (gress === 'i') {
                    values.push(data.ingress);
                }
                else {
                    values.push(data.egress);
                }
            }
        }
        const item = {
            name: deploy.name,
            values: values
        };
        const metricData = {
            total: total,
            dates: dates,
            series: [item]
        };
        return metricData;
    }
}
exports.TrafficService = TrafficService;
//# sourceMappingURL=TrafficService.js.map