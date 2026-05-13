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

    const { documentId, targetLanguage = 'Spanish' } = await req.json();

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

    let content = '';
    const { data: fileData } = await supabaseClient.storage
      .from('documents')
      .download(doc.storage_path);

    if (fileData) {
      content = (await fileData.text()).slice(0, 20000);
    }

    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

    const completion = await openai.chat.completions.create({
      model: Deno.env.get('AI_MODEL') ?? 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional document translator. Translate the following document content to ${targetLanguage}. Preserve all formatting, headings, bullet points, tables, and technical terms. Keep the professional tone.`,
        },
        { role: 'user', content: content || 'No content available.' },
      ],
      max_tokens: 4000,
      temperature: 0.3,
    });

    const translation = completion.choices[0]?.message?.content ?? 'Unable to translate.';

    return new Response(JSON.stringify({ translation, targetLanguage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
