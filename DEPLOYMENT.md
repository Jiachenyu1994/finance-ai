# Deployment Guide

## Prerequisites
- GitHub account
- Vercel account
- Render account
- Turso account (已有)

## 1. 数据库配置 (已完成)
Turso 数据库已经配置完成，配置存在于 `.env` 文件中：
- `LIBSQL_URL`
- `LIBSQL_AUTH_TOKEN`

## 2. 后端部署 (Render)

### 2.1 准备工作
1. 在 Render.com 注册账号
2. 创建新的 Web Service
3. 选择 "Docker" 作为环境
4. 连接 GitHub 仓库

### 2.2 环境变量配置
在 Render Dashboard 中配置以下环境变量：
```env
LIBSQL_AUTH_TOKEN=[从 .env 复制]
LIBSQL_URL=[从 .env 复制]
SECRET=[从 .env 复制]
HASH=HS256
LOGIN_EXPIRE=2
ENV=prod
OPENROUTER_API_KEY=[从 .env 复制]
OPENROUTER_BASE_URL=[从 .env 复制]
OPEN_ROUTER_MODEL=[从 .env 复制]
LLM_TIMEOUT=20
LLM_TEMPERATURE=0.2
FRONTEND_ORIGIN=[Vercel 部署后的域名]
```

### 2.3 部署配置
- Build Command: `docker build -t finance-ai-backend .`
- Start Command: `docker run --env-file .env -p 8000:8000 finance-ai-backend`
- 自动部署：开启

## 3. 前端部署 (Vercel)

### 3.1 准备工作
1. 在 Vercel.com 注册账号
2. 导入 GitHub 仓库
3. 选择 "Create React App" 作为框架预设

### 3.2 环境变量配置
在 Vercel 项目设置中配置：
```env
REACT_APP_API_BASE_URL=[Render 生成的后端 URL]
```

### 3.3 部署配置
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

## 4. 域名配置

### 4.1 后端
1. 在 Render Dashboard 中获取生成的域名
2. 将此域名配置到 Vercel 的 `REACT_APP_API_BASE_URL` 中

### 4.2 前端
1. 在 Vercel Dashboard 中获取生成的域名
2. 将此域名配置到 Render 的 `FRONTEND_ORIGIN` 中

## 5. 验证部署
1. 访问 Vercel 提供的前端域名
2. 测试注册和登录功能
3. 确认数据库连接正常
4. 测试 AI 分析功能

## 注意事项
1. 确保所有环境变量都正确配置
2. 数据库连接串和密钥要保密
3. 定期备份数据库
4. 监控应用性能和错误日志