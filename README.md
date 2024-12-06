
# DNS Configurator

A cross-platform desktop application to dynamically configure the system's DNS address. Built with Electron.js, it validates the DNS server's availability and allows users to connect or disconnect from the DNS server seamlessly.


## Features

- DNS Configuration
- Cross Platform
- Minimalist UI
- Dark Mode
- Notifications
- Activity Logs

## Prerequisites
1. Install the Node.js
2. Platform-Specific Dependencies:
- Windows: Ensure netsh is available.
- Linux: nmcli command should be installed
- macOS: networksetup command should be available.
## Installation

Clone the repositary:

```bash
  git clone <your-repository-url>
  cd dns

```
Install Dependencies:
```bash
  npm install
```
Start the Application:
```bash
  npm start
``` 
## Usage

1. Enter a valid DNS IP address (e.g., 8.8.8.8).
2. Click Connect:
- If the DNS server is reachable, the app will connect and display the success message.
- If unreachable, the app will notify the user.
3. To revert to default DNS, click Disconnect.
## Commands Reference
Connect to DNS
- Windows:
```bash
  netsh interface ipv4 set dns name="WiFi" static <DNS_IP>

```
- macOS:
```bash
  networksetup -setdnsservers Wi-Fi <DNS_IP>
```
- Linux:
```bash
 nmcli dev mod eth0 ipv4.dns <DNS_IP>
```
Disconnect to DNS
- Windows:
```bash
 netsh interface ipv4 set dns name="WiFi" dhcp

```
- macOS:
```bash
 networksetup -setdnsservers Wi-Fi Empty

```
- Linux:
```bash
 nmcli dev mod eth0 ipv4.ignore-auto-dns yes
```
## Logs
Activity logs are saved to a local file:
- Location: %APPDATA%/activity-log (Windows), ~/Library/Application Support (macOS), or ~/.config (Linux).
- Log format: Each entry contains the timestamp and description of the DNS action.
## Issues
 1. Linux-specific configurations: Ensure nmcli is installed.
 2. Permission Requirements:
 - Windows: Run the app as Administrator.
 - Linux/macOS: Requires sudo for DNS changes.