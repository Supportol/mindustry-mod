// ========== КОНСТАНТЫ МОДИФИКАЦИЙ ==========
const MULTIPLIERS = {
    WALL_HP: 0.2,              // HP стен
    BUILD_COST: 3,              // Стоимость постройки
    BUILD_SPEED: 1/3,           // Скорость строительства
    GENERATOR_POWER: 1/4,       // Производство энергии генераторами
    CONSUMER_POWER: 3,          // Потребление энергии
    DRILL_TIME: 3,              // Время добычи
    PUMP_AMOUNT: 1/3,           // Количество воды из помп
    CRAFT_TIME: 3,              // Время крафта
    CRAFT_POWER: 3,             // Энергия для крафта
    CRAFT_RESOURCES: 3,         // Ресурсы для крафта
    NODE_RANGE_REDUCTION: 16,   // Уменьшение радиуса узлов
    NODE_MIN_RANGE: 16,         // Минимальный радиус узла
    UNIT_SPEED: 1/3,            // Скорость юнитов игрока
    UNIT_DAMAGE_PLAYER: 1/3,    // Урон юнитов игрока
    UNIT_RELOAD: 3,             // Перезарядка оружия
    UNIT_HP_PLAYER: 1/3,        // HP юнитов игрока
    UNIT_HP_ENEMY: 3,           // HP юнитов врага
    UNIT_ARMOR_PLAYER: 1/3,     // Броня юнитов игрока
    UNIT_ARMOR_ENEMY: 3,        // Броня юнитов врага
    UNIT_DAMAGE_ENEMY: 3,       // Урон юнитов врага
    TURRET_DAMAGE_ENEMY: 3,     // Урон турелей врага
    WAVE_SPACING: 3,            // Интервал между волнами
    CORE_HP: 1,                 // HP ядер игрока
    CORE_ARMOR: 0               // Броня ядер игрока
};

// ========== СПИСКИ БЛОКОВ ==========
const WALL_BLOCKS = [
    "copper-wall", "copper-wall-large",
    "titanium-wall", "titanium-wall-large",
    "plastanium-wall", "plastanium-wall-large",
    "thorium-wall", "thorium-wall-large",
    "surge-wall", "surge-wall-large",
    "door", "door-large"
];

const GENERATOR_BLOCKS = [
    "combustion-generator", "thermal-generator",
    "steam-generator", "differential-generator",
    "rtg-generator", "solar-panel", "large-solar-panel"
];

const DRILL_BLOCKS = [
    "mechanical-drill", "pneumatic-drill",
    "airblast-drill", "laser-drill"
];

const POWER_CONSUMER_BLOCKS = [
    "mechanical-drill", "pneumatic-drill",
    "airblast-drill", "laser-drill",
    "water-extractor", "cultivator"
];

const PUMP_BLOCKS = [
    "pump", "rotary-pump", "thermal-pump"
];

const NODE_BLOCKS = [
    "power-node", "power-node-large", "surge-tower"
];

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function getBlock(name) {
    const block = Vars.content.getByName(ContentType.block, name);
    return block || null;
}

function patchWalls() {
    WALL_BLOCKS.forEach(name => {
        const block = getBlock(name);
        if (block && block.health) {
            block.health *= MULTIPLIERS.WALL_HP;
        }
    });
}

function patchBuildCosts() {
    Vars.content.blocks().each(b => {
        if (b && b.requirements) {
            b.requirements.each(r => {
                if (r) r.amount *= MULTIPLIERS.BUILD_COST;
            });
        }
    });
}

function patchGenerators() {
    GENERATOR_BLOCKS.forEach(name => {
        const block = getBlock(name);
        if (block && block.powerProduction) {
            block.powerProduction *= MULTIPLIERS.GENERATOR_POWER;
        }
    });
}

function patchPowerConsumers() {
    POWER_CONSUMER_BLOCKS.forEach(name => {
        const block = getBlock(name);
        if (block && block.powerUse) {
            block.powerUse *= MULTIPLIERS.CONSUMER_POWER;
        }
    });
}

function patchDrills() {
    DRILL_BLOCKS.forEach(name => {
        const block = getBlock(name);
        if (block && block.drillTime) {
            block.drillTime *= MULTIPLIERS.DRILL_TIME;
        }
    });
}

function patchPumps() {
    PUMP_BLOCKS.forEach(name => {
        const block = getBlock(name);
        if (block && block.pumpAmount) {
            block.pumpAmount *= MULTIPLIERS.PUMP_AMOUNT;
        }
    });
}

function patchFactories() {
    Vars.content.blocks().each(b => {
        if (!b) return;
        
        if (b.craftTime) {
            b.craftTime *= MULTIPLIERS.CRAFT_TIME;
        }
        
        if (b.consumes) {
            if (b.consumes.power && b.consumes.power.usage) {
                b.consumes.power.usage *= MULTIPLIERS.CRAFT_POWER;
            }
            if (b.consumes.item && b.consumes.item.items) {
                b.consumes.item.items.each(i => {
                    if (i) i.amount *= MULTIPLIERS.CRAFT_RESOURCES;
                });
            }
            if (b.consumes.liquid && b.consumes.liquid.amount) {
                b.consumes.liquid.amount *= MULTIPLIERS.CRAFT_RESOURCES;
            }
        }
    });
}

