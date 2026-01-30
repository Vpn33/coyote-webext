<template>
    <div>
        <h2 class="h5 mb-2">漫画脚本列表</h2>
        <div class="table-actions mb-2" style="display: flex; gap: 10px; align-items: center;">
            <el-button type="primary" @click="showImportDialog">导入 JSON 文本</el-button>
            <el-upload
                action=""
                :auto-upload="false"
                :on-change="handleFileUpload"
                accept=".json"
                :show-file-list="false"
            >
                <el-button type="info">从文件导入</el-button>
            </el-upload>
            <el-button type="success" @click="exportSelected" :disabled="selectedRows.length === 0">导出文件</el-button>
        </div>
        <el-table :data="mangaList" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="bookId" label="漫画id"></el-table-column>
            <el-table-column prop="bookName" label="漫画名称"></el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="primary" size="small" @click="editMangaScript(scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="deleteMangaScript(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        
        <!-- 导入对话框 -->
        <el-dialog title="导入漫画脚本" :visible.sync="importDialogVisible" width="50%">
            <el-form :model="importForm" label-width="80px">
                <el-form-item label="JSON文本">
                    <el-input type="textarea" v-model="importForm.json" rows="10" placeholder="请输入漫画脚本的JSON文本"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="importDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="importJson">导入</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import MyStorage from '../../lib/MyStorage';
export default {
    name: 'manga-script-list',
    data() {
        return {
            mangaList: MyStorage.mangaList(),
            importDialogVisible: false,
            importForm: {
                json: ''
            },
            selectedRows: []
        }
    },
    methods: {
        editMangaScript(manga) {
            // 先更新Vuex状态，再进行路由跳转
            // console.log(manga);
            this.$store.dispatch('setEditMangaScript', manga).then(() => {
                this.$router.push({ name: 'MangaScriptEditor' });
            });
        },
        deleteMangaScript(manga) {
            this.$confirm('确定删除漫画脚本吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let index = this.mangaList.indexOf(manga);
                if (index !== -1) {
                    this.mangaList.splice(index, 1);
                    MyStorage.saveMangaList(this.mangaList);
                    this.$message.success('漫画脚本删除成功');
                }
            }).catch(() => {
                this.$message.info('已取消删除');
            });
        },
        showImportDialog() {
            this.importForm.json = '';
            this.importDialogVisible = true;
        },
        handleSelectionChange(selection) {
            this.selectedRows = selection;
        },
        importJson() {
            try {
                // 清理JSON文本
                let cleanedJson = this.importForm.json;
                
                // 1. 移除多余的逗号（在 ] 或 } 前的逗号）
                cleanedJson = cleanedJson.replace(/,\s*(\]|\})/g, '$1');
                
                // 2. 处理空白字符，保留双引号内的内容
                const quoteRegex = /"([^"\\]|\\.)*"/g;
                const placeholders = [];
                cleanedJson = cleanedJson.replace(quoteRegex, (match) => {
                    placeholders.push(match);
                    return `__PLACEHOLDER_${placeholders.length - 1}__`;
                });
                
                // 3. 清理不在双引号内的空白字符
                cleanedJson = cleanedJson.replace(/\s+/g, ' ').trim();
                
                // 4. 恢复双引号内的内容
                placeholders.forEach((placeholder, index) => {
                    cleanedJson = cleanedJson.replace(`__PLACEHOLDER_${index}__`, placeholder);
                });
                
                // 5. 尝试解析JSON
                const importedData = JSON.parse(cleanedJson);
                
                // 验证数据格式
                if (!Array.isArray(importedData)) {
                    this.$message.error('JSON格式错误，应为数组');
                    return;
                }
                
                // 验证每个元素的bookId
                const invalidItems = importedData.filter(item => !item.bookId);
                if (invalidItems.length > 0) {
                    this.$message.error('导入失败：存在bookId为空的项');
                    return;
                }
                
                // 检查重复ID
                const existingIds = new Set(this.mangaList.map(item => item.bookId));
                const duplicateItems = importedData.filter(item => existingIds.has(item.bookId));
                
                if (duplicateItems.length > 0) {
                    this.$confirm(`发现${duplicateItems.length}个重复ID，是否覆盖？`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.processImport(importedData);
                    }).catch(() => {
                        this.$message.info('已取消导入');
                    });
                } else {
                    this.processImport(importedData);
                }
            } catch (error) {
                this.$message.error(`JSON解析失败：${error.message}`);
            }
        },
        processImport(importedData) {
            // 处理导入逻辑
            const newMangaList = [...this.mangaList];
            let updatedCount = 0;
            let addedCount = 0;
            
            importedData.forEach(item => {
                // 移除不需要的 idx 属性
                if (item.scriptList && Array.isArray(item.scriptList)) {
                    item.scriptList.forEach(script => {
                        if (script.hasOwnProperty('idx')) {
                            delete script.idx;
                        }
                    });
                }
                
                // 优先使用 id 匹配，如果没有 id 则使用 bookId 匹配
                const existingIndex = newMangaList.findIndex(manga => {
                    if (item.id && manga.id) {
                        return manga.id === item.id;
                    } else if (item.bookId && manga.bookId) {
                        return manga.bookId === item.bookId;
                    }
                    return false;
                });
                
                if (existingIndex !== -1) {
                    // 覆盖现有项
                    newMangaList[existingIndex] = item;
                    updatedCount++;
                } else {
                    // 添加新项
                    newMangaList.push(item);
                    addedCount++;
                }
            });
            
            this.mangaList = newMangaList;
            MyStorage.saveMangaList(this.mangaList);
            this.importDialogVisible = false;
            this.$message.success(`成功导入${importedData.length}个漫画脚本（更新${updatedCount}个，新增${addedCount}个）`);
        },
        exportSelected() {
            if (this.selectedRows.length === 0) {
                this.$message.warning('请先选择要导出的数据');
                return;
            }
            
            const jsonData = JSON.stringify(this.selectedRows, null, 2);
            this.downloadJson(jsonData, 'manga-scripts.json');
        },
        downloadJson(data, filename) {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        },
        handleFileUpload(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const fileContent = e.target.result;
                    // 清理JSON文本
                    let cleanedJson = fileContent;
                    
                    // 1. 移除多余的逗号（在 ] 或 } 前的逗号）
                    cleanedJson = cleanedJson.replace(/,\s*(\]|\})/g, '$1');
                    
                    // 2. 处理空白字符，保留双引号内的内容
                    const quoteRegex = /"([^"\\]|\\.)*"/g;
                    const placeholders = [];
                    cleanedJson = cleanedJson.replace(quoteRegex, (match) => {
                        placeholders.push(match);
                        return `__PLACEHOLDER_${placeholders.length - 1}__`;
                    });
                    
                    // 3. 清理不在双引号内的空白字符
                    cleanedJson = cleanedJson.replace(/\s+/g, ' ').trim();
                    
                    // 4. 恢复双引号内的内容
                    placeholders.forEach((placeholder, index) => {
                        cleanedJson = cleanedJson.replace(`__PLACEHOLDER_${index}__`, placeholder);
                    });
                    
                    // 5. 尝试解析JSON
                    const importedData = JSON.parse(cleanedJson);
                    
                    // 验证数据格式
                    if (!Array.isArray(importedData)) {
                        this.$message.error('JSON格式错误，应为数组');
                        return;
                    }
                    
                    // 验证每个元素的bookId
                    const invalidItems = importedData.filter(item => !item.bookId);
                    if (invalidItems.length > 0) {
                        this.$message.error('导入失败：存在bookId为空的项');
                        return;
                    }
                    
                    // 检查重复ID
                    const existingIds = new Set(this.mangaList.map(item => item.bookId));
                    const duplicateItems = importedData.filter(item => existingIds.has(item.bookId));
                    
                    if (duplicateItems.length > 0) {
                        this.$confirm(`发现${duplicateItems.length}个重复ID，是否覆盖？`, '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            this.processImport(importedData);
                        }).catch(() => {
                            this.$message.info('已取消导入');
                        });
                    } else {
                        this.processImport(importedData);
                    }
                } catch (error) {
                    this.$message.error(`文件解析失败：${error.message}`);
                }
            };
            reader.onerror = () => {
                this.$message.error('文件读取失败，请重试');
            };
            reader.readAsText(file.raw);
        }
    },
}
</script>