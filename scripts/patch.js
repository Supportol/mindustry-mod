// ========== ЗАГРУЗКА НАСТРОЕК ==========
// Настройки загружаются из settings.js при инициализации
// Используем глобальную переменную HardcoreSettings

// ========== СПИСКИ БЛОКОВ ==========
const WALLS  = ["copper-wall","copper-wall-large","titanium-wall","titanium-wall-large",
                "plastanium-wall","plastanium-wall-large","thorium-wall","thorium-wall-large",
                "surge-wall","surge-wall-large","door","door-large"];
const GENS   = ["combustion-generator","thermal-generator","steam-generator",
                "differential-generator","rtg-generator","solar-panel","large-solar-panel"];
const DRILLS = ["mechanical-drill","pneumatic-drill","airblast-drill","laser-drill"];
const PUMPS  = ["pump","rotary-pump","thermal-pump"];
const NODES  = ["power-node","power-node-large","surge-tower"];

// ========== ПАТЧИ БЛОКОВ ==========
function patchBlocks(){
    // стены
    WALLS.forEach(w => {
        const b = Vars.content.getByName(ContentType.block, w);
        if(b && b.health) b.health *= HardcoreSettings.WALL_HP;
    });

    // цена постройки
    Vars.content.blocks().each(b => {
        if(b && b.requirements){
            for(let i = 0; i < b.requirements.length; i++) {
                if(b.requirements[i]) b.requirements[i].amount *= HardcoreSettings.BUILD_COST;
            }
        }
    });

    // генераторы
    GENS.forEach(g => {
        const b = Vars.content.getByName(ContentType.block, g);
        if(b && b.powerProduction) b.powerProduction *= HardcoreSettings.GEN_POWER;
    });

    // реакторы
    ["thorium-reactor","impulse-reactor"].forEach(r => {
        const b = Vars.content.getByName(ContentType.block, r);
        if(b){
            if(b.heatOutput) b.heatOutput *= HardcoreSettings.GEN_POWER;
            if(b.powerProduction) b.powerProduction *= HardcoreSettings.GEN_POWER;
        }
    });

    // потребители энергии
    DRILLS.forEach(d => {
        const b = Vars.content.getByName(ContentType.block, d);
        if(b && b.powerUse) b.powerUse *= HardcoreSettings.CONS_POWER;
    });
    
    // водные экстракторы и культиваторы
    ["water-extractor","cultivator"].forEach(d => {
        const b = Vars.content.getByName(ContentType.block, d);
        if(b && b.powerUse) b.powerUse *= HardcoreSettings.CONS_POWER;
    });

    // добыча
    DRILLS.forEach(d => {
        const b = Vars.content.getByName(ContentType.block, d);
        if(b && b.drillTime) b.drillTime *= HardcoreSettings.DRILL_TIME;
    });
    
    // помпы
    PUMPS.forEach(p => {
        const b = Vars.content.getByName(ContentType.block, p);
        if(b && b.pumpAmount) b.pumpAmount *= HardcoreSettings.PUMP;
    });

    // заводы: время, энергия, ресурсы
    Vars.content.blocks().each(b => {
        if(!b) return;
        
        if(b.craftTime) b.craftTime *= HardcoreSettings.CRAFT_TIME;
        
        if(b.consumes){
            if(b.consumes.power && b.consumes.power.usage) {
                b.consumes.power.usage *= HardcoreSettings.CRAFT_PWR;
            }
            if(b.consumes.item && b.consumes.item.items){
                for(let i = 0; i < b.consumes.item.items.length; i++) {
                    if(b.consumes.item.items[i]) {
                        b.consumes.item.items[i].amount *= HardcoreSettings.CRAFT_RES;
                    }
                }
            }
            if(b.consumes.liquid && b.consumes.liquid.amount) {
                b.consumes.liquid.amount *= HardcoreSettings.CRAFT_RES;
            }
        }
    });

    // узлы: уменьшение радиуса
    NODES.forEach(n => {
        const b = Vars.content.getByName(ContentType.block, n);
        if(b && b.laserRange){
            b.laserRange -= HardcoreSettings.NODE_R;
            if(b.laserRange < HardcoreSettings.NODE_MIN) b.laserRange = HardcoreSettings.NODE_MIN;
        }
    });
}

