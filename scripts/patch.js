// ========== 1. СТЕНЫ: HP ×3 ==========
["copper-wall","copper-wall-large",
    "titanium-wall","titanium-wall-large",
    "plastanium-wall","plastanium-wall-large",
    "thorium-wall","thorium-wall-large",
    "surge-wall","surge-wall-large",
    "door","door-large"].forEach(w=>{
      const b = Vars.content.getByName(ContentType.block, w);
      if(b) b.health *= 0.2;
    });
    
    // ========== 2. ЦЕНА ПОСТРОЙКИ ×3 ==========
    Vars.content.blocks().each(b => {
      if(b.requirements){
        b.requirements.each(r => r.amount *= 3);
      }
    });
    
    // ========== 3. СКОРОСТЬ СТРОИТЬ ÷3 ==========
    Vars.state.rules.buildSpeedMultiplier = 1/3;
    
    // ========== 4. ЭНЕРГЕТИКА: генераторы ÷3, потребители ×3 ==========
    ["combustion-generator","thermal-generator",
    "steam-generator","differential-generator",
    "rtg-generator","solar-panel","large-solar-panel"].forEach(g=>{
       const b = Vars.content.getByName(ContentType.block, g);
       if(b && b.powerProduction) b.powerProduction /= 4;
    });
    ["mechanical-drill","pneumatic-drill",
    "airblast-drill","laser-drill","water-extractor","cultivator"].forEach(d=>{
       const b = Vars.content.getByName(ContentType.block, d);
       if(b && b.powerUse) b.powerUse *= 3;
    });
    
    // ========== 5. ДОБЫЧА: бури и помпы ÷3 ==========
    ["mechanical-drill","pneumatic-drill","airblast-drill","laser-drill"].forEach(d=>{
      const b = Vars.content.getByName(ContentType.block, d);
      if(b) b.drillTime *= 3;
    });
    ["pump","rotary-pump","thermal-pump"].forEach(p=>{
      const b = Vars.content.getByName(ContentType.block, p);
      if(b) b.pumpAmount /= 3;
    });
    
    // ========== 6. ЗАВОДЫ: крафт ÷3, энергия ×3, реагенты ×3 ==========
    Vars.content.blocks().each(b => {
      if(b.craftTime) b.craftTime *= 3;
      if(b.consumes && b.consumes.power) b.consumes.power.usage *= 3;
      if(b.consumes && b.consumes.item) b.consumes.item.items.each(i => i.amount *= 3);
      if(b.consumes && b.consumes.liquid) b.consumes.liquid.amount *= 3;
    });
    
    // ========== 7. УЗЛЫ: радиус −2 тайла ==========
    ["power-node","power-node-large","surge-tower"].forEach(n=>{
      const node = Vars.content.getByName(ContentType.block, n);
      if(node && node.laserRange){
        node.laserRange -= 16;
        if(node.laserRange < 16) node.laserRange = 16;
      }
    });
    
    // ========== 8. ЮНИТЫ: слабее, медленнее, дороже ==========
    Vars.content.units().each(u => {
      // базовые параметры
      u.speed        /= 3;
      u.weapons.each(w => {
        w.bullet.damage /= 3;
        w.bullet.reload  *= 3;
      });
    
      // после загрузки карты задаём HP и броню по команде
      Events.on(EventType.UnitCreateEvent, e => {
        if(e.unit.team == Vars.player.team()){
          // игрок: слабые
          e.unit.healthMax /= 3;
          e.unit.armor     /= 3;
        }else{
          // враг: танки
          e.unit.healthMax *= 3;
          e.unit.armor     *= 3;
        }
      });
    });
    
    // ========== 9. ГЛОБАЛЬНО: финальные множители ==========
    Vars.state.rules.buildCostMultiplier      = 3;
    Vars.state.rules.unitBuildSpeedMultiplier = 1/3;
    Vars.state.rules.waveSpacing              *= 3;
    Events.on(EventType.UnitCreateEvent, e => {
      if(e.unit.team != Vars.player.team()){          // только враг
        e.unit.weapons.each(w => w.bullet.damage *= 3);
      }
    });
    
    // 2) пули турелей (например, дуо, scatter, arc ...)
    Vars.content.blocks().each(b => {
      if(b instanceof Turret){                        // любая турель
        // клонируем shootType, чтобы не трогать игровские экземпляры
        const orig = b.shootType;
        b.shootType = new JavaAdapter(orig.class, {}, orig);
        // патчим только если турель принадлежит врагу при постройке
        Events.on(EventType.BlockBuildBeginEvent, e => {
          if(e.team != Vars.player.team() && e.block == b){
            b.shootType.damage *= 3;
          }
        });
      }
    });
    
    // 3) AoE-урон реакторов/взрывов — тоже ×3 только от врага
    Events.on(EventType.BlockDestroyEvent, e => {
      if(e.tile.build && e.tile.build.team != Vars.player.team()){
        // если нужно, можно здесь менять explosionDamage у конкретных блоков
      }
    });
    
    // ========== 10. ИГРОВСКИЕ ЯДРА: 1 HP ==========
    Events.on(EventType.WorldLoadEvent, () => {
      Vars.world.tiles.each(t => {
        if(t.build instanceof CoreBuild && t.build.team == Vars.player.team()){
          t.build.health = 1;
          t.build.armor  = 0;
        }
      });
    });