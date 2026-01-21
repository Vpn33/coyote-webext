<template>
    <div v-if="editorDialogVisible">
        <el-dialog title="波形编辑器" :visible.sync="editorDialogVisible" width="50%" fullscreen :close-on-click-modal="false"
            :before-close="editorDialogClose">
            <WaveEditor ref="waveEditor" :item="editWaveItem"></WaveEditor>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editorDialogClose">取 消</el-button>
                <el-button type="primary" @click="doSave">保 存</el-button>
                <el-button type="normal" @click="openSaveAsDialog">另存为</el-button>
            </span>
        </el-dialog>
        <el-dialog title="另存为" :visible.sync="saveAsDialog" :close-on-click-modal="false" center
            :before-close="saveAsDialogClose">
            <el-input v-model="waveAsName" placeholder="请输入波形名称"></el-input>
            <div slot="footer" class="wave-editor-btns">
                <el-button @click="saveAsDialogClose">取 消</el-button>
                <el-button type="primary" @click="doSaveAs">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import MyStorage from '../../lib/MyStorage';
import WaveEditor from './wave-editor';
export default {
    name: 'wave-saver',
    components: {
        WaveEditor,
    },
    props: {
        item: {
            type: Object,
            default: () => ({
                rate: 1,
                stageList: [{
                    enabled: true,
                    stageTime: 1,
                    hzType: 1,
                    hzMin: 10,
                    hzMax: 10,
                    metas: [
                        { "anchor": 1, "x": 0, "y": 20 },
                        { "anchor": 1, "x": 1, "y": 20 }
                    ]
                }]
            })
        }
    },
    data() {
        return {
            editorDialogVisible: false,
            editWaveItem: null,
            saveAsDialog: false,
            waveAsName: null,
        }
    },
    methods: {
        openWaveEditor(waveItem) {
            if (waveItem) {
                this.editWaveItem = waveItem;
            }
            this.editorDialogVisible = true;
        },
        editorDialogClose() {
            this.editorDialogVisible = false;
        },
        getWaveById(id) {
            let waveItem = MyStorage.getWaveById(id);
            return waveItem;
        },
        doSave() {
            this.editWaveItem = this.$refs.waveEditor.getItem();
            const checkResult = this.checkWaveInfo();
            if (!checkResult) {
                return;
            }
            if (this.editWaveItem.id) {
                this.$confirm('此操作将覆盖波形数据, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.saveWave();
                    this.editorDialogClose();
                }).catch(() => {
                });
            } else {
                if (MyStorage.checkWaveName(this.editWaveItem.name)) {
                    this.$message({
                        type: 'error',
                        message: '波形名称已存在'
                    });
                    return;
                }
                this.saveWave();
                this.editorDialogClose();
            }
        },
        checkWaveInfo() {
            if (!this.editWaveItem.name || '' === this.editWaveItem.name.trim()) {
                this.$message({
                    type: 'error',
                    message: '波形名称不能为空'
                });
                return false;
            }
            if (!this.editWaveItem.stageList || this.editWaveItem.stageList.length == 0) {
                this.$message({
                    type: 'error',
                    message: '最少需要1个小节的数据'
                });
                return false;
            }
            return true;
        },
        saveWave(waveName) {
            let data = _.cloneDeep(this.editWaveItem);
            if (!data.id) {
                data.id = MyStorage.getUUID();
            } else {
                // 线删除后插
                MyStorage.deleteWave(data.id);
            }
            if (waveName) {
                data.name = waveName;
            }
            // 因为hz是数组的 组件回传的hz可能是一个数字 必须要转换一下 否则接口会报错
            data.stageList.forEach((s) => {
                s.hz = [s.hzMin, s.hzMax];
            });
            MyStorage.saveToWaves(data);
        },
        openSaveAsDialog() {
            this.saveAsDialog = true;
            this.waveAsName = this.editWaveItem.name ? this.editWaveItem.name + '-' : null;
        },
        saveAsDialogClose() {
            this.saveAsDialog = false;
            this.waveAsName = null;
        },
        doSaveAs() {
            this.editWaveItem = this.$refs.waveEditor.getItem();
            const checkResult = this.checkWaveInfo();
            if (!checkResult) {
                return;
            }
            if (this.waveAsName == null || this.waveAsName == '') {
                this.$message.error('波形名称不能为空');
                return;
            }
            if (MyStorage.checkWaveName(this.waveAsName.name)) {
                this.$message({
                    type: 'error',
                    message: '波形名称已存在'
                });
                return;
            }
            this.saveWave(this.waveAsName);
            this.saveAsDialogClose();
        },
        initItem() {
            if (this.item) {
                this.editWaveItem = _.cloneDeep(this.item)
            }
        }
    },

    mounted() {
        this.initItem();
    }
}
</script>