// ========== ПАТЧИ ЮНИТОВ ==========
function patchUnits(){
    Vars.content.units().each(u => {
        if(!u) return;
        
        // Базовые параметры для всех юнитов
        if(u.speed) u.speed *= HardcoreSettings.UNIT_SPD;
        
        if(u.weapons){
            u.weapons.each(w => {
                if(w && w.bullet){
                    if(w.bullet.damage) w.bullet.damage *= HardcoreSettings.UNIT_DMG_P;
                    if(w.bullet.reload) w.bullet.reload *= (1 / HardcoreSettings.UNIT_DMG_P); // обратный множитель для перезарядки
                }
            });
        }
    });
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
function setupEvents(){
    // Юниты: игрок слабее, враг сильнее
    Events.on(EventType.UnitCreateEvent, e => {
        if(!e || !e.unit) return;
        
        const u = e.unit;
        const isPlayerTeam = u.team === Vars.player.team();
        
        if(isPlayerTeam){
            // Игрок: слабые юниты
            if(u.maxHealth) u.health = u.maxHealth * HardcoreSettings.UNIT_HP_P;
            if(u.armor !== undefined) u.armor *= HardcoreSettings.UNIT_ARM_P;
        } else {
            // Враг: сильные юниты
            if(u.maxHealth) u.health = u.maxHealth * HardcoreSettings.UNIT_HP_E;
            if(u.armor !== undefined) u.armor *= HardcoreSettings.UNIT_ARM_E;
            
            // Урон оружия врага
            if(u.weapons){
                u.weapons.each(w => {
                    if(w && w.bullet && w.bullet.damage){
                        w.bullet.damage *= HardcoreSettings.UNIT_DMG_E;
                    }
                });
            }
        }
    });

    // Турели врага: увеличенный урон
    Events.on(EventType.BlockBuildBeginEvent, e => {
        if(!e || !e.block || !e.team) return;
        
        if(e.block instanceof Turret && e.team !== Vars.player.team() && e.block.shootType){
            const orig = e.block.shootType;
            e.block.shootType = new JavaAdapter(orig.class, {}, orig);
            if(e.block.shootType.damage) {
                e.block.shootType.damage *= HardcoreSettings.TURRET_DMG_E;
            }
        }
    });

    // Ядра игрока: минимальный HP
    Events.on(EventType.WorldLoadEvent, () => {
        if(!Vars.world || !Vars.world.tiles) return;
        
        Vars.world.tiles.each(t => {
            if(!t || !t.build) return;
            
            const build = t.build;
            if(build.team === Vars.player.team() &&
               build instanceof mindustry.world.blocks.storage.CoreBlock.CoreBuild){
                build.health = HardcoreSettings.CORE_HP;
                build.armor = HardcoreSettings.CORE_ARM;
            }
        });
    });
}

// ========== ГЛОБАЛЬНЫЕ ПРАВИЛА ==========
function setupGlobalRules(){
    if(!Vars.state || !Vars.state.rules) return;
    
    Vars.state.rules.buildCostMultiplier = HardcoreSettings.BUILD_COST;
    Vars.state.rules.buildSpeedMultiplier = HardcoreSettings.BUILD_SPEED;
    Vars.state.rules.unitBuildSpeedMultiplier = HardcoreSettings.UNIT_SPD;
    
    if(Vars.state.rules.waveSpacing) {
        Vars.state.rules.waveSpacing *= HardcoreSettings.WAVE_SP;
    }
}

// ========== ЗАПУСК ==========
// Убеждаемся, что настройки загружены
// Если settings.js ещё не загрузился, загружаем настройки здесь
function hasKeys(obj) {
    if (!obj) return false;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) return true;
    }
    return false;
}

if(typeof HardcoreSettings === 'undefined' || !HardcoreSettings || !hasKeys(HardcoreSettings)){
    // Если функция загрузки доступна, используем её, иначе создаём дефолтные настройки
    if(typeof loadHardcoreSettings === 'function'){
        loadHardcoreSettings();
    } else {
        // Временные значения по умолчанию на случай, если settings.js не загрузился
        HardcoreSettings = {
            WALL_HP: 0.25, BUILD_COST: 3, BUILD_SPEED: 0.333,
            GEN_POWER: 0.25, CONS_POWER: 3, DRILL_TIME: 3, PUMP: 0.333,
            CRAFT_TIME: 3, CRAFT_PWR: 3, CRAFT_RES: 3,
            NODE_R: 16, NODE_MIN: 16, UNIT_SPD: 0.333, UNIT_DMG_P: 0.333,
            UNIT_HP_P: 0.333, UNIT_HP_E: 3, UNIT_ARM_P: 0.333, UNIT_ARM_E: 3,
            UNIT_DMG_E: 3, TURRET_DMG_E: 3, WAVE_SP: 1, CORE_HP: 1, CORE_ARM: 0
        };
    }
}

patchBlocks();
patchUnits();
setupEvents();
setupGlobalRules();
