import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { GIF_TOTAL_MS } from '@/lib/weather-com/config';
import { getErrorMessage } from '@/lib/shared/errors';

const execFileAsync = promisify(execFile);

/**
 * Build a ~GIF_TOTAL_MS GIF from the zero-padded frame.NN.jpg sequence using
 * ffmpeg. Returns true on success. A GIF failure never throws — raw frames are
 * the source of truth and the GIF can be rebuilt later from them.
 */
export async function buildGif(
  framesDir: string,
  outputGifPath: string,
  frameCount: number,
): Promise<boolean> {
  if (frameCount <= 0) return false;

  fs.mkdirSync(path.dirname(outputGifPath), { recursive: true });

  // frames per second so the whole sequence plays in ~GIF_TOTAL_MS.
  const fps = frameCount / (GIF_TOTAL_MS / 1000);

  try {
    await execFileAsync(
      'ffmpeg',
      [
        '-nostdin',
        '-loglevel',
        'error',
        '-y',
        '-threads',
        '1',
        '-framerate',
        String(fps),
        '-i',
        path.join(framesDir, 'frame.%02d.jpg'),
        '-loop',
        '0',
        outputGifPath,
      ],
      { timeout: 60_000, killSignal: 'SIGKILL', maxBuffer: 1024 * 1024 },
    );
    return true;
  } catch (err) {
    console.error(`[WX-RADAR] GIF build failed for ${outputGifPath}: ${getErrorMessage(err)}`);
    return false;
  }
}
