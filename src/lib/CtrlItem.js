import WaveUtil from './WaveUtil.js';

/**
 * 控制器组件类
 * 用于管理波形控制器的配置和计算
 */
export default class CtrlItem {
    constructor() {
        this.id = null;
        /** 是否双通道 */
        this.doubleChannel = false;

        /**
         * 创建时间
         */
        this.createDate = new Date();

        /**
         * 修改时间
         */
        this.updateDate = new Date();

        /**
         * 组件名称
         */
        this.name = '';

        /**
         * 持续总时间 (毫秒)（波形完整播放一次的时间）
         */
        this.duration = 0;

        /**
         * 播放速率 x1 x2 x4
         */
        this.rate = 1;

        /**
         * 休息时长
         */
        this.restTime = 0;

        /**
         * 最小播放时长(如果该值比duration大，则会按照时间补全波形输出)
         */
        this.minRuration = 0;

        /**
         * 节点列表
         */
        this.stageList = [];

        /**
         * 通道A节点列表
         */
        this.stageA = [];
        /**
         * 通道B节点列表
         */
        this.stageB = [];

        /**
         * V3脉冲元节点列表
         */
        this.v3ModelList = null;

    }


    /**
     * 获取持续总时间
     * 每次调用都会重新计算
     * @returns {number} 持续总时间(毫秒)
     */
    getDuration() {
        const stages = this.getStageList();
        if (stages && stages.length > 0) {
            let dur = 0;
            for (const stage of stages) {
                if (stage.enabled) {
                    dur += stage.getStageTotalTime();
                }
            }
            // 单位毫秒
            this.duration = dur;
        }
        return this.duration;
    }

    /**
     * 获取V3模型列表
     * 每次调用都会重新计算
     * @returns {Array} V3模型列表
     */
    getV3ModelList() {
        if (this.doubleChannel === true) {
            return {
                a: this.getV3ModelListByChannel(this.stageA),
                b: this.getV3ModelListByChannel(this.stageB)
            };
        } else {
            if (this.stageList && this.stageList.length > 0) {
                this.v3ModelList = this.getV3ModelListByChannel(this.stageList);
            }
        }
        return this.v3ModelList;
    }

    getV3ModelListByChannel(stList) {
        const v2ModelList = [];
        for (const stage of stList) {
            // 启用了小节就计算V2Model
            if (stage.enabled) {
                const stageList = WaveUtil.stageV2Exchange(stage);
                v2ModelList.push(...stageList);
            }
        }
        if(this.restTime > 0) {
            // 除10 计算休息时长需要循环几次 每次100毫秒
            let restTemp = this.restTime / 10;
            for(let i = 0; i < restTemp; i++) {
                let v2Model = new V2Model(5, 95, 0);
                v2ModelList.push(v2Model);
            }
        }
        return WaveUtil.v2ToV3(v2ModelList);
    }

    /**
     * 获取总时间（包含休息时间）
     * 每次调用都会重新计算
     * @returns {number} 总时间(毫秒)
     */
    getTotalTime() {
        // 每次都重新计算
        const totalTime = this.getDuration();
        // 0 - 100
        const restTime = this.getRestTime();
        // 除10后向上取整 * 100变为毫秒
        const restMs = Math.ceil(restTime / 10) * 100;
        return totalTime + restMs;
    }

    /**
     * 获取总时间的字符串表示
     * @returns {string} 格式化的时间字符串
     */
    getTotalTimeStr() {
        return WaveUtil.msToViewTimeStr(this.getTotalTime());
    }

    /**
     * 获取ID
     * @returns {string} ID
     */
    getId() {
        return this.id;
    }

    /**
     * 设置ID
     * @param {string} id - 要设置的ID
     */
    setId(id) {
        this.id = id;
    }

    /**
     * 获取创建时间
     * @returns {Date} 创建时间
     */
    getCreateDate() {
        return this.createDate;
    }

    /**
     * 设置创建时间
     * @param {Date|string} date - 要设置的创建时间
     */
    setCreateDate(date) {
        if (typeof date === 'string') {
            this.createDate = new Date(date);
        } else {
            this.createDate = date;
        }
    }

    /**
     * 获取修改时间
     * @returns {Date} 修改时间
     */
    getUpdateDate() {
        return this.updateDate;
    }

    /**
     * 设置修改时间
     * @param {Date|string} date - 要设置的修改时间
     */
    setUpdateDate(date) {
        if (typeof date === 'string') {
            this.updateDate = new Date(date);
        } else {
            this.updateDate = date;
        }
    }

    /**
     * 获取组件名称
     * @returns {string} 组件名称
     */
    getName() {
        return this.name;
    }

    /**
     * 设置组件名称
     * @param {string} name - 要设置的组件名称
     */
    setName(name) {
        this.name = name;
    }

    /**
     * 获取播放速率
     * @returns {number} 播放速率
     */
    getRate() {
        return this.rate;
    }

    /**
     * 设置播放速率
     * @param {number} rate - 要设置的播放速率
     */
    setRate(rate) {
        this.rate = rate;
    }

    /**
     * 获取休息时长
     * @returns {number} 休息时长
     */
    getRestTime() {
        return this.restTime;
    }

    /**
     * 设置休息时长
     * @param {number} restTime - 要设置的休息时长
     */
    setRestTime(restTime) {
        this.restTime = restTime;
    }

    /**
     * 获取最小播放时长
     * @returns {number} 最小播放时长
     */
    getMinRuration() {
        return this.minRuration;
    }

    /**
     * 设置最小播放时长
     * @param {number} minRuration - 要设置的最小播放时长
     */
    setMinRuration(minRuration) {
        this.minRuration = minRuration;
    }

    /**
     * 获取节点列表
     * @returns {Array} 节点列表
     */
    getStageList() {
        return this.stageList;
    }

    /**
     * 设置节点列表
     * @param {Array} stageList - 要设置的节点列表
     */
    setStageList(stageList) {
        this.stageList = stageList;
    }

    /**
     * 格式化日期为指定格式
     * @param {Date} date - 要格式化的日期
     * @returns {string} 格式化后的日期字符串 (yyyy/MM/dd HH:mm:ss)
     */
    formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * 获取格式化的创建时间
     * @returns {string} 格式化的创建时间字符串
     */
    getFormattedCreateDate() {
        return this.formatDate(this.createDate);
    }

    /**
     * 获取格式化的修改时间
     * @returns {string} 格式化的修改时间字符串
     */
    getFormattedUpdateDate() {
        return this.formatDate(this.updateDate);
    }

    /**
     * 克隆当前对象
     * @returns {CtrlItem} 克隆的对象
     */
    clone() {
        const cloned = new CtrlItem();
        for (const key in this) {
            if (this.hasOwnProperty(key)) {
                if (key === 'createDate' || key === 'updateDate') {
                    cloned[key] = new Date(this[key]);
                } else if (key === 'stageList' && this[key]) {
                    cloned[key] = JSON.parse(JSON.stringify(this[key]));
                } else {
                    cloned[key] = this[key];
                }
            }
        }
        return cloned;
    }
}