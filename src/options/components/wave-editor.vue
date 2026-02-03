<template>
  <div class="wave-editor">
    <el-form ref="form" :model="localItem" label-width="20%">
      <input type="hidden" v-model="localItem.id" />
      <el-form-item label="名称">
        <el-input v-model="localItem.name"></el-input>
      </el-form-item>
      <el-form-item label="休息时长">
        {{ restTimeStr }}
        <el-slider v-model="localItem.restTime" :show-tooltip="false" :min="0" :max="100" :step="10"
          :format-tooltip="formatRestTime" @change="reduceTotalTime"></el-slider>
      </el-form-item>
      <el-form-item label="播放速率">
        <el-select v-model="localItem.rate" placeholder="请选择">
          <el-option label="X1" :value="1"></el-option>
          <el-option label="X2" :value="2"></el-option>
          <el-option label="X4" :value="4"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="最小播放次数">
        <el-slider v-model="localItem.minRuration" class="min-duration-slider" :show-tooltip="false" :min="1" :max="100" :step="1" show-input :show-input-controls="false"></el-slider>
      </el-form-item>
      <el-form-item label="波形总时长">
        {{ totalTimeStr + '秒'}}{{  localItem.minRuration > 0 ? '（最小播放时长：' + (localItem.minRuration * totalTimeStr).toFixed(1) + '秒）' : ''}}
      </el-form-item>
      <el-form-item label="双通道波形">
        <el-switch v-model="localItem.doubleChannel" @change="toggleDoubleChannel"></el-switch>
      </el-form-item>
      <el-form-item label="小节列表" v-if="!localItem.doubleChannel">
        <wave-stage key-name="channel_main" v-model="localItem.stageList"
          @change="(sl) => stageChange('main', sl)"></wave-stage>
      </el-form-item>
      <el-form-item label="A通道小节列表" v-if="localItem.doubleChannel">
        <wave-stage ref="waveStageA"  key-name="channel_a" v-model="localItem.stageA"
          @change="(sl) => stageChange('A', sl)"></wave-stage>
      </el-form-item>
      <el-form-item label="B通道小节列表" v-if="localItem.doubleChannel">
        <wave-stage ref="waveStageB" key-name="channel_b" v-model="localItem.stageB"
          @change="(sl) => stageChange('B', sl)"></wave-stage>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import _ from 'lodash';
import WaveUtil from '@/lib/WaveUtil';
import WaveStage from './wave-stage.vue';
export default {
  name: 'wave-editor',
  components: {
    WaveStage,
  },
  props: {
    item: {
      type: Object,
      default: () => {
        return {
          id: null,
          name: null,
          rate: 1,
          stageList: [{
            enabled: true,
            times: 1,
            hzType: 1,
            hzMin: 10,
            hzMax: 10,
            metas: [
              { "anchor": 1, "y": 100 },
              { "anchor": 1, "y": 100 }
            ]
          }]
        };
      }

    }
  },
  data: function () {
    return {
      restTimeStr: '0秒',
      totalTimeStr: '0',
      localItem: null, // 使用本地变量存储item的副本，避免直接修改prop
    }
  },
  methods: {
    reduceTotalTime() {
      // 每次都重新计算
      let duration = this.getChannelDurationTime();
      // 0 - 100 除10后向上取整 * 100变为毫秒
      let restTime = Math.ceil(parseFloat((this.localItem.restTime || 0) / 10)) * 100;
      this.localItem.totalTime = duration + restTime;
      this.totalTimeStr = (this.localItem.totalTime / 1000).toFixed(1);
    },
    getChannelDurationTime() {// 获取某个通道的小结时长
      // 如果是单通道 就只用stageList
      if (!this.localItem.doubleChannel) {
        return this.getStageListDurationTime(this.localItem.stageList || []);
      } else {
        // 如果是双通道 分别计算两个通道的时长，取较长的那个
        const durA = this.getStageListDurationTime(this.localItem.stageA || []);
        const durB = this.getStageListDurationTime(this.localItem.stageB || []);
        return durA > durB ? durA : durB;
      }
    },
    getStageListDurationTime(stageList) {
      let dur = 0;
      for (let stage of stageList) {
        if (stage.enabled) {
          // 计算小节循环测试
          let red = this.reduceTimes(stage.times, stage.metas);
          // 小节真实时长
          let rlt = red[1];
          dur += rlt * 1000;
        }
      }
      this.localItem.duration = dur;
      return dur;
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

    formatRestTime(val) {
      // 取值[0, 100] 步长10  = 0毫秒-1秒
      let restTimeStr = (val / 100).toFixed(1);
      this.restTimeStr = restTimeStr + '秒';
      return restTimeStr;
    },
    stageChange(channel, stageList) {
      if (channel === 'A') {
        this.localItem.stageA = _.cloneDeep(stageList);
      } else if (channel === 'B') {
        this.localItem.stageB = _.cloneDeep(stageList);
      } else {
        this.localItem.stageList = _.cloneDeep(stageList);
      }
      // 重新计算总时长
      this.reduceTotalTime();
    },

    beforeDestroy() {
      // 组件销毁前清除Vuex中的波形数据
      this.$store.dispatch('clearEditWaveItem')
    },
    getItem() {
      return this.localItem;
    },
    toggleDoubleChannel(newVal) {
      if (newVal) {
        // 切换到双通道时，如果stageA为空，则将stageList复制到stageA
        if (!this.localItem.stageA && !this.localItem.stageB) {
          // this.localItem.stageA = _.cloneDeep(this.localItem.stageList);
          this.$nextTick(() => {
            this.$refs.waveStageA.setList(_.cloneDeep(this.localItem.stageList));
          });
        }
      }

    },
  },
  created() {
    if (!this.item) {
      // 如果没有item 则初始化localItem
      this.localItem = this.$options.props.item.default();
    } else {
      this.localItem = _.cloneDeep(this.item);
    }
    // v3ModelList是播放时用的 编辑时不需要 
    this.$delete(this.localItem, 'v3ModelList');


  },
  mounted() {
    this.reduceTotalTime();
  }
}
</script>

<style>
.min-duration-slider .el-slider__input.el-input-number.is-without-controls .el-input {
  width: 100%;
}
</style>
