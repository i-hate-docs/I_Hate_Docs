import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { AIMessage, Citation } from '@/types';

export function useAI(documentId: string | null) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!documentId) return;
    const { data, error: err } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });

    if (!err && data) setMessages(data as AIMessage[]);
  }, [documentId]);

  const sendMessage = async (content: string): Promise<string> => {
    if (!documentId) return 'No document selected.';

    setLoading(true);
    setError(null);

    // Add user message to local state immediately
    const userMsg: AIMessage = {
      id: crypto.randomUUID(),
      document_id: documentId,
      user_id: '',
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const { data, error: fnError } = await supabase.functions.invoke<{
        reply: string;
        citations?: Citation[];
        tokenUsage?: { prompt: number; completion: number };
      }>('ai-chat', {
        body: {
          documentId,
          message: content,
          conversationHistory: messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        },
      });

      if (fnError) {
        setError(fnError.message);
        setLoading(false);
        return fnError.message;
      }

      const aiMsg: AIMessage = {
        id: crypto.randomUUID(),
        document_id: documentId,
        user_id: '',
        role: 'assistant',
        content: data?.reply ?? 'No response.',
        citations: data?.citations ?? undefined,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Persist to DB
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('ai_messages') as any).insert([userMsg, aiMsg]);

      setLoading(false);
      return data?.reply ?? '';
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI request failed';
      setError(msg);
      setLoading(false);
      return msg;
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return { messages, loading, error, sendMessage, fetchMessages, clearMessages };
}
