
const voice_ai_pricing_per_min = { // Pricing in terms of $ Dollar
    llm : {
        'gpt-4o-mini': 0.0015,
        'gpt-3.5-turbo': 0.02,
        'gpt-4o': 0.20
    },
    stt : {
        'nova-2': 0.0059
    },
    voice_engine : {
        'elvenlabs': 0.10,
        'deepgram': 0.075

    },
    twilio : 0.01,
    telnyx : 0.0183
}


function get_llm_cost_per_sec(llm_model) {
    return voice_ai_pricing_per_min.llm[llm_model]/ 60;
}

function get_stt_cost_per_sec(stt_model){
    return voice_ai_pricing_per_min.stt[stt_model]/ 60;
}

function get_voice_engine_cost_per_sec(voice_engine='deepgram'){
    return voice_ai_pricing_per_min.voice_engine[voice_engine]/ 60;
}

function get_twilio_cost_per_sec(){
    return voice_ai_pricing_per_min.twilio/ 60;
}

function get_telnyx_cost_per_sec(){
    return voice_ai_pricing_per_min.telnyx/ 60;
}

module.exports = {
    get_llm_cost_per_sec,
    get_stt_cost_per_sec,
    get_voice_engine_cost_per_sec,
    get_twilio_cost_per_sec,
    get_telnyx_cost_per_sec
}