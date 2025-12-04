// ========== СИСТЕМА НАСТРОЕК МОДА (для Mindustry 146) ==========

// Значения по умолчанию
const DEFAULT_SETTINGS = {
    WALL_HP: 0.25,          // HP стен (0.25 = 25%)
    BUILD_COST: 3,          // Стоимость постройки
    BUILD_SPEED: 0.333,     // Скорость строительства (1/3)
    GEN_POWER: 0.25,        // Производство энергии генераторами (1/4)
    CONS_POWER: 3,          // Потребление энергии
    DRILL_TIME: 3,          // Время добычи
    PUMP: 0.333,            // Количество воды из помп (1/3)
    CRAFT_TIME: 3,          // Время крафта
    CRAFT_PWR: 3,           // Энергия для крафта
    CRAFT_RES: 3,           // Ресурсы для крафта
    NODE_R: 16,             // Уменьшение радиуса узлов
    NODE_MIN: 16,           // Минимальный радиус узла
    UNIT_SPD: 0.333,        // Скорость юнитов игрока (1/3)
    UNIT_DMG_P: 0.333,      // Урон юнитов игрока (1/3)
    UNIT_HP_P: 0.333,       // HP юнитов игрока (1/3)
    UNIT_HP_E: 3,           // HP юнитов врага
    UNIT_ARM_P: 0.333,      // Броня юнитов игрока (1/3)
    UNIT_ARM_E: 3,          // Броня юнитов врага
    UNIT_DMG_E: 3,          // Урон юнитов врага
    TURRET_DMG_E: 3,        // Урон турелей врага
    WAVE_SP: 1,             // Интервал между волнами
    CORE_HP: 1,             // HP ядер игрока
    CORE_ARM: 0             // Броня ядер игрока
};

// Текущие настройки (глобальная переменная)
var HardcoreSettings = {};

// Вспомогательная функция для копирования объекта (замена Object.assign)
function copyObject(target, source) {
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }
    return target;
}

// Вспомогательная функция для объединения объектов
function mergeObjects(obj1, obj2) {
    var result = {};
    for (var key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            result[key] = obj1[key];
        }
    }
    for (var key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            result[key] = obj2[key];
        }
    }
    return result;
}

// Загрузка настроек из Core.settings (совместимо с версией 146)
function loadHardcoreSettings() {
    try {
        // Используем Core.settings вместо localStorage
        var saved = Core.settings.getString("hardcore-x3-settings", null);
        if (saved && saved !== "null") {
            var parsed = JSON.parse(saved);
            // Объединяем с дефолтными значениями
            HardcoreSettings = mergeObjects(DEFAULT_SETTINGS, parsed);
        } else {
            HardcoreSettings = copyObject({}, DEFAULT_SETTINGS);
        }
    } catch (e) {
        print("Ошибка загрузки настроек:", e);
        HardcoreSettings = copyObject({}, DEFAULT_SETTINGS);
    }
}

// Сохранение настроек в Core.settings (совместимо с версией 146)
function saveHardcoreSettings() {
    try {
        var jsonString = JSON.stringify(HardcoreSettings);
        Core.settings.put("hardcore-x3-settings", jsonString);
        Core.settings.save();
        return true;
    } catch (e) {
        print("Ошибка сохранения настроек:", e);
        return false;
    }
}

// Сброс настроек к значениям по умолчанию
function resetHardcoreSettings() {
    HardcoreSettings = copyObject({}, DEFAULT_SETTINGS);
    saveHardcoreSettings();
}

// Инициализация при загрузке
loadHardcoreSettings();
