const API_BASE_URL = "http://127.0.0.1:8000/api";

export const aiService = {
  genererQuestions: async (cvText) => {
    const response = await fetch(`${API_BASE_URL}/start-interview/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cv: cvText }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la génération des questions.");
    }
    return response.json();
  },

  evaluerReponse: async (audioBlob, cvText, questionActuelle) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "reponse.webm");
    formData.append("cv", cvText);
    formData.append("question", questionActuelle);

    const response = await fetch(`${API_BASE_URL}/interview/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'évaluation de la réponse par l'IA.");
    }
    return response.json();
  },
};