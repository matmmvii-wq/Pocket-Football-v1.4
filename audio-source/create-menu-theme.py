"""Original Pocket Football menu theme. Optional source; not part of the build.

Requires Python, numpy, and scipy. Run from the project root to regenerate the
included WAV. All instruments and notes are synthesized here; no samples used.
"""
from pathlib import Path
import json
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io.wavfile import write

RATE = 32000
BEAT = .5  # 120 BPM, sixteen bars, exactly 32 seconds
LENGTH = round(16 * 4 * BEAT * RATE)
rng = np.random.default_rng(61017)
music = np.zeros((LENGTH, 2), dtype=np.float64)
drums = np.zeros_like(music)

def hz(note):
    return 440 * 2 ** ((note - 69) / 12)

def envelope(t, hold, attack=.008, release=.10):
    return np.minimum(t / attack, 1) * np.clip((hold + release - t) / release, 0, 1)

def add(track, sound, beat, level, pan=0):
    """Wrap every release and echo into the start of the loop, without gaps."""
    indices = (round(beat * BEAT * RATE) + np.arange(len(sound))) % LENGTH
    gains = np.array([np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)])
    track[indices] += sound[:, None] * gains * level

def voice(note, beats, instrument):
    hold = beats * BEAT
    release = .24 if instrument == 'pad' else .13
    t = np.arange(round((hold + release) * RATE)) / RATE
    f = hz(note)
    phase = 2 * np.pi * f * t
    if instrument == 'lead':
        # Soft bell/pluck with a little pitch shimmer, rather than a harsh beep.
        shimmer = .004 * np.sin(2 * np.pi * 5.2 * t)
        tone = np.sin(phase + shimmer) + .22 * np.sin(phase * 2) * np.exp(-t * 9)
        tone += .08 * np.sin(phase * 3) * np.exp(-t * 14)
        env = envelope(t, hold, .006, release) * (.52 + .48 * np.exp(-t * 7))
    elif instrument == 'bass':
        tone = np.sin(phase) + .25 * np.sin(phase * 2) + .08 * np.sin(phase * 3)
        env = envelope(t, hold, .008, release) * np.exp(-t * 1.3)
    else:
        tone = .65 * np.sin(phase) + .25 * np.sin(phase * 1.002) + .10 * np.sin(phase * 2)
        env = envelope(t, hold, .035, release)
    return tone * env

def kick():
    t = np.arange(round(.25 * RATE)) / RATE
    phase = 2 * np.pi * (49 * t + 75 * .028 * (1 - np.exp(-t / .028)))
    click = rng.normal(0, 1, len(t)) * np.exp(-t * 220) * .07
    return (np.sin(phase) * np.exp(-t * 18) + click) * np.minimum(t / .001, 1)

def clap():
    t = np.arange(round(.19 * RATE)) / RATE
    noise = sosfilt(butter(2, [800, 6500], btype='bandpass', fs=RATE, output='sos'), rng.normal(0, 1, len(t)))
    env = np.zeros_like(t)
    for start, level in [(0, 1), (.012, .8), (.025, .6)]:
        env += np.where(t >= start, np.exp(-np.maximum(t - start, 0) * 48) * level, 0)
    return noise * env * .45 * np.minimum(t / .001, 1)

def hat(open_hat=False):
    length = .16 if open_hat else .055
    t = np.arange(round(length * RATE)) / RATE
    noise = sosfilt(butter(2, 6000, btype='highpass', fs=RATE, output='sos'), rng.normal(0, 1, len(t)))
    return noise * np.exp(-t * (35 if open_hat else 80)) * np.minimum(t / .001, 1)

# D major / B minor / G major / A major. The final dominant resolves across
# the loop boundary. Four phrases add small variations to the main hook.
chords = [(50, [62, 66, 69, 73]), (47, [59, 62, 66, 69]),
          (43, [59, 62, 67, 69]), (45, [61, 64, 69, 71])]
melodies = [
    [(0, 78, .65), (1, 81, .35), (1.75, 83, .35), (2.5, 81, .75)],
    [(0, 78, .65), (1, 74, .35), (1.75, 78, .35), (2.5, 81, .65), (3.5, 78, .25)],
    [(0, 79, .65), (1, 78, .35), (1.75, 74, .6), (3, 76, .55)],
    [(0, 76, .5), (1, 73, .4), (2, 76, .5), (3, 81, .55)],
]
for bar in range(16):
    base = bar * 4
    root, notes = chords[bar % 4]
    phrase = bar // 4
    for n, note in enumerate(notes):
        pad = voice(note, 3.6, 'pad')
        add(music, pad, base, .054, (n - 1.5) * .28)
    for offset, interval, duration in [(0, 0, .65), (1, 0, .35), (1.75, 12, .3), (2.5, 7, .35), (3.25, 0, .45)]:
        add(music, voice(root - 12 + interval, duration, 'bass'), base + offset, .26)
    for offset, note, duration in melodies[bar % 4]:
        if phrase == 2 and offset == 1.75:
            note += 12
        if phrase == 3 and offset == 3.5:
            note = 76
        lead = voice(note, duration, 'lead')
        add(music, lead, base + offset, .15, -.08)
        add(music, lead, base + offset + .75, .024, .6)
        add(music, lead, base + offset + 1.5, .010, -.6)
    # A quieter offbeat arpeggio gives the second half some lift.
    if phrase in [1, 3]:
        for i in range(4):
            add(music, voice(notes[i] + 12, .2, 'lead'), base + i + .5, .027, .4 if i % 2 else -.4)
    for offset in [0, 1, 2, 3]:
        add(drums, kick(), base + offset, .34 if offset in [0, 2] else .25)
    for offset in [1, 3]:
        add(drums, clap(), base + offset, .14, .1)
    for step in range(8):
        add(drums, hat(step == 7 and bar % 4 == 3), base + step * .5, .045 if step % 2 else .023, -.25 if step % 2 else .25)
    if bar in [7, 15]:
        add(drums, clap(), base + 3.5, .065, -.15)

# Small rhythmic ducking makes space for the kick. Circular filtering avoids a
# start-up transient, since notes and reverb continue through the loop seam.
time = np.arange(LENGTH) / RATE
duck = .78 + .22 * (1 - np.exp(-np.remainder(time, BEAT) * 18))
mix = music * duck[:, None] + drums
sos = butter(2, 35, btype='highpass', fs=RATE, output='sos')
mix = sosfilt(sos, np.concatenate([mix, mix]), axis=0)[LENGTH:]
mix = np.tanh(mix * 1.3)
mix *= .70 / np.max(np.abs(mix))
# Join the final half millisecond to the first sample without a silent gap.
seam = 16
for i in range(seam):
    weight = i / (seam - 1)
    mix[-seam + i] = mix[-seam + i] * (1 - weight) + mix[0] * weight
output = Path(__file__).resolve().parents[1] / 'public/audio/pocket-football-menu.wav'
output.parent.mkdir(parents=True, exist_ok=True)
write(output, RATE, (mix * 32767).astype(np.int16))
print(json.dumps({'file': str(output), 'seconds': LENGTH / RATE, 'bpm': 120,
                  'peak': float(np.max(np.abs(mix))), 'rms': float(np.sqrt(np.mean(mix ** 2))),
                  'bytes': output.stat().st_size}))
