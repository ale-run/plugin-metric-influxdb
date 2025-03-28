import { AnyObject, MetricData, MetricFilter } from '@ale-run/runtime';
import { InfluxdbService } from '../InfluxdbService';
export declare class TrafficService extends InfluxdbService {
    private trafficRepository;
    getNetworkOutUsage(env: AnyObject, deploy: AnyObject, options: MetricFilter): Promise<MetricData>;
    getNetworkInUsage(env: AnyObject, deploy: AnyObject, options: MetricFilter): Promise<MetricData>;
    /**
     * Traffic 사용량 조회 (Namespace, Controller, Pod)
     * @param object
     * @param options
     * @returns
     */
    getTrafficUsage(env: AnyObject, deploy: AnyObject, options: MetricFilter, gress?: string): Promise<MetricData>;
    private toMetricData;
}
