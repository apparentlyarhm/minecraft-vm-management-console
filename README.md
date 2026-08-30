## Introduction
A control panel designed to interface with a custom Minecraft server (hyper specific to [Google Cloud Platform](https://cloud.google.com/?hl=en)) and provide stuff like 
- Server Info
- Message Of The Day
- whitelisting user IP
- Modlist View, Search, and Download (no support for adding currently)
- RCON and Access Control operations
- Read Logs from `logs/latest.log`.
- Oauth based Login (Github) - so inbuilt support for admin login (just make ur github)
- Performance Graphs with reference lines for key metrics as well as summary of all metrics in a separate tab

I use this to manange my own server, as well as protect it using the firewall if necessary.

Oh yeah, I copied the AWS/Amazon aesthetic for this; Ironic.

## Small demo as admin
<img src="./repo_assets/demo.gif"> 

## Screenshots

## MOTD
<img src="./repo_assets/motd.png"> 

## VM info
<img src="./repo_assets/deets.png"> 

## Mods
<img src="./repo_assets/mods.png"> 

## Admin Controls
<img src="./repo_assets/admin.png"> 

## Logs
<img src="./repo_assets/logs.png"> 

added in late Aug 2026 -where the app went through a domain change.

## Metric State of the system
<img src="./repo_assets/metric-summary.png"> 

## Performance Graphs Examples

### Cpu
<img src="./repo_assets/graph_cpu.png"> 

### General - Entities and stuff 
<img src="./repo_assets/graph_general.png"> 

### Responsiveness - TPS & MSPT
<img src="./repo_assets/graph_responsiveness.png">

### Memory - JVM stuff
<img src="./repo_assets/graph_mem.png"> 

## Setting up and related repos

do `npm install` or `bun i` first as usual AND you need the corresponding Backend for this.

[the go backend](https://github.com/apparentlyarhm/validator-gcp-go)

[the terraform-based orchaestrator](https://github.com/apparentlyarhm/minecraft-terraform): this is optional, it helps automate stuff.
