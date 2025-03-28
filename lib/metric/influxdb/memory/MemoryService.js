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
exports.MemoryService = void 0;
const runtime_1 = require("@ale-run/runtime");
const InfluxdbService_1 = require("../InfluxdbService");
const MemoryRepository_1 = require("./MemoryRepository");
const logger = runtime_1.Logger.getLogger('metric:MemoryService');
class MemoryService extends InfluxdbService_1.InfluxdbService {
    constructor() {
        super(...arguments);
        this.memoryRepository = new MemoryRepository_1.MemoryRepository();
    }
    /**
     * Memory 사용량
     * @param env
     * @param deploy
     * @param options
     * @returns
     */
    getMemoryUsage(env, deploy, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.getInfluxdbClient(env);
            const unit = this.getInterval(options.interval);
            const desc = false; //true 내림차순, false 오름차순 정렬
            //count
            const count = yield this.memoryRepository.getMemoryUsageCount(client, deploy.namespace, options.from, options.to, unit, deploy.name);
            const total = count != null && count.length > 0 ? Number(count[0]) : 0;
            //data
            let dataPoints = undefined;
            if (total > 0) {
                dataPoints = yield this.memoryRepository.getMemoryUsage(client, deploy.namespace, options.from, options.to, unit, desc, deploy.name);
            }
            return this.toMetricData(deploy, options, total, dataPoints);
        });
    }
    /**
     * Memory Limit
     * @param env
     * @param deploy
     * @param options
     * @returns
     */
    getMemoryLimit(env, deploy, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.getInfluxdbClient(env);
            const unit = this.getInterval(options.interval);
            const desc = false; //true 내림차순, false 오름차순 정렬
            //count
            const count = yield this.memoryRepository.getMemoryLimitCount(client, deploy.namespace, options.from, options.to, unit, deploy.name);
            const total = count != null && count.length > 0 ? Number(count[0]) : 0;
            //data
            let dataPoints = undefined;
            if (total > 0) {
                dataPoints = yield this.memoryRepository.getMemoryLimit(client, deploy.namespace, options.from, options.to, unit, desc, deploy.name);
            }
            return this.toMetricData(deploy, options, total, dataPoints);
        });
    }
    toMetricData(deploy, options, total, dataPoints) {
        const dates = [];
        const values = [];
        if (dataPoints != undefined) {
            for (const data of dataPoints) {
                dates.push(data.date);
                values.push(data.value);
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
exports.MemoryService = MemoryService;
//# sourceMappingURL=MemoryService.js.map