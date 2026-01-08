<template>
    <div class="wave-stage-container">
        <div v-for="(model, idx) in stageList" :key="'item_stage_' + keyName + '_' + idx" class="wave-stage">
            <div :class="model.enabled ? '' : 'state-closed'">
                <div class="stage-item">
                    <el-row type="flex" class="stage-item-title">
                        <el-col :span="12">
                            <div class="stage-index">{{ '第' + (idx + 1) + '小节' }}</div>

                        </el-col>
                        <el-col :span="12" class="stage-item-tools">
                            <el-switch v-if="idx > 0" v-model="model.enabled" @change="stageChange"></el-switch>
                            <el-button type="danger" @click="deleteStage(idx)" icon="el-icon-delete"></el-button>
                        </el-col>
                    </el-row>
                </div>
                <div class="stage-item" v-if="model.enabled">
                    <div>
                        <el-row type="flex">
                            <el-col :span="12">
                                <span>脉冲频率:</span> {{ getHzStr(model.hz) }}
                            </el-col>
                            <el-col :span="12" class="stage-item-tools">
                                <el-select v-model="model.hzType" placeholder="请选择类型"
                                    @change="hzTypeChange(idx, model.hzType)">
                                    <el-option label="固定" :value="1"></el-option>
                                    <el-option label="节间渐变" :value="2"></el-option>
                                    <el-option label="元内渐变 " :value="3"></el-option>
                                    <el-option label="元间渐变" :value="4"></el-option>
                                </el-select>
                            </el-col>
                        </el-row>
                        <el-row type="flex" class="stage-item-component">
                            <el-col :span="24">
                                <el-slider v-if="model.hzType == 1" v-model="model.hz" :min="10" :max="1000"
                                    @change="changeHz(model.hz, idx)">
                                </el-slider>
                                <el-slider v-else v-model="model.hz" range :min="10" :max="1000"
                                    @change="changeHz(model.hz, idx)">
                                </el-slider>
                            </el-col>
                        </el-row>
                    </div>
                    <div v-if="model.hzType > 1">
                        <el-row type="flex">
                            <el-col :span="12">
                                <span>渐变类型:</span> {{ model.hzGradient == 1 ? '大 -> 小' : '小 -> 大' }}
                            </el-col>
                            <el-col :span="12" class="stage-item-tools">
                                <el-button type="primary" @click="toggleHzGradient(idx)" v-if="model.hzGradient == 1"
                                    icon="el-icon-bottom-right"></el-button>
                                <el-button type="primary" @click="toggleHzGradient(idx)" v-else="model.hzGradient==0"
                                    icon="el-icon-top-right"></el-button>
                            </el-col>
                        </el-row>
                    </div>
                    <div>
                        <el-row type="flex">
                            <el-col :span="12">
                                <span>脉冲元形状:</span> {{ getMetaStr(model.metas) }}
                            </el-col>
                            <el-col :span="12" class="stage-item-tools">
                                <el-button-group>
                                    <el-button type="primary" icon="el-icon-minus" @click="minMetas(idx)"></el-button>
                                    <el-button type="primary" icon="el-icon-plus" @click="addMetas(idx)"></el-button>
                                </el-button-group>
                            </el-col>
                        </el-row>
                        <el-row type="flex" class="stage-item-component stage-item-x-over">
                            <div v-for="(point, mtIdx) in model.metas" class="meta-list">
                                <el-button v-if="point?.anchor == 1" type="text" icon="el-icon-close"
                                    @click="setAutoAnchor(idx, mtIdx)"></el-button>
                                <el-button v-else type="text" class="none-btn">&nbsp;</el-button>
                                <el-slider @change="zChange(idx, mtIdx)" :ref="'stage_' + idx + '_meta_' + mtIdx"
                                    :class="(mtIdx == 0 || point?.anchor) == 1 ? 'metas-munal' : 'metas-auto'"
                                    v-model="point.y" vertical height="100px" :min="0" :max="100"></el-slider>
                            </div>
                        </el-row>
                        <el-row type="flex">
                            <el-col :span="12">
                                <span>小节时长:</span> {{ getStageTimeStr(model.stageTime, model.metas) }}
                            </el-col>
                            <el-col :span="12" class="stage-item-tools">
                                <el-slider v-model="model.stageTime" :min="1" :max="100" @change="stageChange">
                                </el-slider>
                            </el-col>
                        </el-row>
                    </div>
                </div>
            </div>
        </div>
        <div class="stage-btn">
            <el-button type="primary" @click="addStage" icon="el-icon-plus">添加小节</el-button>
        </div>
    </div>
