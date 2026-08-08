// Model configuration - Easy to change model details
export const modelConfig = {
  // Current: Nemotron 3 Ultra (NVIDIA free endpoint)
  default: {
    provider: 'nvidia',
    model: 'nvidia/nemotron-3-ultra-550b-a55b',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    apiKey: import.meta.env.VITE_NVIDIA_API_KEY || ''
  },
  
  // Alternative models (easy to switch)
  alternatives: {
    nemotron3Super: {
      provider: 'nvidia',
      model: 'nvidia/nemotron-3-super-120b-a12b',
      baseUrl: 'https://integrate.api.nvidia.com/v1'
    },
    deepseekCoder: {
      provider: 'nvidia',
      model: 'deepseek-ai/deepseek-coder-6.7b-instruct',
      baseUrl: 'https://integrate.api.nvidia.com/v1'
    },
    llama3_2Vision: {
      provider: 'nvidia',
      model: 'meta/llama-3.2-11b-vision-instruct',
      baseUrl: 'https://integrate.api.nvidia.com/v1'
    }
  }
};

// Get current model config
export function getModelConfig() {
  return modelConfig.default;
}

// Switch model (for easy changing)
export function setModel(modelKey) {
  if (modelConfig.alternatives[modelKey]) {
    modelConfig.default = { ...modelConfig.alternatives[modelKey] };
  }
  return modelConfig.default;
}