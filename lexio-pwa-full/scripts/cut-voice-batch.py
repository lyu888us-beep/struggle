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
phones = {
    "criticising":"K R IH T IH S AY Z IH NG", "davey's":"D EY V IY Z",
    "excitements":"IH K S AY T M AH N T S", "takasu":"T AA K AA S UW",
    "avails":"AH V EY L Z", "bai's":"B AY Z",
    "begrudged":"B IH G R AH JH D", "bei":"B EY",
    "benedito":"B EH N AH D IY T OW", "berbers":"B ER B ER Z",
    "bluejay's":"B L UW JH EY Z", "boded":"B OW D IH D",
    "buffaloes":"B AH F AH L OW Z", "bunsen":"B AH N S AH N",
    "burj":"B UH R JH", "carrefour's":"K AE R AH F AO R Z",
    "cast's":"K AE S T S", "champollion":"SH AE M P OW L Y AH N",
    "chapped":"CH AE P T", "chickpeas":"CH IH K P IY Z",
    "chikako":"CH IY K AA K OW", "civilise":"S IH V AH L AY Z",
    "clambering":"K L AE M B ER IH NG", "clattered":"K L AE T ER D",
    "coffined":"K AO F IH N D", "corsets":"K AO R S AH T S",
    "cpr":"S IY P IY AA R", "daping":"D AA P IH NG",
    "daxia":"D AA SH Y AA", "desertification":"D IH Z ER T AH F IH K EY SH AH N",
    "deskmate":"D EH S K M EY T", "dirtying":"D ER T IY IH NG",
    "dracula's":"D R AE K Y AH L AH Z", "dreamless":"D R IY M L AH S",
    "drents":"D R EH N T S", "drink's":"D R IH NG K S",
    "eery":"IH R IY", "elderberry":"EH L D ER B EH R IY",
    "emet":"EH M EH T", "fadil":"F AA D IH L",
    "fascinations":"F AE S AH N EY SH AH N Z", "fearlessly":"F IH R L AH S L IY",
    "femdom":"F EH M D AH M", "feng's":"F EH NG Z",
    "fishnet":"F IH SH N EH T", "flaked":"F L EY K T",
    "flatulence":"F L AE CH AH L AH N S", "flavoured":"F L EY V ER D",
    "footpaths":"F UH T P AE TH S", "forbear":"F AO R B EH R",
    "frisian":"F R IH ZH AH N", "galvanometer":"G AE L V AH N AA M AH T ER",
    "gastroenterology":"G AE S T R OW EH N T ER AA L AH JH IY", "gcc":"JH IY S IY S IY",
    "geologically":"JH IY AH L AA JH IH K L IY", "geraniol":"JH ER AE N IY AO L",
    "glutton":"G L AH T AH N", "goatherd":"G OW T HH ER D",
    "godwit":"G AA D W IH T", "grammatically":"G R AH M AE T IH K L IY",
    "guilin's":"G W EY L IH N Z", "gutenberg's":"G UW T AH N B ER G Z",
    "haemorrhage":"HH EH M ER IH JH", "hamamatsu":"HH AA M AA M AA T S UW",
    "hanukah":"HH AA N AH K AH", "hawk's":"HH AO K S",
    "hb":"EY CH B IY", "herbivores":"HH ER B IH V AO R Z",
    "hiroko":"HH IH R OW K OW", "homebrew":"HH OW M B R UW",
    "honeycake":"HH AH N IY K EY K", "hong's":"HH AO NG Z",
    "hsinchu":"SH IH N CH UW", "hydrochloric":"HH AY D R AH K L AO R IH K",
    "hymned":"HH IH M D", "hypocritically":"HH IH P AH K R IH T IH K L IY",
    "icecaps":"AY S K AE P S", "impermanent":"IH M P ER M AH N AH N T",
    "ingratitude":"IH N G R AE T AH T UW D", "intransitive":"IH N T R AE N S AH T IH V",
    "jewellery":"JH UW AH L R IY", "jingling":"JH IH NG G AH L IH NG",
    "jove":"JH OW V", "joyfulness":"JH OY F AH L N AH S",
    "junko":"JH AH NG K OW", "keeled":"K IY L D",
    "keelung":"K IY L AH NG", "kumul":"K UW M UW L",
    "latinized":"L AE T AH N AY Z D", "lethargically":"L AH TH AA R JH IH K L IY",
    "liqiu":"L IY CH UW", "lofted":"L AO F T IH D",
    "loquats":"L OW K W AA T S", "luogeng":"L W OW G AH NG",
    "maths":"M AE TH S", "mayuko":"M AA Y UW K OW",
    "meddles":"M EH D AH L Z", "mennad":"M EH N AE D",
    "messi":"M EH S IY", "metropolises":"M AH T R AA P AH L AH S IH Z",
    "modernised":"M AA D ER N AY Z D", "monster's":"M AA N S T ER Z",
    "motorway":"M OW T ER W EY", "muiriel":"M Y UW R IY AH L",
    "multifunction":"M AH L T IY F AH NG K SH AH N", "nagisa":"N AA G IH S AH",
    "nakamatsu":"N AA K AA M AA T S UW", "nowt":"N AW T",
    "offcuts":"AO F K AH T S", "oghuz":"OW G UW Z",
    "outworks":"AW T W ER K S", "owl's":"AW L Z",
    "oxidizes":"AA K S AH D AY Z IH Z", "permafrost":"P ER M AH F R AO S T",
    "pigtails":"P IH G T EY L Z", "plastron":"P L AE S T R AH N",
    "plov":"P L AO V", "ponytails":"P OW N IY T EY L Z",
    "proletarians":"P R OW L AH T EH R IY AH N Z", "prowls":"P R AW L Z",
    "pyjamas":"P AH JH AA M AH Z", "pyrimid":"P IH R AH M IH D",
    "qipao":"CH IY P AW", "quadrilateral":"K W AA D R AH L AE T ER AH L",
    "quarrelled":"K W AO R AH L D", "qur'an":"K ER AA N",
    "quran":"K ER AA N", "ravened":"R AE V AH N D",
    "reddened":"R EH D AH N D", "reheat":"R IY HH IY T",
    "reimagined":"R IY IH M AE JH IH N D", "resourcefully":"R IY S AO R S F AH L IY",
    "rewinding":"R IY W AY N D IH NG", "rima's":"R IY M AH Z",
    "ruminants":"R UW M AH N AH N T S", "sailboat's":"S EY L B OW T S",
    "saterland":"S EY T ER L AE N D", "sauropod":"S AO R AH P AA D",
    "semiarid":"S EH M IY AE R IH D", "sendai":"S EH N D AY",
    "shinjuku":"SH IH N JH UW K UW", "silesian":"S AH L IY ZH AH N",
    "skateboards":"S K EY T B AO R D Z", "smithing":"S M IH TH IH NG",
    "snored":"S N AO R D", "sprig":"S P R IH G",
    "stretchy":"S T R EH CH IY", "subarachnoid":"S AH B AH R AE K N OY D",
    "sudoku":"S UW D OW K UW", "superfood":"S UW P ER F UW D",
    "surcharged":"S ER CH AA R JH D", "sycophants":"S IH K AH F AH N T S",
    "syntactical":"S IH N T AE K T IH K AH L", "tashkil":"T AA SH K IY L",
    "tatoeba":"T AA T OW EH B AH", "theives":"TH IY V Z",
    "thongs":"TH AO NG Z", "titanic's":"T AY T AE N IH K S",
    "toothache":"T UW TH EY K", "trainer's":"T R EY N ER Z",
    "trigonometric":"T R IH G AH N AH M EH T R IH K", "tsunamis":"S UW N AA M IY Z",
    "ukuleles":"Y UW K AH L EY L IY Z", "voivodeship":"V OY V OW D SH IH P",
    "vowelizing":"V AW AH L AY Z IH NG", "warmongers":"W AO R M AH NG G ER Z",
    "watercolour":"W AO T ER K AH L ER", "weatherman's":"W EH DH ER M AE N Z",
    "weigongcun":"W EY G AO NG K UW N", "wharfed":"W AO R F D",
    "xiaowang":"SH AW W AA NG", "yoav":"Y OW AA V",
    "yoghurt":"Y OW G ER T", "zamenhof":"Z AA M AH N HH AA F",
    "zeelandic":"Z IY L AE N D IH K", "zelensky":"Z AH L EH N S K IY",
    "zhuge":"JH UW G AH", "ziri":"Z IH R IY",
    "zu":"Z UW",
}


def cut(rows, path, stage, reviewed):
    d = Decoder(loglevel='ERROR')
    sentences = [row['text'] for row in rows]
    if any(row['voice_id'] != 'voice-00' for row in rows):
        raise ValueError('Unexpected requested voice')
    # Require explicit normalization for numbers and unusual spellings.
    # Rows may carry a 'spoken' form (digits already written out); it must match
    # the audio that was generated, while 'text' stays the catalogue key.
    tokens = []
    for row in rows:
        spoken = row.get('spoken', row['text'])
        if re.search(r'[0-9]', spoken):
            raise ValueError(f'Normalize numeral pronunciation before alignment: {spoken}')
        tokens.append(re.findall("[a-z]+(?:'[a-z]+)*", spoken.lower().replace('’', "'")))
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
