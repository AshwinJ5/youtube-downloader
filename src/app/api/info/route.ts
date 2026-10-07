import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) return NextResponse.json({ error: 'Missing URL' }, { status: 400 });

  // 1. Fetch HTML to scrape the true channel avatar directly
  let channelAvatar = '';
  try {
    const htmlRes = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    if (htmlRes.ok) {
      const html = await htmlRes.text();
      
      // Pattern 1: Standard ytInitialData avatar
      const avatarMatch = html.match(/"avatar":\{"thumbnails":\[\{"url":"(https:\/\/yt3\.ggpht\.com\/[^"]+)"/);
      if (avatarMatch) {
        channelAvatar = avatarMatch[1];
      } else {
        // Pattern 2: ownerProfileImageUrl
        const ownerMatch = html.match(/"ownerProfileImageUrl":"(https:\/\/yt3\.ggpht\.com\/[^"]+)"/);
        if (ownerMatch) {
          channelAvatar = ownerMatch[1];
        } else {
          // Pattern 3: Generic meta tag or link containing standard YouTube avatar dimensions (s88, s48, s250, etc)
          const genericMatch = html.match(/(https:\/\/yt3\.ggpht\.com\/[^"]+s[0-9]{2,3}-c-k-c0x00ffffff-no-rj[^"]*)/);
          if (genericMatch) {
            channelAvatar = genericMatch[1];
          }
        }
      }
    }
  } catch (err) {
    console.error("Avatar scrape failed:", err);
  }

  return new Promise<NextResponse>((resolve) => {
    // Use the bundled yt-dlp binary
    const binName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp_linux';
    const binPath = path.join(process.cwd(), 'bin', binName);
    
    // Pass --force-ipv4 to bypass YouTube bot block on datacenter IPv6
    // Pass --js-runtimes to satisfy JavaScript requirement for extraction
    const child = spawn(binPath, [
      '-j', 
      '--no-cache-dir',
      '--force-ipv4',
      '--no-playlist', 
      '--extractor-args', 'youtube:player_client=default',
      '--js-runtimes', `node:${process.execPath}`,
      url
    ]);
    let data = '';
    let errorData = '';

    child.stdout.on('data', (chunk) => data += chunk.toString());
    child.stderr.on('data', (chunk) => errorData += chunk.toString());

    child.on('close', (code) => {
      if (code !== 0) {
        console.error('yt-dlp error:', errorData);
        return resolve(NextResponse.json({ error: 'Failed to fetch video info', details: errorData }, { status: 500 }));
      }
      try {
        const info = JSON.parse(data);
        const resolutions = new Set<number>();
        info.formats?.forEach((f: any) => {
          if (f.height && f.vcodec !== 'none') resolutions.add(f.height);
        });
        
        const sorted = Array.from(resolutions).sort((a, b) => b - a);
        resolve(NextResponse.json({ 
          title: info.title, 
          thumbnail: info.thumbnail, 
          channel: info.uploader || info.channel || 'Unknown Channel',
          channelAvatar: channelAvatar,
          subscribers: info.channel_follower_count || 0,
          views: info.view_count || 0,
          likes: info.like_count || 0,
          uploadDate: info.upload_date || 'Unknown',
          resolutions: sorted.length ? sorted : [1080, 720, 480, 360] 
        }));
      } catch (e) {
        resolve(NextResponse.json({ error: 'Parse error' }, { status: 500 }));
      }
    });
    
    child.on('error', (err) => {
       console.error("Spawn error:", err);
       resolve(NextResponse.json({ error: 'Failed to execute yt-dlp binary' }, { status: 500 }));
    });
  });
}
