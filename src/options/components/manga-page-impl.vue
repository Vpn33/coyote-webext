<template>
    <div class="manga-page-impl">
        <el-button @click="openAddScriptDialog">添加</el-button>
        <el-row>
            <el-col :span="16">
                <div class="table-container">
                    <el-table id="scriptList" :data="scriptList"  border max-height="500px">
                        <el-table-column label="行号" width="100" class-name="drag-handle-column">
                            <template slot-scope="scope">
                                <div class="drag-handle">
                                    {{ scope.$index + 1 }}
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="pageNo" min-width="300" label="页码">
                        </el-table-column>
                        <el-table-column prop="scriptContent" min-width="400" label="脚本内容"
                            class-name="script-content-column">
                        </el-table-column>
                        <el-table-column label="操作" width="200">
                            <template slot-scope="scope">
                                <el-button type="primary" @click="editItem(scope.row, scope.$index)">编辑</el-button>
                                <el-button type="danger" @click="deleteItem(scope.row, scope.$index)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-col>
            <el-col :span="8" class="quickset-row">
                <el-row>
                    <el-col :span="12">
                        <div class="quickset-container">
                            <span class="quickset-name">A通道电源强度</span>
                            <el-slider class="quickset-slider" v-model="powerA" vertical height="200px"
                                :show-input="true" :min="0" :max="100" :step="1" :show-input-controls="false"
                                @input="quickChannelPowerChange('A')" input-size="mini"
                                :format-tooltip="(val) => val + '%'"></el-slider>
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <div class="quickset-container">
                            <span class="quickset-name">B通道电源强度</span>
                            <el-slider class="quickset-slider" v-model="powerB" vertical height="200px"
                                :show-input="true" :min="0" :max="100" :step="1" :show-input-controls="false"
                                @input="quickChannelPowerChange('B')" input-size="mini"
                                :format-tooltip="(val) => val + '%'"></el-slider>
                        </div>
                    </el-col>
                </el-row>
                <div class="quickset-btn">
                    <el-switch v-model="channelSync" active-text="同步" inactive-text="单独"></el-switch>
                    <el-button class="quickset-btn" type="primary" @click="quickAddScript">快速添加</el-button>
                </div>
            </el-col>
        </el-row>
        <el-dialog title="添加脚本" :visible.sync="dialogVisible" width="70%" :close-on-click-modal="false"
            :before-close="addScriptClose">
            <el-form :model="addScriptItem" ref="addScriptForm" label-width="120px" :rules="scriptRules">
                <el-form-item label="页码" prop="pageNo">
                    <div>
                        <el-tag v-for="item in implPage" :key="item.label" :type="item.type" effect="dark"
                            @click="openPopScriptDialog(item, true)" class="impl-type-tag">
                            {{ item.label }}
                        </el-tag>
                    </div>
                    <el-input v-model="addScriptItem.pageNo" placeholder="请输入页码"></el-input>
                </el-form-item>
                <el-form-item label="脚本内容" prop="scriptContent">
                    <div>
                        <el-tag v-for="item in implType" :key="item.label" :type="item.type" effect="dark"
                            @click="openPopScriptDialog(item)" class="impl-type-tag">
                            {{ item.label }}
                        </el-tag>
                        <el-button type="text" size="small" @click="formatScriptContent">
                            格式化
                        </el-button>
                    </div>
                    <el-input ref="scriptContent" v-model="addScriptItem.scriptContent" type="textarea"
                        placeholder="请输入脚本内容" :autosize="{ minRows: 4, maxRows: 20 }"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addScriptContent">确定</el-button>
                <el-button @click="addScriptClose">取消</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="popScriptForm.title" :visible.sync="popScriptVisible" width="30%"
            :close-on-click-modal="false" :before-close="popScriptClose">
            <el-form :model="popScriptForm" ref="popScriptForm" label-width="120px">
                <el-form-item v-for="(val, index) in popScriptForm.items" :key="'popScriptForm_' + index" v-bind="val"
                    :prop="val.name" :rules="val.rules">
                    <template slot="label" v-if="val.labelSlot">
                        {{ val.labelSlot }}
                    </template>
                    <template v-if="val.type === 'input'">
                        <el-input v-model="val.value" placeholder="请输入" v-on="val.events"></el-input>
                    </template>
                    <template v-if="val.type === 'select'">
                        <el-select v-model="val.value" placeholder="请选择" v-on="val.events">
                            <el-option v-for="item in val.options" :key="item.value" :label="item.label"
                                :value="item.value"></el-option>
                        </el-select>
                    </template>
                    <template v-if="val.type === 'checkbox'">
                        <el-checkbox-group v-model="val.value" v-on="val.events">
                            <el-checkbox v-for="item in val.options" :key="item.value" :label="item.value"
                                :value="item.value">{{ item.label }}</el-checkbox>
                        </el-checkbox-group>
                    </template>
                    <template v-if="val.type === 'radio'">
                        <el-radio-group v-model="val.value" v-on="val.events">
                            <el-radio v-for="item in val.options" :key="item.value" :label="item.value"
                                :value="item.value">{{ item.label }}</el-radio>
                        </el-radio-group>
                    </template>
                    <template v-if="val.type === 'slider'">
                        <ul class="slider-item">
                            <li class="slider-item-slider"><el-slider v-model="val.value" v-bind="val"
                                    v-on="val.events"></el-slider></li>
                            <li class="slider-item-text">{{ val.formatTooltip(val.value) }}</li>
                        </ul>
                    </template>
                    <template v-if="val.type === 'input-number'">
                        <el-input-number v-model="val.value" v-bind="val" v-on="val.events"></el-input-number>
                    </template>
                    <template v-if="val.type === 'switch'">
                        <el-switch v-model="val.value" v-bind="val" v-on="val.events"></el-switch>
                    </template>
                    <template v-if="val.type === 'SelectOneWave'">
                        <SelectOneWave ref="selectWave" v-bind="val" v-on="val.events"></SelectOneWave>
                    </template>
                </el-form-item>
            </el-form>
            <template slot="footer">
                <el-button type="primary" @click="popScriptContentConfirm">确定</el-button>
                <el-button @click="popScriptClose">取消</el-button>
            </template>
        </el-dialog>
    </div>
