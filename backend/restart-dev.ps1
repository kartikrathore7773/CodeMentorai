Param(
    [int]$Port = 3000
)

Write-Host "[restart-dev] Checking for process using port $Port..."

try {
    $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop
} catch {
    $conns = @()
}

if ($conns -and $conns.Count -gt 0) {
    $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pids) {
        if ($pid -and $pid -ne 0) {
            Write-Host "[restart-dev] Found PID $pid using port $Port — attempting to stop..."
            try {
                Stop-Process -Id $pid -Force -ErrorAction Stop
                Write-Host "[restart-dev] Stopped process $pid"
            } catch {
                Write-Warning "[restart-dev] Failed to stop process $pid: $_"
            }
        }
    }
} else {
    Write-Host "[restart-dev] No process found via Get-NetTCPConnection. Trying netstat parse as fallback..."
    $netstat = netstat -aon | Select-String ":$Port"
    if ($netstat) {
        $pids = @()
        foreach ($line in $netstat) {
            $parts = ($line -split '\s+') -ne ''
            $last = $parts[-1]
            if ($last -match '^[0-9]+$') { $pids += [int]$last }
        }
        $pids = $pids | Sort-Object -Unique
        foreach ($pid in $pids) {
            if ($pid -and $pid -ne 0) {
                Write-Host "[restart-dev] Found PID $pid via netstat — attempting to stop..."
                try {
                    Stop-Process -Id $pid -Force -ErrorAction Stop
                    Write-Host "[restart-dev] Stopped process $pid"
                } catch {
                    Write-Warning "[restart-dev] Failed to stop process $pid: $_"
                }
            }
        }
    } else {
        Write-Host "[restart-dev] No process appears to be using port $Port."
    }
}

# Try npx kill-port as an extra attempt (non-fatal if not installed)
try {
    Write-Host "[restart-dev] Attempting npx kill-port $Port (if available)..."
    npx kill-port $Port 2>$null
} catch {
    Write-Host "[restart-dev] npx kill-port not available or failed — continuing."
}

# Start the dev server in the backend directory (same folder as this script)
Write-Host "[restart-dev] Starting backend with 'npm run dev' (working dir: $PSScriptRoot)"
Start-Process -FilePath "npm" -ArgumentList "run","dev" -WorkingDirectory $PSScriptRoot -NoNewWindow
Write-Host "[restart-dev] Started 'npm run dev' (check new process)."
