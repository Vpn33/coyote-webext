const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

// Generate pages object
const pagesObj = {
  // 添加默认页面入口，用于开发环境
  index: {
    entry: "src/options/index.js",
    template: "src/options/index.html",
    filename: "index.html"
  }
};

const chromeName = ["popup", "options"];

chromeName.forEach(name => {
  pagesObj[name] = {
    entry: `src/${name}/index.js`,
    template: "public/index.html",
    filename: `${name}.html`
  };
});

// 直接使用开发环境的manifest文件进行测试
const copyConfig = [
  {
    from: path.resolve("src/manifest.development.json"),
    to: path.resolve("dist/manifest.json"),
    force: true // 强制覆盖已存在的文件
  },
  {
    from: path.resolve("src/background.js"),
    to: path.resolve("dist/background.js"),
    force: true // 强制覆盖已存在的文件
  }
];

module.exports = {
  pages: pagesObj,
  lintOnSave: false, // 关闭 eslint 语法检测
  configureWebpack: {
    plugins: [new CopyWebpackPlugin(copyConfig)]
  },
  // 配置开发服务器
  devServer: {
    // 开发时默认打开index.html页面
    open: true
  }
};