// 创建插件图标的右键菜单项
// chrome.runtime.onInstalled.addListener(() => {
//   chrome.contextMenus.create({
//     id: 'open-options',
//     title: '打开选项页面',
//     contexts: ['action']
//   });
// });

// // 监听右键菜单点击事件
// chrome.contextMenus.onClicked.addListener((info, tab) => {
//   if (info.menuItemId === 'open-options') {
//     // 打开options页面
//     chrome.tabs.create({
//       url: chrome.runtime.getURL('options.html')
//     });
//   }
// });

// 监听插件图标点击事件（左键点击）
chrome.action.onClicked.addListener((tab) => {
  // 打开options页面
  chrome.tabs.create({
    url: chrome.runtime.getURL('options.html')
  });
});