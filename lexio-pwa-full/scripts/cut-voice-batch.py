"""Cut a batch of voice-00 WAVs into staged MP3s, never edit live manifests.
Usage: python cut-voice-batch.py groups.json wav_dir staging_dir
Requires: pocketsphinx numpy imageio-ffmpeg. groups.json = arrays of queue rows;
b0.wav, b1.wav, ... must read those exact rows in order. Review before publishing.
"""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

import numpy as np
from pocketsphinx import Decoder
from imageio_ffmpeg import get_ffmpeg_exe

ffmpeg = get_ffmpeg_exe()
phones = {'criticising':'K R IH T IH S AY Z IH NG', "davey's":'D EY V IY Z',
          'excitements':'IH K S AY T M AH N T S', 'takasu':'T AA K AA S UW'}


def cut(rows, path, stage, reviewed):
    d = Decoder(loglevel='ERROR')
    sentences = [row['text'] for row in rows]
    if any(row['voice_id'] != 'voice-00' for row in rows):
        raise ValueError('Unexpected requested voice')
    # Require explicit normalization for numbers and unusual spellings.
    tokens = []
    for text in sentences:
        if re.search(r'[0-9]', text):
            raise ValueError(f'Normalize numeral pronunciation before alignment: {text}')
        tokens.append(re.findall("[a-z]+(?:'[a-z]+)*", text.lower().replace('’', "'")))
    words = sum(tokens, [])
    for w in set(words):
        if not d.lookup_word(w):
            d.add_word(w, phones[w], True)
    pcm = subprocess.check_output([ffmpeg, '-loglevel','error','-i',str(path),'-ar','16000','-ac','1','-f','s16le','-'])
    x = np.frombuffer(pcm, dtype='<i2').astype(float)
    d.set_align_text(' '.join(words)); d.start_utt(); d.process_raw(pcm, False, True); d.end_utt()
    spans = [(re.sub(r'\(\d+\)$','',s.word), s.start_frame/100, (s.end_frame+1)/100)
             for s in d.seg() if not s.word.startswith('<')]
    if [s[0] for s in spans] != words:
        raise ValueError(f'Incomplete word alignment: {path}')
    cuts, index = [0.0], 0
    for row in tokens[:-1]:
        index += len(row)
        end, start = spans[index-1][2], spans[index][1]
        mid = (end+start)/2
        times = np.arange(max(end-.04,mid-.1),min(start+.04,mid+.1)+.002,.002)
        def level(t):
            sample = int(t*16000)
            return np.sqrt(np.mean(x[sample-160:sample+160]**2))
        t = reviewed.get(str(len(cuts)), min(times, key=level))
        if abs(t-mid)>.25: raise ValueError(f'Reviewed cut too far from aligned word boundary: {t}')
        if level(t)>160: raise ValueError(f'No quiet cut: {path} at {t:.3f}s')
        cuts.append(float(t))
    cuts.append(len(x)/16000)
    for text,start,end in zip(sentences,cuts,cuts[1:]):
        name = 's-'+hashlib.sha256(text.encode()).hexdigest()[:16]
        if end-start<.25 or max(abs(x[int(start*16000):int(end*16000)]))<400:
            raise ValueError(f'Empty or implausibly short audio: {text}')
        subprocess.run([ffmpeg,'-loglevel','error','-y','-ss',str(start),'-i',str(path),'-t',str(end-start),
                        '-ar','24000','-ac','1','-c:a','libmp3lame','-b:a','48k',str(stage/(name+'.mp3'))],check=True)
        yield text,name


if __name__=='__main__':
    groups, src, dest = map(Path, sys.argv[1:4]); dest.mkdir(parents=True,exist_ok=True)
    # Optional fourth argument: reviewed quiet cuts {batchIndex: {boundaryIndex: seconds}}.
    reviewed = json.loads(Path(sys.argv[4]).read_text()) if len(sys.argv)>4 else {}
    result = {}
    for i, rows in enumerate(json.loads(groups.read_text())):
        result.update(cut(rows, src/f'b{i}.wav', dest, reviewed.get(str(i), {}))); print(f'b{i}: {len(rows)}',flush=True)
    (dest/'clips.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
