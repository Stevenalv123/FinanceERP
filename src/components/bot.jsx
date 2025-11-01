import { X, Wand2, Languages, Search, CheckCircle2, Send, User } from "lucide-react";
import { useState } from "react";
import { generateContent } from "../contexts/model"; 
import ReactMarkdown from "react-markdown";

const systemPrompt = "You are FinanceBot, a specialized AI financial analyst. Your primary purpose is to provide data-driven financial analysis and support to business owners based exclusively on the data from their internal management system. Your tone must be professional, objective, and insightful. You are an expert assistant, not just a calculator. Core Directives: Analyze Provided Data: When the user provides structured data (e.g., sales records, expense lists, inventory levels, client data), your task is to analyze it thoroughly. Provide a Financial Health Summary: The user will ask for an analysis or status report. You must synthesize all provided data into a clear, high-level summary of the companys financial state. Identify Key Insights & Trends: Do not just list numbers. Tell the user what the numbers mean. Identify sales trends, top-performing products, significant expense categories, and potential areas of concern. Answer Financial Questions: Answer specific questions (e.g., What was my net profit last month?, Who is my most valuable customer?) by calculating the answer from the provided data. Key Analysis Areas: When asked for a general analysis, you should focus on: Profitability: Calculate Total Revenue (from sales). Calculate Total Costs/Expenses (from expense data). Calculate Net Profit (Revenue - Expenses) and Profit Margin. Sales Performance: Identify top-selling products (by revenue and by quantity). Identify sales trends (e.g., Sales increased by X% compared to the previous period.). Calculate Average Order Value (AOV). Expense Analysis: Identify the largest expense categories. Highlight any unusual or significantly high spending. Customer Insights: Identify top customers by total spending. Report on the number of new vs. returning customers, if data is available. Output Format: Start with an Executive Summary: Always begin your analysis with a 2-3 sentence high-level summary. Example: Based on the data from Period your company's financial health is [strong/stable/showing challenges]. You generated C$X in total revenue with a net profit of C$Y. Use Clear Sections: Structure your detailed analysis with clear headings (e.g., ## Profitability, ## Sales Highlights, ## Expense Breakdown). Be Data-Driven: Use specific numbers, percentages, and comparisons to support every insight. Critical Constraints: NEVER Hallucinate: Do not invent numbers or data. If the information is not in the data provided, state that you cannot complete the calculation. Example: I can provide your total revenue, but I cannot calculate net profit as no expense data was provided. No External Advice: Do not provide personalized, external financial advice (e.g., You should invest in the stock market or get a business loan). Your advice must be strictly related to the businesss internal operations based on the data e.g. You may want to review your Supplies spending, as it has increased by 40%. Assume Data is Correct: You must trust the data provided by the users system and base all your analysis on it. If they ask you for financial information, give it them a professional answer with easy words to help them to understand the financial concepts.";

