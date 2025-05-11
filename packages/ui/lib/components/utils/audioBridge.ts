// audioBridge.ts
let sharedContext: AudioContext | null = null;
let sharedSourceNode: AudioNode | null = null;
let sharedGainNode: GainNode | null = null;

/**
 * Appelé depuis Visualizer principal (Butterchurn) une fois le graphe audio en place
 */
export function registerAudioGraph(ctx: AudioContext, previousNode: AudioNode) {
  if (!sharedContext) sharedContext = ctx;
  if (!sharedSourceNode) sharedSourceNode = previousNode;
}

/**
 * Fournit un noeud d’analyse sécurisé (connecté via un GainNode intermédiaire)
 */
export function getAudioGraph(): {
  audioContext: AudioContext | null;
  previousNode: AudioNode | null;
} {
  return {
    audioContext: sharedContext,
    previousNode: getSafeOutputNode(),
  };
}

function getSafeOutputNode(): AudioNode | null {
  if (!sharedContext || !sharedSourceNode) return null;

  // Re-crée un GainNode intermédiaire sécurisé s’il n’existe pas
  if (!sharedGainNode) {
    sharedGainNode = sharedContext.createGain();
    try {
      sharedSourceNode.connect(sharedGainNode);
    } catch (e) {
      console.warn('GainNode déjà connecté');
    }
  }

  return sharedGainNode;
}

export default getAudioGraph;