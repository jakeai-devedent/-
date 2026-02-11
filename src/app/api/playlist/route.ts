import { NextRequest, NextResponse } from 'next/server';

/** 분위기/장르로 플레이리스트 트랙 목록 생성 (Spotify API 연동 전에는 목업 반환) */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mood, genreHints } = body as {
      mood?: string;
      genreHints?: string[];
    };

    const genres = Array.isArray(genreHints) && genreHints.length > 0
      ? genreHints
      : ['ambient', 'indie', 'chill'];

    // TODO: Spotify Web API로 교체 (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET 필요)
    // const token = await getSpotifyToken();
    // const tracks = await searchTracksByGenres(token, genres);

    const mockTracks = getMockTracks(genres);

    return NextResponse.json({
      tracks: mockTracks,
      mood: mood ?? 'chill',
      genreHints: genres,
    });
  } catch (err) {
    console.error('playlist error', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Playlist failed' },
      { status: 500 }
    );
  }
}

function getMockTracks(genres: string[]): Array<{
  id: string;
  name: string;
  artist: string;
  album?: string;
  previewUrl?: string | null;
}> {
  const pool: Array<{ name: string; artist: string; album?: string }> = [
    { name: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours' },
    { name: 'Shape of You', artist: 'Ed Sheeran', album: '÷' },
    { name: 'Someone Like You', artist: 'Adele', album: '21' },
    { name: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia' },
    { name: 'Starboy', artist: 'The Weeknd', album: 'Starboy' },
    { name: 'Watermelon Sugar', artist: 'Harry Styles', album: 'Fine Line' },
    { name: 'Drivers License', artist: 'Olivia Rodrigo', album: 'SOUR' },
    { name: 'Good 4 U', artist: 'Olivia Rodrigo', album: 'SOUR' },
    { name: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland' },
    { name: 'As It Was', artist: 'Harry Styles', album: "Harry's House" },
    { name: 'Flowers', artist: 'Miley Cyrus', album: 'Endless Summer Vacation' },
    { name: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights' },
  ];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 8).map((t, i) => ({
    id: `mock-${genres[0] ?? 'chill'}-${i}`,
    name: t.name,
    artist: t.artist,
    album: t.album,
    previewUrl: null,
  }));
}
