import React from "react";
import STTModelSelector from "./STTModelSelector";
import LLMModelSelector from "./LLMModelSelector";
import TTSModelSelector from "./TTSModelSelector";
import WhoSpeaksFirstSelector from "./WhoSpeaksFirstSelector";
import VoiceSelector from "@/components/VoiceSelector";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info } from "lucide-react";
import {
  STTOptions,
  LLMOptions,
  TTSOptions,
  whoSpeaksFirstOptions,
  LanguageOptions
} from "@/data/modelOptions";
import LanguageSelector from "./LanguageSelector";

const modelSelectionSchema = z.object({
  sttModel: z.string().min(1, "Speech-to-Text model is required"),
  llmModel: z.string().min(1, "Language model is required"),
  ttsModel: z.string().min(1, "Text-to-Speech model is required"),
  voice: z.string().min(1, "Voice is required"),
  whoSpeaksFirst: z.string().min(1, "Who speaks first is required"),
});

const ModelSelection = ({
  sttModel,
  setSTTModel,
  llmModel,
  setLLMModel,
  ttsModel,
  setTTSModel,
  voice,
  setVoice,
  whoSpeaksFirst,
  setWhoSpeaksFirst,
  agentId,
  mutate,
  elevenlabs_api_key,
  setElevenLabsApiKey,
  rime_api_key,
  setRimeApiKey,
  language,
  setLanguage
}) => {
  const form = useForm({
    resolver: zodResolver(modelSelectionSchema),
    values: {
      sttModel,
      llmModel,
      ttsModel,
      voice,
      whoSpeaksFirst,
      language,
    },
  });

  const handleSTTChange = (value) => {
    setSTTModel(value);
    form.setValue("sttModel", value, { shouldValidate: true });
  };

  const handleLLMChange = (value) => {
    setLLMModel(value);
    form.setValue("llmModel", value, { shouldValidate: true });
  };

  const handleTTSChange = (value) => {
    setTTSModel(value);
    form.setValue("ttsModel", value, { shouldValidate: true });
    // update voice based on TTS model
    let voice = {
      voice_id: "",
      voice_name: "",
      voice_engine_name: "",
    };
    if (value == "elevenlabs") {
      voice.voice_name = "Devi";
      voice.voice_id = "MF4J4IDTRo0AxOO4dpFR";
      voice.voice_engine_name = "elevenlabs";
    } else if (value == "sarvam") {
      voice.voice_name = "Meera";
      voice.voice_id = "meera";
      voice.voice_engine_name = "sarvam";
    } else if (value == "smallest") {
      voice.voice_name = "Raman";
      voice.voice_id = "raman";
      voice.voice_engine_name = "smallest";
    } else if (value == "deepgram") {
      voice.voice_name = "Asteria";
      voice.voice_id = "aura-2-asteria-en";
      voice.voice_engine_name = "deepgram";
    } else if (value == "rime") {
      voice.voice_name = "abbie";
      voice.voice_id = "abbie";
      voice.voice_engine_name = "rime";
    }

    setVoice(voice);
  };

  const handleWhoSpeaksFirstChange = (value) => {
    setWhoSpeaksFirst(value);
    form.setValue("whoSpeaksFirst", value, { shouldValidate: true });
  };

  const handleLanguageChange = (value) => {
    setLanguage(value);
    form.setValue("language", value, { shouldValidate: true });
  };

  return (
    <div className="glass-panel p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-white">Model Selection</h2>
        <div className="text-accent-teal flex items-center gap-1 text-sm">
          <Info size={16} />
          <span className="hidden sm:inline">
            Configure AI models for your agent
          </span>
        </div>
      </div>

      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
          {/* <FormField
            control={form.control}
            name="sttModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-400">
                  Speech-to-Text Model
                </FormLabel>
                <STTModelSelector
                  sttModel={sttModel}
                  setSTTModel={handleSTTChange}
                  options={STTOptions}
                />
                <FormMessage className="text-red-400 text-xs mt-1" />
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name="llmModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-400">
                  Language Model
                </FormLabel>
                <LLMModelSelector
                  llmModel={llmModel}
                  setLLMModel={handleLLMChange}
                  options={LLMOptions}
                />
                <FormMessage className="text-red-400 text-xs mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ttsModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-400">
                  Text-to-Speech Model
                </FormLabel>
                <TTSModelSelector
                  ttsModel={ttsModel}
                  setTTSModel={handleTTSChange}
                  options={TTSOptions}
                />
                <FormMessage className="text-red-400 text-xs mt-1" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sttModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-400">
                  Speech-to-Text Model
                </FormLabel>
                <STTModelSelector
                  sttModel={sttModel}
                  setSTTModel={handleSTTChange}
                  options={STTOptions}
                />
                <FormMessage className="text-red-400 text-xs mt-1" />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="voice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-400">
                  Voice
                </FormLabel>

                <VoiceSelector
                  ttsModel={ttsModel}
                  voice={typeof voice === "string" ? voice : voice?.voice_name}
                  voiceId={typeof voice === "string" ? "" : voice?.voice_id}
                  setVoice={(selectedVoice) => {
                    if (selectedVoice && typeof selectedVoice === "object") {
                      setVoice({
                        voice_name: selectedVoice.voice_name,
                        voice_id: selectedVoice.voice_id,
                        voice_engine_name: ttsModel,
                      });
                      form.setValue("voice", selectedVoice.voice_name, {
                        shouldValidate: true,
                      });
                    }
                  }}
                  agentId={agentId}
                  mutate={mutate}
                />
                <FormMessage className="text-red-400 text-xs mt-1" />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-400">
                  Language
                </FormLabel>
                <LanguageSelector
                  language={language}
                  setLanguage={handleLanguageChange}
                  options={LanguageOptions}
                />
                <FormMessage className="text-red-400 text-xs mt-1" />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name="whoSpeaksFirst"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-400">
                  Who Speaks First
                </FormLabel>
                <WhoSpeaksFirstSelector
                  whoSpeaksFirst={whoSpeaksFirst}
                  setWhoSpeaksFirst={handleWhoSpeaksFirstChange}
                  options={whoSpeaksFirstOptions}
                />
                <FormMessage className="text-red-400 text-xs mt-1" />
              </FormItem>
            )}
          /> */}
        </div>
      </Form>
      {ttsModel === "elevenlabs" && (
        <ElevenLabKey
          apiKey={elevenlabs_api_key}
          onSave={setElevenLabsApiKey}
        />
      )}
      {ttsModel === "rime" && (
        <RimeKey
          apiKey={rime_api_key}
          onSave={setRimeApiKey}
        />
      )}
    </div>
  );
};

