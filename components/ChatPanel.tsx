

import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { startChat } from '../services/geminiService';
import type { Chat } from '@google/genai';
import { Icon } from './Icon';

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatRef.current = startChat();
        setMessages([{
            id: 'initial',
            role: 'model',
            text: 'Olá! Sou seu assistente de beleza. Como posso ajudar hoje?'
        }]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            if (chatRef.current) {
                const result = await chatRef.current.sendMessage({ message: input });
                const modelMessage: ChatMessage = {
                    id: Date.now().toString() + '-model',
                    role: 'model',
                    text: result.text
                };
                setMessages(prev => [...prev, modelMessage]);
            }
        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = {
                id: Date.now().toString() + '-error',
                role: 'model',
                text: 'Desculpe, não consegui processar sua solicitação.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-xs xl:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                           {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="px-4 py-2 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                           <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pergunte algo..."
                        className="w-full bg-gray-900 border border-gray-600 rounded-full py-2 pl-4 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        disabled={isLoading}
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 rounded-full hover:bg-emerald-500 disabled:bg-gray-500 transition-colors" disabled={isLoading}>
                       <Icon name="send" className="w-5 h-5 text-white"/>
                    </button>
                </div>
            </form>
        </div>
    );
};

const VirtualAssistant: React.FC = () => {
    // Placeholder for Live API functionality
    return (
        <div className="flex flex-col h-full items-center justify-center p-4 text-center">
            <Icon name="mic" className="w-24 h-24 text-gray-600 mb-4"/>
            <h3 className="text-xl font-semibold text-gray-300">Assistente de Voz</h3>
            <p className="text-gray-500 mt-2">A funcionalidade de assistente de voz com a Live API está em desenvolvimento. Em breve você poderá conversar em tempo real!</p>
        </div>
    );
}


export const ChatPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'chat' | 'assistant'>('chat');

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 border-b border-gray-700">
                <div className="flex p-2 space-x-2">
                    <button onClick={() => setActiveTab('chat')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === 'chat' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>
                        <Icon name="chat" className="w-5 h-5"/>
                        Chatbot
                    </button>
                    <button onClick={() => setActiveTab('assistant')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === 'assistant' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>
                        <Icon name="mic" className="w-5 h-5"/>
                        Assistente
                    </button>
                </div>
            </div>
            <div className="flex-grow overflow-hidden">
                {activeTab === 'chat' ? <Chatbot/> : <VirtualAssistant/>}
            </div>
        </div>
    );
};