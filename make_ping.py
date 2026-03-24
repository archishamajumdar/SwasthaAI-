import wave, struct, math, os

def make_ping(filename):
    sample_rate = 44100
    duration = 0.5 # seconds
    freq = 1046.50 # High C6
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1) # mono
        wav_file.setsampwidth(2) # 16-bit
        wav_file.setframerate(sample_rate)
        
        for i in range(int(sample_rate * duration)):
            time = i / sample_rate
            # sine wave
            value = math.sin(2.0 * math.pi * freq * time)
            # exponential decay envelope for "ping!"
            envelope = math.exp(-time * 12)
            sample = int(value * envelope * 20000.0) # bit of headroom
            data = struct.pack('<h', sample)
            wav_file.writeframesraw(data)

out_dir = r"C:\Users\Archisha Majumdar\Downloads\b_swasthya ai twin\public"
os.makedirs(out_dir, exist_ok=True)
make_ping(os.path.join(out_dir, "ping.wav"))
print("Ping audio generated!")
