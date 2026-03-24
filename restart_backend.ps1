Try {
    $conn = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "Killing process loading port 8000: $($conn.OwningProcess)"
        Stop-Process -Id $conn.OwningProcess -Force
        Start-Sleep -Seconds 2
    }
} Catch {
    Write-Host "No prior process required cleanups: $_"
}

Write-Host "Re-starting backend python main.py..."
cd "C:\Users\Archisha Majumdar\Downloads\b_swasthya ai twin\backend"
& "C:\Users\Archisha Majumdar\Downloads\b_swasthya ai twin\.venv\Scripts\python.exe" main.py > "C:\Users\Archisha Majumdar\Downloads\b_swasthya ai twin\backend\output.log" 2>&1
