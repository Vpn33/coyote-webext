let bookId = null;
let bookName = null;
let currentPage = null;
// 电源开关状态
let aPowerOn = false;
let bPowerOn = false;
// 存储滑块的当前值，用于在电源关闭时恢复
let currentAValue = 0;
let currentBValue = 0;
// 页面加载完成后初始化
function initializeExtension() {
    if (!bookId) {
        const params = getUrlParams();
        bookId = params.id;
        bookName = document.querySelector('.el-popover__reference').textContent.trim();
    }
    // 初始化编辑按钮
    initEditBtn();

    // 初始化脚本显示
    initScriptView();

    // 初始化Coyote设备按钮
    initCoyoteDeviceBtn();

    // 初始化消息监听
    initCoyoteWebextMessage();

    // 加载脚本
    loadScript();

    // 监控翻页
    initWatchPage();

    // 监控页面关闭
    initClosePage();

}
function initClosePage() {
    // 监控页面关闭
    window.addEventListener('beforeunload', (event) => {
        callRemoteMethod('close', { bookId });
    });
}
function initCoyoteWebextMessage() {
    // 监听来自扩展的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'updatePowerIntensity') {
            // 更新电源强度
            const { powerA, powerB } = request.data;
            if (powerA !== undefined) {
                const aSlider = document.querySelector('input[type="range"]');
                if (aSlider) {
                    aSlider.value = powerA;
                    currentAValue = powerA;
                    const aValue = aSlider.parentElement.querySelector('div:nth-child(3)');
                    if (aValue) {
                        aValue.textContent = (powerA) + '%';
                    }
                }
            }
            if (powerB !== undefined) {
                const sliders = document.querySelectorAll('input[type="range"]');
                if (sliders.length > 1) {
                    const bSlider = sliders[1];
                    bSlider.value = powerB;
                    currentBValue = powerB;
                    const bValue = bSlider.parentElement.querySelector('div:nth-child(3)');
                    if (bValue) {
                        bValue.textContent = (powerB) + '%';
                    }
                }
            }
        }
    });
}
function initWatchPage() {
    // 使用MutationObserver监听页面变化 分页信息会根据这个值进行变化
    const observer = new MutationObserver((mutations) => {
        console.log('mutations', mutations);
        for (const mutation of mutations) {
            if (mutation.type === 'characterData') {
                // 分页信息格式 1/100
                const pageInfo = mutation.target.data;
                if (triggerPage(pageInfo)) {
                    break;
                }
            }
        }
    });
    observer.observe(document.querySelector('#app .book-header'), {
        childList: true,
        subtree: true,
        // attributes: true,
        characterData: true
    });

    // 监控只能影响到分页信息的变化，初始化的页面也需要触发
    // 分页信息格式 1/100
    const pageInfo = document.querySelectorAll('#app .book-header > span')[2].textContent;
    triggerPage(pageInfo);
}

function triggerPage(pageInfo) {
    if (pageInfo.indexOf('/') > 0) {
        const page = pageInfo.split('/')[0];
        currentPage = page;
        callRemoteMethod('play', { bookId, page }).then((response) => {
            if (response?.code === '000') {
                const currentPageScript = response?.data;
                if (currentPageScript) {
                    document.getElementById('scriptView').textContent = currentPageScript;
                }
            }
        });
        return true;
    }
    return false;
}

function loadScript() {
    try {
        if (bookId) {
            callRemoteMethod('load', { bookId })
                .then((response) => {
                    if (response?.msg === 'success') {
                        // 加载设备电量
                        loadDeviceBattery();
                        message('✅脚本加载成功');
                    } else if (response?.msg === 'noneScript') {
                        message('⚠️您还没有设置脚本');
                    }
                });
        }
    } catch (error) {
    }
}
function message(msg) {
    var messageBox = document.createElement('div');
    messageBox.id = 'messageBox_' + bookId;
    messageBox.innerHTML = '<span style="margin-right: 8px;">' + msg + '</span>'; // 设置消息内容和警告图标
    messageBox.style.position = 'fixed';
    messageBox.style.top = '10px';
    messageBox.style.left = '50%';
    messageBox.style.transform = 'translateX(-50%)';
    messageBox.style.zIndex = '9999';
    messageBox.style.padding = '10px 20px';
    messageBox.style.backgroundColor = '#fff3cd';
    messageBox.style.color = '#856404';
    messageBox.style.border = '1px solid #ffeeba';
    messageBox.style.borderRadius = '4px';
    messageBox.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    messageBox.style.fontSize = '14px';
    messageBox.style.lineHeight = '1.5';
    messageBox.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    document.body.appendChild(messageBox);
    setTimeout(function () { // 在一段时间后删除
        document.body.removeChild(messageBox);
    }, 3000); // 3秒后自动隐藏
}

