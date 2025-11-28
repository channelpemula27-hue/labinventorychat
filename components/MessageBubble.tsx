import React from 'react';
import { Message, FORM_LINKS, DASHBOARD_URL } from '../types';
import { User as UserIcon, Bot, ExternalLink, ClipboardList, Box, FlaskConical, ShoppingCart } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'clipboard-list': return <ClipboardList className="w-5 h-5" />;
      case 'box-seam': return <Box className="w-5 h-5" />;
      case 'flask': return <FlaskConical className="w-5 h-5" />;
      case 'shopping-cart': return <ShoppingCart className="w-5 h-5" />;
      default: return <ExternalLink className="w-5 h-5" />;
    }
  };

  if (message.type === 'form-list') {
    return (
      <div className="flex gap-4 mb-6">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="text-sm font-medium text-slate-500 mb-1">Flo</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            {FORM_LINKS.map((form) => (
              <a
                key={form.url}
                href={form.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-teal-50 text-teal-600 rounded-lg group-hover:bg-teal-100 transition-colors">
                    {renderIcon(form.icon)}
                  </div>
                  <h3 className="font-semibold text-slate-800">{form.title}</h3>
                </div>
                <p className="text-xs text-slate-500">{form.description}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'dashboard-link') {
     return (
      <div className="flex gap-4 mb-6">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-500 mb-1">Flo</div>
          <a
            href={DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 p-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all max-w-sm"
          >
            <div className="p-2 bg-white/10 rounded-lg">
               <ExternalLink className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="font-semibold">Open LabFlow Dashboard</h3>
              <p className="text-xs text-slate-300 mt-0.5">Access full system analytics</p>
            </div>
          </a>
        </div>
      </div>
     );
  }

  return (
    <div className={`flex gap-4 mb-6 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
        isUser 
          ? 'bg-slate-200 text-slate-600' 
          : 'bg-gradient-to-tr from-teal-500 to-blue-600 text-white'
      }`}>
        {isUser ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`text-xs text-slate-400 mb-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {isUser ? 'You' : 'Flo'}
        </div>
        <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser 
            ? 'bg-slate-900 text-white rounded-tr-sm' 
            : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
        }`}>
          {/* Simple markdown-like rendering for text */}
          {message.content.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-2' : ''}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};