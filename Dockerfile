FROM node:20-alpine

WORKDIR /app

# Переменная используется в entrypoint для условной переустановки зависимостей
ENV CI=true

# Копируем манифест и .npmrc — npm подхватит legacy-peer-deps
COPY package*.json .npmrc ./

# Чистая установка с учётом legacy-peer-deps (на случай если .npmrc не подтянется)
RUN npm install --legacy-peer-deps

# Исходники будут смонтированы через volume, поэтому их копирование не требуется

EXPOSE 5173

# Запуск dev-сервера на всех интерфейсах (чтобы был доступен с хоста)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
