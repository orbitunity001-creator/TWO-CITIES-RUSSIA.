import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";


const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


/* ================================
   OPENAI
================================ */

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


/* ================================
   SERVER
================================ */

const app =
    express();

const PORT =
    process.env.PORT || 3000;


app.use(
    express.json({
        limit:"2mb"
    })
);


app.use(
    express.static(__dirname)
);


/* ================================
   ПРОВЕРКА
================================ */

app.get(
    "/api/health",
    (req,res)=>{

        res.json({
            ok:true,
            name:"AVIA",
            studio:"Cats Developer Studio"
        });

    }
);


/* ================================
   CHAT
================================ */

app.post(
    "/api/chat",
    async (req,res)=>{

        try{

            const messages =
                Array.isArray(req.body.messages)
                    ? req.body.messages
                    : [];


            if(messages.length === 0){

                return res
                    .status(400)
                    .json({
                        error:
                            "Сообщение пустое."
                    });

            }


            /* Ограничиваем историю,
               чтобы запросы не разрастались
               бесконечно */

            const safeMessages =
                messages
                    .slice(-30)
                    .map(message => ({

                        role:
                            message.role === "assistant"
                                ? "assistant"
                                : "user",

                        content:
                            String(
                                message.content || ""
                            ).slice(0,8000)

                    }));


            const response =
                await client.responses.create({

                    model:"gpt-5.6-luna",

                    instructions:`

Ты — AVIA, умная нейросеть
от Cats Developer Studio.

Отвечай пользователю на русском языке,
если пользователь не попросил другой язык.

Твоя задача — помогать пользователю:
отвечать на вопросы,
объяснять сложные темы простыми словами,
помогать с программированием,
математикой,
идеями,
текстами,
обучением,
планированием и другими задачами.

Отвечай естественно и дружелюбно.

Не говори, что ты ChatGPT.
Представляйся AVIA.

Если вопрос требует актуальной информации,
не выдумывай факты.

Если не уверен в ответе,
честно скажи об этом.

Пиши структурировано,
но не делай огромные ответы,
если пользователь не просит подробно.

`,

                    input:
                        safeMessages

                });


            const answer =
                response.output_text;


            res.json({

                answer:
                    answer ||
                    "Не удалось получить ответ."

            });


        }catch(error){

            console.error(
                "AVIA API ERROR:",
                error
            );


            res
                .status(500)
                .json({

                    error:
                        "Ошибка подключения к нейросети."

                });

        }

    }
);


/* ================================
   START
================================ */

app.listen(
    PORT,
    ()=>{
        console.log(
            `AVIA запущена: http://localhost:${PORT}`
        );
    }
);