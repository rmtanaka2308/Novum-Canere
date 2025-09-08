import { supabaseServer } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import SongList from './SongList';

export type Song = {
    id: string;
    track_name: string;
    artist_name: string;
    audio_original_path: string | null;
};

async function LibraryPage() {
    const supabase = await supabaseServer();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/?message=Please log in to view your library.');
    }

    const { data: songs, error } = await supabase
        .from('songs')
        .select('id, track_name, artist_name, audio_original_path')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching songs:', error);
    }

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-light text-gray-900">My Library</h1>
                    <p className="text-gray-600">All the songs you ve uploaded.</p>
                </div>
                <SongList songs={songs || []} />
            </div>
        </main>
    );
}

export default LibraryPage;