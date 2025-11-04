#!/bin/bash
set -e

BASE_URL="http://localhost:3000"

echo "🌱 Проверка API задач..."

# Получаем список задач
tasks=$(curl -s -X GET "$BASE_URL/tasks")

# Проверяем, что обе задачи из seed.ts присутствуют
if echo "$tasks" | grep -q "Finish backend architecture" && echo "$tasks" | grep -q "Write project README"; then
  echo "Список задач содержит все seeded задачи"
else
  echo "Ошибка: список задач не содержит все seeded задачи"
  echo "$tasks"
  exit 1
fi

# Берём ID первой задачи для теста обновления и удаления
task_id=$(echo "$tasks" | jq -r '.[0].id')

# Проверка обновления
update_response=$(curl -s -X PUT "$BASE_URL/tasks/$task_id" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated task","description":"Updated via test","status":"completed"}')

if echo "$update_response" | grep -q "Updated task"; then
  echo "Обновление задачи прошло успешно"
else
  echo "Ошибка при обновлении задачи"
  echo "$update_response"
  exit 1
fi

# Проверка удаления
curl -s -X DELETE "$BASE_URL/tasks/$task_id"

# Проверка, что задача удалена
tasks_after_delete=$(curl -s -X GET "$BASE_URL/tasks")
if echo "$tasks_after_delete" | grep -q "$task_id"; then
  echo "Ошибка: задача не была удалена"
  exit 1
else
  echo "Задача успешно удалена"
fi

echo "Все проверки пройдены!"
