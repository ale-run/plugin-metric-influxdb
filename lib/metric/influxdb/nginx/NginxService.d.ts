import { AnyObject, MetricData, MetricFilter } from '@ale-run/runtime';
import { InfluxdbService } from '../InfluxdbService';
export declare class NginxService extends InfluxdbService {
    private nginxRepository;
    /**
     * Nginx StatusCode 카운팅 (Namespace, Service)
     * @param object
     * @param options
     * @returns
     */
    getStatusCodeAggregate(env: AnyObject, service: AnyObject, options: MetricFilter): Promise<MetricData>;
    private toMetricData;
    private toMetricItem;
}