function callRemoteMethod(method, params) {
    try {
        if (bookId) {
            return sendMsg({ action: method, ...params });
        }
    } catch (error) {
    }
}

function sendMsg(msg) {
    try {
        // 发送消息给后台脚本
        return chrome.runtime.sendMessage(msg).then((response) => {
            if (response?.code === '001') {
                message('执行脚本报错：⚠️' + (response?.msg || 'playError'));
            }
            return response;
        }).catch((error) => {
            // DO Nothing
        });
    } catch (error) {
        // DO Nothing
    }
}

function initEditBtn() {
    const playBtn = document.createElement('button');
    playBtn.textContent = '脚本编辑';
    playBtn.style.position = 'fixed';
    playBtn.style.top = '10px';
    playBtn.style.left = '10px';
    playBtn.style.zIndex = '9999';
    playBtn.style.padding = '5px 10px';
    playBtn.style.backgroundColor = '#007bff';
    playBtn.style.color = '#fff';
    playBtn.style.border = 'none';
    playBtn.style.borderRadius = '5px';
    playBtn.style.cursor = 'pointer';
    document.body.appendChild(playBtn);
    playBtn.addEventListener('click', () => {
        if (bookId) {
            callRemoteMethod('edit', { bookId, bookName });
        }
    });
}

function initScriptView() {
    const playBtn = document.createElement('pre');
    playBtn.id = 'scriptView';
    playBtn.textContent = '脚本内容';
    playBtn.style.fontFamily = 'monospace';
    playBtn.style.fontSize = '0.6rem';
    playBtn.style.position = 'fixed';
    playBtn.style.maxHeight = '200px';
    playBtn.style.overflowY = 'auto';
    playBtn.style.top = '50px';
    playBtn.style.left = '10px';
    playBtn.style.zIndex = '9998';
    playBtn.style.padding = '2px 2px';
    playBtn.style.color = 'rgb(121 121 121)';
    playBtn.style.cursor = 'pointer';
    document.body.appendChild(playBtn);
}

