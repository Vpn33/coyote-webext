<template>
    <div class="wave-player">
        <h1 class="h3 mb-3">Coyote V3 蓝牙控制器 - {{ version }}</h1>

        <el-row :gutter="20" class="mb-3">
            <el-col :span="24">
                <el-button id="searchBtn" type="primary" size="small" style="width: 100%" @click="searchDevices"
                    v-show="!bleConnected">搜索设备</el-button>
                <el-button id="disconnectBtn" type="info" size="small" style="width: 100%" v-show="bleConnected"
                    @click="disconnectDevice">断开连接</el-button>
            </el-col>
        </el-row>
        <el-row :gutter="20" class="mb-3">
            <el-col :span="24">
                <el-alert id="batteryStatus" type="info" :title="`电量: ${batteryLevel}`" center :closable="false" />
            </el-col>
        </el-row>

        <!-- 电源上限 -->
        <div class="card mb-3">
            <div class="card-header">
                <span>电源上限</span>
            </div>
            <el-row :gutter="20">
                <el-col :span="12">
                    <div class="form-item">
                        <label class="form-item-label">A:</label>
                        <el-slider id="aPowerLimitSlider" v-model="aPowerLimit" :min="0" :max="200"
                            :disabled="!bleReady" @input="onAPowerLimitChange" show-input :input-size="'mini'"
                            :show-input-controls="false" class="slider" />
                    </div>
                </el-col>
                <el-col :span="12">
                    <div class="form-item">
                        <label class="form-item-label">B:</label>
                        <el-slider id="bPowerLimitSlider" v-model="bPowerLimit" :min="0" :max="200"
                            :disabled="!bleReady" @input="onBPowerLimitChange" show-input :input-size="'mini'"
                            :show-input-controls="false" class="slider" />
                    </div>
                </el-col>
            </el-row>
        </div>



        <div class="controls-row">
            <h2 class="h5 mb-2">设备控制</h2>
            <div class="card mb-3">
                <div class="card-header">
                    <span>电源强度</span>
                    <el-switch v-model="powerSame" inactive-text="单独" active-text="同步">
                    </el-switch>
                </div>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <div class="d-flex align-items-center">
                            <label class="small mr-2">A:</label>
                            <div class="power-inline d-flex justify-content-center">
                                <el-button id="aDecreaseBtn" size="mini" type="info" :disabled="!bleReady"
                                    @click="adjustStrength('A', -1)">-</el-button>
                                <span id="strengthA" class="font-weight-bold mx-2">{{ strengthA }}</span>
                                <el-button id="aIncreaseBtn" size="mini" type="info" :disabled="!bleReady"
                                    @click="adjustStrength('A', 1)">+</el-button>
                                <el-button id="aZeroBtn" size="mini" type="warning" :disabled="!bleReady"
                                    @click="strengthZero('A')">归零</el-button>
                            </div>
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <div class="d-flex align-items-center">
                            <label class="small mr-2">B:</label>
                            <div class="power-inline d-flex justify-content-center">
                                <el-button id="bDecreaseBtn" size="mini" type="info" :disabled="!bleReady"
                                    @click="adjustStrength('B', -1)">-</el-button>
                                <span id="strengthB" class="font-weight-bold mx-2">{{ strengthB }}</span>
                                <el-button id="bIncreaseBtn" size="mini" type="info" :disabled="!bleReady"
                                    @click="adjustStrength('B', 1)">+</el-button>
                                <el-button id="bZeroBtn" size="mini" type="warning" :disabled="!bleReady"
                                    @click="strengthZero('B')">归零</el-button>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>

            <!-- 频率平衡 -->
            <div class="card mb-3">
                <div class="card-header">
                    <span>频率平衡</span>
                </div>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <div class="form-item">
                            <label class="form-item-label">A:</label>
                            <el-slider id="aFreqBalanceSlider" v-model="aFreqBalance" :min="0" :max="255"
                                :disabled="!bleReady" @input="onAFreqBalanceChange" show-input :input-size="'mini'"
                                :show-input-controls="false" class="slider" />
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <div class="form-item">
                            <label class="form-item-label">B:</label>
                            <el-slider id="bFreqBalanceSlider" v-model="bFreqBalance" :min="0" :max="255"
                                :disabled="!bleReady" @input="onBFreqBalanceChange" show-input :input-size="'mini'"
                                :show-input-controls="false" class="slider" />
                        </div>
                    </el-col>
                </el-row>
            </div>

            <!-- 强度平衡 -->
            <div class="card mb-3">
                <div class="card-header">
                    <span>强度平衡</span>
                </div>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <div class="form-item">
                            <label class="form-item-label">A:</label>
                            <el-slider id="aIntensityBalanceSlider" v-model="aIntensityBalance" :min="0" :max="255"
                                :disabled="!bleReady" @input="onAIntensityBalanceChange" show-input :input-size="'mini'"
                                :show-input-controls="false" class="slider" />
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <div class="form-item">
                            <label class="form-item-label">B:</label>
                            <el-slider id="bIntensityBalanceSlider" v-model="bIntensityBalance" :min="0" :max="255"
                                :disabled="!bleReady" @input="onBIntensityBalanceChange" show-input :input-size="'mini'"
                                :show-input-controls="false" class="slider" />
                        </div>
                    </el-col>
                </el-row>
            </div>



            <!-- 波形强度 -->
            <div class="card mb-3">
                <div class="card-header">
                    <span>播放组件</span>
                </div>

                <div class="charter-content">
                    <el-switch class="charter-switch" v-model="showCharter" active-text="显示图像" inactive-text="关闭图像"
                        active-color="#F9E49C" @change="toggleCharter"></el-switch>
                    <div v-if="showCharter" class="charter-items">
                        <div class="charter-item">
                            <div id="channel-a-chart" class="charter-canvas">
                            </div>
                        </div>
                        <div class="charter-item">
                            <div id="channel-b-chart" class="charter-canvas">
                            </div>
                        </div>
                    </div>
                </div>
                <el-tabs v-model="activeName" type="border-card">
                    <el-tab-pane label="普通波形" name="normal">
                        <!-- 波形频率 -->
                        <div class="card mb-3">
                            <div class="card-header">
                                <span>波形频率</span>
                            </div>
                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <div class="form-item">
                                        <label class="form-item-label">A:</label>
                                        <el-slider id="aWaveFreq1" v-model="aWaveFreq1" :min="10" :max="1000"
                                            :disabled="!bleReady" @input="onAWaveFreq1Change" show-input
                                            :input-size="'mini'" :show-input-controls="false" class="slider" />
                                    </div>
                                </el-col>
                                <el-col :span="12">
                                    <div class="form-item">
                                        <label class="form-item-label">B:</label>
                                        <el-slider id="bWaveFreq1" v-model="bWaveFreq1" :min="10" :max="1000"
                                            :disabled="!bleReady" @input="onBWaveFreq1Change" show-input
                                            :input-size="'mini'" :show-input-controls="false" class="slider" />
                                    </div>
                                </el-col>
                            </el-row>
                        </div>
                        <div class="card mb-3">
                            <div class="card-header">
                                <span>波形强度</span>
                            </div>
                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <div class="form-item">
                                        <label class="form-item-label">A:</label>
                                        <el-slider id="aWaveIntensity1" v-model="aWaveIntensity1" :min="0" :max="100"
                                            :disabled="!bleReady" @input="onAWaveIntensity1Change" show-input
                                            :input-size="'mini'" :show-input-controls="false" class="slider" />
                                    </div>
                                </el-col>
                                <el-col :span="12">
                                    <div class="form-item">
                                        <label class="form-item-label">B:</label>
                                        <el-slider id="bWaveIntensity1" v-model="bWaveIntensity1" :min="0" :max="100"
                                            :disabled="!bleReady" @input="onBWaveIntensity1Change" show-input
                                            :input-size="'mini'" :show-input-controls="false" class="slider" />
                                    </div>
                                </el-col>
                            </el-row>
                        </div>
                        <el-row :gutter="20">
                            <el-col :span="24">
                                <el-button id="nomalPlayBtn" type="primary" :plain="!isNomalPlaySending" size="small"
                                    style="width: 100%" :disabled="!bleReady" @click="toggleNomalPlay">
                                    {{ isNomalPlaySending ? '停止播放' : '开始播放' }}
                                </el-button>
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                    <el-tab-pane label="播放列表" name="playlist">
                        <el-row>
                            <el-col :span="12">
                                <div class="playlist-title">
                                    <span>A通道</span>
                                    <el-button type="primary" size="small" @click="openSelectWavesList('A')">
                                        选择
                                    </el-button>
                                    <div class="channelPlayType">
                                        <el-select v-model="channelPlayType.a" placeholder="请选择"
                                            @change="onPlayTypeChange">
                                            <el-option v-for="item in playTypeOptions" :key="item.value"
                                                :label="item.label" :value="item.value">
                                            </el-option>
                                        </el-select>
                                    </div>
                                    <div class="channelPlayTime">
                                        <el-slider v-model="channelPlayTime.a" :min="5" :max="300" show-input
                                            :show-input-controls="false" @change="onChannelPlayTimeChange">
                                        </el-slider>
                                    </div>
                                </div>
                                <div class="playlist-table">
                                    <el-table id="aChannelList" :data="aChannelList" style="width: 100%"
                                        :show-header="false" :max-height="channelListMaxHieght"
                                        :row-class-name="selectActiveWave('A')"
                                        @row-dblclick="(row) => playChannelWave('A', row)">
                                        <el-table-column prop="name" label="名称">
                                        </el-table-column>
                                        <el-table-column fixed="right" label="操作" width="50">
                                            <template slot-scope="scope">
                                                <el-link icon="el-icon-delete"
                                                    @click="deleteChannelWave('A', scope.row)"></el-link>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                    <el-button type="primary" :plain="!aChannelPlaying" size="small" style="width: 100%"
                                        @click="toggleChannelPlay('A')">
                                        {{ aChannelPlaying ? '停止播放' : '开始播放' }}
                                    </el-button>
                                </div>
                            </el-col>
                            <el-col :span="12">
                                <div class="playlist-title">
                                    <span>B通道</span>
                                    <el-button type="primary" size="small" @click="openSelectWavesList('B')">
                                        选择
                                    </el-button>
                                    <div class="channelPlayType">
                                        <el-select v-model="channelPlayType.b" placeholder="请选择"
                                            @change="onPlayTypeChange">
                                            <el-option v-for="item in playTypeOptions" :key="item.value"
                                                :label="item.label" :value="item.value">
                                            </el-option>
                                        </el-select>
                                    </div>
                                    <div class="channelPlayTime">
                                        <el-slider v-model="channelPlayTime.b" :min="5" :max="300" show-input
                                            :show-input-controls="false" @change="onChannelPlayTimeChange">
                                        </el-slider>
                                    </div>
                                </div>
                                <div class="playlist-table">
                                    <el-table id="bChannelList" :data="bChannelList" style="width: 100%"
                                        :show-header="false" :max-height="channelListMaxHieght"
                                        :row-class-name="selectActiveWave('B')"
                                        @row-dblclick="(row) => playChannelWave('B', row)">

                                        <el-table-column prop="name" label="名称">
                                        </el-table-column>
                                        <el-table-column fixed="right" label="操作" width="50">
                                            <template slot-scope="scope">
                                                <el-link icon="el-icon-delete"
                                                    @click="deleteChannelWave('B', scope.row)"></el-link>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                    <el-button type="primary" :plain="!bChannelPlaying" size="small" style="width: 100%"
                                        @click="toggleChannelPlay('B')">
                                        {{ bChannelPlaying ? '停止播放' : '开始播放' }}
                                    </el-button>
                                </div>
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                    <el-tab-pane label="漫画脚本" name="playManga">
                        <div v-if="playManga">
                            <el-button type="primary" size="small" @click="closePlayMangaPage">
                                关闭脚本
                            </el-button>
                            <div class="play-manga-info">
                                <span>漫画ID：{{ playManga.bookId }}</span>
                                <span>漫画名称：{{ playManga.bookName }}</span>
                                <el-table :data="playManga.scriptList" border :row-class-name="playMangaTableRowActive"
                                    @row-dblclick="playMangaPage">
                                    <el-table-column prop="pageNo" label="页码" min-width="10%">
                                    </el-table-column>
                                    <el-table-column prop="scriptContent" label="脚本内容"
                                        class-name="script-content-column">
                                    </el-table-column>
                                </el-table>
                            </div>

                        </div>
                        <div v-else>
                            当前暂无脚本
                            <el-button type="primary" size="small" @click="loadTestScript">
                                加载默认
                            </el-button>
                        </div>
                    </el-tab-pane>
                </el-tabs>

                <el-row :gutter="20" class="wave-btns">
                    <el-col :span="24">
                        <el-button type="primary" size="small" @click="openWaveSaver">
                            波形编辑器
                        </el-button>
                        <el-button type="primary" size="small" @click="openCtrlItemList">
                            波形列表
                        </el-button>
                        <el-button type="success" size="small" @click="openMangaScriptEditor">
                            漫画脚本编辑器
                        </el-button>
                        <el-button type="success" size="small" @click="openMangaScriptList">
                            漫画脚本列表
                        </el-button>
                    </el-col>
                </el-row>
            </div>

            <h2 class="h5 mb-2">日志</h2>
            <el-switch v-model="debugLog" active-text="调试开启" inactive-text="调试关闭"></el-switch>
            <el-button type="primary" size="small" @click="clearLogArea">
                清空日志
            </el-button>
            <div class="card log-card">
                <div id="logArea" class="log-area"></div>
            </div>
        </div>
        <WaveSaver ref="waveSaver" :item="editWaveItem"></WaveSaver>
        <ChannelWaveList ref="channelWaveList" :readonly="true" @getCheckedWaveList="getCheckedWaveList">
        </ChannelWaveList>
    </div>
</template>

<script>
import Sortable from 'sortablejs';
import WaveSaver from './wave-saver';
import ChannelWaveList from './channel-wave-list.vue';
import MyStorage from '@/lib/MyStorage';
import CtrlItem from '../../lib/CtrlItem.js'
import WaveStage from '../../lib/WaveStage.js'
import WaveMeta from '../../lib/WaveMeta.js'
import * as echarts from 'echarts';

