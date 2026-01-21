<template>
    <div class="select-one-wave">
        {{ selectWave.name || '未选择波形' }}
        <el-button type="text" @click="openChannelWaveListDialog">选择波形</el-button>
        <ChannelWaveList ref="channelWaveList" :readonly="true" :show-checked="showChecked" :max-height="maxHeight" @getCheckedWaveList="getSelectedWave"></ChannelWaveList>
    </div>
</template>
<script>
import ChannelWaveList from './channel-wave-list.vue';
export default {
    name: 'SelectOneWave',
    components: {
        ChannelWaveList,
    },
    props: {
        value: {
            type: Object,
            default: null,
        },
    },
    watch: {
        value: {
            handler(newVal, oldVal) {
                this.selectWave = newVal || {};
            },
            deep: true,
        },
    },
    data() {
        return {
            selectWave: {},
            showChecked: false,
            maxHeight: '400px',
        }
    },
    methods: {
        openChannelWaveListDialog() {
            let selectId = [];
            if (this.selectWave?.id) {
                selectId.push(this.selectWave?.id);
            }
            this.$refs.channelWaveList.openChannelWaveListDialog(selectId);
        },
        getSelectedWave(waveList) {
            this.$emit('change', waveList[0]);
        },
    },
    mounted() {
        this.selectWave = this.value || {};
    }
}
</script>