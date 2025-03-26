import { FluxTableMetaData } from '@influxdata/influxdb-client';
import { Memory } from './Memory';
import { Utils } from '../../Utils';

export class MemoryMapper {
  public static rowMapper(values: string[], tableMeta: FluxTableMetaData): Memory {
    const memory = new Memory();
    memory.date = tableMeta.get(values, '_time');
    memory.name = tableMeta.get(values, 'pod_name');
    if (Utils.isEmpty(memory.name)) {
      memory.name = tableMeta.get(values, 'controller_name');
    }
    if (Utils.isEmpty(memory.name)) {
      memory.name = tableMeta.get(values, 'namespace');
    }

    memory.value = tableMeta.get(values, '_value');
    // memory.usage = tableMeta.get(values, "memory_usage_mib");
    // memory.limit = tableMeta.get(values, "memory_limit_mib");
    return memory;
  }
}
