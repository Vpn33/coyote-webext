import V2Model from './V2Model.js';
import V3Model from './V3Model.js';
export default {
    // 常量定义
    HZ_SLIDER: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 52,
        54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 85, 90, 95, 100, 110, 120,
        130, 140, 150, 160, 170, 180, 190, 200, 233, 266, 300, 333, 366, 400, 450, 500, 550,
        600, 700, 800, 900, 1000],
    STAGE_TIME_SLIDER: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 
                        1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 
                        2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000,
                        3100, 3200, 3300, 3400, 3500, 3600, 3700, 3800, 3900, 4000, 
                        4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000, 
                        5200, 5400, 5600, 5800, 6000, 6200, 6400, 6600, 6800, 7000, 
                        7200, 7400, 7600, 7800, 8000, 8500, 9000, 9500, 10000, 11000, 12000,
                        13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000,
                        23300, 26600, 30000, 33300, 36600, 40000, 45000, 50000, 55000,
                        60000, 70000, 80000, 90000, 100000, 120000, 140000, 160000, 
                        180000, 200000, 250000, 300000],
    WINDOW_TIME: 100,
    WINDOW_TIME_DOUBLE: 100,
    REST_MODE: { hz: 0, z: 0 },
    VIEW_TIME_TPL: '%02d:%02d:%02d',
    VIEW_SECOND_TPL: '%.0f',
    VIEW_SECOND_SUB_TPL: '%.2f',

    // 波形频率转换 波形文件中的频率是一个下标
    msToHz(ms) {
        if (ms < 0) {
            return this.HZ_SLIDER[0];
        }
        if (ms >= this.HZ_SLIDER.length) {
            return this.HZ_SLIDER[this.HZ_SLIDER.length - 1];
        }
        return this.HZ_SLIDER[ms];
    },

    // 通过索引获取频率值
    idx2StageTime(idx) {
        return this.STAGE_TIME_SLIDER[idx] || 1;
    },

    // 小节时长转换
    toStageTime(time) {
        return this.idx2StageTime(time);
    },

    // 生成V2波形
    genderV2Wave(info) {
        const v2ModelList = [];
        const stageList = info.stageList;
        for (const stage of stageList) {
            // 启用了小节就计算V2Model
            if (stage.enabled) {
                const stageList1 = this.stageV2Exchange(stage);
                v2ModelList.push(...stageList1);
            }
        }
        return v2ModelList;
    },

    // V2小节转换波形
    stageV2Exchange(stage) {
        const res = [];

        // 小节内元的数量
        const metaCnt = stage.metas.length;
        // 频率类型
        const hzType = stage.hzType;
        // 最小频率
        let hzMin;
        // 最大频率
        let hzMax;
        // 频率数组缓存
        let hzTemp = [];
        let hzArray = stage.getHz();
        // 每次渐变大小
        let grantNum = 0;
        // 小节循环次数
        let stageLoopCnt = stage.getTimes();
        // 高低频平衡
        let balance = 8;
        // 最后一个Z
        let lastZ = 0;
        let f638n = 1;
        let f640p = 99999;

        // 频率类型 频率类型 1-固定 2-节间渐变 3-元内渐变 4-元间渐变 5-阶梯渐变 6-每节随机 7-每元随机
        if (hzType == 1) {
            hzMin = 0;
            hzMax = hzArray[0];
        } else {
            // 渐变类型 0:小 -> 大 1:大 -> 小
            let hzGradient = stage.hzGradient ? stage.hzGradient : hzArray[0] - hzArray[1] >= 0 ? 1 : 0;
            if (hzGradient == 0) {
                hzMin = hzArray[1];// || 10;
                hzMax = hzArray[0];// || 1;
            } else {
                hzMin = hzArray[0];// || 1;
                hzMax = hzArray[1];// || 10;
            }
        }
        hzTemp = [hzMin, hzMax];

        for (let i = 1; i <= stage.getTimes(); i++) {
            for (const m of stage.metas) {
                hzMax = (hzTemp[1] * 20) + 1000;
                hzMin = (hzTemp[0] * 20) + 1000;
                // 计算小节时长 waveClassicBean2.getJ1()值域[0-100] i3 = (int) Math.ceil(Math.pow(((double) (waveClassicBean2.getJ1() + 1)) / 101.0d, 1.6d) * 100.0d);

                // 小节时长 (原本为滑块的小节时长按公式计算的，但这样会缺少部分时长，而且不能无限拓展 所以使用times参数 不再计算)
                // i3 = (int) Math.ceil(Math.pow(((double) (wa.getXiaojieshichang() + 1)) / 101.0d, 1.6d) * 100.0d);

                // f638n和f640p 未破解出是什么参数
                f638n = parseInt(Math.round((stageLoopCnt * (f638n - 1)) / f640p) + 1);
                if (f638n < 1) {
                    f638n = 1;
                }
                f640p = stageLoopCnt;

                // 计算下次渐变的大小
                grantNum = ((grantNum * metaCnt) + 1) / metaCnt;

                // 1-固定 2-节间渐变 3-元内渐变 4-元间渐变 5-阶梯渐变 6-每节随机 7-每元随机
                if (hzType === 4) {
                    if (stageLoopCnt > 1) {
                        hzMax += ((hzMin - hzMax) * (f638n - 1)) / (stageLoopCnt - 1);
                    }
                } else if (hzType === 3) {
                    hzMax = parseInt(hzMax + (((hzMin - hzMax) * ((metaCnt * grantNum) - 1)) / (metaCnt - 1)));
                } else if (hzType === 2) {
                    hzMax = parseInt(hzMax + (((((hzMin - hzMax)) * 1) * (((f638n + (((metaCnt * grantNum) - 1) / ((metaCnt - 1)))) - 1))) /
                        stageLoopCnt));
                }
                let frequency = parseInt(Math.pow(10, hzMax / 1000));
                lastZ = m.y;
                let x = parseInt(Math.pow((frequency) / 1000, 0.5) * balance);
                if (x < 1) {
                    x = 1;
                }
                let y = frequency - x;
                let v2Model = new V2Model(x, y, lastZ);
                res.push(v2Model);

                // 如果渐变>1说明小节内全部元都结束了 要重置渐变大小为0
                if (grantNum >= 1) {
                    grantNum = 0;
                    f638n++;
                    if (f638n > stageLoopCnt) {
                        f638n = 1;
                    } else {
                        continue;
                    }
                } else {
                    continue;
                }
            }
        }

        return res;
    },

    // 字符串转V2波形列表
    parseListStrToV2(str) {
        const t = str.replace(/\s/g, '').replace(/"\[{/g, '[{').replace(/\}]"/g, '}]').replace(/\\"/g, '"');
        return JSON.parse(t);
    },

    // 检查波形时长并补全
    checkWaveDurtime(time, msArray) {
        // 说明波形不够长 需要补全
        const waveDruTime = msArray.length * this.WINDOW_TIME;
        const minDurationTime = time;
        if (waveDruTime < minDurationTime) {
            // 计算持续时间内还可以放下几个波形 上取整  -1是去掉默认的
            let loopCnt = Math.floor(minDurationTime / waveDruTime) - 1;
            // 需要保证波形完整播放
            if (minDurationTime % waveDruTime > 0) {
                loopCnt += 1;
            }
            // 拷贝一个完整的数据
            const padList = [...msArray];
            // 补全剩余时间中的波形循环
            for (let i = 0; i < loopCnt; i++) {
                msArray.push(...padList);
            }
        }
    },
    getRoundIntValue(value) {
        return parseInt(Math.round(value));
    },

    // V2波形转V3波形
    v2ToV3(v2List) {
        let v3ModelList = [];
        for (const v2 of v2List) {
            // V3波形频率 = V2 (X + Y) 后，执行(10 ~ 1000) -> (10 ~ 240)的转化
            let hz = v2.x + v2.y;
            let v3Hz = 0;
            if (hz >= 10 && hz <= 100) {
                v3Hz = hz;
            } else if (hz >= 101 && hz <= 600) {
                v3Hz = (hz - 100) / 5 + 100;
            } else if (hz >= 601 && hz <= 1000) {
                v3Hz = (hz - 600) / 10 + 200;
            } else {
                v3Hz = 10;
            }

            // V3波形强度 = V2 (Z * 5)
            // let v3Z = this.getRoundIntValue(v2.z * 5);
            // pluse波形文件的z已经是V3的值了，这里不用再*5了 直接使用就可以
            let v3Z = v2.z;
            const v3 = new V3Model(v3Hz, v3Z);

            v3ModelList.push(v3);
        }
        return v3ModelList;
    },

    // 毫秒转换成可视化的时间格式
    msToViewTimeStr(milliseconds) {
        if (milliseconds < 1000) {
            return milliseconds + "毫秒";
        }
        if (milliseconds < 60000) {
            const seconds = milliseconds / 1000;
            const rounded = Math.round(seconds * 100) / 100;
            if (Math.round(rounded) - rounded === 0) {
                return Math.round(rounded) + "秒";
            }
            return rounded + "秒";
        }
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const remainingMillis = milliseconds - (hours * 1000 * 60 * 60);
        const minutes = Math.floor(remainingMillis / (1000 * 60));
        const seconds = Math.floor((remainingMillis - (minutes * 1000 * 60)) / 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    // 解析pulse文件内容为CtrlItem对象
    async parsePulseToCtrlItem(pulseName, pulseContent) {
        // 动态导入CtrlItem模块
        const { default: CtrlItem } = await import('./CtrlItem.js');

        const ctrlItem = new CtrlItem();

        // 移除换行符，将整个内容作为一行处理
        const content = pulseContent.trim().replace(/\n/g, '');

        // 例： Dungeonlab+pulse:0,1,16=59,20,39,1,1/100.00-1,100.00-1+section+69,0,38,1,1/65.00-1,65.00-1+section+19,0,37,1,1/100.00-1,100.00-1+section+72,0,39,1,1/0.00-1,0.00-1,100.00-1+section+20,0,40,1,1/100.00-1,100.00-1
        // 解析标题行
        if (content.startsWith('Dungeonlab+pulse:')) {
            // 分割基本信息和小节部分
            const parts = content.split('Dungeonlab+pulse:');

            if (parts.length === 2) {
                let pulseData = parts[1];
                if (pulseData.indexOf('=') < 0) {
                    // 休息时长
                    ctrlItem.restTime = 0;
                    // 播放速率
                    ctrlItem.rate = 1;
                    // 第三个值8/16都有 暂时未发现这个值有什么用 这里不解析
                } else {
                    const pulseDataParts = pulseData.split('=');
                    const itemInfo = pulseDataParts[0].split(',');
                    // 休息时长
                    ctrlItem.restTime = parseInt(itemInfo[0]);
                    // 播放速率
                    ctrlItem.rate = parseInt(itemInfo[1]);
                    // 继续解析后续的波形小节信息
                    pulseData = pulseDataParts[1];
                }

                // 使用+section+分割所有小节
                const sectionParts = pulseData.split('+section+');

                // 解析小节列表
                const stageList = [];

                // 每个sectionParts元素代表一个小节
                for (const sectionPart of sectionParts) {
                    if (sectionPart.trim()) { // 跳过空小节
                        const [sectionInfo, sectionMetas] = sectionPart.split('/');
                        const section = await this.parseStageData(sectionInfo, sectionMetas);
                        if (section) {
                            stageList.push(section);
                        }
                    }
                }

                // 设置节点列表
                ctrlItem.setStageList(stageList);

                // // 获取V3模型列表
                // if (stageList.length > 0) {
                //     ctrlItem.getV3ModelList();
                // }

                // 生成默认名称
                ctrlItem.setName(pulseName);

                // 计算总时长
                ctrlItem.getDuration();
            }
        }

        return ctrlItem;
    },
    // 解析单个小节的数据行
    async parseStageData(stageInfo, stageMetas) {
        // 创建小节对象
        const { default: WaveStage } = await import('./WaveStage.js');
        const stage = new WaveStage();

        // 解析小节的基本信息
        if (!stageInfo) {
            return null;
        }
        const stageParams = stageInfo.split(',');
        // 根据用户提供的规则，最少应该有5个参数
        if (stageParams.length < 5) {
            return null;
        }


        // 正确的解析顺序：
        // 频率值1,频率值2,小节时长,频率类型,小节状态
        // 计算频率范围
        const hzArray = [this.msToHz(stageParams[0]), this.msToHz(stageParams[1])];
        // 渐变类型 0:小 -> 大 1:大 -> 小
        const hzGradient = hzArray[0] - hzArray[1] >= 1 ? 1 : 0;
        let hzMin, hzMax;

        if (hzGradient === 1) {
            hzMin = hzArray[1];
            hzMax = hzArray[0];
        }

        // 设置频率数组
        stage.hzMin = hzMin;
        stage.hzMax = hzMax;
        stage.hzGradient = hzGradient;
        stage.hz = hzArray;
        // 小节时长(滑块)
        stage.stageTime = parseInt(stageParams[2]);
        // 频率类型 (1-固定 2-节间渐变 3-元内渐变 4-元间渐变)
        stage.hzType = parseInt(stageParams[3]);
        // 小节状态 0-禁用 1-启用
        stage.enabled = parseInt(stageParams[4]) === 1;

        // 解析元数据
        if (stageMetas) {
            const metaGroups = stageMetas.split(',');
            for (const metaGroup of metaGroups) {
                if (metaGroup) {
                    const metaParams = metaGroup.split('-');
                    if (metaParams.length >= 2) {
                        // 创建小节对象
                        const { default: WaveMeta } = await import('./WaveMeta.js');
                        const meta = new WaveMeta(parseInt(metaParams[0]), parseInt(metaParams[1]));
                        stage.metas.push(meta);
                    }
                }
            }
        }
        // 如果启用 才需要计算循环次数
        if (stage.enabled === 1 && stage.metas.length > 0) {
            // 小节持续时间
            const st = this.toStageTime(stage.stageTime);
            // 脉冲元 * 窗口时间 = 小节一次脉冲时间
            const metaTime = stage.metas.length * 100;
            // 上取整 就是小节循环次数
            stage.times = parseInt(Math.ceil(st / metaTime));
        }

        return stage;
    },
};

