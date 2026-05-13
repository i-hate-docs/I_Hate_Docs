import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  documentId: string;
  message: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  documentContent?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: ChatRequest = await req.json();
    const { message, conversationHistory, documentId } = body;

    // Verify document belongs to user
    const { data: doc } = await supabaseClient
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (!doc) {
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get document content from storage
    let documentContent = '';
    const { data: docData } = await supabaseClient
      .from('documents')
      .select('storage_path, mime_type')
      .eq('id', documentId)
      .single();

    if (docData?.storage_path) {
      const { data: fileData } = await supabaseClient.storage
        .from('documents')
        .download(docData.storage_path);

      if (fileData) {
        const text = await fileData.text();
        documentContent = text.slice(0, 30000); // Limit context
      }
    }

    // Call AI (supports multiple providers)
    const provider = Deno.env.get('AI_PROVIDER') ?? 'openai';
    let reply = '';
    let tokenUsage = { prompt: 0, completion: 0 };

    if (provider === 'openai') {
      const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

      const messages = [
        {
          role: 'system' as const,
          content: `You are an AI document assistant for "I Hate Docs". You help users understand, analyze, summarize, translate, and extract information from their documents. Be concise, accurate, and helpful. Always cite specific parts of the document when possible. The document content is: ${documentContent || 'Not available. Answer based on your general knowledge.'}`,
        },
        ...(conversationHistory ?? []).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: message },
      ];

      const completion = await openai.chat.completions.create({
        model: Deno.env.get('AI_MODEL') ?? 'gpt-4o-mini',
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      });

      reply = completion.choices[0]?.message?.content ?? 'No response generated.';
      tokenUsage = {
        prompt: completion.usage?.prompt_tokens ?? 0,
        completion: completion.usage?.completion_tokens ?? 0,
      };
    } else {
      reply = 'AI provider not configured. Set AI_PROVIDER and API key in Supabase secrets.';
    }

    return new Response(JSON.stringify({ reply, tokenUsage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
