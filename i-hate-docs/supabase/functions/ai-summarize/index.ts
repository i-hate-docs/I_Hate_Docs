import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { documentId, length = 'medium' } = await req.json();

    const { data: doc } = await supabaseClient
      .from('documents')
      .select('storage_path')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (!doc) {
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get document content
    let content = '';
    const { data: fileData } = await supabaseClient.storage
      .from('documents')
      .download(doc.storage_path);

    if (fileData) {
      content = (await fileData.text()).slice(0, 25000);
    }

    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
    const lengthMap: Record<string, string> = {
      short: 'in 2-3 sentences',
      medium: 'in 3-5 key bullet points with brief explanations',
      long: 'as a detailed executive summary with sections for key findings, methodology, and conclusions',
    };

    const completion = await openai.chat.completions.create({
      model: Deno.env.get('AI_MODEL') ?? 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a document summarizer. Summarize the following document ${lengthMap[length] ?? lengthMap.medium}. Be accurate and concise. Extract the most important information.`,
        },
        { role: 'user', content: content || 'No content available. Return a placeholder message.' },
      ],
      max_tokens: 1500,
      temperature: 0.5,
    });

    const summary = completion.choices[0]?.message?.content ?? 'Unable to generate summary.';

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