</template>
<script>
import _ from 'lodash';
import WaveUtil from '@/lib/WaveUtil';
export default {
    name: 'wave-stage',
    props: {
        keyName: {
            type: String,
            default: ''
        },
        value: {
            type: Array,
            default: () => ([
                {
                    enabled: true,
                    times: 1,
                    hzType: 1,
                    hzMin: 10,
                    hzMax: 100,
                    hz: [10, 100],
                    metas: [
                        { "anchor": 1, "y": 100 },
                        { "anchor": 1, "y": 100 }
                    ]
                }
            ])
        }
    },
    data() {
        return {
            stageList: [],
            hzArr: [],
        }
    },
    watch: {
        value: {
            handler(newVal) {
                // 当model属性变化时，更新stageList
                if (newVal === undefined || newVal === null) {
                    this.stageList = _.cloneDeep(this.$options.props.model.default());
                } else {
                    this.stageList = _.cloneDeep(newVal);
                }
                // 重新计算频率
                this.setHz();
            },
            deep: true
        }
    },
    methods: {
        setList(stageList, channel) {
            this.stageList = stageList;
            // 重新计算频率
            this.setHz();
            this.stageChange();
        },
        reduceTimes(stageTime, metas) {
            // 上取整就是小节循环次数
            let st = WaveUtil.idx2StageTime(stageTime) / 1000;
            // 小节真实时长
            let metaTime = parseFloat((metas.length * 0.1).toFixed(1));
            let times = Math.ceil(st / metaTime);
            let rlt = (metaTime * times).toFixed(1);
            return [st, rlt];
        },
        getStageTimeStr(stageTime, metas) {
            // 计算小节循环测试
            let red = this.reduceTimes(stageTime, metas);
            // 小节滑块时长
            let st = red[0];
            // 小节真实时长
            let rlt = red[1];
            return st + '秒' + '(' + rlt + '秒)';
        },
        stageChange() {
            this.$emit('change', this.stageList);
        },
        getMetaStr(metas) {
            return (metas.length * 0.1).toFixed(1) + '秒';
        },
        minMetas(idx) {
            let lastIdx = this.stageList[idx].metas.length - 1;
            let preIdx = lastIdx - 1;
            // 把上一个节点变成手动的
            this.$set(this.stageList[idx].metas[preIdx], 'anchor', 1);
            this.$set(this.stageList[idx].metas[preIdx], 'y', this.stageList[idx].metas[lastIdx].y);
            this.stageList[idx].metas.splice(lastIdx, 1);
            this.zChange(idx, preIdx);
            this.stageChange();
        },
        addMetas(idx) {
            let preIdx = this.stageList[idx].metas.length - 1;
            let mtIdx = preIdx + 1;
            // 把上一个节点变成自动的
            let preY = this.stageList[idx].metas[preIdx].y;
            this.$set(this.stageList[idx].metas[preIdx], 'anchor', 0);
            // 最后添加的节点为手动的
            this.stageList[idx].metas.push({
                "anchor": 1, "x": mtIdx, "y": preY
            })
            this.zChange(idx, mtIdx);
            this.stageChange();
        },
        zChange(modeIdx, metaIdx) {
            let tar = this.stageList[modeIdx].metas[metaIdx];
            this.$set(tar, 'anchor', 1);
            this.getSblingAutoPoint(modeIdx, metaIdx);
        },
        getSblingAutoPoint(modeIdx, metaIdx) {
            // 获取当前节点
            let tar = this.stageList[modeIdx].metas[metaIdx];
            let startNode = null; // 左侧起始点
            let endNode = null; // 右侧结束点
            // 节点左侧的自动计算节点数组
            let lChangeIdx = [];
            //  节点右侧的自动计算节点数组
            let rChangeIdx = [];
            // 获取左侧自动计算的节点
            let li = metaIdx - 1;
            // 如果左侧一个节点都没有 就跳过
            if (li >= 0) {
                for (li; li >= 0; li--) {
                    let tmp = Object.assign({}, this.stageList[modeIdx].metas[li]);
                    // 如果只要遇到一个手动调节的 就返回
                    if (tmp.anchor == 1) {
                        startNode = tmp;
                        break;
                    }
                    if (tmp.anchor == 0) {
                        lChangeIdx.push({ idx: li, meta: tmp });
                    }
                }
            }
            // 左侧计算时是反序的 这里要正过来
            if (lChangeIdx.length > 0) {
                lChangeIdx = lChangeIdx.reverse();
            }
            // 如果左侧没有节点 那么就设置开始节点是自己
            if (!startNode) {
                startNode = tar;
            }
            // 获取右侧自动计算的节点
            let ri = metaIdx + 1;
            // 如果右侧一个节点都没有 就跳过
            if (ri <= this.stageList[modeIdx].metas.length - 1) {
                for (ri; ri < this.stageList[modeIdx].metas.length; ri++) {
                    let tmp = Object.assign({}, this.stageList[modeIdx].metas[ri]);
                    // 如果第一个节点就不是 就全部跳过
                    // 如果只要遇到一个手动调节的 就返回 并保存这个y值
                    if (tmp.anchor == 1) {
                        endNode = tmp;
                        break;
                    }
                    if (tmp.anchor == 0) {
                        rChangeIdx.push({ idx: ri, meta: tmp });
                    }
                }
            }
            // 如果右侧没有节点 那么就设置结束节点是自己
            if (!endNode) {
                endNode = tar;
            }

            // 如果当前节点是自动的
            if (tar.anchor == 0) {
                // 自己也在自动计算的列表中
                rChangeIdx.splice(0, 0, { idx: metaIdx, meta: tar })
                // 左右侧列表合并成一个
                let allNode = lChangeIdx.concat(rChangeIdx);
                // 计算平均变化值
                let autoExcY = (startNode.y - endNode.y) / (allNode.length + 1);
                this.changePoints(autoExcY, startNode.y, modeIdx, allNode);
            } else {
                if (lChangeIdx.length > 0) {
                    // 计算节点左侧平均变化值
                    let lAutoExcY = (startNode.y - tar.y) / (lChangeIdx.length + 1);
                    // 改变左侧列表
                    this.changePoints(lAutoExcY, startNode.y, modeIdx, lChangeIdx);
                }

                if (rChangeIdx.length > 0) {
                    // 计算节点右侧平均变化值
                    let rAutoExcY = (tar.y - endNode.y) / (rChangeIdx.length + 1);
                    // 改变左侧列表
                    this.changePoints(rAutoExcY, tar.y, modeIdx, rChangeIdx);
                }
            }
        },
        changePoints(autoExcY, startY, modeIdx, changeList) {
            // 将变化值转为绝对值
            let absCY = Math.abs(autoExcY);
            let loopCnt = 1;
            for (let cm of changeList) {
                let tmpZ;
                // 如果变化值是大于0 就是从大->小
                if (autoExcY > 0) {
                    tmpZ = startY - (loopCnt * absCY);
                } else {
                    tmpZ = startY + (loopCnt * absCY);
                }
                tmpZ = parseInt(tmpZ);
                // 如果超过范围则设置成界限值
                if (tmpZ < 0) {
                    tmpZ = 0;
                }
                if (tmpZ > 100) {
                    tmpZ = 100;
                }
                this.$set(this.stageList[modeIdx].metas[cm.idx], 'y', tmpZ);
                loopCnt++;
            }
        },
        setAutoAnchor(modeIdx, metaIdx) {
            let tar = this.stageList[modeIdx].metas[metaIdx];
            this.$set(tar, 'anchor', 0);
            this.getSblingAutoPoint(modeIdx, metaIdx);
        },
        getHzStr(hz) {
            if (hz instanceof Array) {
                return hz[0] + 'ms - ' + hz[1] + 'ms';
            }
            return hz + 'ms';
        },

        toggleHzGradient(idx) {
            let hzGradient = this.stageList[idx].hzGradient;
            if (!hzGradient || 0 == hzGradient) {
                hzGradient = 1;
            } else {
                hzGradient = 0;
            }
            this.$set(this.stageList[idx], 'hzGradient', hzGradient);
        },
        hzTypeChange(idx, type) {
            // 从缓存中获取最大和最小值
            this.$set(this.stageList[idx], 'hzMin', this.hzArr[idx][0]);
            this.$set(this.stageList[idx], 'hzMax', this.hzArr[idx][1]);
            // 如果是固定 就取第一个
            if (type == 1) {
                this.$set(this.stageList[idx], 'hz', this.hzArr[idx][0]);
            } else {
                this.$set(this.stageList[idx], 'hz', this.hzArr[idx]);
            }
        },
        changeHz(hz, idx) {
            if (hz instanceof Array) {
                this.$set(this.stageList[idx], 'hzMin', hz[0]);
                this.$set(this.stageList[idx], 'hzMax', hz[1]);
                this.hzArr[idx] = hz;
            } else {
                this.$set(this.stageList[idx], 'hzMin', hz);
                this.hzArr[idx][0] = hz;
            }
            this.$set(this.stageList[idx], 'hz', hz);
        },

        setHz() {
            if (this.stageList && this.stageList.length > 0) {
                // 如果是固定频率 要把hz设置成 一个值 否则页面显示不正确
                let idx = 0;
                for (let stage of this.stageList) {
                    // 将各个小节的频率范围缓存起来
                    this.hzArr[idx] = [stage.hzMin, stage.hzMax];
                    // 如果是固定的 要改变hz
                    if (stage.hzType === 1) {
                        // 将各个小节的频率范围缓存起来
                        stage.hz = this.hzArr[idx][0];
                    }
                    idx++;
                }
            }
        },
        addStage() {
            if (!this.stageList) {
                this.stageList = [];
            }
            this.stageList.push({
                enabled: true,
                hzType: 1,
                hz: 10,
                balance: 8,
                metas: [
                    { "anchor": 1, "y": 20 },
                    { "anchor": 1, "y": 20 }
                ]
            });
            this.stageChange();
        },

        deleteStage(idx) {
            if (1 == this.stageList.length) {
                this.$message({
                    message: '至少保留一个小节',
                    type: 'error',
                });
                return;
            }
            this.stageList.splice(idx, 1);
            this.stageChange();
        },
    },
    created() {
        // 只有当model是undefined或null时才使用默认值，空数组也应该被接受
        if (this.value === undefined || this.value === null || this.value.length === 0) {
            this.stageList = _.cloneDeep(this.$options.props.value.default());
        } else {
            this.stageList = _.cloneDeep(this.value);
        }
        console.log(this.keyName + " is inited!", this.stageList);
    },

    mounted() {
        // 计算频率
        this.setHz();
        // 计算总时长
        // this.stageChange();

    }
}
</script>
<style>
.wave-stage-container {
    display: flex;
    overflow-x: auto;
    gap: 1rem;
    padding: 1rem 0;
}

.wave-stage {
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #fff;
    padding: 1rem;
    min-width: 350px;
    height: auto;
    flex-shrink: 0;
}

.stage-item {
    padding: 0.5rem 0;
}

.stage-item-title {
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
}

.stage-item-tools {
    text-align: right;
}

.stage-item-component {
    padding: 0.5rem 0;
}

.stage-index {
    font-weight: bold;
    font-size: 1.1rem;
}

.meta-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 0.5rem;
}

.meta-list:last-child {
    margin-right: 0;
}

.metas-munal {}

div.metas-auto .el-slider__button {
    /* 移除圆角，使滑块变成方形 */
    border-radius: 0;
}

.none-btn {
    visibility: hidden;
}

.state-closed .stage-item:not(:first-child) {
    display: none;
}

.state-closed .stage-item-title {
    border-bottom: none;
    margin-bottom: 0;
}

.stage-item-x-over {
    max-width: 100%;
    overflow-x: auto;
}

.stage-btn {
    text-align: center;
    margin-top: 1rem;
}
</style>
