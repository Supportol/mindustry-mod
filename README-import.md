# Инструкция по импорту мода

## Запуск скрипта импорта

Если при запуске `./import-mod.sh` возникает ошибка "Permission denied", используйте один из следующих способов:

### Способ 1: Запуск через bash
```bash
bash import-mod.sh
```

### Способ 2: Установка прав на выполнение
```bash
chmod +x import-mod.sh
./import-mod.sh
```

### Способ 3: Если файл в git репозитории
```bash
git update-index --chmod=+x import-mod.sh
chmod +x import-mod.sh
./import-mod.sh
```

## Что делает скрипт

Скрипт копирует мод из текущей директории в `~/.local/share/Mindustry/mods/` с именем, указанным в `mod.hjson`.

После импорта мод будет доступен в игре через меню модов.