export default function BotComponent({ onClose }) {
    const [userInput, setUserInput] = useState('');
    
    const [response, setResponse] = useState([]); 
    const [isLoading, setIsLoading] = useState(false);

    const handleUserInput = (e) => {
        setUserInput(e.target.value);
    };

    const handleClear = () => {
        setUserInput('');
        setResponse([]);
        setIsLoading(false);
    };

    const handleSubmit = async () => {
        if (!userInput.trim()) {
            return;
        }

        const newUserMessage = { type: "user", message: userInput };
        const currentChatHistory = [...response, newUserMessage];
        setResponse(currentChatHistory);
        setUserInput('');
        setIsLoading(true);

        const historyString = currentChatHistory
            .map(msg => {
                if (msg.type === 'user') return `User: ${msg.message}`;
                if (msg.type === 'bot') return `Bot: ${msg.message}`;
                return '';
            })
            .join('\n');
        
        const fullPrompt = `${systemPrompt}\n\n--- Historial de Conversación ---\n${historyString}`;
        
        try {
            const res = await generateContent(fullPrompt);
            const botMessage = { type: "bot", message: res };

            setResponse(prevResponse => [
                ...prevResponse,
                botMessage,
            ]);

        } catch (err) {
            console.error("Error generating response:", err);
            setResponse(prevResponse => [
                ...prevResponse,
                { type: "system", message: "Error al generar la respuesta. Intenta de nuevo." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-primary border border-secondary rounded-2xl shadow-2xl w-full max-w-md relative flex flex-col" style={{ minHeight: 480 }}>
            <div className="flex items-center justify-between p-4 border-b border-secondary">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold">
                        <span role="img" aria-label="Bot">🤖</span>
                    </div>
                    <div>
                        <h2 className="text-title text-lg font-semibold">Nuevo chat con la IA</h2>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="text-subtitle cursor-pointer hover:text-title" onClick={onClose}><X size={20} /></button>
                </div>
            </div>

            <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: 320 }}>
                {response.length === 0 && (
                    <>
                        <h3 className="text-title text-base font-semibold mb-2">Tu IA financiera mejorada</h3>
                        <p className="text-subtitle text-sm mb-4">Estas son algunas de las cosas que puedo hacer. ¡También puedes preguntarme lo que quieras!</p>
                        <ul className="flex flex-col gap-3">
                            <li className="flex items-center gap-2">
                                <Wand2 className="text-title w-5 h-5" />
                                <span>Personaliza la IA financiera</span>
                                <span className="ml-2 px-2 py-0.5 rounded bg-secondary text-xs text-title">Nuevo</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Languages className="text-title w-5 h-5" />
                                <span>Traduce esta página</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Search className="text-title w-5 h-5" />
                                <span>Analizar para obtener información</span>
                                <span className="ml-2 px-2 py-0.5 rounded bg-secondary text-xs text-title">Nuevo</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="text-title w-5 h-5" />
                                <span>Crear un registro de tareas</span>
                                <span className="ml-2 px-2 py-0.5 rounded bg-secondary text-xs text-title">Nuevo</span>
                            </li>
                        </ul>
                    </>
                )}
                {response.map((msg, idx) => (
                    <div key={idx} className={
                        msg.type === "user"
                            ? "flex items-start gap-2 justify-end" 
                            : "flex items-start gap-2" 
                    }>
                        {msg.type === "bot" && (
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                <span role="img" aria-label="Bot">🤖</span>
                            </div>
                        )}
                        
                        <div className={
                            msg.type === "user"
                                ? "bg-input rounded-xl px-4 py-2 text-title text-base font-medium max-w-[80%]"
                                : msg.type === "bot"
                                    ? "bg-secondary rounded-xl px-4 py-2 text-title text-base max-w-[80%] prose prose-sm prose-invert"
                                    : "bg-red-900/50 rounded-xl px-4 py-2 text-red-200 text-xs text-center w-full"
                        }>
                            {msg.type === "bot"
                                ? <ReactMarkdown children={msg.message} />
                                : <span>{msg.message}</span>
                            }
                        </div>

                        {msg.type === "user" && (
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                <User className="text-title w-5 h-5" />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-2 animate-pulse">
                         <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                             <span role="img" aria-label="Bot">🤖</span>
                         </div>
                        <span className="text-subtitle">Pensando...</span>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-secondary flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-input rounded-lg px-3 py-2">
                    <input
                        type="text"
                        className="flex-1 bg-transparent outline-none text-title text-base"
                        placeholder="Pregunta, busca o crea lo que quieras..."
                        value={userInput}
                        onChange={handleUserInput}
                        onKeyDown={e => e.key === 'Enter' ? handleSubmit() : null}
                        disabled={isLoading}
                    />
                    <button className="bg-button rounded-full w-8 h-8 cursor-pointer flex items-center justify-center hover:scale-110 transition-transform" onClick={handleSubmit} disabled={isLoading || !userInput.trim()}>
                        <Send className="text-button w-5 h-5" />
                    </button>
                </div>
                <div className="flex gap-2 text-xs text-subtitle">
                    <span>Automático</span>
                    <span>•</span>
                    <span>Todas las fuentes</span>
                    <button className="ml-auto text-xs text-subtitle hover:text-title" onClick={handleClear}>Limpiar</button>
                </div>
            </div>
        </div>
    );
}