<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>
<script>
export default {
    name: "app",
}
</script>
<style>
/* Chrome Extension Popup 专用样式 - 修复样式挤压问题 */
body {
    width: 800px !important;
    min-width: 800px !important;
    max-width: 800px !important;
    height: 600px !important;
    min-height: 600px !important;
    max-height: 600px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
}

#app {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    height: 100% !important;
}

#app .channelPlayTime {
    display: inline;
}

/* 确保Vue应用容器填满popup */
html {
    overflow: hidden !important;
}
</style>