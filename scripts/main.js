// Минимальный рабочий мод - удваивает стоимость всех блоков
Events.on(ContentInitEvent, () => {
    const blocks = Vars.content.blocks();
    
    for (let i = 0; i < blocks.size; i++) {
        const block = blocks.get(i);
        
        if (block.requirements && block.requirements.length > 0) {
            for (let j = 0; j < block.requirements.length; j++) {
                block.requirements[j].amount *= 2;
            }
        }
    }
    
    print("[Hardcore Mod] Стоимость всех блоков удвоена!");
});

