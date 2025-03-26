import { FluxTableMetaData } from '@influxdata/influxdb-client';
import { Traffic } from './Traffic';
import { Utils } from '../../Utils';

export class TrafficMapper {
  public static rowMapper(values: string[], tableMeta: FluxTableMetaData): Traffic {
    const traffic = new Traffic();
    traffic.date = tableMeta.get(values, '_time');
    traffic.name = tableMeta.get(values, 'pod_name');
    if (Utils.isEmpty(traffic.name)) {
      traffic.name = tableMeta.get(values, 'controller_name');
    }
    if (Utils.isEmpty(traffic.name)) {
      traffic.name = tableMeta.get(values, 'namespace');
    }

    traffic.egress = tableMeta.get(values, 'tx_bytes');
    traffic.ingress = tableMeta.get(values, 'rx_bytes');
    //traffic.namespace = tableMeta.get(values, "namespace");
    //traffic.controller_name = tableMeta.get(values, "controller_name");
    return traffic;
  }
}
