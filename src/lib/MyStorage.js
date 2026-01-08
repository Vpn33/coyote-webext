export default {
    name: 'MyStorage',
    getUUID() {
        return 'xxxxxxxxxxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16).replaceAll('-', '');
        });
    },
    getWaveById(id) { // 根据ID获取本地列表中的波形
        if (!id) {
            return null;
        }
        let waves = this.waveList();
        return waves.find((w) => w.id === id);
    },
    checkWaveName(name) { // 检查波形名称是否存在
        let waves = this.waveList();
        return waves.some((w) => w.name === name);
    },
    waveList() { // 获取本地列表中的波形
        let waves = localStorage.getItem('Waves');
        if (waves) {
            waves = JSON.parse(waves);
        } else {
            waves = [];
        }
        return waves;
    },
    saveWaveList(waveList) {
        if (!waveList) {
            return;
        }
        localStorage.setItem('Waves', JSON.stringify(waveList));
    },
    saveToWaves(wave) { // 保存波形到本地列表中
        if (!wave) {
            return;
        }
        let waves = localStorage.getItem('Waves');
        if (waves) {
            waves = JSON.parse(waves);
        } else {
            waves = [];
        }
        waves.push(wave);
        localStorage.setItem('Waves', JSON.stringify(waves));
    },
    deleteWave(waveId) { // 删除本地列表中的波形
        if (!waveId) {
            return;
        }
        let waves = localStorage.getItem('Waves');
        if (waves) {
            waves = JSON.parse(waves);
        } else {
            waves = [];
        }
        waves = waves.filter((w) => w.id !== waveId);
        localStorage.setItem('Waves', JSON.stringify(waves));
    },
    clearWaveList() { // 清空波形列表
        localStorage.removeItem('Waves');
    },
    getCheckedWaveIds() { // 获取选中的波形ID
        let checkedWaveIds = localStorage.getItem('CheckedWaveIds');
        if (checkedWaveIds) {
            checkedWaveIds = JSON.parse(checkedWaveIds);
        } else {
            checkedWaveIds = {};
            checkedWaveIds.a = [];
            checkedWaveIds.b = [];
        }
        return checkedWaveIds;
    },
    findWaves(func) {
        if (!func) {
            return;
        }
        let waves = this.waveList();
        return waves.filter(func);
    },
    saveCheckedWaveIds(checkedWaveIds) { // 保存选中的波形ID
        if (!checkedWaveIds) {
            return;
        }
        localStorage.setItem('CheckedWaveIds', JSON.stringify(checkedWaveIds));
    },
    getChannelPlayType() { // 获取通道播放类型
        let channelPlayType = localStorage.getItem('ChannelPlayType');
        if (channelPlayType) {
            channelPlayType = JSON.parse(channelPlayType);
        } else {
            channelPlayType = { a: 0, b: 0 };
        }
        return channelPlayType;
    },
    saveChannelPlayType(channelPlayType) { // 保存通道播放类型
        if (!channelPlayType) {
            return;
        }
        localStorage.setItem('ChannelPlayType', JSON.stringify(channelPlayType));
    },
    getChannelPlayTime() { // 获取通道播放时间
        let channelPlayTime = localStorage.getItem('ChannelPlayTime');
        if (channelPlayTime) {
            channelPlayTime = JSON.parse(channelPlayTime);
        } else {
            channelPlayTime = { a: 60, b: 60 };
        }
        return channelPlayTime;
    },
    saveChannelPlayTime(channelPlayTime) { // 保存通道播放时间
        if (!channelPlayTime) {
            return;
        }
        localStorage.setItem('ChannelPlayTime', JSON.stringify(channelPlayTime));
    },
}