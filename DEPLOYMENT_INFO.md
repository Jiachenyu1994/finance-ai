# 部署信息

## 服务地址

- 前端: https://finance-ai-six-delta.vercel.app
- 后端: https://finance-ai.onrender.com
- 数据库: Turso (已配置)

## 环境变量配置

### 后端 (Render)
所有环境变量已配置在 Render 控制台中：
```
LIBSQL_AUTH_TOKEN=[已配置]
LIBSQL_URL=[已配置]
SECRET=[已配置]
HASH=HS256
LOGIN_EXPIRE=2
ENV=prod
OPENROUTER_API_KEY=[已配置]
OPENROUTER_BASE_URL=[已配置]
OPEN_ROUTER_MODEL=[已配置]
LLM_TIMEOUT=20
LLM_TEMPERATURE=0.2
FRONTEND_ORIGIN=https://finance-ai-six-delta.vercel.app
```

### 前端 (Vercel)
```
REACT_APP_API_BASE_URL=https://finance-ai.onrender.com
```

## 部署服务

- 前端代码库：GitHub (finance-ai 仓库)
- 前端托管：Vercel（自动部署）
- 后端托管：Render（Docker 容器，自动部署）
- 数据库：Turso（已配置并运行）

## 注意事项

1. 代码更新流程：
   - 推送代码到 GitHub
   - Vercel 和 Render 都会自动重新部署

2. 环境变量更新：
   - 前端：在 Vercel 控制台更新
   - 后端：在 Render 控制台更新

3. 数据库：
   - 使用 Turso 的云数据库
   - 配置保持不变

4. CORS 配置：
   - 后端已配置接受来自 Vercel 域名的请求
   - 本地开发时使用默认值