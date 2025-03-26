import { FluxTableMetaData } from '@influxdata/influxdb-client';
import { Cpu } from './Cpu';
import { Utils } from '../../Utils';

export class CpuMapper {
  public static rowMapper(values: string[], tableMeta: FluxTableMetaData): Cpu {
    const cpu = new Cpu();
    cpu.date = tableMeta.get(values, '_time');
    cpu.name = tableMeta.get(values, 'pod_name');
    if (Utils.isEmpty(cpu.name)) {
      cpu.name = tableMeta.get(values, 'controller_name');
    }
    if (Utils.isEmpty(cpu.name)) {
      cpu.name = tableMeta.get(values, 'namespace');
    }

    // cpu.namespace = tableMeta.get(values, "namespace");
    // cpu.controller = tableMeta.get(values, "controller_name");
    // cpu.pod = tableMeta.get(values, "pod_name");
    cpu.value = tableMeta.get(values, '_value');
    return cpu;
  }
}
