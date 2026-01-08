/**
 * 动态引用CS和CSS
 * */
// 导入所需的库
import Vue from "vue";
import _ from 'lodash';
import $ from 'jquery';

// 为所有组件混入一个动态文件的导入功能
Vue.mixin({
    data: function () {
        return {
            loadedCount: 0, // 动态导入的文件数量
            reqFiles: [], // 需要动态导入的文件
        }
    },
    methods: {
        requires: function (obj) {
            // 字符串直接导入
            if (typeof obj === 'string') {
                this.reqFiles.push(obj);
            } else if (Array.isArray(obj)) {
                this.reqFiles = _.concat([], obj);
            }
            if (this.reqFiles.length <= 0) {
                return;
            }

            // 需要动态添加的节点列表
            var addNodes = [];
            var docFiles = $('link, script');
            let syncImpElem = _.find(docFiles, (a) => a.src && (a.src.indexOf('sync-imp.js') > -1));
            for (let af of this.reqFiles) {
                // 查询是否动态的已经存在
                let ex = _.find(docFiles, {href: af});
                if (ex) {
                    continue;
                }
                let nodeName = 'script';
                if (af.endsWith('.css')) {
                    nodeName = "link";
                }
                addNodes.push(this.createNode({name: nodeName, url: af}, this.onScriptLoad));
            }
            // 如果需要增加的css和js文件，则动态加入
            if (addNodes.length > 0) {
                // 加入
                for (let af of addNodes) {
                    // css 文件按顺序
                    if (af.type.indexOf('css') > -1) {
                        document.head.appendChild(af);
                    } else {
                        // js文件需要放在 sync-imp 之后
                        if (syncImpElem) {
                            syncImpElem.insertAdjacentElement('afterend', af);
                        } else {
                            // 如果找不到sync-imp.js元素，就直接添加到head末尾
                            document.head.appendChild(af);
                        }
                    }
                }
            }
        },
        onScriptLoad() {
            if (this.reqFiles.length <= 0) {
                return;
            }
            this.loadedCount++;
            // 如果加载完成的数量与后添加的文件相等，代表完成
            if (this.loadedCount === (this.reqFiles.length)) {
                this.$emit('scriptLoaded', this.reqFiles);
                // $(document).trigger("ScriptLoaded", reqFiles);
            }
        },
        createNode(module, onScriptLoad) {
            var node = document.createElement(module.name);
            if ('script' === module.name) {
                node.type = 'text/javascript';
                node.src = module.url;
                node.charset = 'utf-8';
                node.async = false;
            } else {
                node.type = 'text/css';
                node.href = module.url;
                node.rel = 'stylesheet';
            }
            // 这里使用了requiredjs的事件判断方式，可以兼容浏览器
            if (node.attachEvent &&
                //Check if node.attachEvent is artificially added by custom script or
                //natively supported by browser
                //read https://github.com/requirejs/requirejs/issues/187
                //if we can NOT find [native code] then it must NOT natively supported.
                //in IE8, node.attachEvent does not have toString()
                //Note the test for "[native code" with no closing brace, see:
                //https://github.com/requirejs/requirejs/issues/273
                !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) &&
                !window.opera) {
                //Probably IE. IE (at least 6-8) do not fire
                //script onload right after executing the script, so
                //we cannot tie the anonymous define call to a name.
                //However, IE reports the script as being in 'interactive'
                //readyState at the time of the define call.
                var useInteractive = true;

                node.attachEvent('onreadystatechange', onScriptLoad);
                //It would be great to add an error handler here to catch
                //404s in IE9+. However, onreadystatechange will fire before
                //the error handler, so that does not help. If addEventListener
                //is used, then IE will fire error before load, but we cannot
                //use that pathway given the connect.microsoft.com issue
                //mentioned above about not doing the 'script execute,
                //then fire the script load event listener before execute
                //next script' that other browsers do.
                //Best hope: IE10 fixes the issues,
                //and then destroys all installs of IE 6-9.
                //node.attachEvent('onerror', context.onScriptError);
            } else {
                node.addEventListener('load', onScriptLoad, false);
            }
            return node;
        }
    }
});