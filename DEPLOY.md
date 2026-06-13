# 腾讯云部署指南

## 前置准备

1. 购买腾讯云轻量应用服务器（推荐 Docker 镜像）
2. 获取服务器公网 IP
3. 确保本地有 git 和 SSH 工具

## 部署步骤

### 1. 本地提交 Docker 配置文件

```bash
git add docker-compose.yml backend/Dockerfile frontend/Dockerfile frontend/nginx.conf DEPLOY.md
git commit -m "Add Docker deployment files"
git push
```

### 2. 连接服务器

```bash
ssh root@你的服务器IP
# 输入密码
```

### 3. 在服务器上克隆代码

```bash
cd /root
git clone https://github.com/eriachen/Traces-of-poetry.git
cd Traces-of-poetry
```

### 4. 启动服务

```bash
docker-compose up -d
```

### 5. 等待部署完成

第一次启动需要下载镜像和安装依赖，约 5-10 分钟。

查看状态：
```bash
docker-compose logs -f
```

### 6. 访问应用

在浏览器访问：`http://你的服务器IP`

## 更新代码

当你在本地更新代码后：

1. 推送代码到 GitHub
2. 在服务器上：
```bash
cd /root/Traces-of-poetry
git pull
docker-compose up -d --build
```

## 常用命令

查看服务状态：
```bash
docker-compose ps
```

查看日志：
```bash
docker-compose logs -f
```

停止服务：
```bash
docker-compose down
```

## 安全建议

1. 修改默认数据库密码
2. 设置防火墙规则，只开放必要端口
3. 定期备份数据库
