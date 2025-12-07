// Минимальный рабочий мод - удваивает стоимость всех блоков
Events.on(ContentInitEvent, () => {
    const timestamp = new Date().toISOString();
    const log = (msg) => print("[" + timestamp + "] [Hardcore Mod] " + msg);
    
    const blocks = Vars.content.blocks();
    let modifiedCount = 0;
    let firstBlockInfo = null;
    let firstReqInfo = null;
    
    log("Начало обработки блоков. Всего: " + blocks.size);
    
    // Обрабатываем все блоки
    for (let i = 0; i < blocks.size; i++) {
        const block = blocks.get(i);
        
        // Проверяем наличие requirements
        if (block.requirements) {
            // requirements - это массив Java, используем только .length
            const reqSize = block.requirements.length;
            
            // Если есть требования, обрабатываем их
            if (reqSize > 0) {
                // Сохраняем информацию о первом блоке для отладки
                if (firstBlockInfo === null) {
                    firstBlockInfo = {
                        name: block.name,
                        index: i,
                        reqSize: reqSize
                    };
                    
                    // Сохраняем информацию о первом requirement
                    const firstReq = block.requirements[0];
                    if (firstReq) {
                        firstReqInfo = {
                            item: firstReq.item ? firstReq.item.name : "unknown",
                            amountBefore: firstReq.amount
                        };
                    }
                }
                
                // Удваиваем каждое требование (используем индексацию массива)
                for (let j = 0; j < reqSize; j++) {
                    const req = block.requirements[j];
                    if (req && req.amount !== undefined) {
                        req.amount *= 2;
                    }
                }
                modifiedCount++;
            }
        }
    }
    
    // Выводим информацию
    if (firstBlockInfo) {
        log("Первый блок с требованиями: " + firstBlockInfo.name + " (#" + firstBlockInfo.index + ", reqs: " + firstBlockInfo.reqSize + ")");
        if (firstReqInfo) {
            log("Первый requirement: " + firstReqInfo.item + " = " + firstReqInfo.amountBefore + " -> " + (firstReqInfo.amountBefore * 2));
        }
    }
    log("Обработано блоков: " + modifiedCount);
});

