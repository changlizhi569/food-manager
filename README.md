# 食材管理应用 (Food Manager)

一个基于 UniApp 开发的跨平台食材管理应用，帮助用户追踪冰箱中的食材，管理保质期，减少食物浪费。

## 📱 功能特点

- 🥬 **食材管理**：添加、编辑、删除食材，记录名称、类型、数量、存放位置等信息
- 📅 **保质期管理**：显示食材距离保质期的天数，帮助用户及时处理即将过期的食材
- 🔍 **搜索功能**：快速查找食材
- 🏠 **冰箱分区管理**：支持多冰箱、多分区、多层级的管理结构
- 🎨 **个性化设置**：可自定义食材卡片显示的信息字段
- 📱 **跨平台支持**：基于 UniApp 开发，支持 Android、iOS、小程序等多个平台

## 🛠️ 技术栈

- **前端框架**：UniApp (Vue 3)
- **数据存储**：localStorage (本地存储)
- **UI 设计**：自定义 CSS + Flexbox 布局
- **构建工具**：Vite

## 📁 项目结构

```
food manager/
├── pages/
│   ├── index/          # 首页 - 食材列表
│   ├── ingredient/     # 食材相关页面
│   │   ├── add.vue     # 添加食材
│   │   ├── detail.vue  # 食材详情
│   │   └── edit.vue    # 编辑食材
│   └── settings/       # 设置页面
│       ├── index.vue   # 设置首页
│       ├── category.vue # 食材种类管理
│       ├── fridge.vue  # 冰箱管理
│       └── ingredient-detail.vue # 食材卡片设置
├── static/             # 静态资源
├── utils/              # 工具类
│   ├── dataManager.js  # 数据管理
│   └── indexedDBManager.js # 索引数据库管理
├── App.vue             # 应用入口
├── main.js             # 主入口文件
├── manifest.json       # 应用配置
├── pages.json          # 页面配置
└── package.json        # 项目依赖
```

## 📸 截图预览

### 首页 - 食材列表

![首页截图](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=food%20management%20app%20home%20page%20with%20ingredient%20cards%20showing%20food%20items%20with%20shelf%20life%20information&image_size=landscape_16_9)

### 添加食材

![添加食材截图](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=food%20management%20app%20add%20ingredient%20page%20with%20form%20fields%20for%20name%2C%20type%2C%20quantity%2C%20location%2C%20and%20expiry%20date&image_size=portrait_4_3)

### 食材详情

![食材详情截图](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=food%20management%20app%20ingredient%20detail%20page%20showing%20detailed%20information%20about%20a%20food%20item&image_size=portrait_4_3)

### 设置页面

![设置页面截图](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=food%20management%20app%20settings%20page%20with%20options%20for%20fridge%20management%20and%20ingredient%20card%20settings&image_size=portrait_4_3)

## 🚀 安装与运行

### 环境要求

- Node.js 14.0+
- HBuilderX (UniApp 开发工具)

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd food-manager
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **运行项目**
   - 使用 HBuilderX 打开项目
   - 选择运行平台（如：浏览器、Android 模拟器、iOS 模拟器等）
   - 点击运行按钮

4. **打包构建**
   - 在 HBuilderX 中选择 "发行" -> "原生 App 打包"
   - 选择相应的平台进行打包

## 📋 产品文档

完整的产品文档请查看 [产品文档](docs/product-documentation.html)

## 🎯 核心功能

### 1. 食材管理
- 添加新食材，包括名称、类型、数量、存放位置、加入日期和到期日期
- 编辑现有食材信息
- 删除不需要的食材
- 查看食材详细信息

### 2. 保质期管理
- 显示食材距离保质期的天数
- 帮助用户及时处理即将过期的食材
- 避免食物浪费

### 3. 冰箱分区管理
- 支持多个冰箱
- 每个冰箱可以有多个分区（如：冷藏室、冷冻室）
- 每个分区可以有多个层级

### 4. 搜索功能
- 快速搜索食材
- 支持按名称搜索

### 5. 个性化设置
- 自定义食材卡片显示的信息字段
- 选择是否显示食材类型、数量、存放位置、加入日期、保质期和图片

## 🔮 未来规划

- [ ] 食材分类统计
- [ ] 过期食材提醒
- [ ] 食材购物清单
- [ ] 多用户支持
- [ ] 云同步功能
- [ ] 食材营养信息

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！

## 📄 许可证

MIT License

## 👨‍💻 开发者

由您的名字开发

---

**让我们一起减少食物浪费，让食材管理更简单！** 🍎🥕🍗