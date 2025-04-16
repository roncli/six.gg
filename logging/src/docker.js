/**
 * @typedef {import("../types/docker").MinutesStats} DockerTypes.MinutesStats
 */

const appInsights = require("applicationinsights"),
    Dockerode = require("dockerode");

// MARK: class Docker
/**
 * A class to handle calls to the docker socket.
 */
class Docker {
    // MARK: constructor
    /**
     * Creates a new docker socket class.
     */
    constructor() {
        this.dockerode = new Dockerode();
    }

    // MARK: async start
    /**
     * Starts docker stats logging.
     * @returns {Promise} A promise that never resolves.  Don't await this method.
     */
    async start() {
        /** @type {DockerTypes.MinutesStats} */
        const minutes = {};

        let currentMinute = -1;

        while (true) { // eslint-disable-line no-constant-condition
            try {
                const stats = await this.getStats();

                if (stats.length > 0) {
                    const minute = stats.map((s) => s.read).sort((a, b) => b.getTime() - a.getTime())[0].getMinutes();

                    if (currentMinute !== -1 && minute !== currentMinute) {
                        for (const id of Object.keys(minutes[currentMinute])) {
                            const stat = minutes[currentMinute][id];

                            appInsights.defaultClient.trackMetric({name: "Memory Used", value: stat.memory.used.total / stat.count, min: stat.memory.used.min, max: stat.memory.used.max, time: new Date(), properties: {id, name: stat.name}});
                            appInsights.defaultClient.trackMetric({name: "Memory Available", value: stat.memory.available.total / stat.count, min: stat.memory.available.min, max: stat.memory.available.max, time: new Date(), properties: {id, name: stat.name}});
                            appInsights.defaultClient.trackMetric({name: "Memory Percent", value: stat.memory.pct.total / stat.count, min: stat.memory.pct.min, max: stat.memory.pct.max, time: new Date(), properties: {id, name: stat.name}});
                            appInsights.defaultClient.trackMetric({name: "CPU Percent", value: stat.cpu.total / stat.count, min: stat.cpu.min, max: stat.cpu.max, time: new Date(), properties: {id, name: stat.name}});
                            appInsights.defaultClient.trackMetric({name: "Network Received", value: stat.network.rxBytes.total / stat.count, min: stat.network.rxBytes.min, max: stat.network.rxBytes.max, time: new Date(), properties: {id, name: stat.name}});
                            appInsights.defaultClient.trackMetric({name: "Network Transmitted", value: stat.network.txBytes.total / stat.count, min: stat.network.txBytes.min, max: stat.network.txBytes.max, time: new Date(), properties: {id, name: stat.name}});
                        }

                        delete minutes[currentMinute];
                    }

                    currentMinute = minute;

                    if (!minutes[currentMinute]) {
                        minutes[currentMinute] = {};
                    }

                    for (const stat of stats) {
                        if (!minutes[currentMinute][stat.id]) {
                            minutes[currentMinute][stat.id] = {
                                name: stat.name,
                                count: 0,
                                memory: {
                                    used: {
                                        min: stat.memory.used,
                                        max: stat.memory.used,
                                        total: 0
                                    },
                                    available: {
                                        min: stat.memory.available,
                                        max: stat.memory.available,
                                        total: 0
                                    },
                                    pct: {
                                        min: stat.memory.pct,
                                        max: stat.memory.pct,
                                        total: 0
                                    }
                                },
                                cpu: {
                                    min: stat.cpu,
                                    max: stat.cpu,
                                    total: 0
                                },
                                network: {
                                    rxBytes: {
                                        min: stat.network.rxBytes,
                                        max: stat.network.rxBytes,
                                        total: 0
                                    },
                                    txBytes: {
                                        min: stat.network.txBytes,
                                        max: stat.network.txBytes,
                                        total: 0
                                    }
                                }
                            };
                        }

                        minutes[currentMinute][stat.id].count++;
                        minutes[currentMinute][stat.id].memory.used.min = Math.min(stat.memory.used, minutes[currentMinute][stat.id].memory.used.min);
                        minutes[currentMinute][stat.id].memory.used.max = Math.max(stat.memory.used, minutes[currentMinute][stat.id].memory.used.max);
                        minutes[currentMinute][stat.id].memory.used.total += stat.memory.used;
                        minutes[currentMinute][stat.id].memory.available.min = Math.min(stat.memory.available, minutes[currentMinute][stat.id].memory.available.min);
                        minutes[currentMinute][stat.id].memory.available.max = Math.max(stat.memory.available, minutes[currentMinute][stat.id].memory.available.max);
                        minutes[currentMinute][stat.id].memory.available.total += stat.memory.available;
                        minutes[currentMinute][stat.id].memory.pct.min = Math.min(stat.memory.pct, minutes[currentMinute][stat.id].memory.pct.min);
                        minutes[currentMinute][stat.id].memory.pct.max = Math.max(stat.memory.pct, minutes[currentMinute][stat.id].memory.pct.max);
                        minutes[currentMinute][stat.id].memory.pct.total += stat.memory.pct;
                        minutes[currentMinute][stat.id].cpu.min = Math.min(stat.cpu, minutes[currentMinute][stat.id].cpu.min);
                        minutes[currentMinute][stat.id].cpu.max = Math.max(stat.cpu, minutes[currentMinute][stat.id].cpu.max);
                        minutes[currentMinute][stat.id].cpu.total += stat.cpu;
                        minutes[currentMinute][stat.id].network.rxBytes.min = Math.min(stat.network.rxBytes, minutes[currentMinute][stat.id].network.rxBytes.min);
                        minutes[currentMinute][stat.id].network.rxBytes.max = Math.max(stat.network.rxBytes, minutes[currentMinute][stat.id].network.rxBytes.max);
                        minutes[currentMinute][stat.id].network.rxBytes.total += stat.network.rxBytes;
                        minutes[currentMinute][stat.id].network.txBytes.min = Math.min(stat.network.txBytes, minutes[currentMinute][stat.id].network.txBytes.min);
                        minutes[currentMinute][stat.id].network.txBytes.max = Math.max(stat.network.txBytes, minutes[currentMinute][stat.id].network.txBytes.max);
                        minutes[currentMinute][stat.id].network.txBytes.total += stat.network.txBytes;
                    }
                }
            } catch (err) {
                console.log(err);
            }
        }
    }

