const chalk = require('chalk');
const inquirer = require('inquirer');
const boxen = require('boxen');
const figlet = require('figlet');

/**
 * 显示启动Banner
 * @param {Object} updateInfo 更新信息（可选）
 */
function showBanner(updateInfo = null) {
  const packageJson = require('../../package.json');

  const banner = figlet.textSync('CC CLI', {
    font: 'Small',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });

  let versionText = chalk.gray(`v${packageJson.version}`);

  // 根据更新状态调整版本显示
  if (updateInfo) {
    // 有新版本可用
    versionText += chalk.yellow(' (有更新)');
  } else {
    // 已是最新版本
    versionText += chalk.green(' (最新)');
  }

  let content = chalk.cyan.bold(banner) + '\n' +
    chalk.white('Claude Code配置管理CLI工具') + '\n' +
    versionText;

  // 如果有更新信息，添加到 banner 中
  if (updateInfo) {
    content += '\n\n' +
      chalk.yellow('🚀 新版本可用! ') +
      chalk.dim(updateInfo.current) + ' → ' + chalk.green(updateInfo.latest) + '\n' +
      chalk.gray('运行 ') + chalk.cyan('npm install -g @cjh0/cc-cli') + chalk.gray(' 更新');
  }

  const boxedBanner = boxen(
    content,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      align: 'center'
    }
  );

  console.log(boxedBanner);
}

/**
 * 显示主菜单
 * @returns {string} 用户选择
 */
async function showMainMenu() {
  const choices = [
    {
      name: '📡 Claude Code API - Claude Code API配置管理',
      value: 'api',
      short: 'Claude Code API'
    },
    {
      name: '💻 Codex API - Codex配置管理',
      value: 'codexapi',
      short: 'CodexAPI'
    },
    {
      name: '🔄 Backup - 备份与恢复',
      value: 'backup',
      short: 'Backup'
    },
    {
      name: '📊 Status - 查看当前状态',
      value: 'status',
      short: 'Status'
    },
    {
      name: '❓ Help - 帮助文档',
      value: 'help',
      short: 'Help'
    },
    new inquirer.Separator(),
    {
      name: '🚪 Exit - 退出',
      value: 'exit',
      short: 'Exit'
    }
  ];

  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: '请选择功能模块：',
      choices,
      pageSize: 10
    }
  ]);

  return choice;
}

/**
 * 显示API菜单
 * @returns {string} 用户选择
 */
async function showApiMenu() {
  console.log(chalk.cyan.bold('\n📡 API配置管理'));
  console.log(chalk.gray('═'.repeat(40)));

  const choices = [
    {
      name: '🔄 切换配置 - 切换API配置',
      value: 'switch',
      short: '切换配置'
    },
    {
      name: '📋 查看配置 - 列出所有配置',
      value: 'list',
      short: '查看配置'
    },
    {
      name: '➕ 添加配置 - 添加新的API配置',
      value: 'add',
      short: '添加配置'
    },
    {
      name: '✏️  编辑配置 - 修改现有配置',
      value: 'edit',
      short: '编辑配置'
    },
    {
      name: '🗑️  删除配置 - 删除API配置',
      value: 'delete',
      short: '删除配置'
    },
    new inquirer.Separator(),
    createBackChoice('back')
  ];

  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: '请选择操作：',
      choices,
      pageSize: 10
    }
  ]);

  return choice;
}

/**
 * 选择站点
 * @param {Object} sites 站点配置
 * @returns {string} 选择的站点key
 */
async function selectSite(sites) {
  const choices = Object.entries(sites).map(([key, config]) => {
    const icon = getSiteIcon(key, config);
    // 新格式中站点名称就是key本身
    return {
      name: `${icon} ${key}`,
      value: key,
      short: key
    };
  });

  // 添加返回选项
  choices.push(createBackChoice('__back__'));

  const { site } = await inquirer.prompt([
    {
      type: 'list',
      name: 'site',
      message: '选择站点：',
      choices,
      pageSize: 10
    }
  ]);

  return site;
}

/**
 * 选择URL
 * @param {Object} urls URL配置
 * @returns {string} 选择的URL
 */
async function selectUrl(urls) {
  const choices = Object.entries(urls).map(([name, url]) => ({
    name: `${getRegionIcon(name)} ${name} (${url})`,
    value: url,
    short: name
  }));

  const { url } = await inquirer.prompt([
    {
      type: 'list',
      name: 'url',
      message: '选择URL线路：',
      choices,
      pageSize: 10
    }
  ]);

  return url;
}