export default ModelSelection;

const elevenLabKeySchema = z.object({
  apiKey: z.string().optional(), // API key can be empty
});

const ElevenLabKey = ({ apiKey, onSave }) => {
  const form = useForm({
    resolver: zodResolver(elevenLabKeySchema),
    values: {
      apiKey: apiKey || "",
    },
  });

  const watchedApiKey = form.watch("apiKey");
  const isLoading = form.formState.isSubmitting;
  const isChanged = watchedApiKey !== apiKey;

  const handleSave = async (data) => {
    await onSave?.(data.apiKey);
    form.reset({ apiKey: data.apiKey }); // Reset form to reflect the saved state
  };

  return (
    <div className="my-3">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSave)}
          className="flex-1 flex gap-3 items-center"
        >
          <FormField
            control={form.control}
            name="apiKey"
            className="flex-1"
            render={({ field }) => (
              <FormItem className="flex-1 flex items-center gap-3">
                <FormLabel className="shrink-0 block text-sm font-medium text-gray-400 ">
                  ElevenLab API Key
                </FormLabel>
                <input
                  {...field}
                  placeholder="Provide your ElevenLab API Key."
                  className="!m-0 w-full glass-panel border border-subtle-border rounded-md px-4 py-2 text-sm text-white focus:border-accent-teal focus:outline-none"
                />
                {form.formState.errors.apiKey && (
                  <FormMessage className="text-red-400 text-xs ">
                    {form.formState.errors.apiKey.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />
          {isChanged && (
            <button
              disabled={isLoading}
              type="submit"
              className=" bg-accent-teal text-white px-4 py-2 rounded-md text-sm hover:bg-accent-teal-dark transition"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          )}
        </form>
      </Form>
    </div>
  );
};





const RimeKey = ({ apiKey, onSave }) => {
  const form = useForm({
    resolver: zodResolver(elevenLabKeySchema),
    values: {
      apiKey: apiKey || "",
    },
  });

  const watchedApiKey = form.watch("apiKey");
  const isLoading = form.formState.isSubmitting;
  const isChanged = watchedApiKey !== apiKey;

  const handleSave = async (data) => {
    await onSave?.(data.apiKey);
    form.reset({ apiKey: data.apiKey }); // Reset form to reflect the saved state
  };

  return (
    <div className="my-3">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSave)}
          className="flex-1 flex gap-3 items-center"
        >
          <FormField
            control={form.control}
            name="apiKey"
            className="flex-1"
            render={({ field }) => (
              <FormItem className="flex-1 flex items-center gap-3">
                <FormLabel className="shrink-0 block text-sm font-medium text-gray-400 ">
                  Rime API Key
                </FormLabel>
                <input
                  {...field}
                  placeholder="Provide your Rime API Key."
                  className="!m-0 w-full glass-panel border border-subtle-border rounded-md px-4 py-2 text-sm text-white focus:border-accent-teal focus:outline-none"
                />
                {form.formState.errors.apiKey && (
                  <FormMessage className="text-red-400 text-xs ">
                    {form.formState.errors.apiKey.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />
          {isChanged && (
            <button
              disabled={isLoading}
              type="submit"
              className=" bg-accent-teal text-white px-4 py-2 rounded-md text-sm hover:bg-accent-teal-dark transition"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          )}
        </form>
      </Form>
    </div>
  );
};