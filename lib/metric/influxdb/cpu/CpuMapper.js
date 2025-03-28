"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CpuMapper = void 0;
const Cpu_1 = require("./Cpu");
const Utils_1 = require("../../Utils");
class CpuMapper {
    static rowMapper(values, tableMeta) {
        const cpu = new Cpu_1.Cpu();
        cpu.date = tableMeta.get(values, '_time');
        cpu.name = tableMeta.get(values, 'pod_name');
        if (Utils_1.Utils.isEmpty(cpu.name)) {
            cpu.name = tableMeta.get(values, 'controller_name');
        }
        if (Utils_1.Utils.isEmpty(cpu.name)) {
            cpu.name = tableMeta.get(values, 'namespace');
        }
        // cpu.namespace = tableMeta.get(values, "namespace");
        // cpu.controller = tableMeta.get(values, "controller_name");
        // cpu.pod = tableMeta.get(values, "pod_name");
        cpu.value = tableMeta.get(values, '_value');
        return cpu;
    }
}
exports.CpuMapper = CpuMapper;
//# sourceMappingURL=CpuMapper.js.map