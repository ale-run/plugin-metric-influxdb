import { ClusterMetricDriver, IDeployment, MetricItem, MetricFilter, MetricData, Logger, AnyObject } from '@ale-run/runtime';
import { CpuService } from './influxdb/cpu/CpuService';
import { MemoryService } from './influxdb/memory/MemoryService';
import { TrafficService } from './influxdb/traffic/TrafficService';
import { NginxService } from './influxdb/nginx/NginxService';

const logger = Logger.getLogger('metric:InfluxdbMetricDriver');

export class InfluxdbMetricDriver extends ClusterMetricDriver {
  private readonly cpuService: CpuService = new CpuService();
  private readonly memoryService: MemoryService = new MemoryService();
  private readonly trafficService: TrafficService = new TrafficService();
  private readonly nginxService: NginxService = new NginxService();

  public async getMetricItems(deployment: IDeployment): Promise<MetricItem[]> {
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

  public async getMetric(deployment: IDeployment, name: string, options: MetricFilter): Promise<MetricData> {
    logger.debug(`[METRIC][${deployment.name}]metricName=${name}`);

    if (this.cluster.env['INFLUX_URL'] === undefined || this.cluster.env['INFLUX_TOKEN'] === undefined || this.cluster.env['INFLUX_ORG'] === undefined) {
      throw new Error(`[METRIC]environments(INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG) are required`);
    }

    let statObjects: AnyObject[] = [];
    if (name === 'statusCode') {
      statObjects = deployment.stat?.objects?.filter((o) => o.kind === 'Service' && o.internal == true);
    } else {
      statObjects = deployment.stat?.objects?.filter((o) => o.kind === 'Deployment');
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
        metricData = await this.cpuService.getCpuUsage(this.cluster.env, statObject, options);
        break;
      case 'cpu-limit':
        metricData = await this.cpuService.getCpuLimit(this.cluster.env, statObject, options);
        break;

      case 'memory':
        metricData = await this.memoryService.getMemoryUsage(this.cluster.env, statObject, options);
        break;
      case 'memory-limit':
        metricData = await this.memoryService.getMemoryLimit(this.cluster.env, statObject, options);
        break;

      case 'inbound':
        metricData = await this.trafficService.getNetworkInUsage(this.cluster.env, statObject, options);
        break;
      case 'outbound':
        metricData = await this.trafficService.getNetworkOutUsage(this.cluster.env, statObject, options);
        break;
      case 'statusCode':
        metricData = await this.nginxService.getStatusCodeAggregate(this.cluster.env, statObject, options);
        break;
      default:
        logger.warn(`[METRIC][${deployment.name}]metricName=${name} undefined item`);
        return;
    }

    logger.debug(`[METRIC]`, metricData);
    return metricData;
  }

  getStartDate(): Date {
    let date = new Date();
    //date.setDate(date.getDate() - 1);
    date.setHours(date.getHours() - 3);
    //date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }
}
