import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json({ limit: "4mb" }));
app.use(express.static(__dirname));

app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        service: "AVIA"
    });
});

app.post("/api/chat", async (req, res) => {
    try {
        const incoming = Array.isArray(req.body.messages)
            ? req.body.messages
            : [];

        if (!incoming.length) {
            return res.status(400).json({
                error: "Сообщение не найдено."
            });
        }

        // Берём последние сообщения,
        // чтобы сохранять контекст диалога.
        const messages = incoming
            .slice(-50)
            .map((message) => ({
                role:
                    message.role === "assistant"
                        ? "assistant"
                        : "user",

                content: String(
                    message.content || ""
                ).slice(0, 12000)
            }));

        const response = await openai.responses.create({
            model: "gpt-5.6-luna",

            instructions: `
Ты — AVIA, универсальная AI-нейросеть
от Cats Developer Studio.

Ты ведёшь естественный многоходовой диалог
с пользователем.

Твоя задача — помогать практически с любыми
обычными темами и задачами:

• общение и повседневные вопросы;
• игры;
• программирование;
• создание сайтов;
• разработка приложений;
• разработка игр;
• математика;
• физика;
• история;
• наука;
• технологии;
• обучение;
• тексты;
• идеи;
• творчество;
• планирование;
• объяснение сложных вещей;
• анализ предоставленного пользователем текста;
• поиск ошибок в коде;
• помощь с проектами.

ОБЯЗАТЕЛЬНО УЧИТЫВАЙ КОНТЕКСТ.

Если пользователь говорит:
"а почему?",
"а дальше?",
"сделай это",
"а если наоборот?",
"я имел в виду другое",
то смотри на предыдущие сообщения
и понимай, о чём идёт речь.

Не относись к каждому сообщению
как к новому отдельному разговору.

Если пользователь меняет тему —
спокойно переключайся на новую тему.

Отвечай на языке пользователя.
Если пользователь пишет на русском —
отвечай на русском.

Не повторяй своё имя в каждом сообщении.

Не начинай каждый ответ одинаково.

Пиши естественно, как хороший собеседник.

Если пользователь просит объяснить —
объясняй понятно.

Если просит код —
давай полноценный код, когда это возможно,
и объясняй, куда его поставить.

Если пользователь просит изменить существующий
проект — учитывай предоставленный контекст.

Если вопрос требует актуальных данных,
не придумывай их.

Если у тебя нет нужной информации,
скажи об этом честно.

Не утверждай, что сделал действие,
которого на самом деле не выполнял.

Главная цель AVIA —
полезный, понятный и естественный диалог.
`,

            input: messages
        });

        const answer =
            response.output_text?.trim();

        if (!answer) {
            return res.status(500).json({
                error: "Модель не вернула ответ."
            });
        }

        res.json({
            answer
        });

    } catch (error) {

        console.error("AVIA ERROR:");
        console.error(error);

        res.status(500).json({
            error:
                "Ошибка соединения с AI. Проверь API-ключ и сервер."
        });
    }
});

app.listen(PORT, () => {
    console.log("");
    console.log("╔══════════════════════════════╗");
    console.log("║          AVIA AI             ║");
    console.log("║    Cats Developer Studio     ║");
    console.log("╚══════════════════════════════╝");
    console.log("");
    console.log(`AVIA: http://localhost:${PORT}`);
});