import { Message } from "../types";

const N8N_WEBHOOK_URL = "https://n8n.srv1128584.hstgr.cloud/webhook/b897c235-0dfc-4d29-b285-2c82ff6403fb";

export class ApiService {
  
  async sendMessage(
    history: Message[],
    newMessage: string,
    userName: string
  ): Promise<Message[]> {
    
    try {
        const controller = new AbortController();
        // 60s timeout for long-running workflows
        const timeoutId = setTimeout(() => controller.abort(), 60000); 

        const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chatInput: newMessage, 
                query: newMessage,
                user: userName,
                history: history.map(h => ({ role: h.role, content: h.content }))
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (webhookResponse.ok) {
            let responseData: any;
            let responseText = "";

            // Check Content-Type header to determine parsing method
            const contentType = webhookResponse.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                responseData = await webhookResponse.json();
            } else {
                // If not JSON, treat as pure text
                responseData = await webhookResponse.text(); 
            }

            // --- Logic to extract the actual answer string from n8n response ---
            
            if (typeof responseData === 'string') {
                responseText = responseData;
            } else if (Array.isArray(responseData)) {
                // n8n often returns an array of items, e.g. [{ "text": "answer" }]
                const firstItem = responseData[0];
                if (firstItem) {
                    if (typeof firstItem === 'string') {
                        responseText = firstItem;
                    } else if (typeof firstItem === 'object') {
                        // Check common keys
                        responseText = firstItem.output || firstItem.text || firstItem.answer || firstItem.message || firstItem.result || (firstItem.json && firstItem.json.text) || JSON.stringify(firstItem);
                    }
                }
            } else if (typeof responseData === 'object') {
                // Single object response
                responseText = responseData.output || responseData.text || responseData.answer || responseData.message || responseData.result || JSON.stringify(responseData);
            }

            // If empty response or specific "Workflow was started" message which implies no data returned yet
            if (!responseText || responseText.trim() === "" || responseText === "{}" || responseText.includes("Workflow was started")) {
                return [{
                    id: crypto.randomUUID(),
                    role: 'model',
                    content: "The system processed your request but returned no content. Please check the workflow.",
                    timestamp: Date.now(),
                    type: 'text'
                }];
            }

            return [{
                id: crypto.randomUUID(),
                role: 'model',
                content: responseText,
                timestamp: Date.now(),
                type: 'text'
            }];

        } else {
            return [{
                id: crypto.randomUUID(),
                role: 'model',
                content: `System Error: ${webhookResponse.status} - ${webhookResponse.statusText}`,
                timestamp: Date.now(),
                type: 'text'
            }];
        }
    } catch (error) {
        console.error("Webhook connection failed:", error);
        return [{
            id: crypto.randomUUID(),
            role: 'model',
            content: "I apologize, but I cannot connect to the laboratory system at the moment. Please check your connection or try again later.",
            timestamp: Date.now(),
            type: 'text'
        }];
    }
  }
}

// Exporting as 'geminiService' to maintain compatibility with existing imports in ChatInterface
export const geminiService = new ApiService();