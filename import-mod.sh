#!/bin/bash

# Скрипт для импорта мода в Mindustry
# Использование: 
#   ./import-mod.sh
#   или
#   bash import-mod.sh

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Путь к директории мода
MOD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GAME_DIR="/home/yurets/projects/mindustry-linux-64-bit"

# Проверка существования директории игры
if [ ! -d "$GAME_DIR" ]; then
    echo -e "${RED}Ошибка: Директория игры не найдена: $GAME_DIR${NC}"
    exit 1
fi

# Проверка существования mod.hjson
if [ ! -f "$MOD_DIR/mod.hjson" ]; then
    echo -e "${RED}Ошибка: Файл mod.hjson не найден в директории мода${NC}"
    exit 1
fi

# Получаем имя мода из mod.hjson
MOD_NAME=$(grep -E "^name:" "$MOD_DIR/mod.hjson" | sed 's/name:[[:space:]]*//' | tr -d '"' | tr -d "'")

if [ -z "$MOD_NAME" ]; then
    echo -e "${YELLOW}Предупреждение: Не удалось определить имя мода из mod.hjson, используется 'hardcore'${NC}"
    MOD_NAME="hardcore"
fi

# Определяем путь к папке модов
# Сначала проверяем стандартное место в домашней директории
MODS_DIR="$HOME/.local/share/Mindustry/mods"

# Если не существует, создаем
if [ ! -d "$MODS_DIR" ]; then
    echo -e "${YELLOW}Создаю директорию для модов: $MODS_DIR${NC}"
    mkdir -p "$MODS_DIR"
fi

# Путь к целевому архиву
TARGET_ZIP="$MODS_DIR/$MOD_NAME.zip"

echo -e "${GREEN}Импорт мода '$MOD_NAME'...${NC}"
echo -e "Источник: $MOD_DIR"
echo -e "Назначение: $TARGET_ZIP"

# Удаляем старую версию архива, если существует
if [ -f "$TARGET_ZIP" ]; then
    echo -e "${YELLOW}Удаляю старую версию архива...${NC}"
    rm -f "$TARGET_ZIP"
fi

# Создаем временную директорию для архивации
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

echo -e "${GREEN}Создаю архив мода...${NC}"

# Копируем содержимое мода во временную директорию, исключая служебные файлы
cd "$MOD_DIR"
find . -mindepth 1 -maxdepth 1 ! -name '.git' ! -name 'import-mod.sh' ! -name 'README-import.md' ! -name '.gitignore' -exec cp -r {} "$TEMP_DIR/" \;

# Создаем zip-архив
cd "$TEMP_DIR"
zip -r "$TARGET_ZIP" . > /dev/null

echo -e "${GREEN}✓ Мод успешно импортирован!${NC}"
echo -e "Архив находится в: $TARGET_ZIP"
echo -e "\nТеперь вы можете запустить игру и активировать мод в меню модов."