</template>
<script>
import Sortable from 'sortablejs';
import SelectOneWave from './select-one-wave.vue';
import WaveUtil from '../../lib/WaveUtil.js';

export default {
    name: 'MangaPageImpl',
    components: {
        SelectOneWave,
    },
    props: {
        value: {
            type: Array,
            default: () => [],
        },

    },
    data() {
        return {
            scriptList: [],
            dialogVisible: false,
            addScriptItem: {
                pageNo: '',
                scriptContent: '',
            },
            implPage: [
                {
                    label: '从x~y页', type: 'warning', value: 'pageRegex',
                    form: {
                        title: '从x~y页',
                        items: [
                            { name: 'startPage', label: '起始页码', type: 'input-number', controlsPosition: 'right', value: 1, min: 1, max: 10000, step: 1 },
                            { name: 'endPage', label: '结束页码', type: 'input-number', controlsPosition: 'right', value: 2, min: 1, max: 10000, step: 1 },
                        ],
                        codeTemplate: (item) => {
                            if (item.startPage <= 9 && item.endPage <= 9) {
                                return `[${item.startPage}-${item.endPage}]`;
                            } else {
                                let reg = [];
                                for (let i = item.startPage; i <= item.endPage; i++) {
                                    reg.push(i);
                                }
                                return `^(${reg.join('|')})$`;
                            }
                        },
                    },
                }
            ],
            implType: [
                {
                    label: '通道电源强度', type: 'warning', value: 'setPowerIntensity',
                    form: {
                        title: '设置通道电源强度',
                        items: [
                            { name: 'channel', label: '通道', type: 'select', value: 'both', options: [{ label: 'A和B', value: 'both' }, { label: '仅A', value: 'A' }, { label: '仅B', value: 'B' }] },
                            { name: 'intensity', label: '电源强度', type: 'slider', value: 50, min: 0, max: 100, step: 1, showInput: true, showInputControls: false, inputSize: 'mini', formatTooltip: (val) => val + '%' },
                            {
                                name: 'waitTime', label: '延迟时间', type: 'slider', value: 0, min: 0, max: 10000, step: 100, formatTooltip: (val) => {
                                    return WaveUtil.msToViewTimeStr(val);
                                }
                            },
                        ],
                        codeTemplate: (item) => {
                            return `// 1 ~ 100% 根据通道电源上限的百分比进行计算
this.setPowerIntensity('${item.channel}', ${item.intensity / 100}${item.waitTime ? `, ${item.waitTime}` : ''});`
                        },
                    },
                },
                {
                    label: '平滑电源强度', type: 'warning', value: 'setFlatPowerIntensity',
                    form: {
                        title: '设置平滑电源强度加减',
                        items: [
                            { name: 'channel', label: '通道', type: 'select', value: 'both', options: [{ label: 'A和B', value: 'both' }, { label: '仅A', value: 'A' }, { label: '仅B', value: 'B' }] },
                            { name: 'intensity', label: '电源强度变化', type: 'slider', value: 0, min: -100, max: 100, step: 1, showInput: true, showInputControls: false, inputSize: 'mini', formatTooltip: (val) => val > 0 ? '+' + val : val },
                            {
                                name: 'flatInterval', label: '平滑时间间隔', type: 'slider', value: 500, min: 100, max: 10000, step: 100, formatTooltip: (val) => {
                                    return WaveUtil.msToViewTimeStr(val);
                                }
                            },
                            {
                                name: 'waitTime', label: '延迟时间', type: 'slider', value: 0, min: 0, max: 10000, step: 100, formatTooltip: (val) => {
                                    return WaveUtil.msToViewTimeStr(val);
                                }
                            },
                        ],
                        codeTemplate: (item) => {
                            return `// 平滑的设置通道电源强度加减
this.setFlatPowerIntensity('${item.channel}', ${item.intensity}, ${item.flatInterval}${item.waitTime ? `, ${item.waitTime}` : ''});`
                        },
                    },
                },
                {
                    label: '通道波形', type: 'success', value: 'setChannelWave',
                    form: {
                        title: '设置通道波形',
                        items: [
                            { name: 'channel', label: '通道', type: 'select', value: 'A', options: [{ label: 'A通道', value: 'A' }, { label: 'B通道', value: 'B' }] },
                            {
                                name: 'selWave', label: '选择波形', type: 'SelectOneWave', value: {},
                                showChecked: false,
                                rules: [{
                                    required: true, message: '请选择波形', validator: (rule, val, callback) => {
                                        return this.popScriptForm.items[1].value?.id !== undefined ? callback() : callback(new Error('请选择波形'));
                                    }
                                },
                                ],
                                events: {
                                    'change': (selectedWave) => {
                                        this.popScriptForm.items[1].value = selectedWave;
                                    }
                                }

                            },
                            {
                                name: 'waitTime', label: '延迟时间', type: 'slider', value: 0, min: 0, max: 1000, formatTooltip: (val) => {
                                    return WaveUtil.msToViewTimeStr(val * 100);
                                }
                            },
                        ],
                        codeTemplate: (item) => {
                            return `// 设置通道${item.channel}的波形为${item.selWave.name}
this.setChannelWave('${item.channel}', ${item.selWave.id}${item.waitTime ? `, ${item.waitTime}` : ''});`
                        },
                    },
                },
                {
                    label: '通道播放时间', type: 'primary', value: 'setPlayTime',
                    form: {
                        title: '设置通道播放时间',
                        items: [
                            { name: 'channel', label: '通道', type: 'select', value: 'A', options: [{ label: 'A和B', value: 'both' }, { label: 'A通道', value: 'A' }, { label: 'B通道', value: 'B' }] },
                            { name: 'time', label: '播放时间', type: 'slider', value: 60, min: 5, max: 300, showInput: true, showInputControls: false, inputSize: 'mini', formatTooltip: (val) => val + '秒' },
                            {
                                name: 'waitTime', label: '延迟时间', type: 'slider', value: 0, min: 0, max: 10000, step: 100, formatTooltip: (val) => {
                                    return WaveUtil.msToViewTimeStr(val);
                                }
                            },
                        ],
                        codeTemplate: (item) => {
                            return `// 设置通道${item.channel}的播放时间为${item.time}秒
this.setPlayTime('${item.channel}', ${item.time}${item.waitTime ? `, ${item.waitTime}` : ''});`
                        },
                    },
                },
                {
                    label: '播放模式', type: 'primary', value: 'setPlayType',
                    form: {
                        title: '设置播放模式',
                        items: [
                            { name: 'channel', label: '通道', type: 'select', value: 'both', options: [{ label: 'A和B', value: 'both' }, { label: 'A通道', value: 'A' }, { label: 'B通道', value: 'B' }] },
                            {
                                name: 'playType', label: '播放模式', type: 'select', value: 1,
                                options: [{ label: '列表循环', value: 0 }, { label: '单曲循环', value: 1 }, { label: '随机', value: 2 }]
                            },
                            {
                                name: 'waitTime', label: '延迟时间', type: 'slider', value: 0, min: 0, max: 10000, step: 100, formatTooltip: (val) => {
                                    return WaveUtil.msToViewTimeStr(val);
                                }
                            },
                        ],
                        codeTemplate: (item) => {
                            return `// 设置播放模式为${this.playTypeFilter(item.playType)}
this.setPlayType('${item.channel}', ${item.playType}${item.waitTime ? `, ${item.waitTime}` : ''});`
                        },
                    },
                },
                {
                    label: '通道播放器', type: 'info', value: 'setPlayerStatus',
                    form: {
                        title: '设置通道播放器开始播放',
                        items: [
                            { name: 'channel', label: '通道', type: 'select', value: 'A', options: [{ label: 'A和B', value: 'both' }, { label: 'A通道', value: 'A' }, { label: 'B通道', value: 'B' }] },
                            { name: 'isStart', label: '播放', type: 'switch', value: true, activeText: '开始', inactiveText: '停止' },
                            {
                                name: 'waitTime', label: '延迟时间', type: 'slider', value: 0, min: 0, max: 10000, step: 100, formatTooltip: (val) => {
                                    return WaveUtil.msToViewTimeStr(val);
                                }
                            },
                        ],
                        codeTemplate: (item) => {
                            return `// 设置通道${item.channel}的播放器
this.setPlayerStatus('${item.channel}', ${item.isStart}${item.waitTime ? `, ${item.waitTime}` : ''});`
                        },
                    },
                },

                //                 {
                //                     label: '链式', type: 'info', value: 'callPromise',
                //                     codeTemplate: (item) => {
                //                         return `new Promise((resolve, reject) => {
                // }).then(() => {
                // }).catch(() => {
                //     // 失败回调
                // });`
                //                     },
                //                 },
                //                 {
                //                     label: '等待', type: 'info', value: 'waitToDo',
                //                     form: {
                //                         title: '设置等待时间',
                //                         items: [
                //                             {
                //                                 name: 'waitTime', label: '等待时间', type: 'slider', value: 1, min: 1, max: 1000, formatTooltip: (val) => {
                //                                     return WaveUtil.msToViewTimeStr(val * 100);
                //                                 }
                //                             },
                //                         ],
                //                         codeTemplate: (item) => {
                //                             return `setTimeout(() => {
                // }, ${item.waitTime} * 100);`
                //                         },
                //                     },

                //                 }
            ],
            scriptRules: {
                pageNo: [{ required: true, message: '请输入页码', trigger: 'blur' },
                {
                    message: '页码重复', validator: (rule, value, callback) => {
                        if (this.addScriptItem.idx != undefined) {
                            if (this.scriptList[this.addScriptItem.idx].pageNo === value) {
                                callback();
                            }
                        }
                        const exItem = _.find(this.scriptList, (item) => {
                            return item.pageNo === value;
                        })
                        if (exItem) {
                            callback(new Error('页码重复'));
                        } else {
                            callback();
                        }
                    },
                }],
                scriptContent: [{ required: true, message: '请输入脚本内容', trigger: 'blur' }],
            },
            popScriptVisible: false,
            popScriptForm: {
                items: [],
            },
            powerA: 0, // 快速设置 A通道电源强度
            powerB: 0, // 快速设置 B通道电源强度
            channelSync: true, // 快速设置通道同步
        }
    },
    methods: {
        openPopScriptDialog(impl, isPage) {
            if (impl.form) {
                this.popScriptForm = _.cloneDeep(impl.form);
                this.popScriptForm.isPage = isPage;
                this.popScriptVisible = true;
            } else {
                let popCodeContent = impl.codeTemplate().trim()
                if (!isPage) {
                    popCodeContent += '\n';
                }
                let resContent = this.addScriptItem.scriptContent;
                if (!isPage && !resContent.endsWith('\n')) {
                    resContent += '\n';
                }
                resContent += popCodeContent;

                this.addScriptItem.scriptContent = resContent;

            }
        },
        popScriptContentConfirm() {
            this.$refs.popScriptForm.validate((valid) => {
                if (valid) {
                    let t = {};
                    this.popScriptForm.items.map(item => {
                        t[item.name] = item.value;
                    });
                    // console.log('popScriptItem', popScriptItem);
                    // 计算字符串模板
                    let popCodeContent = this.popScriptForm.codeTemplate(t).trim();
                    if (!this.popScriptForm.isPage) {
                        popCodeContent += '\n';
                    }
                    if (this.popScriptForm.isPage) {
                        this.addScriptItem.pageNo = popCodeContent;
                    } else {
                        let resContent = this.addScriptItem.scriptContent;
                        if (!this.popScriptForm.isPage && !resContent.endsWith('\n')) {
                            resContent += '\n';
                        }
                        resContent += popCodeContent;
                        this.addScriptItem.scriptContent = resContent.trim();
                    }
                    this.popScriptClose();
                }
            });
        },
        popScriptClose() {
            this.popScriptVisible = false;
            this.$refs.popScriptForm.resetFields();
        },
        openAddScriptDialog() {
            this.dialogVisible = true;
        },
        addScriptClose() {
            this.dialogVisible = false;
            this.$refs.addScriptForm.resetFields();
            // 上面的重置不会清空值，需要手动清空
            this.addScriptItem = this.$options.data().addScriptItem;
        },
        formatScriptContent() {
            // 格式化脚本内容，添加适当的缩进
            let scriptContent = this.addScriptItem.scriptContent;
            if (!scriptContent) return;

            // 解析脚本内容
            const lines = scriptContent.split('\n');
            const formattedLines = [];
            const indentSize = 1;

            // 使用栈来跟踪括号的位置和缩进级别
            const braceStack = [];

            // 遍历每一行
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (line === '') {
                    // 只保留一个空行
                    if (i > 0 && formattedLines[formattedLines.length - 1] !== '') {
                        formattedLines.push('');
                    }
                    continue;
                }

                // 检查是否有结束括号需要减少缩进
                const hasEndBrace = line.includes('}');

                // 特殊处理：如果行以结束括号开头，需要从栈中弹出并使用对应的缩进级别
                if (line.startsWith('}')) {
                    if (braceStack.length > 0) {
                        braceStack.pop();
                    }
                }

                // 添加缩进，使用当前栈的长度作为缩进级别
                const indentLevel = braceStack.length;
                const indent = ' '.repeat(indentLevel * indentSize);
                formattedLines.push(indent + line);

                // 检查是否有开始括号需要增加缩进
                const hasStartBrace = line.includes('{');

                // 特殊处理：只对大括号{}进行跟踪，确保结束括号与开始括号对齐
                if (hasStartBrace) {
                    // 计算这一行的开始括号数量
                    const startBraces = line.match(/\{/g) || [];
                    for (let j = 0; j < startBraces.length; j++) {
                        braceStack.push(indentLevel);
                    }
                }

                // 检查是否有结束括号需要从栈中弹出
                if (hasEndBrace) {
                    // 计算这一行的结束括号数量
                    const endBraces = line.match(/\}/g) || [];
                    for (let j = 0; j < endBraces.length; j++) {
                        if (braceStack.length > 0) {
                            braceStack.pop();
                        }
                    }
                }

                // 特殊处理：如果行包含=>{，则需要增加缩进
                if (line.includes('=>{')) {
                    braceStack.push(indentLevel);
                }

                // 特殊处理链式调用（如.then()、.catch()、.finally()）
                const chainCalls = ['.then(', '.catch(', '.finally('];
                const hasChainCall = chainCalls.some(call => line.includes(call));

                if (hasChainCall) {
                    // 检查链式调用后面是否有{，如果有，增加缩进
                    for (let call of chainCalls) {
                        if (line.includes(call)) {
                            const callIndex = line.indexOf(call);
                            const restOfLine = line.slice(callIndex + call.length).trim();
                            if (restOfLine.startsWith('{')) {
                                braceStack.push(indentLevel);
                            } else if (restOfLine.startsWith('(')) {
                                // 处理.then(() => {}) 这种情况
                                if (restOfLine.includes('=>')) {
                                    const arrowIndex = restOfLine.indexOf('=>');
                                    const arrowRest = restOfLine.slice(arrowIndex + 2).trim();
                                    if (arrowRest.startsWith('{')) {
                                        braceStack.push(indentLevel);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 移除多余的空行
            const finalLines = [];
            for (let line of formattedLines) {
                if (line !== '' || (finalLines.length > 0 && finalLines[finalLines.length - 1] !== '')) {
                    finalLines.push(line);
                }
            }

            // 更新脚本内容
            this.addScriptItem.scriptContent = finalLines.join('\n');
        },
        addScriptContent() {
            this.$refs.addScriptForm.validate((valid) => {
                if (valid) {
                    let addScriptItem = _.cloneDeep(this.addScriptItem);
                    delete addScriptItem.idx;
                    // console.log('addScriptItem', addScriptItem);
                    if (this.addScriptItem.idx !== undefined) {
                        this.scriptList[this.addScriptItem.idx] = addScriptItem;
                    } else {
                        this.scriptList.push(addScriptItem);
                    }
                    this.addScriptClose();
                    this.$emit('change', this.scriptList);
                }
            });
        },
        editItem(item, index) {
            this.addScriptItem = _.cloneDeep(item);
            this.addScriptItem.idx = index;
            this.dialogVisible = true;
        },
        deleteItem(item, index) {
            this.$confirm('确定删除吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.scriptList.splice(index, 1);
                this.$emit('change', this.scriptList);
            });
        },
        modelTypeFilter(modelType) {
            switch (modelType) {
                case '0':
                    return 'AB同步';
                case '1':
                    return 'AB单独';
                case '2':
                    return '仅A';
                case '3':
                    return '仅B';
                default:
                    return modelType;
            }
        },
        powerTypeFilter(powerType) {
            switch (powerType) {
                case '0':
                    return '线性改变';
                case '1':
                    return '直接改变';
                default:
                    return powerType;
            }
        },
        playTypeFilter(playType) {

            switch (playType) {
                case 0:
                    return '列表循环';
                case 1:
                    return '单曲循环';
                case 2:
                    return '随机';
                default:
                    return playType;
            }
        },
        quickChannelPowerChange(channel) {
            if (channel === 'A') {
                if (this.channelSync) {
                    this.powerB = this.powerA;
                }
            } else if (channel === 'B') {
                if (this.channelSync) {
                    this.powerA = this.powerB;
                }
            }
        },
        isNum(param) {
            let num = parseInt(param);
            return !Number.isNaN(num);
        },
        quickAddScript() {
            let pageNo = 1;
            let lastItem = _.last(this.scriptList);
            if (lastItem) {
                if (this.isNum(lastItem.pageNo)) {
                    pageNo = parseInt(lastItem.pageNo) + 1;
                } else {
                    if (lastItem.pageNo.indexOf('-') !== -1) {
                        pageNo = parseInt(lastItem.pageNo.split('-')[1]) + 1;
                    } else if (lastItem.pageNo.indexOf('|') !== -1) {
                        pageNo = parseInt(_.last(lastItem.pageNo.split('|')).match(/\d+/g).join('')) + 1;
                    }
                }
            }
            let channel = 'both';
            if (this.channelSync) {
                this.scriptList.push({
                    pageNo,
                    scriptContent: `// 1 ~ 100% 根据通道电源上限的百分比进行计算
this.setPowerIntensity('${channel}', ${this.powerA});`
                });
            } else {
                this.scriptList.push({
                    pageNo,
                    scriptContent: `// 1 ~ 100% 根据通道电源上限的百分比进行计算
this.setPowerIntensity('A', ${this.powerA});
this.setPowerIntensity('B', ${this.powerB});`
                });
            }
        },
        initSortTable() {
            // 为A通道表格添加排序功能
            const scTable = document.querySelector("#scriptList");
            if (scTable) {
                Sortable.create(scTable.querySelector('.el-table__body-wrapper tbody'), {
                    group: 'shared',
                    animation: 150,
                    ghostClass: 'sortable-ghost', //拖拽样式
                    easing: 'cubic-bezier(1, 0, 0, 1)',
                    handle: '.drag-handle', // 只能在行号列拖动
                    // 结束拖动事件
                    onEnd: (item) => {
                        // 更新脚本列表数据
                        const currentRow = this.scriptList.splice(item.oldIndex, 1)[0];
                        this.$nextTick(() => {
                            this.scriptList.splice(item.newIndex, 0, currentRow);
                            this.$emit('change', this.scriptList);
                        });
                    },
                });
            }
        }
    },
    mounted() {
        this.scriptList = _.cloneDeep(this.value) || [];
        this.initSortTable();
    },
    watch: {
        // 监听value变化，更新scriptList
        value: {
            handler(newVal) {
                this.scriptList = _.cloneDeep(newVal) || [];
            },
            deep: true // 深度监听，确保数组内容变化也能触发更新
        }
    }
}
</script>
<style>
.manga-page-impl .script-content-column .cell {
    white-space: pre;
}

/* 拖拽手柄样式 */
.manga-page-impl .drag-handle {
    cursor: move;
    cursor: grab;
    user-select: none;
    padding: 5px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}

.manga-page-impl .drag-handle:active {
    cursor: grabbing;
}

.manga-page-impl .drag-handle-column .cell {
    padding: 0;
}

/* 修复错误消息显示位置 */
.manga-page-impl .el-form-item {
    margin-bottom: 22px;
}

/* 为标签添加间距 */
.manga-page-impl .impl-type-tag {
    margin-right: 10px !important;
    margin-bottom: 8px !important;
}

.manga-page-impl .slider-item {
    display: flex;
    flex-direction: row;
    list-style-type: none;
    padding-inline-start: 0px;
}

.manga-page-impl .slider-item-slider {
    flex-grow: 18;
}

.manga-page-impl .slider-item-text {
    flex-grow: 2;
    text-align: center;
}

.manga-page-impl .el-form-item__error {
    position: relative;
}

.manga-page-impl .el-input-number .el-input {
    width: 100%;
}

.manga-page-impl .el-input-number.el-input-number--mini {
    width: 20%;
}

.manga-page-impl .el-input-number.el-input-number--mini+.el-slider__runway.show-input {
    margin-right: 80px;
}

.manga-page-impl .el-slider.is-vertical.el-slider--with-input {
    padding-bottom: 65px;
}

.manga-page-impl .quickset-btn {
    display: flex;
    /* 弹性布局 */
    align-content: center;
    /* 垂直居中 */
    flex-direction: column;
    /* 垂直方向 */
    flex-wrap: nowrap;
    /* 不换行 */
    justify-content: center;
    /** 水平居中 */
    align-items: center;
    /** 垂直居中 */
    gap: 1rem;
    /** 按钮间距 */
}

.manga-page-impl .quickset-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* 响应式样式 */
@media (max-width: 768px) {
    .manga-page-impl .table-container {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }


    /* 调整整体布局 */
    .manga-page-impl .el-row {
        flex-direction: column;
    }

    .manga-page-impl .el-col {
        width: 100% !important;
        margin-bottom: 20px;
    }

    /* 调整表格布局 */
    .manga-page-impl .table-container {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        margin-bottom: 15px;
    }

    .manga-page-impl #scriptList {
        max-height: 250px;
    }

    /* 调整 AB 通道电源强度条为水平排列 */
    .manga-page-impl .el-row:nth-child(2) {
        flex-direction: row;
        margin-bottom: 10px !important;
    }

    .manga-page-impl .el-row:nth-child(2) .el-col {
        width: 50% !important;
        margin-bottom: 0;
    }

    .manga-page-impl .quickset-container {
        flex-direction: column;
        align-items: flex-start;
        padding: 0 10px;
        gap: 2px;
    }

    .manga-page-impl .quickset-name {
        width: 100%;
        margin-bottom: 2px;
        font-size: 14px;
    }

    .manga-page-impl .quickset-slider {
        width: 100% !important;
        vertical: false !important;
        height: auto !important;
    }

    /* 确保滑块为水平方向 */
    .manga-page-impl .el-slider.is-vertical {
        display: flex !important;
        align-items: center;
        width: 100% !important;
        height: 30px !important;
        flex-direction: row;
    }

    .manga-page-impl .el-slider.is-vertical .el-slider__runway {
        flex: 1 !important;
        height: 4px !important;
        margin-right: 10px !important;
        background-color: #e4e7ed !important;
        position: relative !important;
    }

    .manga-page-impl .el-slider.is-vertical .el-slider__bar {
        width: 100% !important;
        height: 4px !important;
        background-color: #409eff !important;
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
    }

    .manga-page-impl .el-slider.is-vertical .el-slider__button {
        margin-left: -7px !important;
        margin-top: -5px !important;
        width: 16px !important;
        height: 16px !important;
        background-color: #409eff !important;
        border: 2px solid #fff !important;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
        z-index: 1 !important;
    }

    .manga-page-impl .el-slider.is-vertical .el-slider__input {
        position: relative !important;
        top: 0 !important;
        left: 0 !important;
        margin-top: 0 !important;
        margin-left: 0 !important;
        width: 60px !important;
        max-width: 60px !important;
        order: 2;
    }

    .manga-page-impl .el-slider.is-vertical .el-slider__input input {
        width: 100% !important;
    }

    /* 调整底部按钮布局 */
    .manga-page-impl .quickset-btn {
        flex-direction: row;
        justify-content: space-around;
        margin-top: 10px;
    }

    .manga-page-impl .el-slider.is-vertical.el-slider--with-input {
        padding-bottom: 10px;
    }
}

/* 更小屏幕的适配 */
@media (max-width: 480px) {

    /* 调整 AB 通道电源强度条布局 */
    .manga-page-impl .el-row:nth-child(2) {
        flex-direction: column;
        gap: 8px !important;
    }

    .manga-page-impl .el-row:nth-child(2) .el-col {
        width: 100% !important;
        margin-bottom: 0;
    }

    .manga-page-impl .quickset-container {
        flex-direction: column;
        align-items: flex-start;
        padding: 0 10px;
        gap: 2px;
    }

    .manga-page-impl .quickset-name {
        width: 100%;
        margin-bottom: 2px;
        font-size: 14px;
    }

    .manga-page-impl .quickset-slider {
        width: 100% !important;
        vertical: false !important;
        height: auto !important;
    }

    /* 确保滑块为水平方向 */
    .manga-page-impl .el-slider.is-vertical {
        display: flex !important;
        align-items: center;
        width: 100% !important;
        height: 30px !important;
        flex-direction: row;
    }

    .manga-page-impl .el-slider.is-vertical .el-slider__runway {
        flex: 1 !important;
        height: 4px !important;
        margin-right: 10px !important;
        background-color: #e4e7ed !important;
        position: relative !important;
    }

    .manga-page-impl .el-slider.is-vertical .el-slider__bar {
        width: 100% !important;
        height: 4px !important;
        background-color: #409eff !important;
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
    }

    .manga-page-impl .el-slider.is-vertical .el-slider__button {
        margin-left: -7px !important;
        margin-top: -5px !important;
        width: 16px !important;
        height: 16px !important;
        background-color: #409eff !important;
        border: 2px solid #fff !important;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
        z-index: 1 !important;
    }

    .manga-page-impl .el-slider.is-vertical .el-slider__input {
        position: relative !important;
        top: 0 !important;
        left: 0 !important;
        margin-top: 0 !important;
        margin-left: 0 !important;
        width: 60px !important;
        max-width: 60px !important;
        order: 2;
    }

    .manga-page-impl .el-slider.is-vertical .el-slider__input input {
        width: 100% !important;
    }

    /* 调整底部按钮布局 */
    .manga-page-impl .quickset-btn {
        flex-direction: column;
        gap: 8px;
    }

    .manga-page-impl .quickset-row {
        border: 1px solid #e4e7ed;
        margin-top: 10px;
        border-radius: 10%;
        padding: 10px 0px;
    }
}
</style>