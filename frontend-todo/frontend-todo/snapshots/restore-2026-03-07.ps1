param(
  [string]$RepoRoot = "D:\AllProjects\ToDoProject"
)

$SnapshotRoot = "D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\snapshots\2026-03-07"
$Manifest = Join-Path $SnapshotRoot "manifest.csv"

if (-not (Test-Path $Manifest)) {
  throw "Manifest not found: $Manifest"
}

$rows = Import-Csv $Manifest
foreach ($row in $rows) {
  $src = Join-Path $SnapshotRoot $row.path
  $dst = Join-Path $RepoRoot $row.path
  $dstDir = Split-Path $dst -Parent

  if (-not (Test-Path $src)) {
    Write-Warning "Missing snapshot file: $src"
    continue
  }

  if (-not (Test-Path $dstDir)) {
    New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
  }

  Copy-Item -Path $src -Destination $dst -Force
}

Write-Output "Restored $($rows.Count) files from snapshot date 2026-03-07."
