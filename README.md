# 🌿 WeightCon — AI 减脂管家

> 一款专为个人减脂设计的轻量 Web App，支持 AI 图像识别热量、智能饮食建议与体重趋势分析。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/XuanG2001/WeightCon)

---

## ✨ 功能亮点

| 功能 | 说明 |
|------|------|
| 📸 **拍照识别热量** | 上传餐食照片，Kimi-K2.5 视觉模型自动识别食物并估算热量、蛋白质、碳水、脂肪 |
| 🧮 **智能热量预算** | 基于 Mifflin-St Jeor 公式计算 TDEE，每日动态显示热量余额 |
| 🎯 **目标双向推算** | 设定目标体重 → 自动算完成日期；或设定完成日期 → 自动算每周减重速度 |
| 🤖 **每日 AI 建议** | 根据当天饮食和运动数据，生成个性化减脂建议 |
| 📈 **体重趋势图** | 记录每日体重，可视化减脂曲线 |
| 🏃 **运动记录** | 记录运动类型、时长和消耗热量 |
| 💧 **饮水打卡** | 快速记录每日水分摄入 |
| 🗓️ **新用户引导** | 3 步完成初始设置（体型、目标、活动水平），仅需完成一次 |

---

## 🛠️ 技术栈

- **框架**：[Next.js 16](https://nextjs.org/) (App Router)
- **数据库**：[Prisma v7](https://www.prisma.io/) + [Turso](https://turso.tech/)（libSQL / SQLite 兼容）
- **AI 模型**：[SiliconFlow](https://siliconflow.cn/) API
  - 视觉识别：`Pro/moonshotai/Kimi-K2.5`
  - 文本建议：`deepseek-ai/DeepSeek-V3`
- **UI**：[shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide](https://lucide.dev/)
- **图表**：[Recharts](https://recharts.org/)
- **部署**：[Vercel](https://vercel.com/)

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm

### 本地开发

```bash
# 克隆项目
git clone https://github.com/XuanG2001/WeightCon.git
cd WeightCon

# 安装依赖（自动运行 prisma generate）
npm install

# 初始化数据库
npx prisma migrate dev

# 配置环境变量
cp .env.local.example .env.local
# 填写 SILICONFLOW_API_KEY

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可访问。

### 环境变量

创建 `.env.local` 文件：

```env
# SiliconFlow AI API（必须）
SILICONFLOW_API_KEY=your_api_key_here
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1

# 本地开发用 SQLite（默认）
DATABASE_URL="file:./dev.db"

# 生产环境 Turso 数据库（可选，生产必须）
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_turso_token
```

> 本地开发无需 Turso，默认使用本地 SQLite 文件。

---

## ☁️ 部署到 Vercel + Turso

1. **创建 Turso 数据库**：前往 [turso.tech](https://turso.tech) 创建数据库，获取 URL 和 Token

2. **应用数据库迁移**：
   ```bash
   node --env-file=.env scripts/migrate-turso.mjs
   ```

3. **推送到 GitHub** 并在 [Vercel](https://vercel.com) 中 Import 项目

4. **在 Vercel 中配置环境变量**：
   | 变量 | 说明 |
   |------|------|
   | `TURSO_DATABASE_URL` | Turso 数据库 URL |
   | `TURSO_AUTH_TOKEN` | Turso Auth Token |
   | `SILICONFLOW_API_KEY` | SiliconFlow API 密钥 |

5. 点击 **Deploy** 完成部署 🎉

---

## 📁 项目结构

```
src/
├── app/
│   ├── page.tsx              # 首页（今日热量仪表盘）
│   ├── setup/page.tsx        # 新用户引导（3步设置）
│   ├── (pages)/
│   │   ├── log/page.tsx      # 饮食与运动记录
│   │   ├── trends/page.tsx   # 体重趋势图
│   │   └── plan/page.tsx     # 减脂计划
│   └── api/
│       ├── meals/            # 餐食 CRUD + AI 图像分析
│       ├── workouts/         # 运动记录
│       ├── weight/           # 体重记录
│       ├── settings/         # 用户设置（TDEE 计算）
│       ├── advice/daily/     # AI 每日建议
│       └── plan/weekly-adjust/ # 周目标自动校准
├── components/
│   ├── ActionButtons.tsx     # 快速记录按钮（含拍照上传）
│   └── BottomNav.tsx         # 底部导航栏
└── lib/
    ├── db.ts                 # Prisma 客户端（自动切换本地/Turso）
    └── ai.ts                 # AI 调用封装
```

---

## 📜 License

MIT © 2026 XuanG2001
