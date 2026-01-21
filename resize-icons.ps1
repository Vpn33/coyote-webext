# 导入System.Drawing命名空间
Add-Type -AssemblyName System.Drawing

# 设置源图像路径和目标目录
$sourceImagePath = "f:\trae_workspace\coyote-webext\src\assets\icon.png"
$targetDirectory = "f:\trae_workspace\coyote-webext\src\assets"

# 定义要转换的尺寸
$sizes = @(16, 48, 128)

# 打开源图像
$sourceImage = [System.Drawing.Image]::FromFile($sourceImagePath)

# 遍历每个尺寸
foreach ($size in $sizes) {
    # 创建新的图像对象
    $newImage = New-Object System.Drawing.Bitmap($size, $size)
    
    # 获取Graphics对象进行绘制
    $graphics = [System.Drawing.Graphics]::FromImage($newImage)
    
    # 设置高质量绘制
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # 绘制调整后的图像
    $graphics.DrawImage($sourceImage, 0, 0, $size, $size)
    
    # 保存新图像
    $targetPath = Join-Path $targetDirectory "icon$size.png"
    $newImage.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # 释放资源
    $graphics.Dispose()
    $newImage.Dispose()
    
    Write-Host "已创建 $size x $size 尺寸的图标: $targetPath"
}

# 释放源图像资源
$sourceImage.Dispose()

Write-Host "所有图标转换完成！"