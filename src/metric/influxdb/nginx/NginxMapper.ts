import { FluxTableMetaData } from '@influxdata/influxdb-client';
import { Nginx } from './Nginx';

export class NginxMapper {
  public static rowMapper(values: string[], tableMeta: FluxTableMetaData): Nginx {
    const nginx = new Nginx();

    nginx.date = tableMeta.get(values, '_time');

    nginx.map = new Map<string, number>();

    for (const column of tableMeta.columns) {
      if (column.label === '_time' || column.label === 'result' || column.label === 'table') {
        //skip
      } else if (column.dataType === 'long') {
        nginx.map.set(column.label, tableMeta.get(values, column.label));
      }
    }

    return nginx;
  }
}
