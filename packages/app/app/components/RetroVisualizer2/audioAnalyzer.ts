let sharedContext: AudioContext | null = null;
let sharedNode: AudioNode | null = null;

export function registerAudioGraph(ctx: AudioContext, node: AudioNode) {
  sharedContext = ctx;
  sharedNode = node;
}

export function getAudioAnalyzer(): AnalyserNode | null {
  if (!sharedContext || !sharedNode) return null;

  const analyser = sharedContext.createAnalyser();
  try {
  sharedNode.connect(analyser);
  }catch (e) {}
  return analyser;
}