function patchNodes() {
    NODE_BLOCKS.forEach(name => {
        const node = getBlock(name);
        if (node && node.laserRange) {
            node.laserRange -= MULTIPLIERS.NODE_RANGE_REDUCTION;
            if (node.laserRange < MULTIPLIERS.NODE_MIN_RANGE) {
                node.laserRange = MULTIPLIERS.NODE_MIN_RANGE;
            }
        }
    });
}

function patchUnits() {
    Vars.content.units().each(u => {
        if (!u) return;
        
        // Базовые параметры для всех юнитов
        if (u.speed) u.speed *= MULTIPLIERS.UNIT_SPEED;
        
        if (u.weapons) {
            u.weapons.each(w => {
                if (w && w.bullet) {
                    if (w.bullet.damage) {
                        w.bullet.damage *= MULTIPLIERS.UNIT_DAMAGE_PLAYER;
                    }
                    if (w.bullet.reload) {
                        w.bullet.reload *= MULTIPLIERS.UNIT_RELOAD;
                    }
                }
            });
        }
    });
}

function patchTurrets() {
    const enemyTurretBullets = new Map();
    
    Vars.content.blocks().each(b => {
        if (!b || !(b instanceof Turret)) return;
        if (!b.shootType) return;
        
        // Сохраняем оригинальный урон для каждой турели
        const originalDamage = b.shootType.damage;
        if (originalDamage) {
            enemyTurretBullets.set(b, originalDamage);
        }
    });
    
    // Один обработчик для всех турелей врага
    Events.on(EventType.BlockBuildBeginEvent, e => {
        if (!e || !e.block || !e.team) return;
        
        if (e.block instanceof Turret && e.team != Vars.player.team()) {
            const originalDamage = enemyTurretBullets.get(e.block);
            if (originalDamage && e.block.shootType) {
                // Устанавливаем урон ×3 от оригинального
                e.block.shootType.damage = originalDamage * MULTIPLIERS.TURRET_DAMAGE_ENEMY;
            }
        }
    });
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ (регистрируются ОДИН РАЗ) ==========
function setupEventHandlers() {
    // Обработчик создания юнитов (объединенный)
    Events.on(EventType.UnitCreateEvent, e => {
        if (!e || !e.unit) return;
        
        const isPlayerTeam = e.unit.team == Vars.player.team();
        
        if (isPlayerTeam) {
            // Игрок: слабые юниты
            if (e.unit.healthMax) e.unit.healthMax *= MULTIPLIERS.UNIT_HP_PLAYER;
            if (e.unit.armor) e.unit.armor *= MULTIPLIERS.UNIT_ARMOR_PLAYER;
        } else {
            // Враг: сильные юниты
            if (e.unit.healthMax) e.unit.healthMax *= MULTIPLIERS.UNIT_HP_ENEMY;
            if (e.unit.armor) e.unit.armor *= MULTIPLIERS.UNIT_ARMOR_ENEMY;
            
            // Урон оружия врага ×3
            if (e.unit.weapons) {
                e.unit.weapons.each(w => {
                    if (w && w.bullet && w.bullet.damage) {
                        w.bullet.damage *= MULTIPLIERS.UNIT_DAMAGE_ENEMY;
                    }
                });
            }
        }
    });
    
    // Обработчик загрузки мира для ядер
    Events.on(EventType.WorldLoadEvent, () => {
        if (!Vars.world || !Vars.world.tiles) return;
        
        Vars.world.tiles.each(t => {
            if (!t || !t.build) return;
            
            if (t.build instanceof CoreBuild && t.build.team == Vars.player.team()) {
                t.build.health = MULTIPLIERS.CORE_HP;
                t.build.armor = MULTIPLIERS.CORE_ARMOR;
            }
        });
    });
    
    // Обработчик разрушения блоков (заглушка для будущих улучшений)
    Events.on(EventType.BlockDestroyEvent, e => {
        if (!e || !e.tile || !e.tile.build) return;
        
        if (e.tile.build.team != Vars.player.team()) {
            // Здесь можно добавить логику для AoE-урона от вражеских блоков
        }
    });
}

// ========== ГЛОБАЛЬНЫЕ ПРАВИЛА ==========
function setupGlobalRules() {
    if (!Vars.state || !Vars.state.rules) return;
    
    Vars.state.rules.buildCostMultiplier = MULTIPLIERS.BUILD_COST;
    Vars.state.rules.buildSpeedMultiplier = MULTIPLIERS.BUILD_SPEED;
    Vars.state.rules.unitBuildSpeedMultiplier = MULTIPLIERS.UNIT_SPEED;
    
    if (Vars.state.rules.waveSpacing) {
        Vars.state.rules.waveSpacing *= MULTIPLIERS.WAVE_SPACING;
    }
}

// ========== ГЛАВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ ==========
function init() {
    // Патчинг блоков
    patchWalls();
    patchBuildCosts();
    patchGenerators();
    patchPowerConsumers();
    patchDrills();
    patchPumps();
    patchFactories();
    patchNodes();
    
    // Патчинг юнитов
    patchUnits();
    
    // Патчинг турелей
    patchTurrets();
    
    // Настройка глобальных правил
    setupGlobalRules();
    
    // Регистрация обработчиков событий (ОДИН РАЗ)
    setupEventHandlers();
}

// Запуск инициализации
init();
