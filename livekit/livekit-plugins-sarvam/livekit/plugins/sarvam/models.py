from typing import Literal

TTSEncoding = Literal[
    "wav",
]

TTSModels = Literal["bulbul:v1", "bulbul:v2"]
TTSLanguages = Literal["te-IN", "en-IN", "gu-IN", "kn-IN", "ml-IN", "od-IN", "pa-IN", "ta-IN"]

TTSVoices = Literal[
  "Diya", "Maya", "Meera", "Pavithra", "Maitreyi", "Misha",
  "Amol", "Arjun", "Amartya", "Arvind", "Neel", "Vian"
]

