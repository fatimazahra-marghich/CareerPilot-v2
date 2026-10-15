// AudioWorkletProcessor: mic -> PCM16LE 16kHz mono frames
// - no ScriptProcessor (deprecated)
// - posts ArrayBuffer chunks to main thread

class Pcm16Downsampler extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetRate = 16000;
    this.sourceRate = sampleRate; // AudioWorklet global
    this.ratio = this.sourceRate / this.targetRate;
    this._carry = new Float32Array(0);
    this._accum = [];
    this._accumSamples = 0;
    this.frameSamples = 320; // 20ms @16k
  }

  _downsampleTo16k(input) {
    // concatenate carry + input
    const merged = new Float32Array(this._carry.length + input.length);
    merged.set(this._carry, 0);
    merged.set(input, this._carry.length);

    const outLen = Math.floor(merged.length / this.ratio);
    if (outLen <= 0) {
      this._carry = merged;
      return new Float32Array(0);
    }

    const out = new Float32Array(outLen);
    let pos = 0;
    for (let i = 0; i < outLen; i++) {
      const idx = pos;
      const i0 = Math.floor(idx);
      const i1 = Math.min(i0 + 1, merged.length - 1);
      const frac = idx - i0;
      out[i] = merged[i0] * (1 - frac) + merged[i1] * frac;
      pos += this.ratio;
    }

    const used = Math.floor(pos);
    this._carry = merged.subarray(used);
    return out;
  }

  _floatToInt16PCM(f32) {
    const out = new Int16Array(f32.length);
    for (let i = 0; i < f32.length; i++) {
      let s = f32[i];
      s = Math.max(-1, Math.min(1, s));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  }

  process(inputs) {
    const input = inputs?.[0]?.[0];
    if (!input || input.length === 0) return true;

    const down = this._downsampleTo16k(input);
    if (down.length === 0) return true;

    // accumulate into fixed frames to keep WS messages small
    let offset = 0;
    while (offset < down.length) {
      const remaining = down.length - offset;
      const need = this.frameSamples - this._accumSamples;
      const take = Math.min(remaining, need);
      this._accum.push(down.subarray(offset, offset + take));
      this._accumSamples += take;
      offset += take;

      if (this._accumSamples >= this.frameSamples) {
        const frame = new Float32Array(this.frameSamples);
        let w = 0;
        for (const chunk of this._accum) {
          frame.set(chunk, w);
          w += chunk.length;
        }
        this._accum = [];
        this._accumSamples = 0;

        const pcm16 = this._floatToInt16PCM(frame);
        this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
      }
    }

    return true;
  }
}

registerProcessor("pcm16-downsampler", Pcm16Downsampler);

