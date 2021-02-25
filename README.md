## dwz_mobile_app

> ### 介绍

- DWZ 手机版 HTML5 + 原生 混合开发框架。
- 基于原生 JS 轻量级移动端开发框架，核心代码库 dwz.core.js 使用方式和 jQuery 80%相似，针对移动端精简优化代码（核心库代码相当于 jQuery 的十分之一）。

> ### 设计思路

1. 灵活定制扩展方便：gulp 构建工程，组件 html 结构、css（使用 less）、javascript 完全开放，可以实际项目要求灵活定制。
2. 轻量级：封装精简版核心库 dwz.core.js，相当于一个专门针对移动端优化的精简版 jQuery，代码量只有 jQuery 的十分之一左右，使用方式基本同 jQuery。
3. 统一风格：UI 组件不依赖于第三方组件库，都是统一封装的，组件样式可以灵活定制。
4. 跨平台：Android 应用、iOS 应用、公众号。
5. 支持屏幕自适配：手机、平板、PC、大屏（包含非正常比例拼接屏）界面布局可以支持自动适配。

**Require:**

- node\^10.13.0 `https://nodejs.org/en/download`
- npm\^6.14.5 `新版的nodejs已经集成了npm`
- apicloud-cli\^0.2.0 `npm install -g apicloud-cli`

> ### Quickstart

1. 下载 DWZ Mobile 开源项目源码

```
git clone https://gitee.com/dwzteam/dwz_mobile_app.git
```

或者

```
git clone https://github.com/dwzteam/dwz_mobile_app.git
```

2. 开发环境 Chrome 中运行

   - 第一次运行，需要初始化工程 `npm intall`
   - 前端开发模式运行，会自动打开 chrome `npm run dev`

> ### 详细文档

- [在线文档](http://dwzteam.gitee.io/dwz_mobile_doc_v1)
- [文档工程 git 仓库](https://gitee.com/dwzteam/dwz_mobile_doc_v1)

> ### 开源项目仓库

- [Gitee 仓库](https://gitee.com/dwzteam/dwz_mobile_app)
- [Gitbug 仓库](https://github.com/dwzteam/dwz_mobile_app)

> ### Demo 演示

- 在线演示版，使用 chrome 开发模式设置手机版 `http://mobile.jui.org`
- 安卓 Apk 安装测试版 `http://mobile.jui.org/apk/dwz_mobile_dev.apk`
- 视频演示 `http://mobile.jui.org/video/dwz_mobile.mp4`

> ### 联系

- 网站：http://jui.org
- DWZ 官方微博：http://weibo.com/dwzui
- 邮箱：z@j-ui.com

|               技术服务微信               |
| :--------------------------------------: |
| ![](./widget/image/wx_zhh.jpg?width=200) |

> ### 捐助

如果您觉得我们的开源软件对你有所帮助，请扫下方二维码打赏我们一杯咖啡。

|                支付宝                 |                 微信                 |
| :-----------------------------------: | :----------------------------------: |
| ![](./widget/image/zfb.png?width=200) | ![](./widget/image/wx.png?width=200) |

> ### 版权声明

    DWZ Mobile 遵循Apache2开源协议发布，并提供免费使用。
    版权所有Copyright © 2009-2020 by DWZ (http://jui.org) All rights reserved。
    Apache Licence是著名的非盈利开源组织Apache采用的协议。
    该协议和BSD类似，鼓励代码共享和尊重原作者的著作权，允许代码修改，再作为开源或商业软件发布。需要满足的条件：

    需要给代码的用户一份Apache Licence
    如果你修改了代码，需要在被修改的文件中说明
    在延伸的代码中（修改和有源代码衍生的代码中）需要带有原来代码中的协议，商标，专利声明和其他原来作者规定需要包含的说明
    如果再发布的产品中包含一个Notice文件，则在Notice文
    件中需要带有本协议内容。你可以在Notice中增加自己的许可，但不可以表现为对Apache Licence构成更改

具体的协议参考：http://www.apache.org/licenses/LICENSE-2.0

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOTLIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESSFOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THECOPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVERCAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICTLIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING INANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THEPOSSIBILITY OF SUCH DAMAGE.
