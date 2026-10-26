# LIFE PACK / Life Peak 抽卡项目

> **将日常生活小事变成具有仪式感与收藏价值的 3D 全息奇遇闪卡应用**  
> *"一张卡，就是一次小小的出发。"*

---

## 📖 项目定位与核心体验

**Life Peak (LIFE PACK)** 是一个融合了 **实体TCG物理拆包感**、**高质量 3D 全息视觉** 与 **治愈系现实生活手账打卡** 的双端应用工程：

- 📱 **移动客户端 (`mobile/`)**：基于 Expo SDK 52 / React Native，提供向右滑动撕开 3D 仿真卡包、宇宙揭晓页、1:1 封印态与解封态卡牌、动漫光斩解封特效与卡背手账记忆。
- 🛠️ **制作台与工坊 (`managment/`)**：基于 Vite / React 18 / Tailwind CSS / Express，提供卡片资产生产、等级模组调色、全息光学参数配置、3D 卡包封装与 ZIP 导出。

详细的产品设计规格书、3D 渲染原理与产品 AI 优化评估指南，请参阅：  
👉 [**详细产品与技术规格文档 (docs/PRODUCT_AND_TECHNICAL_DOCUMENTATION.md)**](./docs/PRODUCT_AND_TECHNICAL_DOCUMENTATION.md)

---

## 🌟 核心视觉与交互特色

1. **Three.js 物理卡包贝塞尔连续撕裂**：手指按住卡包向右滑动，细分网格顶点随贝塞尔曲线物理弯曲剥离，100% 后破袋升起并 360° 旋转自转。
2. **宇宙揭晓页 (Cosmic Reveal Stage)**：融入 React Bits 设计哲学，拥有对角线虹彩棱镜光束（Prism Beam）、景深漂浮星尘与四角菱形星芒晶体（Cosmic Particles）、地面双层流光能量环（Ground Energy Ring）与镜面扫光珍珠胶囊按钮（ShinyPillButton）。
3. **1:1 封印态与解封态**：
   - **未解封 (Sealed)**：黄金角螺旋磨砂模糊（Frosted Blur）、深黑曜石微粒压暗、中央 LIFE SEAL 罗盘印章、已封印徽章。
   - **解封完成 (Unsealed)**：光斩消融磨砂，释放 2.5D 突破卡框的浮雕视差（Depth），全光谱彩虹扫光与 HDR 双通道 42× 真实辉光全面爆发。
4. **背面手账记忆沉淀**：轻触卡片 180° 翻转，在温润纸感背面记下执行奇遇任务时的真实体会，永久留档珍藏。

---

## 🚀 快速启动指南

### 1. 启动移动端 (`mobile`)
```bash
cd mobile
npm install
npm run dev
```
启动后在浏览器中打开 `http://localhost:8081`（支持桌面端与移动端浏览器触控）。

### 2. 启动管理端制作台 (`managment`)
```bash
cd managment
npm install
npm run dev
```
启动后在浏览器中打开 `http://localhost:5173`。

---

## 📂 项目结构概览

```text
life-peak/
├── mobile/                      # [客户端] 移动端跨平台应用 (Expo SDK 52)
│   ├── src/
│   │   ├── app/                 # 基于 Expo Router 的页面文件路由
│   │   ├── components/          # 3D 全息卡片、撕包舞台、宇宙揭晓页特效组件
│   │   ├── core/                # WebGL2 着色器渲染管线与 Three.js 物理撕包引擎
│   │   ├── services/            # 数据仓库与本地状态持久化
│   │   └── utils/               # Canvas 2D LIFE SEAL 矢量卡面渲染器
│   └── assets/                  # 离线环境与默认卡片材质切片
│
├── managment/                   # [管理端] 官方卡片制作台与数字工坊 (Vite + React 18)
│   ├── src/                     # 制作台工作流、模组配置中心、卡包打包导出
│   └── data/                    # 本地文件存储与持久化 (db.json, uploads/)
│
├── docs/                        # 综合规格与使用文档
│   └── PRODUCT_AND_TECHNICAL_DOCUMENTATION.md
└── README.md                    # 项目首页简介
```

---

## 🛠️ 技术栈清单

- **移动端**：Expo SDK 52 / React Native, Expo Router, Three.js, Native WebGL Shaders, React Native Reanimated, React Native SVG
- **管理端**：Vite, React 18, Tailwind CSS, Lucide Icons, Express REST API, JSZip
- **图形学实现**：Dual-Pass HDR Bloom (RGBM), Golden-Angle Spiral Sampling, Anisotropic Etched Foil, Volumetric God Rays, Multi-spectral Rainbow Interferometry
