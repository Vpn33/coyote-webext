<template>
    <div v-if="channelWaveListDialogVisible">
        <el-dialog title="请选择波形" :visible.sync="channelWaveListDialogVisible" width="80%" center append-to-body
            :close-on-click-modal="false" :before-close="channelWaveListDialogClose">
            <ctrl-item-list ref="ctrlItemList" :defaultCheckedIds="defaultCheckedIds" :show-checked="showChecked"
                :max-height="maxHeight" :readonly="readonly"></ctrl-item-list>
            <span slot="footer" class="dialog-footer">
                <el-button @click="channelWaveListDialogClose">取 消</el-button>
                <el-button type="primary" @click="getCheckedWaveList">确 认</el-button>
            </span>
        </el-dialog>
    </div>

</template>
<script>
import CtrlItemList from './ctrl-item-list.vue';
export default {
    name: 'ChannelWaveList',
    components: {
        CtrlItemList,
    },
    props: {
        showChecked: {
            type: Boolean,
            default: true,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        maxHeight: {
            type: String,
            default: '400px',
        }
    },
    data() {
        return {
            channelWaveListDialogVisible: false,
            defaultCheckedIds: []
        }
    },
    methods: {
        openChannelWaveListDialog(defaultCheckedIds) {
            if (defaultCheckedIds) {
                this.defaultCheckedIds = defaultCheckedIds || [];
            }

            this.channelWaveListDialogVisible = true;
        },
        channelWaveListDialogClose() {
            this.channelWaveListDialogVisible = false;
            this.defaultCheckedIds = [];
        },
        getCheckedWaveList() {
            let waveList = this.$refs.ctrlItemList.getCheckedWaveList();
            if (waveList.length === 0) {
                this.$message({
                    message: '请选择要操作的波形',
                    type: 'warning'
                });
                return;
            }
            this.$emit('getCheckedWaveList', waveList);
            this.channelWaveListDialogClose();
        },
    },
    mounted() {

    }
}
</script>
