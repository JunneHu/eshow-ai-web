// 兼容旧版依赖期望的 path-to-regexp 默认导出是一个函数的情况
// react-router v5 会调用 default(pattern, keys, options)

// 注意：这里显式引用 index.js，绕过 webpack 中对 'path-to-regexp$' 的 alias，避免循环
// eslint-disable-next-line @typescript-eslint/no-var-requires
const real = require('path-to-regexp/index.js');

// v1/v2: module.exports = pathToRegexp（函数本身）
// v6: module.exports = { pathToRegexp, match, parse, compile, ... }
const fn =
  typeof real === 'function'
    ? real
    : typeof real.pathToRegexp === 'function'
    ? real.pathToRegexp
    : typeof real.default === 'function'
    ? real.default
    : () => {
        throw new Error('Incompatible path-to-regexp version: default export is not a function');
      };

// 保留所有命名导出（match/parse/compile 等）
export * from 'path-to-regexp/index.js';

// 提供兼容的默认导出函数
export default fn;


