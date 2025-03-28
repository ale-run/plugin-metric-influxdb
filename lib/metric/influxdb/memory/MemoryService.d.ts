import { AnyObject, MetricData, MetricFilter } from '@ale-run/runtime';
import { InfluxdbService } from '../InfluxdbService';
export declare class MemoryService extends InfluxdbService {
    private memoryRepository;
    /**
     * Memory 사용량
     * @param env
     * @param deploy
     * @param options
     * @returns
     */
    getMemoryUsage(env: AnyObject, deploy: AnyObject, options: MetricFilter): Promise<MetricData>;
    /**
     * Memory Limit
     * @param env
     * @param deploy
     * @param options
     * @returns
     */
    getMemoryLimit(env: AnyObject, deploy: AnyObject, options: MetricFilter): Promise<MetricData>;
    private toMetricData;
}
