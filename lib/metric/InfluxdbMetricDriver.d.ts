import { ClusterMetricDriver, IDeployment, MetricItem, MetricFilter, MetricData } from '@ale-run/runtime';
export declare class InfluxdbMetricDriver extends ClusterMetricDriver {
    private readonly cpuService;
    private readonly memoryService;
    private readonly trafficService;
    private readonly nginxService;
    getMetricItems(deployment: IDeployment): Promise<MetricItem[]>;
    getMetric(deployment: IDeployment, name: string, options: MetricFilter): Promise<MetricData>;
    getStartDate(): Date;
}
