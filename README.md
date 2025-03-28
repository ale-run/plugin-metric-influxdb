<br />
<br />

<p align="center">
<a href="https://ale.run/">
  <img src="https://files.cloudtype.io/logo/ale-wordmark-black.svg" width="160px" alt="Ale logo" />
</a>
</p>

<h3 align="center">A Fully Customizable Internal Developer Platform</h3>
<p align="center">A framework that enables a fully self-service environment for developers. <br />Build your team’s Internal Developer Platform more efficiently.</p>
<br />

# Ale Plugin for InfluxDB

This driver enables you to monitor InfluxDB-collected metrics for services deployed to Kubernetes clusters using ale.

## Getting Started

<a href="https://docs.ale.run/" target="_blank">Read the documentation</a> or follow the steps below:

### 📌 Requirements

- Node.js version 20 or higher
- Kubernetes cluster with pre-configured Telegraf collectors and InfluxDB for service deployment

### 🪄 Installation(Local)

1. Clone the project repository.

   ```bash
   git clone https://github.com/ale-run/plugin-metric-influxdb.git
   ```

2. Navigate to the project directory and run the npm installation command.

   ```bash
   cd plugin-metric-influxdb
   npm i
   ```

3. Run Ale with the built-in Ale Plugin for InfluxDB.

   ```bash
   npm run dev
   ```

4. Select the target cluster for Ale.

   ```bash
   ? Select a Kubernetes context: (Use arrow keys)
     No Cluster Selected
     orbstack
   ❯ docker-desktop
   (Move up and down to reveal more choices)
   ```

5. Access via the following address.

   - <http://localhost:9001>

### ⚙️ Configuration

1. Navigate to the Settings page under the Operating System section.

2. From the Clusters section, click on a cluster where metrics are being collected through InfluxDB.

3. In the Metric Driver section, select **InfluxDB** and then add the following key-value pairs to Variables under More Options.

   - `INFLUX_URL`: InfluxDB URL
   - `INFLUX_TOKEN`: InfluxDB token
   - `INFLUX_ORG`: InfluxDB organization

### 📈 Observation

1. After configuring the metrics, click on the Metrics tab on the deployed service page.

2. In the dashboard, you can monitor CPU, Memory, and network traffic by date and interval.

## Community support

For general help using Ale, please refer to [the official Ale documentation](https://docs.ale.run/).
For additional help, you can use one of these channels to ask a question:

- [Discord](https://discord.gg/wVafphzcRE)
- [YouTube Channel](https://www.youtube.com/@ale_run)

## Documentation

- [Ale docs](https://docs.ale.run/)
- [InfluxDB docs](https://docs.influxdata.com/)

## License

See the [LICENSE](./LICENSE) file for licensing information.
