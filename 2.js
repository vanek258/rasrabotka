const readline = require('readline');

function carDealerChat() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const responses = {
        budget: [
            "На такую сумму могу предложить несколько вариантов",
            "За эти деньги найдем хорошую машину", 
            "Бюджет скромный, но что-то подберем"
        ],
        condition: [
            "Машина в отличном состоянии",
            "Есть мелкие косяки, но ничего серьезного",
            "Полностью исправна, не битая"
        ],
        inspection: [
            "Можете посмотреть в любое время",
            "Машина у меня, приезжайте когда удобно",
            "Нужно заранее договориться об осмотре"
        ],
        price: [
            "Цена обсуждается",
            "Могу немного скинуть",
            "Цена фиксированная, машина того стоит"  
        ],
        documents: [
            "Все документы готовы",
            "ПТС оригинал",
            "Переоформление за один день"
        ]
    };

    console.log("Здравствуйте! Ищете машину?");

    const questions = [
        "Какой у вас бюджет?",
        "Какое состояние интересует?",
        "Когда сможете посмотреть?",
        "Цена окончательная?",
        "Документы в порядке?"
    ];

    let currentQuestion = 0;

    function ask() {
        if (currentQuestion >= questions.length) {
            console.log("Перезвоню вам завтра!");
            rl.close();
            return;
        }

        rl.question(questions[currentQuestion] + ' ', (answer) => {
            if (!answer) {
                console.log("До связи!");
                rl.close();
                return;
            }

            let topic = "price";
            if (answer.includes('бюджет')) topic = "budget";
            else if (answer.includes('состояние')) topic = "condition";
            else if (answer.includes('посмотреть')) topic = "inspection";
            else if (answer.includes('документ')) topic = "documents";

            const dealerAnswer = responses[topic];
            const randomResponse = dealerAnswer[Math.floor(Math.random() * dealerAnswer.length)];
            
            console.log(`${randomResponse}\n`);
            
            currentQuestion++;
            ask();
        });
    }

    ask();
}

carDealerChat();