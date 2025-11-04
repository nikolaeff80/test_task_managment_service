# Официальный образ Bun
FROM oven/bun:latest

# Рабочая директория
WORKDIR /app

# Копируем package.json, bun.lock и tsconfig
COPY package.json bun.lock tsconfig.json ./

# Устанавливаем зависимости
RUN bun install --production

# Копируем весь проект
COPY . .

# Устанавливаем jq для тестов
RUN apt-get update && apt-get install -y jq

# Генерируем Prisma Client
RUN bun prisma generate

# Экспонируем порт приложения
EXPOSE 3000

# Запуск миграций, seed и сервера
CMD bun prisma migrate deploy && bun run src/seed/seed.ts && bun run src/http/server.ts