/**
 * 选择Token
 * @param {Object} tokens Token配置
 * @returns {string} 选择的Token
 */
async function selectToken(tokens) {
  const choices = Object.entries(tokens).map(([name, token]) => ({
    name: `${getTokenIcon(name)} ${name} (${token.substring(0, 10)}...)`,
    value: token,
    short: name
  }));

  // 添加返回选项
  choices.push(createBackChoice('__back__'));

  const { token } = await inquirer.prompt([
    {
      type: 'list',
      name: 'token',
      message: '选择Token：',
      choices,
      pageSize: 10
    }
  ]);

  return token;
}

/**
 * 确认配置切换
 * @param {Object} config 配置信息
 * @returns {boolean} 是否确认
 */
async function confirmSwitch(config) {
  console.log(chalk.white('\n📋 即将切换到以下配置：'));
  
  const configBox = boxen(
    `${chalk.white('站点：')} ${chalk.cyan(config.siteName)}\n` +
    `${chalk.white('ANTHROPIC_BASE_URL：')} ${chalk.cyan(config.ANTHROPIC_BASE_URL)}\n` +
    `${chalk.white('Token：')} ${chalk.cyan(config.token.substring(0, 20) + '...')}`,
    {
      padding: 1,
      margin: { top: 0, bottom: 1, left: 0, right: 0 },
      borderStyle: 'round',
      borderColor: 'yellow'
    }
  );

  console.log(configBox);

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: '确认切换配置？',
      default: true
    }
  ]);

  return confirm;
}

/**
 * 显示成功消息
 * @param {string} message 消息内容
 */
function showSuccess(message) {
  console.log(chalk.green('✨ ' + message));
}

/**
 * 显示警告消息
 * @param {string} message 消息内容
 */
function showWarning(message) {
  console.log(chalk.yellow('⚠️  ' + message));
}

/**
 * 显示错误消息
 * @param {string} message 消息内容
 */
function showError(message) {
  console.log(chalk.red('❌ ' + message));
}

/**
 * 显示信息消息
 * @param {string} message 消息内容
 */
function showInfo(message) {
  console.log(chalk.blue('ℹ️  ' + message));
}

/**
 * 获取站点图标（通用版）
 * @param {string} siteKey 站点标识
 * @param {Object} siteConfig 站点配置对象（可选）
 * @returns {string} 图标
 */
function getSiteIcon(siteKey, siteConfig = null) {
  return '🌐'; // 通用网络服务图标
}

/**
 * 获取地区图标
 * @param {string} regionName 地区名称
 * @returns {string} 图标
 */
function getRegionIcon(regionName) {
  const lowerName = regionName.toLowerCase();
  if (lowerName.includes('日本') || lowerName.includes('japan')) return '🇯🇵';
  if (lowerName.includes('新加坡') || lowerName.includes('singapore')) return '🇸🇬';
  if (lowerName.includes('美国') || lowerName.includes('usa')) return '🇺🇸';
  if (lowerName.includes('香港') || lowerName.includes('hongkong')) return '🇭🇰';
  if (lowerName.includes('大陆') || lowerName.includes('china')) return '🇨🇳';
  return '🌍';
}

/**
 * 获取Token图标（固定版）
 * @param {string} tokenName Token名称
 * @returns {string} 图标
 */
function getTokenIcon(tokenName) {
  return '🔑'; // 固定Token图标
}

/**
 * 通用返回确认
 * @param {string} message 提示消息
 * @returns {Promise<void>} 等待用户确认返回
 */
async function waitForBackConfirm(message = '操作完成') {
  const inquirer = require('inquirer');
  await inquirer.prompt([
    {
      type: 'list',
      name: 'back',
      message: `${message}：`,
      choices: [
        createBackChoice('back')
      ]
    }
  ]);
}

/**
 * 创建标准返回按钮选项
 * @param {string} value - 返回值 ('back' | '__back__')
 * @returns {Object} 标准返回按钮配置
 */
function createBackChoice(value = 'back') {
  return {
    name: '⬅️  返回上一级菜单',
    value: value,
    short: '返回'
  };
}

module.exports = {
  showBanner,
  showMainMenu,
  showApiMenu,
  selectSite,
  selectUrl,
  selectToken,
  confirmSwitch,
  showSuccess,
  showWarning,
  showError,
  showInfo,
  getSiteIcon,
  getRegionIcon,
  getTokenIcon,
  waitForBackConfirm,
  createBackChoice
};