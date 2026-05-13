import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/appStore';
import type { Document } from '@/types';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addToast = useAppStore((s) => s.addToast);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('documents')
      .select('*')
      .eq('is_deleted', false)
      .order('updated_at', { ascending: false });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setDocuments(data as Document[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (file: File): Promise<Document | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { addToast('Not authenticated', 'error'); return null; }

    const storagePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file);

    if (uploadError) { addToast(uploadError.message, 'error'); return null; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error: insertError } = await (supabase
      .from('documents') as any)
      .insert({
        user_id: user.id,
        name: file.name.replace(/\.[^/.]+$/, ''),
        original_name: file.name,
        size_bytes: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        page_count: 1,
        tags: [],
        is_starred: false,
        is_deleted: false,
      })
      .select()
      .single();

    if (insertError) { addToast(insertError.message, 'error'); return null; }

    addToast('Document uploaded', 'success');
    await fetchDocuments();
    return inserted as Document;
  };

  const toggleStar = async (doc: Document) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase.from('documents') as any)
      .update({ is_starred: !doc.is_starred })
      .eq('id', doc.id);
    if (err) { addToast(err.message, 'error'); return; }
    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, is_starred: !d.is_starred } : d))
    );
  };

  const deleteDocument = async (doc: Document) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase.from('documents') as any)
      .update({ is_deleted: true })
      .eq('id', doc.id);
    if (err) { addToast(err.message, 'error'); return; }
    addToast('Moved to trash', 'info');
    await fetchDocuments();
  };

  const getDocumentDownloadUrl = async (doc: Document): Promise<string | null> => {
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.storage_path, 3600);
    return data?.signedUrl ?? null;
  };

  const getStarredCount = () => documents.filter((d) => d.is_starred).length;

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    toggleStar,
    deleteDocument,
    getDocumentDownloadUrl,
    getStarredCount,
  };
}

export function useDocument(id: string | null) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) { setDocument(null); return; }
    setLoading(true);
    supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error) setDocument(data as Document);
        setLoading(false);
      });
  }, [id]);

  return { document, loading };
}
