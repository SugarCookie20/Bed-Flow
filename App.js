import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const highRiskSample = {
    nursing_note: "Patient had a restful night but appears more tired than yesterday. Had an episode of shallow breathing around 3 AM. Also coughed while drinking water, suggesting aspiration risk.",
    sofa_score: 5,
    hr: 85
};

const lowRiskSample = {
    nursing_note: "Patient is alert, oriented, and ate a full breakfast. Ambulating in the hallway with minimal assistance. Eager to go home. No complaints of pain. Vitals stable throughout the shift.",
    sofa_score: 2,
    hr: 72
};


function App() {
    const [note, setNote] = useState('');
    const [sofa, setSofa] = useState('');
    const [hr, setHr] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!note || !sofa || !hr) {
            alert("Please fill in all fields.");
            return;
        }
        setIsLoading(true);
        setAnalysis(null);
        try {
            const response = await axios.post('http://localhost:8000/analyze', {
                nursing_note: note,
                sofa_score: parseInt(sofa),
                hr: parseInt(hr),
            });
            const parsedAnalysis = JSON.parse(response.data.analysis);
            setAnalysis(parsedAnalysis);
        } catch (error) {
            console.error("Error fetching analysis:", error);
            setAnalysis({ risk_level: "Error", rationale: "Could not connect to the AI model. Is the Python backend running?" });
        }
        setIsLoading(false);
    };

    const loadSample = (sample) => {
        setNote(sample.nursing_note);
        setSofa(sample.sofa_score);
        setHr(sample.hr);
    };

    return (
        <div className="container">
            <header>
                <h1>Bed-Flow AI</h1>
                <p>Your Digital Senior Resident for ICU Triage</p>
            </header>

            <div className="form-container">
        <textarea
            placeholder="Enter Nursing Note... (e.g., 'Patient is alert and oriented...')"
            value={note}
            onChange={(e) => setNote(e.target.value)}
        />
                <div className="inputs-row">
                    <input
                        type="number"
                        placeholder="SOFA Score"
                        value={sofa}
                        onChange={(e) => setSofa(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Heart Rate (BPM)"
                        value={hr}
                        onChange={(e) => setHr(e.target.value)}
                    />
                </div>
                <button className="analyze-btn" onClick={handleAnalyze} disabled={isLoading}>
                    {isLoading ? 'Analyzing with MedGemma...' : 'Analyze Transfer Risk'}
                </button>
                <div className="sample-buttons">
                    <button className="sample-btn" onClick={() => loadSample(highRiskSample)}>Load High-Risk Sample</button>
                    <button className="sample-btn" onClick={() => loadSample(lowRiskSample)}>Load Low-Risk Sample</button>
                </div>
            </div>

            {analysis && (
                <div className={`result-container ${analysis.risk_level?.toLowerCase()}`}>
                    <h2>Analysis Result</h2>
                    <div className="result-item">
                        <strong>Risk Level:</strong>
                        <span>{analysis.risk_level}</span>
                    </div>
                    <div className="result-item">
                        <strong>Rationale:</strong>
                        <p>{analysis.rationale}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;