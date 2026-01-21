<template>
    <div>
        <h2 class="h5 mb-2">波形列表</h2>
        <div v-if="ctrlItemList.length === 0">
            <el-alert type="info" title="正在加载波形数据..." show-icon></el-alert>
        </div>
        <div v-else>
            <p class="mb-3">共加载 {{ ctrlItemList.length }} 个波形</p>
            <el-button type="primary" size="small" @click="reimportDefWave">重置默认波形</el-button>
            <el-input v-model="searchText" placeholder="搜索波形" clearable @input="handleSearch"></el-input>
            <el-table ref="ctrlItemTable" :data="ctrlItemList" stripe border style="width: 100%" size="small"
                @selection-change="handleSelectionChange" :max-height="maxHeight" :highlight-current-row="!showChecked"
                @current-change="handleCurrentChange">
                <el-table-column v-if="showChecked" type="selection" width="55">
                </el-table-column>
                <el-table-column prop="name" label="名称" min-width="150" align="left">
                </el-table-column>
                <el-table-column label="持续总时间" min-width="120" align="center">
                    <template slot-scope="scope">
                        <span>{{ scope.row.getTotalTimeStr() }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="rate" label="播放速率" min-width="100" align="center">
                    <template slot-scope="scope">
                        <el-tag type="info" size="small">{{ scope.row.rate }}x</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="小节数量" min-width="100" align="center">
                    <template slot-scope="scope">
                        <span>{{scope.row.stageList.filter(stage => stage.enabled).length}}个</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" min-width="150" align="center" fixed="right" v-if="!readonly">
                    <template slot-scope="scope">
                        <el-button type="primary" size="small" @click="editWave(scope.row)">
                            编辑
                        </el-button>
                        <el-button type="danger" size="small" @click="delWave(scope.row, scope.$index)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <wave-saver ref="waveSaver" :item.sync="editWaveItem"></wave-saver>
    </div>
</template>
<script>
import ctrlItemListData from '../../lib/ctrlItemList.json'
import CtrlItem from '../../lib/CtrlItem.js'
import WaveStage from '../../lib/WaveStage.js'
import WaveMeta from '../../lib/WaveMeta.js'
import WaveSaver from './wave-saver';
import MyStorage from '@/lib/MyStorage';
import { readonly } from 'vue';

export default {
    components: {
        WaveSaver,
    },
    props: {
        defaultCheckedIds: {
            type: Array,
            default: () => [],
        },
        showChecked: {
            type: Boolean,
            default: false,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        maxHeight: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            ctrlItemList: [],
            checkedItemList: [],
            editWaveItem: null,
            searchText: null,
        }
    },
    created() {
        console.log('CtrlItemList组件已创建，开始加载数据')
        this.loadCtrlItemData()
    },
    mounted() {
        console.log('CtrlItemList组件已挂载')
    },
    // 如果组件被keep-alive包裹，activated钩子会在组件被激活时执行
    activated() {
        console.log('CtrlItemList组件被激活')
        this.loadCtrlItemData()
    },
    // 监听路由变化，确保组件重新加载数据
    watch: {
        $route() {
            this.loadCtrlItemData()
        }
    },
    methods: {
        handleSearch() {
            let st = this.searchText.trim();
            if (!st) {
                this.loadCtrlItemData();
            } else {
                this.ctrlItemList = this.ctrlItemList.filter(item => item.name.includes(st));
            }
        },
        handleCurrentChange(currentRow) {
            if (!this.showChecked && currentRow) {
                this.$refs.ctrlItemTable.setCurrentRow(currentRow);
                this.checkedItemList = [_.cloneDeep(currentRow)];
            }
        },
        reimportDefWave() {
            this.$confirm('此操作将重置所有波形数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let tempDefData = ctrlItemListData;
                let waveList = MyStorage.waveList() || [];

                // 创建默认数据的ID映射表，方便快速查找
                let defDataMap = {};
                tempDefData.forEach(item => {
                    defDataMap[item.id] = item;
                });

                // 合并数据：如果当前waveList中的波形在默认数据中存在相同ID，则用默认数据替换
                let mergedList = waveList.map(item => {
                    if (defDataMap[item.id]) {
                        return defDataMap[item.id];
                    }
                    return item;
                });

                // 将合并后的数据保存到本地存储
                MyStorage.saveWaveList(mergedList);

                // 重新加载数据
                this.loadCtrlItemData();
            }).catch(() => {
            });
        },
        getCheckedWaveList() {
            return this.checkedItemList;
        },
        handleSelectionChange(selection) {
            this.checkedItemList = _.cloneDeep(selection);
        },
        editWave(waveItem) {
            // this.editWaveItem = _.cloneDeep(waveItem);
            this.$refs.waveSaver.openWaveEditor(_.cloneDeep(waveItem));
            // console.log('编辑波形:', waveItem)
            // // 使用Vuex存储波形数据
            // this.$store.dispatch('setEditWaveItem', waveItem)
            // // 跳转到wave-editor页面，不需要传递参数
            // this.$router.push({ name: 'waveEditor', query: { edit: 1 } })
        },
        delWave(waveItem, index) {
            if (!waveItem) {
                return;
            }
            this.$confirm('此操作将删除波形数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                MyStorage.deleteWave(waveItem.id);
                this.$delete(this.ctrlItemList, index);
            }).catch(() => {
            });

        },
        loadCtrlItemData() {
            console.log('开始加载波形数据')
            let waveList = MyStorage.waveList() || [];
            let isImp = false;
            // 如果本地存储没有数据，则从JSON文件加载
            if (waveList.length === 0) {
                waveList = ctrlItemListData;
                isImp = true;
            }

            // 将所有数据转换为CtrlItem实例
            try {
                this.ctrlItemList = waveList.map(itemData => {
                    const ctrlItem = new CtrlItem();

                    // 复制基本属性
                    Object.assign(ctrlItem, itemData);

                    // 将stageList转换为WaveStage实例
                    if (itemData.stageList && itemData.stageList.length > 0) {
                        ctrlItem.stageList = itemData.stageList.map(stageData => {
                            const stage = new WaveStage();

                            // 复制stage基本属性
                            Object.assign(stage, stageData);

                            // 将metas转换为WaveMeta实例
                            stage.metas = stageData.metas.map(metaData => {
                                return new WaveMeta(metaData.y, metaData.anchor)
                            });

                            return stage;
                        });
                    }

                    if (itemData.stageA && itemData.stageA.length > 0) {
                        ctrlItem.stageA = itemData.stageA.map(stageData => {
                            const stage = new WaveStage();

                            // 复制stage基本属性
                            Object.assign(stage, stageData);

                            // 将metas转换为WaveMeta实例
                            stage.metas = stageData.metas.map(metaData => {
                                return new WaveMeta(metaData.y, metaData.anchor)
                            });

                            return stage;
                        });
                    }
                    if (itemData.stageB && itemData.stageB.length > 0) {
                        ctrlItem.stageB = itemData.stageB.map(stageData => {
                            const stage = new WaveStage();

                            // 复制stage基本属性
                            Object.assign(stage, stageData);

                            // 将metas转换为WaveMeta实例
                            stage.metas = stageData.metas.map(metaData => {
                                return new WaveMeta(metaData.y, metaData.anchor)
                            });

                            return stage;
                        });
                    }

                    return ctrlItem;
                });

                // 如果是从JSON文件加载的数据，则保存到本地存储
                if (isImp) {
                    MyStorage.saveWaveList(this.ctrlItemList);
                }

                console.log('转换后的CtrlItem实例:', this.ctrlItemList)
            } catch (error) {
                console.error('转换数据时出错:', error)
                this.ctrlItemList = []
            }
            this.initCheckedItemById();
        },
        initCheckedItemById() {
            this.$nextTick(() => {
                this.ctrlItemList.forEach(row => {
                    if (this.defaultCheckedIds.indexOf(row.id) >= 0) {
                        if (this.showChecked) {
                            this.$refs.ctrlItemTable.toggleRowSelection(row, true);
                        } else {
                            this.handleCurrentChange(row);
                        }
                    }
                })
            })
        }
    }
}
</script>
<style >
.el-table--striped .el-table__body tr.el-table__row--striped.current-row td.el-table__cell, .el-table--striped .el-table__body tr.el-table__row--striped.selection-row td.el-table__cell {
    background-color: #cbe2fd;
}
.el-table__body tr.current-row>td.el-table__cell, .el-table__body tr.selection-row>td.el-table__cell {
    background-color: #cbe2fd;
}
.el-table--enable-row-hover .el-table__body tr:hover>td.el-table__cell {
    background-color: #cbe2fd;
}
</style>