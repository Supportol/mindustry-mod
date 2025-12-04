// ========== UI НАСТРОЕК МОДА (для Mindustry 146) ==========

var settingsDialog = null;
var sliders = {};

// Создание диалога настроек
function createSettingsDialog() {
    if (settingsDialog) {
        settingsDialog.show();
        return;
    }

    var dialog = new BaseDialog("Настройки Мода Якушев Killer Mod");
    var cont = dialog.cont;

    // Создаём скроллируемую таблицу для настроек
    var table = new Table();
    table.defaults().pad(5).left();

    // Функция для создания ползунка с меткой
    function createSlider(name, label, min, max, step, currentValue) {
        var row = new Table();
        row.defaults().pad(5);

        // Метка
        var labelText = new Label(label);
        labelText.setWrap(true);
        labelText.setWidth(200);
        row.add(labelText).left();

        // Ползунок
        var slider = new Slider(min, max, step, false);
        slider.setValue(currentValue);
        row.add(slider).width(200).padLeft(10);

        // Текстовое поле для точного ввода
        var valueField = new TextField(String(currentValue.toFixed(2)), Styles.areaField);
        valueField.setWidth(80);
        valueField.setFilter(function(text, char) {
            // Разрешаем только цифры, точку и минус
            return /[0-9.\-]/.test(char);
        });
        
        // Обновление текстового поля при изменении ползунка
        slider.changed(function() {
            var val = slider.getValue();
            valueField.setText(val.toFixed(2));
            HardcoreSettings[name] = val;
        });

        // Обновление ползунка при изменении текстового поля
        valueField.changed(function() {
            try {
                var val = parseFloat(valueField.getText());
                if (!isNaN(val) && val >= min && val <= max) {
                    slider.setValue(val);
                    HardcoreSettings[name] = val;
                }
            } catch (e) {
                // Игнорируем ошибки парсинга
            }
        });

        row.add(valueField).padLeft(10);
        sliders[name] = { slider: slider, valueField: valueField };
        return row;
    }

    // Группа: Строительство
    table.add(new Label("Строительство")).left().colspan(3);
    table.row();
    table.add(createSlider("BUILD_COST", "Стоимость постройки", 1, 10, 0.1, HardcoreSettings.BUILD_COST)).colspan(3);
    table.row();
    table.add(createSlider("BUILD_SPEED", "Скорость строительства", 0.1, 1, 0.01, HardcoreSettings.BUILD_SPEED)).colspan(3);
    table.row();
    table.add(createSlider("WALL_HP", "HP стен (множитель)", 0.1, 1, 0.01, HardcoreSettings.WALL_HP)).colspan(3);
    table.row();
    table.add().height(10).colspan(3);
    table.row();

    // Группа: Энергетика
    table.add(new Label("Энергетика")).left().colspan(3);
    table.row();
    table.add(createSlider("GEN_POWER", "Производство энергии", 0.1, 1, 0.01, HardcoreSettings.GEN_POWER)).colspan(3);
    table.row();
    table.add(createSlider("CONS_POWER", "Потребление энергии", 1, 10, 0.1, HardcoreSettings.CONS_POWER)).colspan(3);
    table.row();
    table.add(createSlider("NODE_R", "Уменьшение радиуса узлов", 0, 32, 1, HardcoreSettings.NODE_R)).colspan(3);
    table.row();
    table.add().height(10).colspan(3);
    table.row();

    // Группа: Добыча
    table.add(new Label("Добыча")).left().colspan(3);
    table.row();
    table.add(createSlider("DRILL_TIME", "Время добычи", 1, 10, 0.1, HardcoreSettings.DRILL_TIME)).colspan(3);
    table.row();
    table.add(createSlider("PUMP", "Количество воды", 0.1, 1, 0.01, HardcoreSettings.PUMP)).colspan(3);
    table.row();
    table.add().height(10).colspan(3);
    table.row();

    // Группа: Производство
    table.add(new Label("Производство")).left().colspan(3);
    table.row();
    table.add(createSlider("CRAFT_TIME", "Время крафта", 1, 10, 0.1, HardcoreSettings.CRAFT_TIME)).colspan(3);
    table.row();
    table.add(createSlider("CRAFT_PWR", "Энергия для крафта", 1, 10, 0.1, HardcoreSettings.CRAFT_PWR)).colspan(3);
    table.row();
    table.add(createSlider("CRAFT_RES", "Ресурсы для крафта", 1, 10, 0.1, HardcoreSettings.CRAFT_RES)).colspan(3);
    table.row();
    table.add().height(10).colspan(3);
    table.row();

    // Группа: Юниты игрока
    table.add(new Label("Юниты игрока")).left().colspan(3);
    table.row();
    table.add(createSlider("UNIT_SPD", "Скорость", 0.1, 1, 0.01, HardcoreSettings.UNIT_SPD)).colspan(3);
    table.row();
    table.add(createSlider("UNIT_DMG_P", "Урон", 0.1, 1, 0.01, HardcoreSettings.UNIT_DMG_P)).colspan(3);
    table.row();
    table.add(createSlider("UNIT_HP_P", "HP", 0.1, 1, 0.01, HardcoreSettings.UNIT_HP_P)).colspan(3);
    table.row();
    table.add(createSlider("UNIT_ARM_P", "Броня", 0.1, 1, 0.01, HardcoreSettings.UNIT_ARM_P)).colspan(3);
    table.row();
    table.add().height(10).colspan(3);
    table.row();

    // Группа: Вражеские юниты
    table.add(new Label("Вражеские юниты")).left().colspan(3);
    table.row();
    table.add(createSlider("UNIT_HP_E", "HP", 1, 10, 0.1, HardcoreSettings.UNIT_HP_E)).colspan(3);
    table.row();
    table.add(createSlider("UNIT_ARM_E", "Броня", 1, 10, 0.1, HardcoreSettings.UNIT_ARM_E)).colspan(3);
    table.row();
    table.add(createSlider("UNIT_DMG_E", "Урон", 1, 10, 0.1, HardcoreSettings.UNIT_DMG_E)).colspan(3);
    table.row();
    table.add(createSlider("TURRET_DMG_E", "Урон турелей", 1, 10, 0.1, HardcoreSettings.TURRET_DMG_E)).colspan(3);
    table.row();
    table.add().height(10).colspan(3);
    table.row();

    // Группа: Дополнительно
    table.add(new Label("Дополнительно")).left().colspan(3);
    table.row();
    table.add(createSlider("WAVE_SP", "Интервал между волнами", 0.5, 5, 0.1, HardcoreSettings.WAVE_SP)).colspan(3);
    table.row();
    table.add(createSlider("CORE_HP", "HP ядер игрока", 1, 1000, 1, HardcoreSettings.CORE_HP)).colspan(3);
    table.row();
    table.add(createSlider("CORE_ARM", "Броня ядер игрока", 0, 100, 1, HardcoreSettings.CORE_ARM)).colspan(3);
    table.row();

    // Скролл панель
    var scroll = new ScrollPane(table);
    scroll.setFadeScrollBars(false);
    scroll.setScrollingDisabled(true, false);
    cont.add(scroll).size(600, 500).pad(10);

    cont.row();

    // Кнопки
    var buttons = new Table();
    buttons.defaults().size(120, 50).pad(5);

    var saveBtn = new TextButton("Сохранить", Styles.defaultt);
    saveBtn.clicked(function() {
        if (saveHardcoreSettings()) {
            Vars.ui.showInfoToast("Настройки сохранены!", 2);
            dialog.hide();
            Vars.ui.showInfoToast("Перезапустите игру для применения настроек", 3);
        } else {
            Vars.ui.showInfoToast("Ошибка сохранения!", 2);
        }
    });
    buttons.add(saveBtn);

    var resetBtn = new TextButton("Сброс", Styles.defaultt);
    resetBtn.clicked(function() {
        resetHardcoreSettings();
        // Обновляем все ползунки
        for (var key in sliders) {
            if (sliders.hasOwnProperty(key) && sliders[key] && HardcoreSettings[key] !== undefined) {
                sliders[key].slider.setValue(HardcoreSettings[key]);
                sliders[key].valueField.setText(HardcoreSettings[key].toFixed(2));
            }
        }
        Vars.ui.showInfoToast("Настройки сброшены!", 2);
    });
    buttons.add(resetBtn);

    var cancelBtn = new TextButton("Отмена", Styles.defaultt);
    cancelBtn.clicked(function() {
        // Загружаем сохранённые настройки обратно
        loadHardcoreSettings();
        dialog.hide();
    });
    buttons.add(cancelBtn);

    cont.add(buttons).pad(10);

    settingsDialog = dialog;
    dialog.show();
}

// Создание кнопки в HUD (совместимо с версией 146)
Events.on(EventType.ClientLoadEvent, function() {
    Timer.schedule(function() {
        var btn = new TextButton("Настройки Якушев Killer Mod", Styles.defaultt);
        btn.setSize(150, 40);
        btn.clicked(function() {
            createSettingsDialog();
        });
        // Размещаем кнопку в правом верхнем углу
        btn.setPosition(Vars.graphics.getWidth() - 160, Vars.graphics.getHeight() - 50);
        Vars.ui.hudGroup.addActor(btn);
    }, 0.5);
});