export default {
    name: 'wave-player',
    components: {
        WaveSaver,
        ChannelWaveList,
    },
    data() {
        return {
            tabId: null,
            activeName: 'playlist',
            version: '1.0.0',
            // 蓝牙设备常量
            BATTERY_SERVICE_UUID: '0000180a-0000-1000-8000-00805f9b34fb',
            SERVICE_UUID: '0000180c-0000-1000-8000-00805f9b34fb',
            WRITE_CHAR_UUID: '0000150a-0000-1000-8000-00805f9b34fb',
            NOTIFY_CHAR_UUID: '0000150b-0000-1000-8000-00805f9b34fb',
            BATTERY_CHAR_UUID: '00001500-0000-1000-8000-00805f9b34fb',
            debugLog: false,

            // 全局变量
            // 设备状态
            bluetoothDevice: null,
            bleConnected: false,
            writeCharacteristic: null,
            notifyCharacteristic: null,
            batteryCharacteristic: null,
            writeMethod: null,
            batteryLevel: '未知',
            strengthA: 0,
            strengthB: 0,
            powerSame: true,  // 是否AB通道电源强度相等
            previousChannelAPower: 0, // 上一次的A通道电源强度
            previousChannelBPower: 0, // 上一次的B通道电源强度

            // 波形测试滑块值
            aWaveFreq1: 500,
            aWaveIntensity1: 100,
            bWaveFreq1: 500,
            bWaveIntensity1: 100,

            // 新增的控制项值
            aFreqBalance: 127,
            bFreqBalance: 127,
            aIntensityBalance: 127,
            bIntensityBalance: 127,
            aPowerLimit: 40,
            bPowerLimit: 40,

            // 命令队列相关
            gattCommandQueue: [], // GATT操作命令队列
            isExecutingGattCommand: false, // 是否正在执行GATT命令

            // 波形测试滑块值
            aWaveFreq1: 500,
            aWaveIntensity1: 100,
            bWaveFreq1: 500,
            bWaveIntensity1: 100,

            // 频率平衡
            aFreqBalance: 255,
            bFreqBalance: 255,
            // 强度平衡
            aIntensityBalance: 255,
            bIntensityBalance: 255,
            // 电源上限
            aPowerLimit: 40,
            bPowerLimit: 40,

            // 电池轮询相关
            batteryPollInterval: null,
            BATTERY_POLL_INTERVAL_SECS: 60, // 电池轮询间隔，单位秒

            // 普通波形生成和发送相关变量
            isNomalPlaySending: false,
            nomalPlayTimer: null,
            nomalPlayCache: [],
            generateDataBatchTimer: null,
            generateNomalPlayInterval: 5000, // 这个参数只给 每隔X毫秒生成一批默认数据 这个值不能小于channelPlayTime * 1000 当前最小值是5秒
            generatePlayBatchIng: false, // 是否正在生成播放批次
            generateNomalPlayShakeDelay: 2000, // 每隔X毫秒生成一批X毫秒的数据 这个值最后的波形数据时间 要至少大于generateNomalPlayInterval 1秒，避免不连续的问题
            tmpSendData: null, // 上次发送波形的数据

            // V3指令相关状态管理
            accumulatedStrengthValueA: 0,
            accumulatedStrengthValueB: 0,
            deviceStrengthValueA: 0,
            deviceStrengthValueB: 0,
            isInputAllowed: true,


            editWaveItem: null,
            activeChannelType: null,
            channelListMaxHieght: '400px',

            aChannelList: [],
            bChannelList: [],
            aChannelPlayIdx: 0, // 当前播放A通道的索引
            bChannelPlayIdx: 0, // 当前播放B通道的索引
            aChannelPlaying: false,
            aChannelV3ModelList: [],
            aChannelV3ModelIdx: 0, // 当前播放A通道的V3模型索引
            bChannelPlaying: false,
            bChannelV3ModelList: [],
            bChannelV3ModelIdx: 0, // 当前播放B通道的V3模型索引
            channelPlayInDoubleChannel: false, // 是否在双通道模式下播放
            playTypeOptions: [
                {
                    value: 0,
                    label: '列表循环',
                },
                {
                    value: 1,
                    label: '单曲循环',
                },
                {
                    value: 2,
                    label: '随机',
                },
            ],
            channelPlayType: {
                a: 0,
                b: 0,
            },
            channelPlayTime: {
                a: 60, // 最小为5 秒
                b: 60, // 最小为5 秒
            },
            channelAPlayTime: 0, // A通道播放时间
            channelAPlayWaitingNext: false, // A通道是否等待下一个播放
            channelBPlayTime: 0, // B通道播放时间
            channelBPlayWaitingNext: false, // B通道是否等待下一个播放
            testConnectBLE: true, // 测试连接BLE

            showCharter: false, // 是否显示图像
            chartViewInv: {
                1: null, // A通道图像显示范围计时器
                2: null, // B通道图像显示范围计时器
            },
            chartViewMin: {
                1: 0, // A通道图像显示范围x最小值
                2: 0, // B通道图像显示范围x最小值
            },
            charter1: null, // A通道echart对象
            charter2: null, // B通道echart对象
            charterTmp: { // 图像临时数据
                1: null,
                2: null,
            },
            chartData1: { // A通道 图像数据
                pw: [], // 电源强度数据
                wa: []  // 波形数据
            },
            chartData2: { // B通道 图像数据
                pw: [], // 电源强度数据
                wa: []  // 波形数据
            },
            waCacheMaxCnt: 500, // 波形图像缓存最大项
            pwCacheMaxCnt: 100, // 电源图像缓存最大项
            waChartMaxCnt: 500, // 波形图像显示最大项
            pwChartMaxCnt: 100, // 电源图像显示最大项

            mangaTabId: null, // 当前播放的漫画脚本tabId
            playManga: null, // 当前播放的漫画脚本
            playMangaCurrentPageNo: '2', // 当前播放的漫画脚本页码
            flatPowerIntensity: {
                a: null, // A通道电源强度
                b: null, // B通道电源强度
            }, // 上次播放的漫画脚本电源强度
            flatPowerDiffMin: 5, // 平滑电源强度变化最小差值 5
            flatPowerIntensityInterval: 500, // 平滑电源强度变化时间间隔 500ms变化一次
            flatPowerIntensityInv: null,
            tempPlayerInfo: null, // 临时播放器信息
        };
    },
    computed: {
        bleReady() {
            return this.bleConnected === true || this.testConnectBLE === true;
        },
    },
    methods: {
        clearLogArea() {
            document.getElementById('logArea').innerHTML = '';
        },
        playChannelWave(channelType, channelRow) {
            if (channelType === 'A' || channelType === 'both') {
                this.aChannelPlayIdx = _.findIndex(this.aChannelList, item => item.id === channelRow.id);
                // 如果A通道正在播放中
                if (this.aChannelPlaying) {
                    // 重置A通道播放时间
                    this.channelAPlayTime = 0;
                }
                this.aChannelV3ModelList = [];
            }
            if (channelType === 'B' || channelType === 'both') {
                this.bChannelPlayIdx = _.findIndex(this.bChannelList, item => item.id === channelRow.id);
                // 如果B通道正在播放中
                if (this.bChannelPlaying) {
                    // 重置B通道播放时间
                    this.channelBPlayTime = 0;
                }
                this.bChannelV3ModelList = [];
            }
            this.clearNomalPlayCache();
            // 清空缓存并重新生成波形数据
            this.clearCacheRegenerate();
        },
        openSelectWavesList(channelType) {
            this.activeChannelType = channelType;
            this.$refs.channelWaveList.openChannelWaveListDialog(channelType === 'A' ? this.aChannelList.map(item => item.id) : this.bChannelList.map(item => item.id));
        },
        getCheckedWaveList(waveList) {
            if (this.activeChannelType === 'A') {
                this.aChannelList = waveList;
            } else {
                this.bChannelList = waveList;
            }
            this.saveCheckedWaveIds();
        },
        saveCheckedWaveIds() {
            MyStorage.saveCheckedWaveIds({
                a: this.aChannelList.map(item => item.id),
                b: this.bChannelList.map(item => item.id),
            });
        },
        deleteChannelWave(channelType, channelRow) {
            if (channelType === 'A') {
                if (this.aChannelPlaying) {
                    this.$message.error('A通道正在播放中，不能删除当前波形');
                    return;
                }
                this.aChannelList = this.aChannelList.filter(item => item.id !== channelRow.id);
            } else {
                if (this.bChannelPlaying) {
                    this.$message.error('B通道正在播放中，不能删除当前波形');
                    return;
                }
                this.bChannelList = this.bChannelList.filter(item => item.id !== channelRow.id);
            }
            this.saveCheckedWaveIds();
        },
        // 显示连接提示
        showConnectionAlert(message) {
            // 创建提示元素
            const alert = document.createElement('div');
            alert.className = 'alert alert-success alert-dismissible fade show text-center mb-3';
            alert.role = 'alert';
            alert.innerHTML = message;

            // 添加到页面
            const container = document.querySelector('.main-container');
            const controlsRow = document.querySelector('.controls-row');
            container.insertBefore(alert, controlsRow);

            // 3秒后自动移除
            setTimeout(() => {
                alert.remove();
            }, 3000);
        },

        // 日志记录
        log(message, ...args) {
            const logArea = document.getElementById('logArea');
            if (!logArea) return;
            // 修改时间戳格式，显示到毫秒级别
            const timestamp = new Date().toLocaleString('zh-CN', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                fractionalSecondDigits: 3
            });
            let logMessage = `[${timestamp}] ${message}`;

            if (args.length > 0) {
                logMessage += ': ' + JSON.stringify(args);
            }

            // 创建新的日志条目
            const logItem = document.createElement('div');
            logItem.textContent = logMessage;
            logItem.style.marginBottom = '2px';

            // 添加到日志区域
            logArea.appendChild(logItem);

            // 检查日志数量是否超过上限（200条）
            const maxLogEntries = 200;
            while (logArea.children.length > maxLogEntries) {
                // 删除最旧的日志条目（第一个子元素）
                logArea.removeChild(logArea.firstChild);
            }

            // 滚动到底部
            logArea.scrollTop = logArea.scrollHeight;

            // 控制台输出
            console.log(logMessage);
        },

        // 添加GATT命令到队列
        addGattCommand(command, commandName = 'Unknown') {
            return new Promise((resolve, reject) => {
                this.gattCommandQueue.push({ command, commandName, resolve, reject });
                // 继续处理队列中的下一个命令
                this.processGattQueue();
            }).catch(error => {
                if (this.debugLog) {
                    this.log(`GATT命令执行错误 [${commandName}]: ${error.message}`);
                }
                reject(error);
            }).finally(() => {
                if (this.aChannelPlaying || this.bChannelPlaying) {
                    // 继续处理队列中的下一个命令
                    this.processGattQueue();
                }
            });
        },

        // 处理GATT命令队列
        processGattQueue() {
            // 如果正在执行命令或队列为空，则返回
            if (this.isExecutingGattCommand || this.gattCommandQueue.length === 0) {
                return;
            }

            // 标记正在执行命令
            this.isExecutingGattCommand = true;

            // 获取队列中的第一个命令
            const { command, commandName, resolve, reject } = this.gattCommandQueue.shift();

            // 执行命令并处理结果
            try {
                Promise.resolve(command())
                    .then(result => resolve(result))
                    .catch(error => {
                        if (this.debugLog) {
                            this.log(`GATT命令执行错误 [${commandName}]: ${error.message}`);
                        }
                        reject(error);
                    })
                    .finally(() => {
                        // 标记命令执行完毕
                        this.isExecutingGattCommand = false;
                        // 继续处理队列中的下一个命令
                        this.processGattQueue();
                    });
            } catch (error) {
                // 捕获命令执行过程中的同步错误
                if (this.debugLog) {
                    this.log(`GATT命令执行同步错误 [${commandName}]: ${error.message}`);
                }
                reject(error);
                // 标记命令执行完毕
                this.isExecutingGattCommand = false;
                // 继续处理队列中的下一个命令
                this.processGattQueue();
            }
        },

        // 搜索并连接蓝牙设备
        searchDevices() {
            // 如果设备已经连接或正在连接，不进行搜索
            if (this.bleConnected) {
                return;
            }

            this.log('正在搜索蓝牙设备...');
            this.log('当前SERVICE_UUID: ' + this.SERVICE_UUID);

            // 检查浏览器是否支持Web Bluetooth API
            if (!navigator.bluetooth) {
                this.log('错误: 浏览器不支持Web Bluetooth API');
                return;
            }

            this.log('navigator.bluetooth对象:', navigator.bluetooth);

            // 先获取蓝牙适配器状态
            navigator.bluetooth.getAvailability()
                .then(available => {
                    this.log('蓝牙适配器可用:', available);

                    // 使用Web Bluetooth API请求设备，根据名称过滤并指定要访问的服务
                    return navigator.bluetooth.requestDevice({
                        filters: [
                            { name: "47L121000" }
                        ],
                        optionalServices: [this.SERVICE_UUID, this.BATTERY_SERVICE_UUID]
                    });
                })
                .then(device => {
                    this.bluetoothDevice = device;
                    this.log('设备已选择: ' + device.name);
                    this.log('设备ID: ' + device.id);

                    // 添加设备连接状态变化监听器
                    device.addEventListener('gattserverdisconnected', this.onDisconnected);

                    return this.connectBluetooth();
                })
                .catch(error => {
                    // 检查是否是用户取消选择
                    if (error.name === 'NotFoundError' && error.message.includes('User cancelled')) {
                        this.log('用户取消了蓝牙设备选择');
                    } else if (error.name === 'NotFoundError') {
                        this.log('未找到名称为"47L121000"的蓝牙设备');
                        this.log('请确保设备已开启并处于可搜索状态');
                    } else {
                        this.log('错误: ' + error.message);
                        this.log('错误类型: ' + error.name);
                        if (error.code) this.log('错误代码: ' + error.code);
                        console.error('蓝牙搜索错误详细信息:', error);
                    }
                });
        },

        // 连接蓝牙服务器
        connectBluetooth() {
            // 如果设备已经连接或正在连接，不进行连接
            if (this.bleConnected) {
                return Promise.resolve();
            }

            this.log('正在连接蓝牙服务器...');
            return this.bluetoothDevice.gatt.connect()
                .then(server => {
                    this.log('蓝牙服务器已连接');
                    // 更新UI状态
                    this.updateUIState(true);
                    // 同时获取两个服务：主服务和电池服务
                    return Promise.all([
                        server.getPrimaryService(this.SERVICE_UUID),
                        server.getPrimaryService(this.BATTERY_SERVICE_UUID)
                    ]);
                })
                .then(services => {
                    const [mainService, batteryService] = services;

                    // 分别获取特征：从主服务获取写入和通知特征，从电池服务获取电池特征
                    return Promise.all([
                        mainService.getCharacteristic(this.WRITE_CHAR_UUID),
                        mainService.getCharacteristic(this.NOTIFY_CHAR_UUID),
                        batteryService.getCharacteristic(this.BATTERY_CHAR_UUID)
                    ]).then(characteristics => {
                        [this.writeCharacteristic, this.notifyCharacteristic, this.batteryCharacteristic] = characteristics;
                        // 根据特征支持的写入方式选择合适的方法
                        if (this.writeCharacteristic.properties.writeWithoutResponse) {
                            this.writeMethod = this.writeCharacteristic.writeValueWithoutResponse;
                            this.log('使用writeValueWithoutResponse方法');
                        } else if (this.writeCharacteristic.properties.write) {
                            this.writeMethod = this.writeCharacteristic.writeValue;
                            this.log('使用writeValue方法');
                        } else {
                            this.log('错误: 特征不支持写入操作');
                        }


                        // 连接成功后，立即刷新一次电量
                        this.readBatteryLevel();
                        // 开启电量轮训查询
                        this.startBatteryPolling();
                        this.batteryCharacteristic.addEventListener('characteristicvaluechanged', this.handleBatteryCharacteristicChanged);
                        // 电量需要主动获取 如果开启通知会报错GATT Error Unknown
                        // // this.batteryCharacteristic.startNotifications();

                        // 订阅通知特征
                        this.notifyCharacteristic.addEventListener('characteristicvaluechanged', this.handleCharacteristicChanged);
                        this.notifyCharacteristic.startNotifications();

                        // 发送参数同步命令
                        return this.sendParameters({
                            channelALimit: this.aPowerLimit,
                            channelBLimit: this.bPowerLimit,
                            channelAFrequencyBalance: this.aFreqBalance,
                            channelBFrequencyBalance: this.bFreqBalance,
                            channelAIntensityBalance: this.aIntensityBalance,
                            channelBIntensityBalance: this.bIntensityBalance
                        });
                    });
                })

                .catch(error => {
                    this.log('蓝牙连接错误: ' + error.message);
                    this.log('错误详情:', error);
                    this.updateUIState(false);
                    // 断开设备连接
                    if (this.bluetoothDevice && this.bluetoothDevice.gatt.connected) {
                        this.bluetoothDevice.gatt.disconnect();
                    }
                    // 重置状态
                    this.disconnectDevice();
                    return Promise.reject(error);
                })
                .finally(() => {

                });
        },

        // arraybuffer转16进制字符串
        ab2hex(buffer) {
            return Array.from(new Uint8Array(buffer))
                .map(byte => byte.toString(16).padStart(2, '0'))
                .join('');
        },

        // 解析电池电量值并更新UI的核心方法
        parseBatteryValue(value, logPrefix = '电池电量读取') {
            const uint8Array = new Uint8Array(value.buffer);
            if (uint8Array.length === 1 && uint8Array[0] >= 0 && uint8Array[0] <= 100) {
                const batteryLevel = uint8Array[0];
                this.log(logPrefix + ': ' + batteryLevel + '%');
                this.batteryLevel = batteryLevel + '%';
            }
        },

        // 读取电池电量并更新UI的公共方法
        readBatteryLevel() {
            if (this.batteryCharacteristic && this.batteryCharacteristic.properties.read) {
                return this.addGattCommand(() => {
                    return this.batteryCharacteristic.readValue()
                        .then(value => {
                            this.parseBatteryValue(value, '电池电量读取');
                            return value;
                        });
                }, 'ReadBatteryLevel')
                    .catch(error => {
                        this.log('读取电池电量失败: ' + error.message);
                        throw error;
                    });
            } else {
                return Promise.reject(new Error('电池特征不可用或不支持读取操作'));
            }
        },

        // 处理电池特征值变化事件
        handleBatteryCharacteristicChanged(event) {
            const value = event.target.value;
            this.parseBatteryValue(value, '电池特征值变化');
        },

        // 处理通知特征值变化事件
        handleCharacteristicChanged(event) {
            const value = event.target.value;
            const uint8Array = new Uint8Array(value.buffer);
            // const data = this.ab2hex(uint8Array);
            // this.log('接收到强度特征值变化: ' + data);
            if (this.debugLog) {
                this.log('接收到强度特征值变化: ' + this.ab2hex(uint8Array));
            }


            // 根据V3协议解析数据
            if (uint8Array.length >= 4 && uint8Array[0] === 0xB1) {
                const strengthByte = uint8Array[1];
                const powerA = uint8Array[2];
                const powerB = uint8Array[3];

                // 更新历史强度值
                this.previousChannelAPower = powerA;
                this.previousChannelBPower = powerB;

                // 只有当strengthByte == 0x00时，才更新当前强度值和UI
                if (strengthByte === 0x00) {
                    this.log(`接收到新的强度值: A=${powerA}, B=${powerB}`);

                    // 更新设备当前强度值
                    this.deviceStrengthValueA = powerA;
                    this.deviceStrengthValueB = powerB;

                    // 更新UI显示
                    this.strengthA = powerA;
                    this.strengthB = powerB;
                }
            }
        },

        // 实现参数同步功能
        sendParameters(parameters) {
            this.log('发送设备控制命令...');

            // 检查是否已准备好发送参数
            if (!this.writeCharacteristic || !this.bluetoothDevice || !this.bluetoothDevice.gatt.connected) {
                this.log('设备未连接或未就绪，无法发送参数');
                return Promise.reject('设备未连接或未就绪');
            }

            // 将GATT操作封装为命令添加到队列
            return this.addGattCommand(() => {
                // 根据V3协议，参数同步命令格式（0xBF命令）
                const buffer = new ArrayBuffer(7); // 0xBF命令固定长度7字节
                const data = new Uint8Array(buffer);

                data[0] = 0xBF; // 指令HEAD
                data[1] = parameters.channelALimit;
                data[2] = parameters.channelBLimit;
                data[3] = parameters.channelAFrequencyBalance;
                data[4] = parameters.channelBFrequencyBalance;
                data[5] = parameters.channelAIntensityBalance;
                data[6] = parameters.channelBIntensityBalance;

                // 转换为十六进制字符串以便日志记录
                const hexData = Array.from(data).map(byte => byte.toString(16).padStart(2, '0')).join('');
                // 连续发送模式下不打印每条日志，避免日志过多
                if (this.tmpSendData != hexData) {
                    this.tmpSendData = hexData;
                    // 打印转换后的16进制字符串
                    this.log(`准备发送设备控制数据: 电源上限(A/B): ${data[1]}/${data[2]}, 频率平衡(A/B): ${data[3]}/${data[4]}, 强度平衡(A/B): ${data[5]}/${data[6]}`);
                    this.log(`准备发送设备控制数据: 0x${hexData}`);
                }

                // 发送数据
                return this.writeMethod.call(this.writeCharacteristic, buffer)
                    .catch(error => {
                        this.log(`发送设备控制命令: 0x${hexData}, 错误: ` + error.message);
                        return Promise.reject(error);
                    });
            }, "SendParameters");
        },

        // 开始电池轮询
        startBatteryPolling() {
            this.log('开始电池轮询，间隔: ' + (this.BATTERY_POLL_INTERVAL_SECS * 1000) + 'ms');

            // 如果已有定时器，先清除
            this.stopBatteryPolling();

            // 设置新的定时器，定期读取电池电量
            this.batteryPollInterval = setInterval(() => {
                try {
                    // 使用readBatteryLevel方法读取电池电量，确保通过命令队列执行
                    this.readBatteryLevel();
                } catch (error) {
                    this.log('电池轮询异常: ' + error.message);
                    // this.stopBatteryPolling();
                }
            }, this.BATTERY_POLL_INTERVAL_SECS * 1000);
        },

        // 停止电池轮询
        stopBatteryPolling() {
            if (this.batteryPollInterval) {
                clearInterval(this.batteryPollInterval);
                this.batteryPollInterval = null;
                this.log('停止电池轮询');
            }
        },

        // 处理设备断开连接事件
        onDisconnected(event) {
            const device = event.target;
            this.log('设备已断开连接: ' + device.name);
            this.log('设备ID: ' + device.id);
            this.disconnectDevice();
        },

        // 断开设备连接
        disconnectDevice() {
            // 无论设备是否已连接，都执行断开操作
            if (this.bluetoothDevice) {
                if (this.bluetoothDevice.gatt.connected) {
                    this.bluetoothDevice.gatt.disconnect();
                    this.log('设备已断开连接');
                }

                // 移除特征监听器
                if (this.notifyCharacteristic) {
                    this.notifyCharacteristic.removeEventListener('characteristicvaluechanged', this.handleCharacteristicChanged);
                }
                if (this.batteryCharacteristic) {
                    this.batteryCharacteristic.removeEventListener('characteristicvaluechanged', this.handleBatteryCharacteristicChanged);
                }

                // 关闭电量轮训查询
                this.stopBatteryPolling();

                // 重置全局变量
                this.bluetoothDevice = null;
                this.writeCharacteristic = null;
                this.notifyCharacteristic = null;
                this.batteryCharacteristic = null;
                this.deviceStrengthValueA = 0;
                this.deviceStrengthValueB = 0;
                this.accumulatedStrengthValueA = 0;
                this.accumulatedStrengthValueB = 0;
                this.isInputAllowed = true;

                // 更新UI状态
                this.updateUIState(false);
            }

            // 断开连接时，将电量显示设置为"-"
            this.batteryLevel = '-';

            // 停止电池轮询
            this.stopBatteryPolling();

            // 停止波形测试数据发送
            if (this.nomalPlayTimer) {
                clearInterval(this.nomalPlayTimer);
                this.nomalPlayTimer = null;
            }
            this.isNomalPlaySending = false;

            this.log('已停止播放数据的连续发送');

            // 清空播放数据缓存
            this.clearNomalPlayCache();
        },

        // 更新UI状态
        updateUIState(isConnected) {
            this.bleConnected = isConnected;
            // 可以在这里添加更多UI状态更新逻辑
        },

        // 调节强度
        adjustStrength(channel, value) {
            // 如果正在自动平滑处理电源强度变化，就先清除计时器 手动点击处理强度最优先
            this.clearFlatPowerIntensity();
            // 计算新的强度值，强度范围0-100
            let newA = this.strengthA;
            let newB = this.strengthB;

            if (channel === 'A') {
                newA = Math.max(0, Math.min(100, this.strengthA + value));
                if (this.powerSame === true) {
                    newB = newA;
                }
            } else if (channel === 'B') {
                newB = Math.max(0, Math.min(100, this.strengthB + value));
                if (this.powerSame === true) {
                    newA = newB;
                }
            }

            // 更新显示
            this.strengthA = newA;
            this.strengthB = newB;

            // 发送命令
            this.sendStrengthCommand(newA, newB);

            this.log(`调节${channel}通道强度: ${value > 0 ? '+' : ''}${value}`);
        },

        // 强度归零
        strengthZero(channel) {
            // 如果正在自动平滑处理电源强度变化，就先清除计时器
            this.clearFlatPowerIntensity();

            // 根据通道参数确定要设置的值
            let newA = this.deviceStrengthValueA;
            let newB = this.deviceStrengthValueB;

            if (channel === 'A') {
                newA = 0;
                if (this.powerSame === true) {
                    newB = 0;
                }
            } else if (channel === 'B') {
                newB = 0;
                if (this.powerSame === true) {
                    newA = 0;
                }
            } else if (channel === 'both') {
                newA = 0;
                newB = 0;
            }

            // 使用sendStrengthCommand来单独设置通道强度
            return this.sendStrengthCommand(newA, newB)
                .then(() => {
                    this.log(`${channel}通道归零命令发送成功`);
                    // 更新UI显示
                    if (channel === 'A') {
                        this.strengthA = 0;
                        if (this.powerSame === true) {
                            this.strengthB = 0;
                        }
                    } else if (channel === 'B') {
                        this.strengthB = 0;
                        if (this.powerSame === true) {
                            this.strengthA = 0;
                        }
                    }
                });
        },

        // 发送强度命令 
        sendStrengthCommand(newA, newB) {
            try {
                if (newA < 0) {
                    newA = 0;
                    this.strengthA = newA;
                }
                if (newB < 0) {
                    newB = 0;
                    this.strengthB = newB;
                }
                if (newA > this.aPowerLimit) {
                    newA = this.aPowerLimit;
                    this.strengthA = newA;
                }
                if (newB > this.bPowerLimit) {
                    newB = this.bPowerLimit;
                    this.strengthB = newB;
                }
                if (this.mangaTabId) {
                    let sendA = (newA / this.aPowerLimit) * 100;
                    let sendB = (newB / this.bPowerLimit) * 100;
                    chrome.tabs.sendMessage(this.mangaTabId, {
                        action: 'updatePowerIntensity',
                        data: {
                            powerA: Math.round(sendA),
                            powerB: Math.round(sendB),
                        }
                    });
                }
            } catch (error) {
                // 发送失败
            }
            return this.sendBLEData(newA, newB);
        },
        generateNomalPlayBatch() {
            // 构造V3指令 - B0协议要求20字节长度
            const buffer = new ArrayBuffer(20); // V3 B0指令固定长度20字节
            const data = new Uint8Array(buffer);

            // 根据滑块值动态构造波形数据
            data[0] = 0xB0; // 指令HEAD
            data[1] = null;
            data[2] = null; // A通道强度设定值
            data[3] = null; // B通道强度设定值
            // A通道波形频率 (4bytes) - 当前只使用一个滑块，复制4次
            const aFreq = this.frequencyHzToCoyote(this.aWaveFreq1) & 0xFF;
            data[4] = aFreq; data[5] = aFreq; data[6] = aFreq; data[7] = aFreq;
            // A通道波形强度 (4bytes) - 当前只使用一个滑块，复制4次
            const aIntensity = this.aWaveIntensity1 & 0xFF;
            data[8] = aIntensity; data[9] = aIntensity; data[10] = aIntensity; data[11] = aIntensity;
            // B通道波形频率 (4bytes) - 当前只使用一个滑块，复制4次
            const bFreq = this.frequencyHzToCoyote(this.bWaveFreq1) & 0xFF;
            data[12] = bFreq; data[13] = bFreq; data[14] = bFreq; data[15] = bFreq;

            // B通道波形强度 (4bytes) - 当前只使用一个滑块，复制4次
            const bIntensity = this.bWaveIntensity1 & 0xFF;
            data[16] = bIntensity; data[17] = bIntensity; data[18] = bIntensity; data[19] = bIntensity;

            // 此时的buffer是100ms的，需要补全到设定的时间长度 10次就是1秒 50次就是5秒
            const batchSize = this.generateNomalPlayShakeDelay / 100
            for (let i = 0; i < batchSize; i++) {
                // 创建buffer的副本并添加到缓存
                this.nomalPlayCache.push(buffer);
            }
            // 启动批量发送
            this.startBatchDataSend();
        },

        clearCacheRegenerate() {
            // 清空波形数据缓存队列和GATT操作队列
            this.clearNomalPlayCache();
            this.gattCommandQueue = [];
            // 如果当前正在连续发送波形，重新生成数据
            if (this.isNomalPlaySending) {
                this.generateNomalPlayBatch();
            }
            if (this.aChannelPlaying || this.bChannelPlaying) {
                this.generateChannelPlayBatch();
            }
        },

        // A通道波形频率改变
        onAWaveFreq1Change() {
            if (!this.bleConnected && !this.testConnectBLE) {
                return;
            }
            this.clearCacheRegenerate();
            this.log(`A通道波形频率已更新: ${this.aWaveFreq1}`);
            this.sendFrequencyBalance(this.aFreqBalance, this.bFreqBalance);
        },

        // A通道波形强度改变
        onAWaveIntensity1Change() {
            if (!this.bleConnected && !this.testConnectBLE) {
                return;
            }
            this.clearCacheRegenerate();
            this.log(`A通道波形强度已更新: ${this.aWaveIntensity1}`);
            this.sendIntensityBalance(this.aIntensityBalance, this.bIntensityBalance);
        },

        onBWaveFreq1Change() {
            if (!this.bleConnected && !this.testConnectBLE) {
                return;
            }
            this.clearCacheRegenerate();
            this.log(`B通道波形频率已更新: ${this.bWaveFreq1}`);
            this.sendFrequencyBalance(this.aFreqBalance, this.bFreqBalance);
        },

        onBWaveIntensity1Change() {
            if (!this.bleConnected && !this.testConnectBLE) {
                return;
            }
            this.clearCacheRegenerate();
            this.log(`B通道波形强度已更新: ${this.bWaveIntensity1}`);
            this.sendIntensityBalance(this.aIntensityBalance, this.bIntensityBalance);
        },

        // 新增的控制项事件处理函数
        onAFreqBalanceChange() {
            if (!this.bleConnected && !this.testConnectBLE) {
                return;
            }
            this.log(`A通道频率平衡已更新: ${this.aFreqBalance}`);
            // 发送频率平衡参数
            this.sendFrequencyBalance(this.aFreqBalance, this.bFreqBalance);
        },

        onBFreqBalanceChange() {
            if (!this.bleConnected && !this.testConnectBLE) {
                return;
            }
            this.log(`B通道频率平衡已更新: ${this.bFreqBalance}`);
            // 发送频率平衡参数
            this.sendFrequencyBalance(this.aFreqBalance, this.bFreqBalance);
        },

        onAIntensityBalanceChange() {
            if (!this.bleConnected && !this.testConnectBLE) {
                return;
            }
            this.log(`A通道强度平衡已更新: ${this.aIntensityBalance}`);
            // 发送强度平衡参数
            this.sendIntensityBalance(this.aIntensityBalance, this.bIntensityBalance);
        },

        onBIntensityBalanceChange() {
            if (!this.bleConnected && !this.testConnectBLE) {
                return;
            }
            this.log(`B通道强度平衡已更新: ${this.bIntensityBalance}`);
            // 发送强度平衡参数
            this.sendIntensityBalance(this.aIntensityBalance, this.bIntensityBalance);

        },

        onAPowerLimitChange() {
            if (!this.bleConnected && !this.testConnectBLE) {
                return;
            }
            let channel = 'A';
            if (this.powerSame === true) {
                this.bPowerLimit = this.aPowerLimit;
                channel = 'both';
            }
            this.log(`A通道电源上限已更新: ${this.aPowerLimit}`);

            // 发送电源上限参数
            this.sendPowerLimit(this.aPowerLimit, this.bPowerLimit);
            // 上限改变同时要变化强度
            this.setPowerIntensity(channel, this.strengthA);

        },

        onBPowerLimitChange() {
            if (!this.bleConnected && !this.testConnectBLE) {
                return;
            }
            let channel = 'B';
            if (this.powerSame === true) {
                this.aPowerLimit = this.bPowerLimit;
                channel = 'both';
            }
            this.log(`B通道电源上限已更新: ${this.bPowerLimit}`);

            // 发送电源上限参数
            this.sendPowerLimit(this.aPowerLimit, this.bPowerLimit);

            // 上限改变同时要变化强度
            this.setPowerIntensity(channel, this.strengthB);

        },

        // 发送频率平衡参数
        sendFrequencyBalance(aFreq, bFreq) {
            if (!this.writeCharacteristic) {
                this.log('设备未连接，无法发送频率平衡参数');
                return;
            }

            this.log(`发送频率平衡参数: A=${aFreq}, B=${bFreq}`);

            // 根据V3协议，发送频率平衡参数（0xBF命令的一部分）
            return this.sendParameters({
                channelALimit: this.aPowerLimit,
                channelBLimit: this.bPowerLimit,
                channelAFrequencyBalance: aFreq,
                channelBFrequencyBalance: bFreq,
                channelAIntensityBalance: this.aIntensityBalance,
                channelBIntensityBalance: this.bIntensityBalance
            });
        },

        // 发送强度平衡参数
        sendIntensityBalance(aIntensity, bIntensity) {
            if (!this.writeCharacteristic) {
                this.log('设备未连接，无法发送强度平衡参数');
                return;
            }

            this.log(`发送强度平衡参数: A=${aIntensity}, B=${bIntensity}`);

            // 根据V3协议，发送强度平衡参数（0xBF命令的一部分）
            return this.sendParameters({
                channelALimit: this.aPowerLimit,
                channelBLimit: this.bPowerLimit,
                channelAFrequencyBalance: this.aFreqBalance,
                channelBFrequencyBalance: this.bFreqBalance,
                channelAIntensityBalance: aIntensity,
                channelBIntensityBalance: bIntensity
            });
        },

        // 发送电源上限参数
        sendPowerLimit(aLimit, bLimit) {
            if (!this.writeCharacteristic) {
                this.log('设备未连接，无法发送电源上限参数');
                return;
            }

            this.log(`发送电源上限参数: A=${aLimit}, B=${bLimit}`);

            // 根据V3协议，发送电源上限参数（0xBF命令的一部分）
            return this.sendParameters({
                channelALimit: aLimit,
                channelBLimit: bLimit,
                channelAFrequencyBalance: this.aFreqBalance,
                channelBFrequencyBalance: this.bFreqBalance,
                channelAIntensityBalance: this.aIntensityBalance,
                channelBIntensityBalance: this.bIntensityBalance
            });
        },

        // 波形播放按钮（支持toggle启停）
        toggleNomalPlay() {
            if (this.isNomalPlaySending) {
                // 停止播放
                this.stopNomalPlay();
            } else {
                // 开始播放
                this.startNomalPlay();
            }
        },

        // 开始播放普通波形
        startNomalPlay() {
            // 开始发送
            if (!this.writeCharacteristic || !this.bluetoothDevice || !this.bluetoothDevice.gatt.connected) {
                this.log('设备未准备好，无法发送播放数据');
                return;
            }

            this.isNomalPlaySending = true;

            // 重置通道功率历史值，确保下次比较时使用当前值作为参考
            // 解决切换播放按钮时previousChannelAPower和previousChannelBPower没有重置的问题
            this.previousChannelAPower = -1;
            this.previousChannelBPower = -1;

            // 清空缓存，准备新的数据
            this.clearNomalPlayCache();

            // 立即生成一批默认数据
            this.generateNomalPlayBatch();

            this.log('开始播放波形数据');
        },

        // 停止播放普通波形
        stopNomalPlay() {
            this.log('停止播放普通波形');
            this.isNomalPlaySending = false;
            this.isExecutingGattCommand = false;

            // 清空波形队列
            this.clearNomalPlayCache();
            // 清空发送队列
            this.gattCommandQueue = [];

            // 关闭波形生成定时器
            if (this.nomalPlayTimer) {
                clearInterval(this.nomalPlayTimer);
                this.nomalPlayTimer = null;
            }
        },
        getNomalPlayFromCache() {
            // 每次取队列中的数据量  减去10 是避免抖动延迟时间带来的影响 每次留存1秒的数据
            let batchSize = this.nomalPlayCache.length - 10;

            // 从缓存中获取需要发送的X条数据
            return this.nomalPlayCache.splice(0, batchSize);
        },
        startBatchDataSend() {
            if (!this.writeCharacteristic && !this.testConnectBLE) {
                return;
            }
            // 如果两条通道都没有在播放 则不发送数据
            if (!this.aChannelPlaying && !this.bChannelPlaying) {
                return;
            }

            // 从缓存中获取需要发送的X条数据
            const dataToSend = this.getNomalPlayFromCache();
            if (dataToSend.length === 0) {
                this.log('缓存中没有数据可发送');
                return;
            }

            this.log(`开始批量发送 ${dataToSend.length} 条数据`);

            // 依次发送获取的数据
            let sendPromises = [];
            dataToSend.forEach((dataItem, index) => {
                // 使用setTimeout控制每条数据的发送间隔为100ms
                const sendPromise = new Promise((resolve) => {
                    setTimeout(() => {
                        if (!this.aChannelPlaying && !this.bChannelPlaying) {
                            // 如果两条通道都没有在播放 则清空缓存
                            this.clearNomalPlayCache();
                            // 清空缓存并重新生成波形数据
                            this.clearCacheRegenerate();
                            return;
                        }
                        return this.sendBLEData(this.strengthA, this.strengthB, dataItem)
                            .then(() => {
                                resolve({ success: true, index });
                            })
                            .catch((error) => {
                                resolve({ success: false, index, error });
                            });
                    }, index * 100);
                });
                sendPromises.push(sendPromise);
            });

            // 等待所有数据发送完成
            Promise.all(sendPromises)
                .then(results => {
                    const successfulCount = results.filter(r => r.success).length;
                    const failedCount = results.filter(r => !r.success).length;
                    this.log(`批量发送完成: 成功 ${successfulCount} 条, 失败 ${failedCount} 条`);
                    this.log(`当前缓存队列剩余数据: ${this.nomalPlayCache.length} 条`);

                    // 更新播放时间并设置标志
                    if (this.aChannelPlaying) {
                        //  已发送的条 * 100毫秒 / 1000秒 = 通道已播放时间
                        this.channelAPlayTime += sendPromises.length / 10;
                        if (this.channelAPlayTime >= this.channelPlayTime.a) {
                            // 通道A播放时间到了或超过了，需要计算下个波形下标
                            this.channelAPlayWaitingNext = true;
                            // 更新剩余时间，减去完整的周期数
                            this.channelAPlayTime %= this.channelPlayTime.a;
                        }
                    }
                    if (this.bChannelPlaying) {
                        //  已发送的条 * 100毫秒 / 1000秒 = 通道已播放时间
                        this.channelBPlayTime += sendPromises.length / 10;
                        if (this.channelBPlayTime >= this.channelPlayTime.b) {
                            // 通道B播放时间到了或超过了，需要计算下个波形下标
                            this.channelBPlayWaitingNext = true;
                            // 更新剩余时间，减去完整的周期数
                            this.channelBPlayTime %= this.channelPlayTime.b;
                        }
                    }

                    // 无论是否成功，都继续下一批数据的发送
                    if (this.aChannelPlaying || this.bChannelPlaying) {
                        this.generateChannelPlayBatch();
                    }
                })
                .catch(error => {
                    this.log('批量发送过程中发生错误: ' + error.message);
                });
        },
        sendBLEData(optStrengthA, optStrengthB, optBuffer) {
            // 将GATT写入操作添加到队列
            return this.addGattCommand(() => {
                if (!optStrengthA) {
                    optStrengthA = this.strengthA;
                }
                if (!optStrengthB) {
                    optStrengthB = this.strengthB
                }
                let data = null;
                // 为空是初始化完成，设置默认强度是0，此时波形的数据都没有，默认都是0
                if (!optBuffer || optBuffer.length === 0) {
                    optBuffer = new Uint8Array(20);
                    data = new Uint8Array(optBuffer);
                    data[0] = 0xB0; // 指令HEAD
                    data[1] = 0x1F;
                    data[2] = 0; // A通道强度设定值
                    data[3] = 0; // B通道强度设定值
                    // 波形数据都是0
                    _.fill(data, 0, 4, 19);
                } else {
                    data = new Uint8Array(optBuffer);
                    // B0指令第2字节(索引1)说明：序列号(4bits) + 强度值解读方式(4bits)
                    // 1. 为什么是1byte：4bits(序列号) + 4bits(强度值解读方式) = 8bits = 1byte
                    // 2. 序列号(高4位)：当前实现中未使用动态序列号，固定为0x0(二进制0000)
                    // 3. 强度值解读方式(低4位)：
                    //    - 0x0F(二进制1111)：表示通道功率发生变化，需要重新设置设备功率
                    //    - 0x00(二进制0000)：表示通道功率未变化，设备保持原有功率设置
                    //    - 注意：代码中使用0x1F(二进制00011111)，高4位为0，低4位为15(0x0F)
                    // 关于使用=而不是+=的说明：
                    // strengthByte是一个完整的8位字节变量
                    // 0x1F(00011111)和0x00(00000000)都是完整的8位字节值
                    // 使用=直接赋值整个字节是正确的，这样既设置了高4位(序列号)为0，又设置了低4位(强度解读方式)为对应值
                    // 根据Kotlin中的sendPulses函数规则：如果通道功率发生变化，strengthByte设为0x1F，否则为0x00
                    let strengthByte = 0x00;
                    if (optStrengthA !== this.previousChannelAPower || optStrengthB !== this.previousChannelBPower) {
                        strengthByte = 0x1F;
                    }

                    // 设置strengthByte   // sequence number + strength interpretation method
                    data[1] = strengthByte;
                    data[2] = optStrengthA & 0xFF; // A通道强度设定值
                    data[3] = optStrengthB & 0xFF; // B通道强度设定值
                }
                // 检查数据长度是否正确
                if (data.length < 20) {
                    this.log(`错误的波形数据：${data}，被丢弃`);
                    return Promise.reject(`错误的波形数据：${data}，被丢弃`);
                }

                if (this.debugLog) {
                    const hexData = Array.from(data).map(byte => byte.toString(16).padStart(2, '0')).join('');
                    //连续发送模式下不打印每条日志，避免日志过多
                    if (this.tmpSendData != hexData) {
                        this.tmpSendData = hexData;
                        // 打印转换后的16进制字符串
                        const logFormat = `A电:${data[2]} B电:${data[3]}, A频{${data[4]},${data[5]},${data[6]},${data[7]}}, A强{${data[8]},${data[9]},${data[10]},${data[11]}}, B频{${data[12]},${data[13]},${data[14]},${data[15]}}, B强{${data[16]},${data[17]},${data[18]},${data[19]}}`;
                        this.log(`准备发送波形数据: ${logFormat}`);
                        this.log(`准备发送波形数据: 0x${hexData}`);
                    }
                }

                // 发送到图像
                if (this.showCharter) {
                    this.pulseToCharts(data);
                }

                if (!this.bleConnected) {
                    if (this.testConnectBLE) {
                        return Promise.resolve('testConnectBLE = true, 发送波形数据成功！');
                    }
                    return Promise.reject('设备未连接');
                }

                // 发送数据
                return this.writeMethod.call(this.writeCharacteristic, optBuffer)
                    .catch(error => {
                        if (this.debugLog) {
                            this.log(`发送波形数据错误: 0x${hexData}, 错误: ` + error.message);
                        }
                        return Promise.reject(error);
                    });
            }, "sendWaveData");
        },

        frequencyHzToCoyote(inputValue) {
            let coyoteFreq;
            if (inputValue >= 10 && inputValue <= 100) {
                coyoteFreq = inputValue;
            } else if (inputValue >= 101 && inputValue <= 600) {
                coyoteFreq = Math.round((inputValue - 100) / 5 + 100);
            } else if (inputValue >= 601 && inputValue <= 1000) {
                coyoteFreq = Math.round((inputValue - 600) / 10 + 200);
            } else {
                coyoteFreq = 10.0;
            }

            // 与Kotlin保持一致：四舍五入并限制在设备频率范围内(10-240)
            return Math.round(coyoteFreq).clamp(10, 240);
        },

        // 清空播放数据缓存
        clearNomalPlayCache() {
            this.nomalPlayCache = [];
        },

        initSortTable() {
            // 为A通道表格添加排序功能
            const aTable = document.querySelector("#aChannelList");
            if (aTable) {
                Sortable.create(aTable.querySelector('.el-table__body-wrapper tbody'), {
                    group: 'shared',
                    animation: 150,
                    ghostClass: 'sortable-ghost', //拖拽样式
                    easing: 'cubic-bezier(1, 0, 0, 1)',
                    // 结束拖动事件
                    onEnd: (item) => {
                        // 更新A通道列表数据
                        const currentRow = this.aChannelList.splice(item.oldIndex, 1)[0];
                        this.$nextTick(() => {
                            this.aChannelList.splice(item.newIndex, 0, currentRow);
                            this.saveCheckedWaveIds();
                        });
                    },
                });
            }

            // 为B通道表格添加排序功能
            const bTable = document.querySelector("#bChannelList");
            if (bTable) {
                Sortable.create(bTable.querySelector('.el-table__body-wrapper tbody'), {
                    group: 'shared',
                    animation: 150,
                    ghostClass: 'sortable-ghost', //拖拽样式
                    easing: 'cubic-bezier(1, 0, 0, 1)',
                    // 结束拖动事件
                    onEnd: (item) => {
                        // 更新B通道列表数据
                        const currentRow = this.bChannelList.splice(item.oldIndex, 1)[0];
                        this.$nextTick(() => {
                            this.bChannelList.splice(item.newIndex, 0, currentRow);
                            this.saveCheckedWaveIds();
                        });
                    },
                });
            }
        },
        openWaveSaver() {
            this.$refs.waveSaver.openWaveEditor();
        },
        openCtrlItemList() {
            const url = this.$router.resolve({ name: 'CtrlItemList' }).href;
            window.open(url, '_blank');
        },
        getCheckedWaveIds() {
            const checkedWaveIds = MyStorage.getCheckedWaveIds();
            const allWaves = MyStorage.waveList();
            let ctrlItemList = this.formateCtrlItemWave(allWaves);
            if (checkedWaveIds?.a && checkedWaveIds.a.length > 0) {
                // 先找到所有选中的波形
                // 按照checkedWaveIds.a中的顺序重新排列波形
                this.aChannelList = checkedWaveIds.a.map(id => ctrlItemList.find(wave => wave.id === id)).filter(Boolean);
                console.log('A通道选中的波形:', this.aChannelList);
            }
            if (checkedWaveIds?.b && checkedWaveIds.b.length > 0) {
                // 先找到所有选中的波形
                // 按照checkedWaveIds.b中的顺序重新排列波形
                this.bChannelList = checkedWaveIds.b.map(id => ctrlItemList.find(wave => wave.id === id)).filter(Boolean);
                console.log('B通道选中的波形:', this.bChannelList);
            }
        },
        getChannelPlayType() {
            this.channelPlayType = MyStorage.getChannelPlayType();
        },
        onPlayTypeChange() {
            MyStorage.saveChannelPlayType(this.channelPlayType);
        },
        getChannelPlayTime() {
            this.channelPlayTime = MyStorage.getChannelPlayTime();
        },
        onChannelPlayTimeChange() {
            MyStorage.saveChannelPlayTime(this.channelPlayTime);
        },
        channelPlayStart(channel) {
            if (channel === 'A') {
                if (this.aChannelPlaying) {
                    return;
                } else {
                    this.toggleChannelPlay('A', true);
                }
            } else if (channel === 'B') {
                if (this.bChannelPlaying) {
                    return;
                } else {
                    this.toggleChannelPlay('B', true);
                }
            } else if (channel === 'both') {
                this.toggleChannelPlay('both', true);
            }
        },
        channelPlayStop(channel) {
            if (channel === 'A') {
                if (!this.aChannelPlaying) {
                    return;
                } else {
                    this.toggleChannelPlay('A', false);
                }
            } else if (channel === 'B') {
                if (!this.bChannelPlaying) {
                    return;
                } else {
                    this.toggleChannelPlay('B', false);
                }
            } else if (channel === 'both') {
                this.toggleChannelPlay('both', false);
            }
        },
        // 切换通道播放状态
        toggleChannelPlay(channel, play) {
            if (this.powerSame === true) {
                channel = 'both';
            }
            if (channel === 'A' || channel === 'both') {
                if (!this.aChannelList || this.aChannelList.length <= 0) {
                    this.$message({
                        message: 'A通道没有选中的波形',
                        type: 'warning',
                    });
                    return;
                }
                if (null != play || undefined != play) {
                    this.aChannelPlaying = play;
                } else {
                    this.aChannelPlaying = !this.aChannelPlaying;
                }

                if (!this.aChannelPlaying) {
                    this.cleanChartViewInv(1);
                    this.clearFlatPowerIntensity();
                    // 清空播放缓存
                    this.clearNomalPlayCache();
                    // 清空缓存并重新生成波形数据
                    this.clearCacheRegenerate();
                }
            }
            if (channel === 'B' || channel === 'both') {
                if (!this.bChannelList || this.bChannelList.length <= 0) {
                    this.$message({
                        message: 'B通道没有选中的波形',
                        type: 'warning',
                    });
                    return;
                }
                if (null != play || undefined != play) {
                    this.bChannelPlaying = play;
                } else {
                    this.bChannelPlaying = !this.bChannelPlaying;
                }
                if (!this.bChannelPlaying) {
                    this.cleanChartViewInv(2);
                    this.clearFlatPowerIntensity();
                }
            }
            this.playerStart();
        }
        // 开始播放
        , playerStart() {
            // A通道如果关闭了播放
            if (!this.aChannelPlaying) {
                if (this.channelAPlayInterval) {
                    clearInterval(this.channelAPlayInterval);
                }
                this.channelAPlayWaitingNext = false;
                this.channelAPlayTime = 0;
                // 重置通道功率历史值，确保下次比较时使用当前值作为参考
                this.previousChannelAPower = -1;
            }
            // B通道如果关闭了播放
            if (!this.bChannelPlaying) {
                if (this.channelBPlayInterval) {
                    clearInterval(this.channelBPlayInterval);
                }
                this.channelBPlayWaitingNext = false;
                this.channelBPlayTime = 0;
                // 重置通道功率历史值，确保下次比较时使用当前值作为参考
                this.previousChannelBPower = -1;
            }
            if (!this.aChannelPlaying && !this.bChannelPlaying) {
                // 清空缓存，准备新的数据
                this.clearNomalPlayCache();
                this.clearCacheRegenerate();
                if (this.nomalPlayTimer) {
                    clearInterval(this.nomalPlayTimer);
                }
                this.log('停止播放波形数据');
                return;
            }
            // 开始发送
            /* if (!this.writeCharacteristic || !this.bluetoothDevice || !this.bluetoothDevice.gatt.connected) {
                this.log('设备未准备好，无法发送播放数据');
                return;
            } */
            // 立即生成一批默认数据
            this.generateChannelPlayBatch();

            // // 设置定时器，每5秒生成一批数据
            // this.nomalPlayTimer = setInterval(() => {
            //     if ((!this.aChannelPlaying && !this.bChannelPlaying) || this.nomalPlayTimer === null) {
            //         clearInterval(this.nomalPlayTimer);
            //         return;
            //     }
            //     // 生成一批默认数据
            //     this.generateChannelPlayBatch();
            // }, this.generateNomalPlayInterval);

            // // 启动批量发送
            // this.startBatchDataSend();

            this.log('开始播放波形数据');
        },
        getEachOfGenerateV3List(modelList, channelModelIdx, rate = 1) {
            const result = [];
            const listLength = modelList.length;

            // 如果数组为空，直接返回空数组
            if (listLength === 0) {
                return result;
            }

            // 循环获取需要的数量，超出数组长度时从0开始循环
            // 每次需要从生成缓存的数量 
            const batchSize = this.generateNomalPlayShakeDelay / 25;
            let startIdx = this[channelModelIdx] || 0;
            for (let i = 0; i < batchSize; i++) {
                // 默认的播放速率是100ms ，即每个meta是100ms  rate=2时 播放速率是50ms 即每个meta是50ms rate=4时 播放速率是25ms 即每个meta是25ms
                if (rate === 1) {
                    result.push(modelList[startIdx]);
                    result.push(modelList[startIdx]);
                    result.push(modelList[startIdx]);
                    result.push(modelList[startIdx]);
                } else if (rate === 2) {
                    result.push(modelList[startIdx]);
                    result.push(modelList[startIdx]);
                } else {
                    result.push(modelList[startIdx]);
                }
                startIdx++;
                if (startIdx % listLength === 0) {
                    startIdx = 0;
                }
            }
            this[channelModelIdx] = startIdx;
            // 这里的result是以25ms为单位的

            return result;
        },
        getNextPlayChannelIdx(channelType, currentPlayIdx, channelList) {
            let nextPlayIdx = currentPlayIdx;
            switch (channelType) {
                case 0: // 列表循环
                    let tempIdx = currentPlayIdx + 1;
                    if (tempIdx >= channelList.length) {
                        tempIdx = 0;
                    }
                    nextPlayIdx = tempIdx;
                    break;
                case 1: // 单曲循环
                    break;
                case 2: // 随机
                    let tIdx = Math.floor(Math.random() * channelList.length);
                    // 如果随机到的索引和当前播放索引相同，递归调用直到找到不同的索引
                    if (tIdx == currentPlayIdx) {
                        tIdx = this.getNextPlayChannelIdx(channelType, currentPlayIdx, channelList);
                    }
                    nextPlayIdx = tIdx;
                    break;
            }
            return nextPlayIdx;
        },
        generateChannelPlayBatch() {
            if (this.generatePlayBatchIng) {
                return;
            }
            if (!this.aChannelPlaying && !this.bChannelPlaying) {
                return;
            }
            this.generatePlayBatchIng = true;
            let currentACtrlItem = null;
            let currentBCtrlItem = null;
            let tempAChannelV3ModelList = [];
            let tempBChannelV3ModelList = [];
            // 如果通道处于播放状态
            if (this.aChannelPlaying) {
                // 获取当前A通道的波形数据
                currentACtrlItem = this.aChannelList[this.aChannelPlayIdx];

                if (this.channelAPlayWaitingNext === true) {
                    let dur = currentACtrlItem.duration;
                    if (currentACtrlItem.minRuration > 0) {
                        dur = currentACtrlItem.minRuration * currentACtrlItem.duration;
                    }
                    dur = dur / 1000;
                    if (this.channelAPlayTime >= dur) {
                        // 重置等待切换
                        this.channelAPlayWaitingNext = false;
                        // 清空缓存
                        this.aChannelV3ModelList = [];
                        // 重置播放时间
                        this.channelAPlayTime = 0;
                        // 计算播放下一个索引
                        this.aChannelPlayIdx = this.getNextPlayChannelIdx(this.channelPlayType.a, this.aChannelPlayIdx, this.aChannelList);
                        // 获取当前A通道的波形数据
                        currentACtrlItem = this.aChannelList[this.aChannelPlayIdx];
                    }
                }
                if (this.aChannelV3ModelList.length <= 0) {
                    this.aChannelV3ModelList = currentACtrlItem.getV3ModelList();
                }
                // 如果是双通道波形 就要同时获取B通道数据
                if (currentACtrlItem.doubleChannel === true) {
                    tempAChannelV3ModelList = this.aChannelV3ModelList.a;
                    tempBChannelV3ModelList = this.aChannelV3ModelList.b;
                    // 双通道模式下 要同时播放A通道和B通道
                    this.channelPlayInDoubleChannel = true;
                } else {
                    tempAChannelV3ModelList = this.getEachOfGenerateV3List(this.aChannelV3ModelList, 'aChannelV3ModelIdx', currentACtrlItem.rate);
                }
            }
            if (this.bChannelPlaying) {
                // 获取当前B通道的波形数据
                currentBCtrlItem = this.bChannelList[this.bChannelPlayIdx];
                if (this.channelBPlayWaitingNext === true) {
                    let dur = currentBCtrlItem.duration;
                    if (currentBCtrlItem.minRuration > 0) {
                        dur = currentBCtrlItem.minRuration * currentBCtrlItem.duration;
                    }
                    dur = dur / 1000;
                    if (this.channelBPlayTime >= dur) {
                        // 重置等待切换
                        this.channelBPlayWaitingNext = false;
                        // 清空缓存
                        this.bChannelV3ModelList = [];
                        // 重置播放时间
                        this.channelBPlayTime = 0;
                        // 计算播放下一个索引
                        this.bChannelPlayIdx = this.getNextPlayChannelIdx(this.channelPlayType.b, this.bChannelPlayIdx, this.bChannelList);
                        // 获取当前B通道的波形数据
                        currentBCtrlItem = this.bChannelList[this.bChannelPlayIdx];
                    }
                }

                if (this.bChannelV3ModelList.length <= 0) {
                    this.bChannelV3ModelList = currentBCtrlItem.getV3ModelList();
                }
                // 如果是双通道波形 就要同时获取B通道数据
                if (currentBCtrlItem?.doubleChannel === true) {
                    // 如果AB同时为双通道 以A通道为准 A如果是单通道 B就补上另一条通道的数据
                    if (tempAChannelV3ModelList.length <= 0) {
                        tempAChannelV3ModelList = this.aChannelV3ModelList.a;
                    }
                    if (tempBChannelV3ModelList.length <= 0) {
                        tempBChannelV3ModelList = this.bChannelV3ModelList.b;
                    }
                    // 双通道模式下 要同时播放A通道和B通道
                    this.channelPlayInDoubleChannel = true;
                } else {
                    tempBChannelV3ModelList = this.getEachOfGenerateV3List(this.bChannelV3ModelList, 'bChannelV3ModelIdx', currentBCtrlItem.rate);
                }
            }

            const listMaxSize = Math.max(tempAChannelV3ModelList.length, tempBChannelV3ModelList.length);
            // 100ms/ 次 批量需要生成多少次的数据
            const batchSize = this.generateNomalPlayShakeDelay / 100;

            let tempCnt = 0;
            let listIdx = 0;
            // 如果波形时间不足批量生成数据的最小时间，需要补充数据
            while (tempCnt < batchSize) {
                // 构造V3指令 - B0协议要求20字节长度
                const buffer = new ArrayBuffer(20); // V3 B0指令固定长度20字节
                const data = new Uint8Array(buffer);
                // // 根据滑块值动态构造波形数据
                data[0] = 0xB0; // 指令HEAD
                data[1] = null;
                data[2] = null; // A通道强度设定值
                data[3] = null; // B通道强度设定值

                // data[4~7] - A通道波形频率(4bytes) 
                // data[8~11] - A通道波形强度 (4bytes) 
                // data[12~15] - B通道波形频率(4bytes) 
                // data[16~19] - B通道波形强度 (4bytes) 

                // 每个buffer组装100ms的数据，按照25ms一个数据点的规则
                if (this.aChannelPlaying === true) {
                    const tmpA = tempAChannelV3ModelList[listIdx];
                    data[4] = tmpA?.hz || 0 & 0xFF;
                    data[8] = tmpA?.z || 0 & 0xFF;
                }
                if (this.bChannelPlaying === true) {
                    const tmpB = tempBChannelV3ModelList[listIdx];
                    data[12] = tmpB?.hz || 0 & 0xFF;
                    data[16] = tmpB?.z || 0 & 0xFF;
                }
                // 移动到下一个25ms的数据点
                listIdx++;
                if (listIdx >= listMaxSize) {
                    listIdx = 0;
                }
                if (this.aChannelPlaying === true) {
                    const tmpA = tempAChannelV3ModelList[listIdx];
                    data[5] = tmpA?.hz || 0 & 0xFF;
                    data[9] = tmpA?.z || 0 & 0xFF;
                }
                if (this.bChannelPlaying === true) {
                    const tmpB = tempBChannelV3ModelList[listIdx];
                    data[13] = tmpB?.hz || 0 & 0xFF;
                    data[17] = tmpB?.z || 0 & 0xFF;
                }
                // 移动到下一个25ms的数据点
                listIdx++;
                if (listIdx >= listMaxSize) {
                    listIdx = 0;
                }
                if (this.aChannelPlaying === true) {
                    const tmpA = tempAChannelV3ModelList[listIdx];
                    data[6] = tmpA?.hz || 0 & 0xFF;
                    data[10] = tmpA?.z || 0 & 0xFF;
                }
                if (this.bChannelPlaying === true) {
                    const tmpB = tempBChannelV3ModelList[listIdx];
                    data[14] = tmpB?.hz || 0 & 0xFF;
                    data[18] = tmpB?.z || 0 & 0xFF;
                }
                // 移动到下一个25ms的数据点
                listIdx++;
                if (listIdx >= listMaxSize) {
                    listIdx = 0;
                }
                if (this.aChannelPlaying === true) {
                    const tmpA = tempAChannelV3ModelList[listIdx];
                    data[7] = tmpA?.hz || 0 & 0xFF;
                    data[11] = tmpA?.z || 0 & 0xFF;
                }
                if (this.bChannelPlaying === true) {
                    const tmpB = tempBChannelV3ModelList[listIdx];
                    data[15] = tmpB?.hz || 0 & 0xFF;
                    data[19] = tmpB?.z || 0 & 0xFF;
                }


                // 移动到下一个25ms的数据点
                listIdx++;
                if (listIdx >= listMaxSize) {
                    listIdx = 0;
                }

                // 100毫秒一组的数据
                this.nomalPlayCache.push(buffer);
                tempCnt++;
            }
            this.log(`生成缓存队列剩余数据: ${this.nomalPlayCache.length} 条`);

            // 启动批量发送
            this.startBatchDataSend();
            this.generatePlayBatchIng = false;
        },
        selectActiveWave(channel) {
            return (tableRow) => {
                if (channel === 'A') {
                    return tableRow.rowIndex === this.aChannelPlayIdx ? 'active-row' : '';
                } else if (channel === 'B') {
                    return tableRow.rowIndex === this.bChannelPlayIdx ? 'active-row' : '';
                }
            }
        },
        toggleCharter() {
            if (this.showCharter) {
                // 初始化echart图像
                this.$nextTick(() => {
                    this.initCharts('channel-a-chart');
                    this.initCharts('channel-b-chart');
                });
            } else {
                // 如果有图像对象
                if (this.charter1) {
                    // 销毁旧图像对象
                    this.charter1.dispose();
                    // 重置图像数据
                    this.charter1 = null;
                    this.chartData1 = this.$options.data()['chartData1'];
                }
                if (this.charter2) {
                    // 销毁旧图像对象
                    this.charter2.dispose();
                    // 重置图像数据
                    this.charter2 = null;
                    this.chartData1 = this.$options.data()['chartData1'];
                }
                this.charterTmp = this.$options.data()['charterTmp'];
            }
        },
        initCharts(id) {
            // 基于准备好的dom，初始化echarts实例
            var charter = echarts.init(document.getElementById(id));

            // 指定图表的配置项和数据
            var option = this.getWaveChartsOpt();

            // 使用刚指定的配置项和数据显示图表。
            charter.setOption(option);

            if (id === 'channel-a-chart') {
                this.charter1 = charter;
            } else {
                this.charter2 = charter;

                // // 添加一个假的测试图像
                // let waData = [];
                // let pwData = [];
                // for (let i = 0; i < 1000; i++) {
                //     waData.push(i);
                //     if (parseInt(i % 10) == 0) {
                //         pwData.push(parseInt(i % 10));
                //     }
                // }

                // this.chartData2.wa = waData;
                // this.chartData2.pw = pwData;

                // this.setChartViewRange(2, this.chartData2, charter);
            }
        },
        getWaveChartsOpt() {
            return {
                // color: ['#F9E49C'],
                grid: {
                    width: "98%",
                    height: "85%",
                    left: "center",
                    top: "10%",
                    right: "center",
                },
                legend: {
                    show: true,
                    data: [{
                        name: "波形图像",
                        // textStyle: {
                        //     color: "#ffebcd"
                        // }
                    }, {
                        name: "电源强度",
                        // textStyle: {
                        //     color: "#ffebcd"
                        // }
                    }],
                    right: 10,
                    top: 'top'
                },
                xAxis: {
                    show: false,
                    type: 'value',
                    // axisLine: { //轴线
                    //     show: true,
                    //     lineStyle: {
                    //         color: '#F9E49C'
                    //     }
                    // },
                    splitLine: {
                        show: false
                    },
                    axisTick: { // 刻度
                        show: false
                    },
                    // splitNumber: 50,
                    // interval: 0, // 最小的刻度1
                    // maxInterval: 1000, // 最大的刻度1000
                    // axisLabel: { // 刻度标签
                    //     interval: 0
                    // },
                },
                yAxis: [{ // 波形Y轴
                    show: false,
                    max: 100,  // z的范围0-100
                    type: 'value',
                    axisLine: {
                        show: false,
                        // lineStyle: {
                        //     color: '#F9E49C'
                        // }
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    // minInterval: 0,
                    // maxInterval: 31,
                    axisLabel: {
                        show: false
                    },
                }, { // 电源Y轴
                    show: false,
                    type: 'value',
                    min: 0, //Y轴最小值
                    max: 200, //Y轴最大值   // 电源强度的范围0-200
                    axisLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        show: false
                    },
                }],
                series: [{
                    name: '波形图像',
                    data: [],
                    type: 'bar',
                    barWidth: 1,
                    barGap: '0%',
                    /*多个并排柱子设置柱子之间的间距*/
                    barCategoryGap: '0%',
                    /*多个并排柱子设置柱子之间的间距*/
                }, {
                    name: '电源强度',
                    data: [],
                    type: 'line',
                    yAxisIndex: 1,
                    // itemStyle: {
                    //     normal: {
                    //         color: '#339bfb' // 折线的颜色
                    //     }
                    // },
                }],
                animation: false, // 不显示动画
            };
        },
        getCharterTmp: function () {
            return {
                pulseAct: 0, // 脉冲激活位
                pulseRst: 0, // 脉冲休息位
                lastZ: 0, // 上一个脉冲的Z(宽度)
                oneHudArr: new Array(100), //  一个波形对应的完整脉冲(一个脉冲生效时间为0.1s[100毫秒] 每毫秒都可能会产生脉冲)
                zArr: [], // 每10毫秒变化的z值
            };
        },
        pulseToCharts(data) {
            // `A电:${data[2]} B电:${data[3]}, A频{${data[4]},${data[5]},${data[6]},${data[7]}}, A强{${data[8]},${data[9]},${data[10]},${data[11]}}, B频{${data[12]},${data[13]},${data[14]},${data[15]}}, B强{${data[16]},${data[17]},${data[18]},${data[19]}}`;

            if (this.aChannelPlaying) {
                let tmpA = [
                    {
                        hz: data[4],
                        z: data[8]
                    },
                    {
                        hz: data[5],
                        z: data[9]
                    },
                    {
                        hz: data[6],
                        z: data[10]
                    },
                    {
                        hz: data[7],
                        z: data[11]
                    }
                ];
                let chartList = this.songToCharts(tmpA, 1);
                this.writeCharts(1, chartList);
            }

            if (this.bChannelPlaying) {
                let tmpB = [
                    {
                        hz: data[12],
                        z: data[16]
                    },
                    {
                        hz: data[13],
                        z: data[17]
                    },
                    {
                        hz: data[14],
                        z: data[18]
                    },
                    {
                        hz: data[15],
                        z: data[19]
                    }
                ];
                let chartListB = this.songToCharts(tmpB, 2);
                this.writeCharts(2, chartListB);
            }
        },
        songToChartsV3(msList, channel) {
            // 返回图像数组 每个msList是100ms的数据 每10ms一个图像
            let resArr = new Array(10);
        },
        songToCharts(msList, channel) {
            let tmp = this.charterTmp[channel];
            if (!tmp) {
                this.charterTmp[channel] = this.getCharterTmp();
                tmp = this.charterTmp[channel];
            }

            // 清空zArr数组，确保每次处理波形时都是从空数组开始
            tmp.zArr = [];

            // 计算100毫秒内的脉冲 激活为1 休息为0 每组有4个 每个25ms
            for (let i = 0; i < 100; i++) {
                let msIdx = parseInt(i / 25);
                let hz = msList[msIdx].hz;
                let z = msList[msIdx].z;
                if ((tmp.pulseAct < hz) && (tmp.pulseRst == 0)) {
                    tmp.oneHudArr[i] = 1;
                    tmp.pulseAct++;
                } else {
                    tmp.pulseAct = 0;
                    if (tmp.pulseRst < hz) {
                        tmp.oneHudArr[i] = 0;
                        tmp.pulseRst++;
                    } else {
                        if (hz == 0) {
                            tmp.oneHudArr[i] = 0;
                        } else {
                            tmp.oneHudArr[i] = 1;
                        }
                        tmp.pulseAct = 1;
                        tmp.pulseRst = 0;
                    }
                }
                // 每隔10个就存储一个Z值
                let zi = parseInt(i % 10);
                if (zi == 0) {
                    tmp.zArr[parseInt(i / 10)] = z;
                }
            }
            // 返回图像数组
            let resArr = new Array(10);
            for (let k = 0; k < 10; k++) {
                let j = k * 10;
                // 如果10毫秒内的脉冲全部为0 就为0 如果不为0说明有脉冲 要计算图像(10毫秒一个图像)
                if (tmp.oneHudArr[j] == 0 && tmp.oneHudArr[j + 1] == 0 && tmp.oneHudArr[j + 2] == 0 && tmp.oneHudArr[j + 3] == 0 && tmp.oneHudArr[j + 4] == 0 && tmp.oneHudArr[j + 5] == 0 && tmp.oneHudArr[j + 6] == 0 && tmp.oneHudArr[j + 7] == 0 && tmp.oneHudArr[j + 8] == 0 && tmp.oneHudArr[j + 9] == 0) {
                    resArr[k] = 0;
                } else {
                    // 计算当前波形的脉冲Z
                    // resArr[k] = parseInt(tmp.lastZ + (((tmp.zArr[k] - tmp.lastZ) * (k + 1)) / 10));
                    resArr[k] = tmp.zArr[k];
                    // 保留最后一个z 避免断崖式图像 在波形完整播放后需要重置
                    tmp.lastZ = tmp.zArr[k];
                }
            }

            this.charterTmp[channel] = tmp;
            return resArr;
        },
        writeCharts(channel, charts) {
            // 返回的图像必须要有值
            if (!(charts && charts.length > 0)) {
                return;
            }
            let _charter = this.charter1;
            if (channel === 2) {
                _charter = this.charter2;
            }

            if (!_charter) {
                return;
            }

            let chartData = this.chartData1;
            if (channel === 2) {
                chartData = this.chartData2;
            }
            // 将数据放入缓存
            this.setChannelChartToCache(channel, charts, chartData);
            // 从缓存分批读入并输出图像
            this.setChartViewRange(channel, chartData);

        },
        setChartViewRange(channel, chartData) {
            if (!this.chartViewInv[channel]) {
                this.chartViewInv[channel] = setTimeout(() => {
                    // 循环内重取charter 否则可能关闭了 但是临时变量没删 导致函数继续执行
                    let _charter = this.charter1;
                    if (channel === 2) {
                        _charter = this.charter2;
                    }
                    if (!_charter) {
                        this.cleanChartViewInv(channel);
                        return;
                    }
                    // 如果可见范围比最大的图像还大 就清空
                    if (chartData.wa.length === 0) {
                        this.cleanChartViewInv(channel);
                        return;
                    }
                    // 动态设置最小值
                    let nextWa = _.take(chartData.wa, 50);
                    let nextPw = _.take(chartData.pw, 5);
                    let waData = _charter.getOption().series[0].data;
                    let pwData = _charter.getOption().series[1].data;

                    let tmpPa = [];
                    // 合并波形图像数组
                    if (nextWa && nextWa.length > 0) {
                        let tmpWa = [];
                        let idx = 0;
                        for (let w of nextWa) {
                            let chartX = this.chartViewMin[channel]++;
                            tmpWa.push([chartX, w]);
                            if (nextPw && nextPw.length > 0) {
                                // 每10个波形取1个电源 第5个波形在中间位置 由于下标从0开始 所以第一个是4 此后每间隔10 写一个电源强度
                                if (idx === 4 || idx === 14 || idx === 24 || idx === 34 || idx === 44) {
                                    // 计算电源强度的下标 0 1 2 3 4 5
                                    let pwIdx = parseInt((idx - 4) / 10);
                                    tmpPa.push([chartX, nextPw[pwIdx]]);
                                }
                            }
                            idx++;
                        }
                        waData = _.concat(waData, tmpWa);
                        waData = _.takeRight(waData, this.waChartMaxCnt);
                    } else {
                        // 如果缓存中获取不到图像 就删除输出的图像
                        waData.splice(0, 50);
                    }
                    // 合并电源强度图像数组
                    if (nextPw && nextPw.length > 0 && tmpPa.length > 0) {
                        pwData = _.concat(pwData, tmpPa);
                        pwData = _.takeRight(pwData, this.pwChartMaxCnt);
                    } else {
                        // 如果缓存中获取不到图像 就删除输出的图像
                        pwData.splice(0, 5);
                    }
                    // 计算x轴的最小和最大值
                    let min = 0;
                    let max = min + 50;
                    // 如果列表有值从波形中取最大的 电源的要小5
                    if (waData.length > 0) {
                        min = waData[0][0];
                        max = _.last(waData)[0];
                    }
                    // 设置图像x轴的最大最小值
                    _charter.setOption({
                        xAxis: {
                            min,
                            max
                        },
                        series: [{
                            data: waData
                        }, {
                            data: pwData
                        }]
                    });
                    // 移除已经看不见的部分
                    chartData.wa.splice(0, 50);
                    chartData.pw.splice(0, 5);

                    // 标记当前动画帧已完成
                    this.chartViewInv[channel] = null;

                    // 如果还有剩余数据，继续递归调用处理
                    if (chartData.wa.length > 0) {
                        this.setChartViewRange(channel, chartData);
                    }
                }, 200);

            }
        },
        cleanChartViewInv(channel) {
            if (1 === channel) {
                this.chartData1 = this.$options.data()['chartData1'];
                if (this.charter1) {
                    this.charter1.clear();
                    this.charter1.setOption(this.getWaveChartsOpt(), false);
                }
            } else {
                this.chartData2 = this.$options.data()['chartData2'];
                if (this.charter2) {
                    this.charter2.clear();
                    this.charter2.setOption(this.getWaveChartsOpt(), false);
                }
            }
            clearInterval(this.chartViewInv[channel]);
            // cancelAnimationFrame(this.chartViewInv[channel]);
            this.chartViewInv[channel] = null;
            this.chartViewMin[channel] = 0;
            this.charterTmp[channel] = null;

        },
        setChannelChartToCache(channel, charts, chartData) {
            chartData.wa = _.concat(chartData.wa, charts);
            chartData.wa = _.takeRight(chartData.wa, this.waCacheMaxCnt);
            chartData.pw.push(1 === channel ? this.strengthA : this.strengthB);
            chartData.pw = _.takeRight(chartData.pw, this.pwCacheMaxCnt);
        },
        saveTempPlayerInfo() {
            // 当加载脚本时， 需要缓存当前播放器的播放模式和最小播放时间信息  在关闭脚本后用于恢复播放器状态
            this.tempPlayerInfo = {
                aChannelPlayIdx: this.aChannelPlayIdx, // A通道播放下标
                bChannelPlayIdx: this.bChannelPlayIdx, // B通道播放下标
                channelPlayType: _.cloneDeep(this.channelPlayType), // 播放模式
                channelPlayTime: _.cloneDeep(this.channelPlayTime), // 最小播放时间
            };
        },
        restoreTempPlayerInfo() {
            // 当关闭脚本时，需要恢复之前缓存的播放器状态
            if (this.tempPlayerInfo) {
                this.aChannelPlayIdx = this.tempPlayerInfo.aChannelPlayIdx;
                this.bChannelPlayIdx = this.tempPlayerInfo.bChannelPlayIdx;
                this.channelPlayType = this.tempPlayerInfo.channelPlayType;
                this.onPlayTypeChange();
                this.getChannelPlayType();

                this.channelPlayTime = this.tempPlayerInfo.channelPlayTime;
                this.onChannelPlayTimeChange();
                this.getChannelPlayTime();
                this.tempPlayerInfo = null;
            }
        },
        initWebMessage() {
            // 初始化扩展消息
            chrome.runtime?.onMessage.addListener((request, sender, sendResponse) => {
                if (request.type === 'waveChange') {
                    this.log('检测到波形变化', request);
                    // 从编辑器中保存后，需要重新获取选中的波形
                    this.getCheckedWaveIds();
                    this.log('重新加载脚本列表');
                }
                if (request.type === 'mangaChange') {
                    this.log('检测到脚本变化', request);
                    if (this.playManga && this.playManga.bookId === request.data.bookId) {
                        // 从编辑器中保存后，需要重新获取选中的波形
                        // 漫画脚本加载
                        const mangaList = MyStorage.mangaList();
                        let mangaScript = null;
                        if (mangaList && mangaList.length > 0) {
                            // 漫画脚本加载
                            mangaScript = _.find(mangaList, { bookId: request.data.bookId });
                            this.playManga = mangaScript;
                            this.log('重新加载播放脚本：', this.playManga);
                        }
                    }
                }
            });
        },
        initExtendsMessage() {

            // 初始化扩展消息
            chrome.runtime?.onMessage.addListener((request, sender, sendResponse) => {
                if (sender.tab.id !== this.mangaTabId) {
                    this.mangaTabId = sender.tab.id;
                }
                // 漫画脚本加载
                if (request.action === 'load') {
                    this.log('触发了脚本load', request);
                    // 缓存当前播放器的信息
                    this.saveTempPlayerInfo();
                    // 漫画脚本加载
                    const mangaList = MyStorage.mangaList();
                    let mangaScript = null;
                    if (mangaList && mangaList.length > 0) {
                        // 漫画脚本加载
                        mangaScript = _.find(mangaList, { bookId: request.bookId });
                    }
                    if (mangaScript) {
                        this.playManga = mangaScript;
                        this.log('当前播放脚本：', this.playManga);
                        return sendResponse({ code: '000', msg: 'success', data: mangaScript });
                    }
                    return sendResponse({ code: '000', msg: 'noneScript' });
                }
                // 漫画脚本编辑
                if (request.action === 'edit') {
                    this.log('触发了脚本edit', request);
                    chrome.tabs.update(this.tabId, { active: true }, function (tab) {

                    });
                    const mangaList = MyStorage.mangaList();
                    const mangaScript = _.find(mangaList, { bookId: request.bookId }) || { bookId: request.bookId, bookName: request.bookName || '', scriptList: [] };
                    // 先更新Vuex状态，再进行路由跳转
                    this.$store.dispatch('setEditMangaScript', mangaScript).then(() => {
                        this.$router.push({ name: 'MangaScriptEditor' });
                    });
                }
                if (request.action === 'play') {
                    this.log('触发了play', request);
                    if (!this.playManga) {
                        return sendResponse({ code: '002', msg: 'scriptClose' });
                    }
                    const pageNo = request.page;
                    const rowIdx = _.findIndex(this.playManga.scriptList, (item) => {
                        if (this.isNum(item.pageNo)) {
                            return item.pageNo === pageNo;
                        } else {
                            return this.logicPage(item.pageNo, pageNo);
                        }
                    });
                    if (rowIdx < 0) {
                        this.log('未找到对应的脚本行:', pageNo);
                        return;
                    }
                    try {
                        let row = this.playManga.scriptList[rowIdx];
                        // 触发并执行脚本
                        this.playMangaPageForEvent(row, rowIdx, request);
                        return sendResponse({ code: '000', data: row.scriptContent });
                    } catch (error) {
                        return sendResponse({ code: '001', msg: error.$message });
                    }
                }
                // 漫画脚本关闭
                if (request.action === 'close') {
                    this.log('触发了close', request);
                    this.closePlayMangaPage();
                    return sendResponse({ code: '000' });
                }
                // 获取设备电量
                if (request.action === 'getBattery') {
                    if (!this.bleReady) {
                        return sendResponse({ code: '002', msg: 'bleNotReady' });
                    }
                    let batteryLevel = this.batteryLevel || '-';
                    if (batteryLevel === '未知') {
                        batteryLevel = undefined;
                    }
                    return sendResponse({ code: '000', data: batteryLevel });
                }
                // 切换通道播放状态
                if (request.action === 'togglePower') {
                    this.log('触发了togglePower', request);
                    this.toggleChannelPlay(request.channel, request.play);
                    return sendResponse({ code: '000' });
                }
                // 设置通道电源强度
                if (request.action === 'setPower') {
                    this.log('触发了setPower', request);
                    this.setPowerIntensity(request.channel, request.power);
                    return sendResponse({ code: '000' });
                }
                if (request.action === 'quickAdd') {
                    this.log('触发了quickAdd', request);

                    if (this.playManga) {
                        // 漫画脚本加载
                        const mangaList = MyStorage.mangaList();
                        let idx = null;
                        if (mangaList && mangaList.length > 0) {
                            // 漫画脚本加载
                            idx = _.findIndex(mangaList, { bookId: request.bookId });
                        }

                        const pageNo = request.pageNo;
                        const rowIdx = _.findIndex(this.playManga.scriptList, (item) => {
                            if (this.isNum(item.pageNo)) {
                                return item.pageNo === pageNo;
                            } else {
                                return this.logicPage(item.pageNo, pageNo);
                            }
                        });
                        let row = this.playManga.scriptList[rowIdx];
                        let content;
                        if (request.powerA === request.powerB) {
                            content = `// 1 ~ 100% 根据通道电源上限的百分比进行计算
this.setPowerIntensity('both', ${request.powerA});`
                        } else {
                            content = `// 1 ~ 100% 根据通道电源上限的百分比进行计算
this.setPowerIntensity('A', ${request.powerA});
this.setPowerIntensity('B', ${request.powerB});`;
                        }
                        row.scriptContent = content;
                        // 保存到本地列表中
                        mangaList[idx].scriptList.splice(rowIdx, 1, row);
                        MyStorage.saveMangaList(mangaList);
                    }
                    return sendResponse({ code: '000' });
                }
            });
        },
        isNum(param) {
            let num = parseInt(param);
            return !Number.isNaN(num);
        },
        logicPage(param, pageNo) {
            return new String(pageNo).match(param)?.[0];
        },
        openMangaScriptEditor() {
            const mangaScript = { bookId: '', bookName: '', scriptList: [] };
            // 先更新Vuex状态，再进行路由跳转
            this.$store.dispatch('setEditMangaScript', mangaScript).then(() => {
                const url = this.$router.resolve({ name: 'MangaScriptEditor' }).href;
                window.open(url, '_blank');
            });
        },
        openMangaScriptList() {
            const url = this.$router.resolve({ name: 'MangaScriptList' }).href;
            window.open(url, '_blank');
            // this.$router.push({ name: 'MangaScriptList' });
        },
        loadTestScript() {
            // 加载测试脚本
            const mangaList = MyStorage.mangaList();
            if (mangaList && mangaList.length > 0) {
                this.playManga = mangaList[0];
                this.saveTempPlayerInfo();
            }
        },
        closePlayMangaPage() {
            this.playManga = null;
            this.playMangaCurrentPageNo = null;
            // 关闭播放脚本时，重置上次电源强度
            this.flatPowerIntensity = {
                a: null, // A通道电源强度
                b: null, // B通道电源强度
            };
            // 清除之前的定时器
            this.clearFlatPowerIntensity();
            // 双通道强度设置成0
            this.strengthZero('both');
            // 双通道播放器停止
            this.setPlayerStatus('both', false);
            // 恢复之前缓存的播放器状态
            this.restoreTempPlayerInfo();
        },
        playMangaTableRowActive({ row, rowIndex }) {
            // 设置当前触发的脚本选中状态
            if (rowIndex === this.playMangaCurrentPageNo) {
                return 'playManga-active-row';
            }
            return '';
        },
        playMangaPage(row, column, event) {
            let rowIdx = _.findIndex(this.playManga.scriptList, row);
            let pageNo = parseInt(row.pageNo);
            if (!this.isNum(row.pageNo)) {
                pageNo = parseInt(prompt('触发页码：'));
                const isCurrentPage = this.logicPage(row.pageNo, pageNo);
                if (false === isCurrentPage) {
                    this.log('触发页码结果:', rowIdx + ' 逻辑判断结果:', isCurrentPage);
                    return;
                }
            }
            this.triggerMangaScript(row);
            this.playMangaCurrentPageNo = rowIdx;


            // // 双击也可以触发脚本
            // this.triggerMangaScriptForDynamic(row, {
            //     action: 'play', bookId: this.playManga.bookId, page: pageNo
            // });

        },
        playMangaPageForEvent(row, rowIdx, request) {
            // 双击也可以触发脚本
            // this.triggerMangaScriptForDynamic(row, request);
            this.triggerMangaScript(row);
            this.playMangaCurrentPageNo = rowIdx;
        },
        // triggerMangaScriptForDynamic(row, request) {
        //     // 触发漫画的脚本
        //     try {
        //         let func = new Function(row.scriptContent);
        //         func.call(this, request);
        //         console.info('触发漫画脚本成功:', row);
        //     } catch (error) {
        //         console.info('触发漫画脚本时出错:', error, row);
        //     }
        // },
        triggerMangaScript(row) {
            // 触发漫画的脚本
            try {
                // 安全解析脚本内容，避免使用eval或new Function违反CSP
                const scriptLines = row.scriptContent.split('\n');
                for (let line of scriptLines) {
                    // 跳过注释和空行
                    line = line.trim();
                    if (line.startsWith('//') || line === '') continue;

                    // 解析函数调用
                    const match = line.match(/this\.([a-zA-Z_][a-zA-Z0-9_]*)\((.*)\);?/);
                    if (match) {
                        const funcName = match[1];
                        const argsStr = match[2];

                        // 检查函数是否存在于当前组件中
                        if (typeof this[funcName] === 'function') {
                            // 解析参数
                            let args = [];
                            if (argsStr.trim() !== '') {
                                try {
                                    // 使用JSON.parse的思想，但更宽松地解析参数
                                    args = this.parseScriptArgs(argsStr);
                                } catch (e) {
                                    console.error('解析脚本参数失败:', argsStr, e);
                                    continue;
                                }
                            }

                            // 调用函数
                            this[funcName](...args);
                        }
                    }
                }
                this.log('触发漫画脚本成功:', row);
            } catch (error) {
                this.log('触发漫画脚本时出错:', error, row);
            }
        },
        parseScriptArgs(argsStr) {
            // 简单的参数解析器
            const args = [];
            let currentArg = '';
            let inString = false;
            let stringChar = '';
            let inParentheses = 0;

            for (let i = 0; i < argsStr.length; i++) {
                const char = argsStr[i];

                if (inString) {
                    if (char === stringChar && argsStr[i - 1] !== '\\') {
                        inString = false;
                        stringChar = '';
                    }
                    currentArg += char;
                } else if (char === '"' || char === "'") {
                    inString = true;
                    stringChar = char;
                    currentArg += char;
                } else if (char === '(') {
                    inParentheses++;
                    currentArg += char;
                } else if (char === ')') {
                    inParentheses--;
                    currentArg += char;
                } else if (char === ',' && inParentheses === 0) {
                    // 分隔参数
                    args.push(this.evaluateArg(currentArg.trim()));
                    currentArg = '';
                } else {
                    currentArg += char;
                }
            }

            // 添加最后一个参数
            if (currentArg.trim() !== '') {
                args.push(this.evaluateArg(currentArg.trim()));
            }

            return args;
        },
        evaluateArg(argStr) {
            // 简单的参数求值
            argStr = argStr.trim();

            // 字符串
            if ((argStr.startsWith('"') && argStr.endsWith('"')) ||
                (argStr.startsWith("'") && argStr.endsWith("'"))) {
                return argStr.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
            }

            // 数字
            if (!isNaN(argStr)) {
                return parseFloat(argStr);
            }

            // 布尔值
            if (argStr === 'true') return true;
            if (argStr === 'false') return false;

            // null
            if (argStr === 'null') return null;

            // undefined
            if (argStr === 'undefined') return undefined;

            // 对象或数组（简单情况）
            if ((argStr.startsWith('{') && argStr.endsWith('}')) ||
                (argStr.startsWith('[') && argStr.endsWith(']'))) {
                try {
                    return JSON.parse(argStr);
                } catch (e) {
                    return argStr;
                }
            }

            // 默认返回字符串
            return argStr;
        },
        formateCtrlItemWave(allWaves) {
            if (!allWaves || allWaves.length === 0) {
                return [];
            }
            return allWaves.map(itemData => {
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
        },
        setPowerIntensity(channel, intensity, delayTime) {
            if (false === this.aChannelPlaying && false === this.bChannelPlaying) {
                return;
            }
            if (delayTime) {
                setTimeout(() => {
                    this.setPowerIntensity(channel, intensity);
                }, delayTime);
                return;
            }
            // 漫画脚本触发电源强度改变
            let newA = this.strengthA;
            let newB = this.strengthB;
            if ('A' === channel || 'both' === channel) {
                if (false === this.aChannelPlaying) {
                    newA = 0;
                } else {
                    let tempA = Math.round(this.aPowerLimit * intensity);
                    // 如果电源强度变化大于等于10，则平滑设置电源强度 每0.5秒变化1次
                    const powerDiff = Math.abs(tempA - newA);
                    if (powerDiff >= this.flatPowerDiffMin) {
                        this.flatPowerIntensity.a = tempA;
                        if (this.powerSame === true) {
                            this.flatPowerIntensity.b = tempA;
                        }
                    } else {
                        newA = tempA;
                        if (this.powerSame === true) {
                            newB = newA;
                        }
                    }
                }
            }
            if ('B' === channel || 'both' === channel) {
                if (false === this.bChannelPlaying) {
                    newA = 0;
                } else {
                    let tempB = Math.round(this.bPowerLimit * intensity);
                    // 如果电源强度变化大于等于10，则平滑设置电源强度 每0.5秒变化1次
                    const powerDiff = Math.abs(tempB - newB);
                    if (powerDiff >= this.flatPowerDiffMin) {
                        this.flatPowerIntensity.b = tempB;
                        if (this.powerSame === true) {
                            this.flatPowerIntensity.a = tempB;
                        }
                    } else {
                        newB = tempB;
                        if (this.powerSame === true) {
                            newA = newB;
                        }
                    }
                }
            }
            // 如果有平滑处理 先执行一次 然后再进入自动平滑处理
            this.sendStrengthCommand(newA, newB);
            this.strengthA = newA;
            this.strengthB = newB;
            // 如果AB都不需要平滑 就直接设置强度
            if (this.flatPowerIntensity?.a >= 0 || this.flatPowerIntensity?.b >= 0) {
                this.autoFlatPowerIntensity(this.flatPowerIntensityInterval);
            }
        },
        autoFlatPowerIntensity(flatInterval) { // 平滑的处理脚本触发的电源强度变化
            // 如果AB都不需要平滑 就清除计时器 直接返回 
            if (!this.flatPowerIntensity.a && !this.flatPowerIntensity.b) {
                this.clearFlatPowerIntensity();
                return;
            }
            // 如果AB都到达了目标强度 就清除计时器 直接返回
            if (this.flatPowerIntensity.a === this.strengthA && this.flatPowerIntensity.b === this.strengthB) {
                this.clearFlatPowerIntensity();
                return;
            }
            // 如果没有设置平滑时间间隔 就使用默认值
            if (!flatInterval) {
                flatInterval = this.flatPowerIntensityInterval;
            }
            // 每0.5秒变化一次
            this.flatPowerIntensityInv = setTimeout(() => {
                if (false === this.aChannelPlaying && false === this.bChannelPlaying) {
                    this.clearFlatPowerIntensity();
                    return;
                }
                let newA = this.strengthA;
                let newB = this.strengthB;

                // 如果A通道需要平滑 就设置A通道强度
                if (this.flatPowerIntensity.a) {
                    let tempDiffA = this.flatPowerIntensity?.a - newA;
                    if (tempDiffA > 0) {
                        newA++;
                    } else if (tempDiffA < 0) {
                        newA--;
                    } else {
                        this.flatPowerIntensity.a = null;
                    }
                }
                // 如果B通道需要平滑 就设置B通道强度
                if (this.flatPowerIntensity.b) {
                    let tempDiffB = this.flatPowerIntensity?.b - newB;
                    if (tempDiffB > 0) {
                        newB++;
                    } else if (tempDiffB < 0) {
                        newB--;
                    } else {
                        this.flatPowerIntensity.b = null;
                    }
                }
                this.sendStrengthCommand(newA, newB);
                this.strengthA = newA;
                this.strengthB = newB;
                // 如果AB都到达了目标强度 就清除计时器 直接返回
                if (this.flatPowerIntensity.a === this.strengthA && this.flatPowerIntensity.b === this.strengthB) {
                    this.clearFlatPowerIntensity();
                    return;
                }
                // 如果计时器已经启动了 就直接返回
                this.autoFlatPowerIntensity(flatInterval);
            }, flatInterval);
        },
        clearFlatPowerIntensity() { // 清除平滑设置电源强度定时器
            if (this.flatPowerIntensityInv) {
                clearTimeout(this.flatPowerIntensityInv);
                this.flatPowerIntensityInv = null;
            }
        },
        setChannelWave(channel, waveId, delayTime) {
            if (false === this.aChannelPlaying && false === this.bChannelPlaying) {
                return;
            }
            if (delayTime) {
                setTimeout(() => {
                    this.setChannelWave(channel, waveId);
                }, delayTime);
                return;
            }
            // 漫画脚本触发通道波形改变
            if ('A' === channel) {
                if (false === this.aChannelPlaying) {
                    return;
                }
                let triggerWave = MyStorage.getWaveById(waveId);
                if (!triggerWave) {
                    console.info('触发的脚本中包含不存在的波形:', waveId);
                    return;
                }
                let triggerCtrlItem = this.formateCtrlItemWave([triggerWave])[0];
                // 判断是否波形在通道波形列表中存在
                let aChannelItem = _.find(this.aChannelList, item => item.id === triggerCtrlItem.id);
                // 如果不存在要保存到列表
                if (!aChannelItem) {
                    this.aChannelList.push(triggerCtrlItem);
                    this.saveCheckedWaveIds();
                    aChannelItem = triggerCtrlItem;
                }
                this.playChannelWave('A', aChannelItem);
            } else if ('B' === channel) {
                if (false === this.bChannelPlaying) {
                    return;
                }
                let triggerWave = MyStorage.getWaveById(waveId);
                if (!triggerWave) {
                    console.info('触发的脚本中包含不存在的波形:', waveId);
                    return;
                }
                let triggerCtrlItem = this.formateCtrlItemWave([triggerWave])[0];
                // 判断是否波形在通道波形列表中存在
                let bChannelItem = _.find(this.bChannelList, item => item.id === triggerCtrlItem.id);
                // 如果不存在要保存到列表
                if (!bChannelItem) {
                    this.bChannelList.push(triggerCtrlItem);
                    this.saveCheckedWaveIds();
                    bChannelItem = triggerCtrlItem;
                }
                this.playChannelWave('B', bChannelItem);
            }
        },
        setPlayerStatus(channel, isStart, delayTime) {
            if (delayTime) {
                setTimeout(() => {
                    this.setPlayerStatus(channel, isStart);
                }, delayTime);
                return;
            }
            // 漫画脚本触发通道播放器状态改变
            if (true === isStart) {
                // 如果是开始播放 重复执行不会toggle的播放器函数
                this.channelPlayStart(channel);
            } else {
                // 如果是停止播放 重复执行不会toggle的播放器函数
                this.channelPlayStop(channel);
            }
        },
        setPlayTime(channel, time, delayTime) {
            if (false === this.aChannelPlaying && false === this.bChannelPlaying) {
                return;
            }
            if (delayTime) {
                setTimeout(() => {
                    this.setPlayTime(channel, time);
                }, delayTime);
                return;
            }
            // 漫画脚本触发通道播放时间改变
            if ('A' === channel || 'both' === channel) {
                if (true === this.aChannelPlaying) {
                    this.channelPlayTime.a = time;
                }
            }
            if ('B' === channel || 'both' === channel) {
                if (true === this.aChannelPlaying) {
                    this.channelPlayTime.b = time;
                }
            }
            this.onChannelPlayTimeChange();
        },
        setPlayType(channel, type, delayTime) {
            if (false === this.aChannelPlaying && false === this.bChannelPlaying) {
                return;
            }
            if (delayTime) {
                setTimeout(() => {
                    this.setPlayType(channel, type);
                }, delayTime);
                return;
            }
            // 漫画脚本触发通道播放类型改变
            if ('A' === channel || 'both' === channel) {
                if (true === this.aChannelPlaying) {
                    this.channelPlayType.a = type;
                }
            }
            if ('B' === channel || 'both' === channel) {
                if (true === this.bChannelPlaying) {
                    this.channelPlayType.b = type;
                }
            }
            this.onPlayTypeChange();
        },
        setFlatPowerIntensity(channel, intensity, flatInterval, delayTime) {
            if (false === this.aChannelPlaying && false === this.bChannelPlaying) {
                return;
            }
            if (delayTime) {
                setTimeout(() => {
                    this.setFlatPowerIntensity(channel, intensity, flatInterval);
                }, delayTime);
                return;
            }
            // 每X毫秒 平滑的电源变化
            if ('A' === channel || 'both' === channel) {
                if (true === this.aChannelPlaying) {
                    this.flatPowerIntensity.a = this.strengthA + intensity;
                }
            }
            if ('B' === channel || 'both' === channel) {
                if (true === this.bChannelPlaying) {
                    this.flatPowerIntensity.b = this.strengthB + intensity;
                }
            }
            // 清除旧的定时器 重新设置新的定时器
            this.clearFlatPowerIntensity();
            this.autoFlatPowerIntensity(flatInterval);
        }
    },
    mounted() {
        // 组件挂载时的初始化逻辑
        this.log('Coyote V3 蓝牙控制组件已挂载');
        this.initSortTable();
        this.getCheckedWaveIds();
        this.getChannelPlayType();
        this.getChannelPlayTime();
        this.initWebMessage();
        this.initExtendsMessage();
    },
    beforeDestroy() {
        // 组件销毁前的清理逻辑
        this.disconnectDevice();
        this.log('Coyote V3 蓝牙控制组件已销毁');
    }
}
</script>

<style>
.wave-player {
    padding: 15px;
}

/* Element UI风格样式调整 */
.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    margin-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
}

