const dnsInput = document.getElementById("dnsipaddress");
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const statusDiv = document.getElementById("status");
const platform = window.electronAPI.platform;

dnsInput.addEventListener("input", () => {
  connectBtn.disabled = dnsInput.value.trim() === "";
});

connectBtn.addEventListener("click", async () => {
  const address = dnsInput.value.trim();

  if (!validateIpAddress(address)) {
    updateStatus("Invalid DNS address!", "red");
    new Notification("DNS Configurator",{
      body : `Invalid DNS address!`
    })
    return;
  }

  updateStatus(`Validating ${address}...`, "orange");

  const isReachable = await validateDNS(address);
  if (isReachable) {
    connectToDNS(address);
  } else {
    updateStatus("DNS server unreachable", "red");
    new Notification("DNS Configurator",{
      body : `DNS server unreachable`
    })
  }
});

disconnectBtn.addEventListener("click", () => {
  disconnectFromDNS();
});

  const validateIpAddress = (ip) => {
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;
  
    if (!ipRegex.test(ip)) return false;
  
    const octets = ip.split('.').map(Number);
    if (
      octets[0] === 127 || 
      // these all are in private range
      (octets[0] === 10) || 
      (octets[0] === 192 && octets[1] === 168) ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) 
    ) {
      return false;
    }
  
    return true;
  };
  

  async function validateDNS(dnsAddress) {
    const command = platform === "win32"
      ? `ping -n 3 ${dnsAddress}`
      : `ping -c 3 ${dnsAddress}`;
  
    try {
      const result = await window.electronAPI.executeCommand(command);
      console.log(`Ping successful: ${result}`);
      
      const lookupCommand = platform === "win32"
        ? `nslookup google.com ${dnsAddress}`
        : `dig @${dnsAddress} google.com`;
  
      const lookupResult = await window.electronAPI.executeCommand(lookupCommand);
      if (lookupResult.includes("No servers could be reached") || lookupResult.includes("NXDOMAIN")) {
        throw new Error("DNS server is not resolving queries.");
      }
      return true; 
    } catch (error) {
      console.error(error);
      return false; 
    }
  }

async function connectToDNS(dnsAddress) {
  const command = platform === "win32"
    ? `netsh interface ipv4 set dns name="WiFi" static ${dnsAddress}`
    : platform === "darwin"
    ? `networksetup -setdnsservers Wi-Fi ${dnsAddress}`
    : `nmcli dev mod eth0 ipv4.dns ${dnsAddress}`;

  try {
    await window.electronAPI.executeCommand(command);
    updateStatus(`Connected to ${dnsAddress}`, "green");
    new Notification("DNS Configurator",{
      body : `Connected to ${dnsInput.value.trim()}`
    })
    connectBtn.disabled=true;
    disconnectBtn.disabled=false;
    logActivity(`Connected to DNS: ${dnsAddress}`);
  } catch (error) {
    updateStatus("Error connecting to DNS", "red");
    new Notification("DNS Configurator",{
      body : `Error connecting to DNS`
    })
    console.error(error);
  }
}

async function disconnectFromDNS() {
  const command = platform === "win32"
    ? `netsh interface ipv4 set dns name="WiFi" dhcp`
    : platform === "darwin"
    ? `networksetup -setdnsservers Wi-Fi Empty`
    : `nmcli dev mod eth0 ipv4.ignore-auto-dns yes`;

  try {
    await window.electronAPI.executeCommand(command);
    updateStatus("Disconnected. DNS reset to default.", "gray");
    new Notification("DNS Configurator",{
      body : `Disconnected. DNS reset to default.`
    })
    connectBtn.disabled=false;
    disconnectBtn.disabled=true;
    dnsInput.value="";
    logActivity("Disconnected from DNS.");
  } catch (error) {
    updateStatus("Error disconnecting DNS", "red");
    new Notification("DNS Configurator",{
      body : `Error disconnecting DNS`
    })
    console.error(error);
  }
}

function updateStatus(message, color) {
  statusDiv.textContent = `Status: ${message}`;
  statusDiv.style.color = color;
}

function logActivity(message) {
  const logEntry = `${new Date().toLocaleString()}: ${message}`;
  console.log(logEntry);
  window.electronAPI.writeLog(message).catch((error)=>{
    console.log("Failed to log into Log file",error);
  });
}
