import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import ffmpegStatic from 'ffmpeg-static';


export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const type = request.nextUrl.searchParams.get('type') || 'video';
  const quality = request.nextUrl.searchParams.get('quality') || '1080';
  let title = request.nextUrl.searchParams.get('title') || 'download';
  
  // Sanitize title for filename
  title = title.replace(/[^a-zA-Z0-9 -]/g, '').trim().substring(0, 50) || 'youtube_download';

  if (!url) return NextResponse.json({ error: 'Missing URL' }, { status: 400 });

  const ytDlpName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp_linux';
  const binPath = path.join(process.cwd(), 'bin', ytDlpName);
  
  // Get ffmpeg path using the imported module so Vercel traces it
  const ffmpegPath = ffmpegStatic || path.join(process.cwd(), 'node_modules', 'ffmpeg-static', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');

  // Unique filename for disk-first processing
  const uniqueId = Math.random().toString(36).substring(7);
  const ext = type === 'audio' ? 'mp3' : 'mp4';
  const outPath = path.join(process.cwd(), 'temp', `${title}_${uniqueId}.${ext}`);

  try {
    // Ensure temp dir exists and run Garbage Collection for old files
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    } else {
      // Lazy GC: Delete files older than 1 hour to prevent buildup
      try {
        fs.readdirSync(tempDir).forEach(file => {
          const filePath = path.join(tempDir, file);
          const stats = fs.statSync(filePath);
          const now = new Date().getTime();
          if (now - new Date(stats.ctime).getTime() > 3600000) { // 1 hour
            fs.unlinkSync(filePath);
          }
        });
      } catch (gcErr) {
        console.error("GC Error:", gcErr);
      }
    }

    // Step 1: Download to disk first (Solves A/V sync and missing headers)
    await new Promise((resolve, reject) => {
      let format = '';
      if (type === 'audio') {
        format = 'bestaudio';
      } else {
        format = `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]/best`;
      }

      const args = [
        '--force-ipv4',
        '--no-playlist', 
        '--extractor-args', 'youtube:player_client=default',
        '--js-runtimes', `node:${process.execPath}`,
        '-f', format,
        '--merge-output-format', type === 'audio' ? 'mp3' : 'mp4',
        '--ffmpeg-location', ffmpegPath,
        '-o', outPath
      ];

      if (type === 'audio') {
        args.push('-x', '--audio-format', 'mp3');
      }

      args.push(url);

      const child = spawn(binPath, args);
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error(`yt-dlp exited with code ${code}`));
        }
      });
      child.on('error', reject);
    });

    // Step 2: Stream the fully muxed file to the client using Web ReadableStream
    // This is required in Next.js to reliably detect stream termination and delete the file immediately
    const stat = fs.statSync(outPath);
    const fileStream = fs.createReadStream(outPath);

    const readable = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => {
          controller.close();
          // Delete file instantly when fully streamed
          try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {}
        });
        fileStream.on('error', (err) => {
          controller.error(err);
          try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {}
        });
      },
      cancel() {
        fileStream.destroy();
        // Delete file if the user cancels the download halfway
        try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {}
      }
    });

    // Also listen to Next.js native abort signal just in case
    request.signal.addEventListener('abort', () => {
      try {
        fileStream.destroy();
        if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
      } catch (err) {}
    });

    return new NextResponse(readable, {
      headers: {
        'Content-Type': type === 'audio' ? 'audio/mpeg' : 'video/mp4',
        'Content-Disposition': `attachment; filename="${title}.${ext}"`,
        'Content-Length': stat.size.toString(),
      },
    });

  } catch (error) {
    console.error(error);
    // Attempt cleanup if failed during download
    try {
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    } catch(e) {}
    
    return NextResponse.json({ error: 'Download/processing failed' }, { status: 500 });
  }
}
