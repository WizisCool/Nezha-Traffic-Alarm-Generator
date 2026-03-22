# 哪吒监控流量警告规则生成器

一个为哪吒监控生成流量告警规则的轻量网页工具。

手动编写哪吒监控的流量告警 JSON 规则并不算难，但在实际配置时总归有些繁琐。这个项目把这件事做成了一个更直观的网页表单：填好参数，生成规则，复制粘贴到面板里即可。

## Live Demo

- [https://wiziscool.github.io/Nezha-Traffic-Alarm-Generator/](https://wiziscool.github.io/Nezha-Traffic-Alarm-Generator/)

## 这个工具可以做什么

- 通过可视化表单生成哪吒监控流量告警规则
- 自动输出符合哪吒监控格式的 JSON 内容
- 支持一键复制结果，便于直接粘贴到面板中使用
- 适合快速配置常见的流量告警场景

## 使用方式

### 1. 直接使用 Live Demo

打开在线页面：

- [https://wiziscool.github.io/Nezha-Traffic-Alarm-Generator/](https://wiziscool.github.io/Nezha-Traffic-Alarm-Generator/)

填写参数后生成规则，并复制到哪吒监控面板中使用即可。

### 2. 从源码部署

克隆仓库后，直接打开 `index.html` 即可本地使用：

```bash
git clone https://github.com/WizisCool/Nezha-Traffic-Alarm-Generator.git
cd Nezha-Traffic-Alarm-Generator
```

随后用浏览器打开 `index.html`。

## 技术栈

- HTML
- CSS
- JavaScript

## 许可证

[MIT](LICENSE)