    // MARK: async getStats
    /**
     * Gets the container stats.
     * @returns {Promise<{id: string, name: string, read: Date, memory: {used: number, available: number, pct: number}, cpu: number, network: {rxBytes: number, txBytes: number}}[]>} The container stats.
     */
    async getStats() {
        const containers = await this.dockerode.listContainers(),
            containerStats = [],
            fxs = [];

        for (const containerInfo of containers) {
            fxs.push((async () => {
                const stats = await this.getStatsByContainerId(containerInfo.Id, containerInfo.Names[0]);
                if (stats) {
                    containerStats.push(stats);
                }
            })());
        }

        await Promise.all(fxs);

        return containerStats;
    }

    // MARK: async getStatsByContainerId
    /**
     * Gets the stats for a single container.
     * @param {string} id The container ID.
     * @param {string} name The container name.
     * @returns {Promise<{id: string, name: string, read: Date, memory: {used: number, available: number, pct: number}, cpu: number, network: {rxBytes: number, txBytes: number}}>} The container's stats.
     */
    async getStatsByContainerId(id, name) {
        const container = this.dockerode.getContainer(id),
            stats = await container.stats({stream: false});

        // @ts-ignore: stats.preread exists, but is not in the @types/dockerode typings.
        if (!stats || new Date(stats.read).getTime() === new Date(stats.preread).getTime()) {
            return void 0;
        }

        const usedMemory = stats.memory_stats.usage,
            availableMemory = stats.memory_stats.limit,
            memoryUsagePct = usedMemory / availableMemory,
            cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage,
            systemCpuDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage,
            numberCpus = stats.cpu_stats.online_cpus,
            cpuUsagePct = numberCpus * cpuDelta / systemCpuDelta,
            rxBytes = stats.networks && Object.keys(stats.networks).map((key) => stats.networks[key].rx_bytes).reduce((acc, cur) => acc + cur) || 0,
            txBytes = stats.networks && Object.keys(stats.networks).map((key) => stats.networks[key].tx_bytes).reduce((acc, cur) => acc + cur) || 0;

        return {
            id,
            name,
            read: new Date(stats.read),
            memory: {
                used: usedMemory,
                available: availableMemory,
                pct: memoryUsagePct
            },
            cpu: cpuUsagePct,
            network: {rxBytes, txBytes}
        };
    }
}

module.exports = Docker;
