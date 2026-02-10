from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

model_id = "google/medgemma-2b"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.bfloat16,
    device_map="auto",

)
print("MedGemma Model Loaded Successfully!")

app = FastAPI()

app.addmiddleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PatientData(BaseModel):
    nursing_note: str
    sofa_score: int
    hr: int

@app.post("/analyze")
def analyze_patient(data: PatientData):
    prompt = f"""
    Analyze the following ICU patient case for transfer readiness. 
    The goal is to decide if the patient is safe to move to a general ward.
    Provide your output as a JSON object with two keys: "risk_level" (Low, Medium, High) and "rationale" (a brief explanation).

    Patient Data:
    - SOFA Score: {data.sofa_score}
    - Heart Rate: {data.hr}
    - Nursing Note: "{data.nursing_note}"

    JSON Output:
    """

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(**inputs, max_new_tokens=100)
    result_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    json_output = result_text.split("JSON Output:")[1].strip()

    print(f"Generated JSON: {json_output}")
    return {"analysis": json_output}

