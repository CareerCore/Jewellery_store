$categories = @("rings", "earings", "neckles", "braclete")
$data = @{}

foreach ($cat in $categories) {
    $data[$cat] = @()
    $catPath = Join-Path -Path $PWD -ChildPath $cat
    if (Test-Path $catPath) {
        $items = Get-ChildItem -Path $catPath -Directory
        foreach ($item in $items) {
            $itemPath = $item.FullName
            $images = Get-ChildItem -Path $itemPath -Include *.webp,*.jpg,*.jpeg,*.png -Recurse | Select-Object -ExpandProperty Name
            
            # Simple format: capitalization
            $formattedName = $item.Name.ToUpper()

            $imagePaths = @()
            foreach ($img in $images) {
                $imagePaths += "$cat/$($item.Name)/$img"
            }

            $obj = @{
                id = $item.Name
                name = $formattedName
                images = $imagePaths
            }
            $data[$cat] += $obj
        }
    }
}

$json = $data | ConvertTo-Json -Depth 5
"const jewelryData = $json;`n`nexport default jewelryData;" | Out-File -FilePath "data.js" -Encoding utf8
Write-Output "Successfully created data.js"
