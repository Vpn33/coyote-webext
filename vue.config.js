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
    template: `src/${name}/index.html`,
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
  },
  {
    from: path.resolve("src/inject_lib"),
    to: path.resolve("dist/inject_lib"),
    force: true // 强制覆盖已存在的文件
  }
  ,
  {
    from: path.resolve("src/assets"),
    to: path.resolve("dist/assets"),
    force: true // 强制覆盖已存在的文件
  }
];

// 根据环境变量决定是否启用Source Maps和调试模式
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.VUE_APP_DEBUG_MODE === 'true'

module.exports = {
  pages: pagesObj,
  lintOnSave: false, // 关闭 eslint 语法检测
  // 根据环境决定是否生成Source Maps
  productionSourceMap: isDevelopment,
  // 根据环境选择合适的devtool配置
  configureWebpack: {
    plugins: [new CopyWebpackPlugin(copyConfig)],
    // 开发环境使用source-map避免CSP限制
    devtool: isDevelopment ? 'source-map' : 'source-map',
    // 确保Source Maps能够正确映射到原始文件
    output: {
      // 确保生成的Source Maps文件与JavaScript文件在同一目录
      sourceMapFilename: '[file].map',
      // 确保Source Maps中使用正确的路径
      devtoolModuleFilenameTemplate: isDevelopment ? 'webpack:///[resource-path]' : '[resource-path]',
      // 确保Source Maps中使用相对路径
      devtoolFallbackModuleFilenameTemplate: isDevelopment ? 'webpack:///[resource-path]?[hash]' : '[resource-path]?[hash]'
    },
  },
  // 配置Vue Loader，确保Vue组件的Source Maps能够正确生成
  chainWebpack: config => {
    // 确保Vue组件的Source Maps能够正确生成
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.sourceMap = isDevelopment
        return options
      })
    
    // 确保JavaScript文件的Source Maps能够正确生成
    config.module
      .rule('js')
      .use('babel-loader')
      .loader('babel-loader')
      .tap(options => {
        options.sourceMap = isDevelopment
        return options
      })
    
    // 移除自定义CSS loader配置，使用Vue CLI默认配置
  },
  // 配置开发服务器
  devServer: {
    // 开发时默认打开index.html页面
    open: true
  }
};
