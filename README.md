
## 项目结构

/project-root
│
├── 📂 backend/  (后端服务)
│   ├── 📂 api/  (API路由/控制器)
│   │   ├── auth_controller.js         # 用户认证、登录、注册
│   │   ├── face_rec_controller.js     # 人脸识别相关接口
│   │   ├── pavement_controller.js     # 路面病害检测相关接口
│   │   ├── traffic_controller.js      # 交通数据分析相关接口
│   │   └── alert_controller.js        # 告警日志相关接口
│   │
│   ├── 📂 core/  (核心业务逻辑)
│   │   ├── services/                  # 服务层，处理具体业务
│   │   ├── models/                    # 数据库模型/Schema
│   │   └── utils/                     # 工具函数 (如加密算法)
│   │
│   ├── 📂 middleware/
│   │   └── auth_middleware.js         # 身份验证中间件
│   │
│   ├── 📂 config/
│   │   └── database.js                # 数据库配置
│   │
│   ├── app.js                         # 应用主入口
│   └── package.json
│
├── 📂 frontend/  (前端应用)
│   ├── 📂 public/
│   │   └── index.html                 # HTML主页面
│   │
│   ├── 📂 src/
│   │   ├── 📂 components/              # 可复用的UI组件
│   │   │   ├── 📂 common/              # 通用组件 (按钮, 弹窗等)
│   │   │   ├── 📂 charts/              # 图表组件
│   │   │   └── 📂 layout/              # 页面布局 (导航栏, 侧边栏)
│   │   │
│   │   ├── 📂 pages/ or views/        # 页面级组件
│   │   │   ├── LoginPage.js           # 登录页
│   │   │   ├── DashboardPage.js       # 主仪表盘/大屏展示页
│   │   │   ├── FaceRecPage.js         # 人脸识别功能页
│   │   │   ├── PavementPage.js        # 路面病害检测功能页
│   │   │   └── AlertsPage.js          # 告警中心页
│   │   │
│   │   ├── 📂 api/ or services/       # 前端API请求服务
│   │   ├── 📂 assets/                 # 静态资源 (图片, 字体, 样式)
│   │   ├── 📂 store/ or context/      # 全局状态管理
│   │   ├── App.js                     # 根组件
│   │   └── main.js                    # 前端主入口
│   │
│   └── package.json
│
├── 📂 ai_models/  (AI模型与数据处理)
│   ├── 📂 face_recognition/
│   │   ├── data/                      # 存放人脸图像数据
│   │   ├── saved_models/              # 存放训练好的人脸识别模型文件
│   │   ├── train.py                   # 训练脚本
│   │   └── predict.py                 # 推理/预测脚本
│   │
│   ├── 📂 pavement_detection/
│   │   ├── data/                      # 存放路面病害数据集
│   │   ├── saved_models/              # 存放训练好的病害检测模型
│   │   ├── train.py                   # 训练脚本
│   │   ├── predict.py                 # 推理/预测脚本
│   │   └── model_compression.py       # (可选)模型压缩脚本
│   │
│   └── 📂 traffic_analysis/
│       ├── data/                      # 存放原始交通数据
│       ├── notebooks/                 # Jupyter Notebooks 用于数据清洗、探索和分析
│       └── scripts/                   # 自动化数据处理脚本
│
├── 📂 docs/  (项目文档 - 对应交付物)
│   ├── daily_reports/                 # 工作日报
│   ├── api/                           # 接口文档 (如Swagger导出)
│   ├── requirements.md                # 需求文档
│   ├── design.md                      # 设计文档
│   └── user_manual.md                 # 用户手册
│
├── 演示视频.mp4                       # 最终系统演示视频
├── .gitignore                         # Git忽略文件配置
└── README.md                          # 项目说明文件