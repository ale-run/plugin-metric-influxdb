import { AnyObject, MetricData, MetricFilter } from '@ale-run/runtime';
import { InfluxdbService } from '../InfluxdbService';
export declare class CpuService extends InfluxdbService {
    private cpuRepository;
    /**
     * CPU 사용량 조회
     * @param object
     * @param options
     * @returns
     */
    getCpuUsage(env: AnyObject, deploy: AnyObject, options: MetricFilter): Promise<MetricData>;
    /**
     * CPU Limit
     * @param env
     * @param deploy
     * @param options
     * @returns
     */
    getCpuLimit(env: AnyObject, deploy: AnyObject, options: MetricFilter): Promise<MetricData>;
    private toMetricData;
}
