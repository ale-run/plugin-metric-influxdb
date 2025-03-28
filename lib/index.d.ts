import { Plugin } from '@ale-run/runtime';
export default class InfluxdbMetricPlugin extends Plugin {
    activate(): Promise<void>;
    deactivate(): Promise<void>;
}
