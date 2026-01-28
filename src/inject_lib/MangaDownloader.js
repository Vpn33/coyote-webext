let bookId = null;
let bookName = null;
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
    // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    //     if (request.action === 'noneScript') {

    //     }
    // });
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
    playBtn.textContent = '编辑脚本';
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
    playBtn.style.zIndex = '9999';
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