function getUrlParams() {
    const url = window.location.href;
    const regex = /[?&]([^=#]+)=([^&#]*)/g;
    let params = {};
    let match;
    while ((match = regex.exec(url))) {
        params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
    }
    return params;
}
// 首次加载时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}

function initCoyoteDeviceBtn() {
    // 创建Coyote设备按钮
    const deviceBtn = document.createElement('button');
    deviceBtn.textContent = '设备信息';
    deviceBtn.style.position = 'fixed';
    deviceBtn.style.top = '10px';
    deviceBtn.style.left = '100px';
    deviceBtn.style.zIndex = '9997';
    deviceBtn.style.padding = '5px 10px';
    deviceBtn.style.backgroundColor = '#28a745';
    deviceBtn.style.color = '#fff';
    deviceBtn.style.border = 'none';
    deviceBtn.style.borderRadius = '5px';
    deviceBtn.style.cursor = 'pointer';
    document.body.appendChild(deviceBtn);

    // 创建设备面板
    const devicePanel = document.createElement('div');
    devicePanel.id = 'coyoteDevicePanel';
    devicePanel.style.position = 'fixed';
    devicePanel.style.top = '50px';
    devicePanel.style.left = '10px';
    devicePanel.style.zIndex = '9999';
    devicePanel.style.padding = '15px';
    devicePanel.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
    devicePanel.style.border = '1px solid #ddd';
    devicePanel.style.borderRadius = '5px';
    devicePanel.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    devicePanel.style.display = 'none';
    devicePanel.style.minWidth = '200px';
    devicePanel.style.maxWidth = '400px';

    // 设备电量显示
    const batteryInfo = document.createElement('div');
    batteryInfo.id = 'batteryInfo';
    batteryInfo.textContent = '设备电量: -';
    batteryInfo.style.marginBottom = '10px';
    batteryInfo.style.fontSize = '14px';
    devicePanel.appendChild(batteryInfo);

    // 电源强度控制区域
    const powerControl = document.createElement('div');
    powerControl.style.display = 'flex';
    powerControl.style.justifyContent = 'space-around';
    powerControl.style.height = '160px';

    // A通道电源强度
    const aChannel = document.createElement('div');
    aChannel.style.display = 'flex';
    aChannel.style.flexDirection = 'column';
    aChannel.style.alignItems = 'center';
    aChannel.style.height = '100%';
    aChannel.style.justifyContent = 'flex-end';

    const aLabel = document.createElement('div');
    aLabel.textContent = 'A电源强度';
    aLabel.style.fontSize = '12px';
    aLabel.style.marginBottom = '5px';
    aChannel.appendChild(aLabel);

    const aSlider = document.createElement('input');
    aSlider.type = 'range';
    aSlider.min = '0';
    aSlider.max = '100';
    aSlider.value = '0';
    aSlider.style.width = '100px';
    aSlider.style.height = '120px';
    aSlider.style.transform = 'rotate(270deg)';
    aSlider.style.margin = '20px 0';
    aChannel.appendChild(aSlider);

    const aValue = document.createElement('div');
    aValue.textContent = '0%';
    aValue.style.fontSize = '12px';
    aValue.style.marginTop = '5px';
    aChannel.appendChild(aValue);

    // A通道开关按钮
    const aPowerBtn = document.createElement('button');
    aPowerBtn.textContent = '开始';
    aPowerBtn.id = 'aPowerBtn';
    aPowerBtn.style.marginTop = '5px';
    aPowerBtn.style.padding = '3px 8px';
    aPowerBtn.style.backgroundColor = '#28a745';
    aPowerBtn.style.color = '#fff';
    aPowerBtn.style.border = 'none';
    aPowerBtn.style.borderRadius = '3px';
    aPowerBtn.style.fontSize = '10px';
    aPowerBtn.style.cursor = 'pointer';
    aChannel.appendChild(aPowerBtn);

    powerControl.appendChild(aChannel);

    // B通道电源强度
    const bChannel = document.createElement('div');
    bChannel.style.display = 'flex';
    bChannel.style.flexDirection = 'column';
    bChannel.style.alignItems = 'center';
    bChannel.style.height = '100%';
    bChannel.style.justifyContent = 'flex-end';

    const bLabel = document.createElement('div');
    bLabel.textContent = 'B电源强度';
    bLabel.style.fontSize = '12px';
    bLabel.style.marginBottom = '5px';
    bChannel.appendChild(bLabel);

    const bSlider = document.createElement('input');
    bSlider.type = 'range';
    bSlider.min = '0';
    bSlider.max = '100';
    bSlider.value = '0';
    bSlider.style.width = '100px';
    bSlider.style.height = '120px';
    bSlider.style.transform = 'rotate(270deg)';
    bSlider.style.margin = '20px 0';
    bChannel.appendChild(bSlider);

    const bValue = document.createElement('div');
    bValue.textContent = '0%';
    bValue.style.fontSize = '12px';
    bValue.style.marginTop = '5px';
    bChannel.appendChild(bValue);

    // B通道开关按钮
    const bPowerBtn = document.createElement('button');
    bPowerBtn.textContent = '开始';
    bPowerBtn.id = 'bPowerBtn';
    bPowerBtn.style.marginTop = '5px';
    bPowerBtn.style.padding = '3px 8px';
    bPowerBtn.style.backgroundColor = '#28a745';
    bPowerBtn.style.color = '#fff';
    bPowerBtn.style.border = 'none';
    bPowerBtn.style.borderRadius = '3px';
    bPowerBtn.style.fontSize = '10px';
    bPowerBtn.style.cursor = 'pointer';
    bChannel.appendChild(bPowerBtn);

    powerControl.appendChild(bChannel);
    devicePanel.appendChild(powerControl);

    // 同步开关
    const syncControl = document.createElement('div');
    syncControl.style.display = 'flex';
    syncControl.style.justifyContent = 'center';
    syncControl.style.alignItems = 'center';
    syncControl.style.marginBottom = '15px';

    const syncLabel = document.createElement('span');
    syncLabel.textContent = '单独';
    syncLabel.style.fontSize = '12px';
    syncLabel.style.marginRight = '5px';
    syncControl.appendChild(syncLabel);

    const syncSwitch = document.createElement('label');
    syncSwitch.style.position = 'relative';
    syncSwitch.style.display = 'inline-block';
    syncSwitch.style.width = '40px';
    syncSwitch.style.height = '20px';

    const syncInput = document.createElement('input');
    syncInput.type = 'checkbox';
    syncInput.checked = true; // 设置默认选中状态
    syncInput.style.opacity = '0';
    syncInput.style.width = '0';
    syncInput.style.height = '0';
    syncSwitch.appendChild(syncInput);

    const syncSlider = document.createElement('span');
    syncSlider.style.position = 'absolute';
    syncSlider.style.cursor = 'pointer';
    syncSlider.style.top = '0';
    syncSlider.style.left = '0';
    syncSlider.style.right = '0';
    syncSlider.style.bottom = '0';
    syncSlider.style.backgroundColor = '#2196F3'; // 默认激活状态的背景色
    syncSlider.style.transition = '.4s';
    syncSlider.style.borderRadius = '20px';
    syncSwitch.appendChild(syncSlider);

    syncSlider.innerHTML = '<span style="position: absolute; content: \"\"; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; transform: translateX(20px);"></span>'; // 默认激活状态的位置
    syncControl.appendChild(syncSwitch);

    const syncLabel2 = document.createElement('span');
    syncLabel2.textContent = '同步';
    syncLabel2.style.fontSize = '12px';
    syncLabel2.style.marginLeft = '5px';
    syncControl.appendChild(syncLabel2);

    devicePanel.appendChild(syncControl);

    // 快速添加按钮
    const quickAddBtn = document.createElement('button');
    quickAddBtn.textContent = '快速编辑';
    quickAddBtn.style.display = 'block';
    quickAddBtn.style.margin = '0 auto';
    quickAddBtn.style.padding = '8px 16px';
    quickAddBtn.style.backgroundColor = '#007bff';
    quickAddBtn.style.color = '#fff';
    quickAddBtn.style.border = 'none';
    quickAddBtn.style.borderRadius = '5px';
    quickAddBtn.style.cursor = 'pointer';
    devicePanel.appendChild(quickAddBtn);

    document.body.appendChild(devicePanel);

    // 切换面板显示/隐藏
    deviceBtn.addEventListener('click', () => {
        const panel = document.getElementById('coyoteDevicePanel');
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    });

    // 同步开关事件
    syncInput.addEventListener('change', function () {
        if (this.checked) {
            syncSlider.style.backgroundColor = '#2196F3';
            syncSlider.querySelector('span').style.transform = 'translateX(20px)';
        } else {
            syncSlider.style.backgroundColor = '#ccc';
            syncSlider.querySelector('span').style.transform = 'translateX(0)';
        }
    });


    // A通道滑块事件
    aSlider.addEventListener('input', function (event) {
        if (aPowerOn === false) {
            // 电源未开启，恢复之前的值
            this.value = currentAValue;
            aValue.textContent = currentAValue + '%';
            message('请先开启A通道');
            return;
        }
        // 更新当前值
        currentAValue = this.value;
        aValue.textContent = this.value + '%';
        let channel = 'A';
        if (syncInput.checked) {
            channel = 'both';
            bSlider.value = this.value;
            bValue.textContent = this.value + '%';
            currentBValue = this.value;
        }
        callRemoteMethod('setPower', { channel, power: this.value / 100 }).then((response) => {

        });
    });

    // B通道滑块事件
    bSlider.addEventListener('input', function (event) {
        if (bPowerOn === false) {
            // 电源未开启，恢复之前的值
            this.value = currentBValue;
            bValue.textContent = currentBValue + '%';
            message('请先开启B通道');
            return;
        }
        // 更新当前值
        currentBValue = this.value;
        bValue.textContent = this.value + '%';
        let channel = 'B';
        if (syncInput.checked) {
            channel = 'both';
            aSlider.value = this.value;
            aValue.textContent = this.value + '%';
            currentAValue = this.value;
        }
        callRemoteMethod('setPower', { channel, power: this.value / 100 }).then((response) => {

        });
    });

    // A通道开关按钮事件
    aPowerBtn.addEventListener('click', () => {
        aPowerOn = !aPowerOn;
        let channel = 'A';
        if (aPowerOn) {
            // 如果同步开关打开，同时开启B通道
            if (syncInput.checked) {
                bPowerOn = true;
                channel = 'both';
            }
            // 调用开启A通道的方法
            callRemoteMethod('togglePower', { channel, play: aPowerOn }).then((response) => {
                if (response?.code === '000') {
                    aPowerBtn.textContent = '停止';
                    aPowerBtn.style.backgroundColor = '#dc3545';
                    if (syncInput.checked) {
                        bPowerBtn.textContent = '停止';
                        bPowerBtn.style.backgroundColor = '#dc3545';
                    }
                }
            }).catch((error) => {
                aPowerOn = false;
                if (syncInput.checked) {
                    bPowerOn = false;
                }
            });
        } else {
            // 如果同步开关打开，同时开启B通道
            if (syncInput.checked) {
                bPowerOn = false;
                channel = 'both';
            }

            // 调用关闭A通道的方法
            callRemoteMethod('togglePower', { channel, play: aPowerOn }).then((response) => {
                if (response?.code === '000') {
                    aPowerBtn.textContent = '开始';
                    aPowerBtn.style.backgroundColor = '#28a745';
                    if (syncInput.checked) {
                        bPowerBtn.textContent = '开始';
                        bPowerBtn.style.backgroundColor = '#28a745';
                    }
                }
            }).catch((error) => {
                aPowerOn = false;
                if (syncInput.checked) {
                    bPowerOn = false;
                }
            });
        }
    });

    // B通道开关按钮事件
    bPowerBtn.addEventListener('click', () => {
        bPowerOn = !bPowerOn;
        let channel = 'B';
        if (bPowerOn) {
            // 如果同步开关打开，同时开启A通道
            if (syncInput.checked) {
                aPowerOn = true;
                channel = 'both';
            }
            callRemoteMethod('togglePower', { channel, play: bPowerOn }).then((response) => {
                if (response?.code === '000') {
                    bPowerBtn.textContent = '停止';
                    bPowerBtn.style.backgroundColor = '#dc3545';
                    if (syncInput.checked) {
                        aPowerBtn.textContent = '停止';
                        aPowerBtn.style.backgroundColor = '#dc3545';
                    }
                }
            }).catch((error) => {
                bPowerOn = false;
                if (syncInput.checked) {
                    aPowerOn = false;
                }
            });
        } else {
            // 如果同步开关打开，同时关闭A通道
            if (syncInput.checked) {
                aPowerOn = false;
                channel = 'both';
            }
            // 调用关闭B通道的方法
            callRemoteMethod('togglePower', { channel, play: bPowerOn }).then((response) => {
                if (response?.code === '000') {
                    bPowerBtn.textContent = '开始';
                    bPowerBtn.style.backgroundColor = '#28a745';
                    if (syncInput.checked) {
                        aPowerBtn.textContent = '开始';
                        aPowerBtn.style.backgroundColor = '#28a745';
                    }
                }
            }).catch((error) => {
                bPowerOn = false;
                if (syncInput.checked) {
                    aPowerOn = false;
                }
            });
        }
    });

    // 快速添加按钮事件
    quickAddBtn.addEventListener('click', () => {
        const powerA = aSlider.value;
        const powerB = bSlider.value;
        if (bookId && currentPage) {
            // 调用快速添加脚本方法
            callRemoteMethod('quickAdd', {
                bookId,
                bookName,
                pageNo: currentPage,
                powerA: powerA / 100,
                powerB: powerB / 100
            }).then((response) => {
                if (response?.msg === 'success') {
                    message('✅快速添加脚本成功');
                }
            });
        }
    });
}

function loadDeviceBattery() {
    // 模拟加载设备电量
    const batteryInfo = document.getElementById('batteryInfo');

    // 调用远程方法获取设备电量
    callRemoteMethod('getBattery').then((response) => {
        if (response?.code === '002') {
            message('❌设备未连接');
            return;
        }
        if (response?.code === '000') {
            if (response?.data !== undefined) {
                batteryInfo.textContent = `设备电量: ${response.data}`;
            } else {
                batteryInfo.textContent = '设备电量: -';
            }
            // 每60秒加载一次设备电量
            setTimeout(() => {
                loadDeviceBattery();
            }, 60000);
        }
    }).catch(() => {
        batteryInfo.textContent = '设备电量: -';
    }).finally(() => {

    });
}