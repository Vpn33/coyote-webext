/**
 * @Author vpn_33
 * @Date 2024/5/11 17:03
 */
import WaveUtil from './WaveUtil.js';

// 模拟WavePoints类（根据实际使用情况可能需要调整）
class WavePoints {
  constructor() {
    // 这里可以根据实际需求添加属性和方法
  }
}

// 模拟ConverterUtil工具类
const ConverterUtil = {
  isNotEmpty: function(...values) {
    return values.every(value => value !== null && value !== undefined);
  }
};

export default class WaveStage {
  /**
   * 是否启用小节 小节状态 0-禁用 1-启用
   */
  enabled = false;
  
  /**
   * 频率类型 1-固定 2-节间渐变 3-元内渐变 4-元间渐变
   */
  hzType = 1;
  
  /**
   * 渐变类型 0-从小变大 1-从大变小
   */
  hzGradient = 0;
  
  hzMin = 0;
  hzMax = 0;
  
  /**
   * 频率数组
   */
  hz = null;
  
  /**
   * 小节循环次数
   */
  times = 0;
  
  /**
   * 小节时长(滑块)
   */
  stageTime = 0;
  
  /**
   * 小节总时长(完整播放小节所消耗时间)
   */
  stageTotalTime = 0;
  

  /**
   * 脉冲元列表
   */
  metas = [];


  /**
   * 获取频率数组
   */
  getHz() {
    if (!this.hz) {
      if (ConverterUtil.isNotEmpty(this.hzMin, this.hzMax)) {
        this.hz = [this.hzMin, this.hzMax];
      }
    }
    return this.hz;
  }

  /**
   * 设置小节时长
   */
  setStageTime(stageTime) {
    this.stageTime = stageTime;
  }

  /**
   * 获取小节总时长
   */
  getStageTotalTime() {
    const t = this.getTimes();
    // 脉冲元 * 窗口时间 = 小节一次脉冲时间
    const metaTime = this.metas.length * (WaveUtil.WINDOW_TIME || 100);
    this.stageTotalTime = t * metaTime;
    return this.stageTotalTime;
  }

  /**
   * 获取小节循环次数
   */
  getTimes() {
    if (this.enabled && this.metas.length > 0) {
      // 这是官方给定的转换公式 小节时长转毫秒公式
      const stageTime = WaveUtil.toStageTime(this.stageTime);
      // const st = Math.ceil(Math.pow(((stageTime + 1) / 101.0), 1.6) * 100.0) * 100;
      // pluse已经将小节时长改成slider的映射数值，非线性计算了 
      const st = stageTime;
      // 脉冲元 * 窗口时间 = 小节一次脉冲时间
      const metaTime = this.metas.length * (WaveUtil.WINDOW_TIME_DOUBLE || 100);
      // 上取整 就是小节循环次数
      this.times = Math.ceil(st / metaTime);
    }
    return this.times;
  }
}
