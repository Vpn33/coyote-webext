const fs = require('fs');
const path = require('path');
// 使用require导入，因为package.json中没有设置type: module
const WaveUtil = require('./src/lib/WaveUtil.js').default;

// 解压后的pulse文件目录
const pulseDirectory = './pulse_files';

async function testBatchParse() {
    console.log('=== 批量测试pulse文件解析 ===\n');

    try {
        // 获取目录中的所有文件
        const files = fs.readdirSync(pulseDirectory);
        const pulseFiles = files.filter(file => file.endsWith('.pulse'));

        console.log(`找到 ${pulseFiles.length} 个pulse文件\n`);

        let successCount = 0;
        let failedCount = 0;
        const failedFiles = [];
        let ctrlItemList = [];

        // 遍历所有pulse文件
        for (const file of pulseFiles) {
            const fileName = path.basename(file, '.pulse');
            const filePath = path.join(pulseDirectory, file);

            try {
                console.log(`正在解析: ${file}`);

                // 读取文件内容
                const content = fs.readFileSync(filePath, 'utf-8');

                // 调用解析函数
                const ctrlItem = await WaveUtil.parsePulseToCtrlItem(fileName, content);

                // 检查解析结果
                if (!ctrlItem) {
                    throw new Error('解析返回null');
                }
                if (!ctrlItem.id) {
                    ctrlItem.id = fileName.split('-')[0];
                }

                if (!Array.isArray(ctrlItem.stageList)) {
                    throw new Error('stageList不是数组');
                }

                if (ctrlItem.stageList.length === 0) {
                    console.log(`  ⚠️  警告: ${file} 没有解析到任何小节`);
                } else {
                    // 检查每个stage是否有getStageTotalTime方法
                    for (let i = 0; i < ctrlItem.stageList.length; i++) {
                        const stage = ctrlItem.stageList[i];
                        if (typeof stage.getStageTotalTime !== 'function') {
                            throw new Error(`第${i + 1}个小节缺少getStageTotalTime方法`);
                        }
                    }

                    // 尝试计算总时长
                    const totalDuration = ctrlItem.getDuration();
                    ctrlItemList.push(ctrlItem);
                    console.log(`  ✅ 成功解析! id: ${ctrlItem.id}, 小节数: ${ctrlItem.stageList.length}, 总时长: ${totalDuration}ms`);
                }

                successCount++;
                console.log();

            } catch (error) {
                console.log(`  ❌ 解析失败: ${error.message}`);
                failedCount++;
                failedFiles.push({ file, error: error.message });
                console.log();
                break;
            }
        }

        // 打印测试结果总结
        console.log('=== 测试结果总结 ===');
        console.log(`总文件数: ${pulseFiles.length}`);
        console.log(`成功解析: ${successCount}`);
        console.log(`解析失败: ${failedCount}`);

        const ctrlItemListJson = JSON.stringify(ctrlItemList, null, 2);
        fs.writeFileSync('./src/lib/CtrlItemList.json', ctrlItemListJson, 'utf-8');
        console.log(`已将ctrlItemList保存到 ./src/lib/CtrlItemList.json`);

        if (failedCount > 0) {
            console.log('\n失败文件列表:');
            for (const { file, error } of failedFiles) {
                console.log(`- ${file}: ${error}`);
            }
        }

        return {
            total: pulseFiles.length,
            success: successCount,
            failed: failedCount,
            failedFiles
        };

    } catch (error) {
        console.error('批量测试过程中发生错误:', error);
        return null;
    }
}

// 运行测试
testBatchParse().then(result => {
    if (result) {
        if (result.failed === 0) {
            console.log('\n🎉 所有pulse文件都成功解析!');
        } else {
            console.log(`\n⚠️  解析测试完成，但有 ${result.failed} 个文件解析失败。`);
        }
    }
});