.card-header span {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
}

/* 滑块样式调整 */
.slider {
    flex: 1;
    margin-left: 10px;
}



/* 日志区域样式 */
.log-card .el-card__body {
    padding: 10px;
}

.log-area {
    height: 120px;
    overflow-y: auto;
    font-size: 11px;
    line-height: 1.4;
    color: #606266;
    background-color: #f5f7fa;
    padding: 8px;
    border-radius: 4px;
}

/* 电源强度控制区域样式 */
.power-inline {
    margin-left: 0.5rem;
}

/* 控制行样�?*/
.controls-row {
    overflow-y: auto;
    margin-bottom: 10px;
}

/* 按钮样式微调 */
.el-button--mini {
    padding: 4px 8px;
    font-size: 12px;
}

/* 卡片间距调整 */
.el-card {
    margin-bottom: 15px;
}

/* 标题样式调整 */
.h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: #303133;
}

.h5 {
    font-size: 1.1rem;
    margin-bottom: 10px;
    color: #606266;
    font-weight: 500;
}

.form-item {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.form-item-label {
    width: 20px;
    margin-right: 8px;
    text-align: left;
}

.playlist-title {
    text-align: center;
}

.playlist-table {
    padding: 0px 5px;
    height: 450px;
    display: flex;
    flex-direction: column;
}

.playlist-table .el-table {
    margin: 5px 0px;
    border: 1px solid #fac000;
    flex: 1;
    max-height: calc(100% - 40px);
}

.playlist-table .el-table__body-wrapper {
    overflow-y: auto;
}

.wave-player .el-table .active-row {
    background-color: #ebeaea;
}

.channelPlayType {
    display: inline-block;
    margin-left: 20px;
}

.channelPlayTime {
    display: inline-block;
    position: relative;
    top: 15px;
    width: 30%;
    left: 20px;
}

.el-input-number .el-input {
    width: 45%;
}

.charter-content {
    text-align: center;
    padding-bottom: 10px;
}

.charter-switch .el-switch__label {
    color: #939393;
}

.client-dashbord .charter-switch .el-switch__label.is-active {
    color: #F9E49C;
}

.charter-items {
    display: flex;
    justify-content: space-around;
}

.charter-item {
    border: 1px solid #F9E49C;
    border-radius: 0.2rem;
    margin: 0rem 0.5rem;
    width: 50%;
}

.charter-canvas {
    width: 100%;
    height: 200px;
}

.wave-player .script-content-column .cell {
    white-space: pre;
}

.wave-player .wave-btns {
    margin-top: 10px;
}

.play-manga-info span {
    display: block;
}

.wave-player .playManga-active-row,
.wave-player .el-table--enable-row-hover .el-table__body tr:hover>td.el-table__cell {
    background-color: #d9faff;
}

/* 响应式样式调整 */
@media (max-width: 768px) {
    .el-col {
        width: 100% !important;
        flex: 0 0 100% !important;
        max-width: 100% !important;
    }

    .form-item {
        flex-wrap: wrap !important;
        align-items: flex-start !important;
    }

    .form-item-label {
        width: 100% !important;
        margin-bottom: 5px !important;
        text-align: left !important;
    }

    .slider {
        flex: 1 1 100% !important;
        margin-left: 0 !important;
        margin-bottom: 10px !important;
        width: 100% !important;
    }

    /* 修复滑块和输入框重叠问题 */
    .form-item {
        flex-direction: row !important;
        align-items: center !important;
        flex-wrap: nowrap !important;
        width: 100% !important;
    }

    .form-item-label {
        width: 20px !important;
        margin-bottom: 0 !important;
        margin-right: 10px !important;
        flex-shrink: 0 !important;
    }

    .slider {
        flex: 1 !important;
        margin-left: 0 !important;
        margin-bottom: 0 !important;
    }

    /* 更具体的滑块样式覆盖 */
    .wave-player .el-slider {
        width: 100% !important;
        display: flex !important;
        align-items: center !important;
        height: 40px !important;
        position: relative !important;
    }

    .wave-player .el-slider__runway {
        flex: 1 !important;
        margin-right: 10px !important;
        width: auto !important;
        position: static !important;
    }

    .wave-player .el-slider__input {
        position: static !important;
        margin-left: 10px !important;
        margin-top: 0 !important;
        width: 60px !important;
        z-index: 1 !important;
        flex-shrink: 0 !important;
    }

    .wave-player .el-slider__input .el-input {
        width: 100% !important;
    }

    .wave-player .el-slider.is-vertical {
        height: 150px !important;
    }

    /* 确保滑块和输入框在移动设备上正确显示 */
    @media (max-width: 480px) {
        .form-item {
            flex-direction: column !important;
            align-items: flex-start !important;
        }

        .form-item-label {
            width: 100% !important;
            margin-bottom: 8px !important;
        }

        .slider {
            width: 100% !important;
        }

        .wave-player .el-slider {
            width: 100% !important;
            display: block !important;
            height: 60px !important;
            position: relative !important;
        }

        .wave-player .el-slider__runway {
            width: calc(100% - 80px) !important;
            margin-right: 0 !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
        }

        .wave-player .el-slider__input {
            position: absolute !important;
            right: 0 !important;
            top: 0 !important;
            margin-left: 0 !important;
            margin-top: 0 !important;
            width: 70px !important;
        }

        /* 底部按钮响应式样式 */
        .wave-btns {
            margin-top: 15px !important;
        }

        .wave-btns .el-col {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
        }

        .wave-btns .el-button {
            flex: 1 1 calc(50% - 10px) !important;
            min-width: calc(50% - 10px) !important;
            margin: 0 !important;
            text-align: center !important;
        }
    }

    .el-input-number {
        width: 100% !important;
        margin-bottom: 10px !important;
    }

    .el-input-number .el-input {
        width: 100% !important;
    }

    .power-inline {
        margin-left: 0 !important;
        width: 100% !important;
    }

    .channelPlayType,
    .channelPlayTime {
        display: block !important;
        margin-left: 0 !important;
        margin-top: 10px !important;
        position: static !important;
        width: 100% !important;
    }

    .charter-items {
        flex-direction: column !important;
    }

    .charter-item {
        width: 100% !important;
        margin: 0.5rem 0 !important;
    }
}
</style>
