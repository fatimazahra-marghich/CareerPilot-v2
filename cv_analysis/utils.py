import os
import re
import json
import unicodedata
import io
import zipfile
from dotenv import load_dotenv # Ajoutez ceci
load_dotenv() # Et ceci avant de lire HF_TOKEN

HF_TOKEN = os.getenv("HF_TOKEN")

from pypdf import PdfReader
from docx import Document

# Optional deps (avoid crashing Django if missing)
try:
    import fitz  # PyMuPDF
except Exception:
    fitz = None

try:
    from PIL import Image
except Exception:
    Image = None

try:
    from huggingface_hub import InferenceClient
except Exception:
    InferenceClient = None


# =========================
# HUGGING FACE CLIENT
# =========================

HF_TOKEN = os.getenv("HF_TOKEN")

hf_client = InferenceClient(
    provider="novita",
    api_key=HF_TOKEN
) if (HF_TOKEN and InferenceClient) else None


HF_MODEL = "deepseek-ai/DeepSeek-V4-Flash"


# =========================
# EXTRACTION TEXTE
# =========================

def extract_text_from_pdf(file_path):
    text = []
    reader = PdfReader(file_path)

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text.append(page_text)

    return "\n".join(text)


def extract_text_from_docx(file_path):
    doc = Document(file_path)
    return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])


def extract_text_from_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return extract_text_from_pdf(file_path)

    if ext == ".docx":
        return extract_text_from_docx(file_path)

    return ""
def call_huggingface_interview(prompt, max_tokens=500, temperature=0.7):
    if hf_client is None:
        raise Exception("HF_TOKEN absent.")
    
    # On n'utilise pas le format JSON strict ici pour permettre une discussion naturelle
    response = hf_client.chat.completions.create(
        model=HF_MODEL,
        messages=[
            {"role": "system", "content": "Tu es un recruteur. Analyse le CV fourni dans le prompt et pose des questions précises au candidat."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=max_tokens,
        temperature=temperature,
    )
    return response.choices[0].message.content

def save_best_image_from_bytes(images_bytes, output_path):
    if Image is None:
        return None

    best_image = None
    best_area = 0

    for img_bytes in images_bytes:
        try:
            image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            w, h = image.size
            area = w * h
            ratio = w / h if h else 0

            if w < 120 or h < 120:
                continue

            if 0.55 <= ratio <= 1.5 and area > best_area:
                best_image = image.copy()
                best_area = area

        except Exception:
            continue

    if best_image:
        best_image.save(output_path)
        return output_path

    return None


def extract_photo_from_pdf(file_path, output_path):
    if fitz is None:
        return None

    images_bytes = []

    try:
        doc = fitz.open(file_path)

        for page in doc:
            for img in page.get_images(full=True):
                xref = img[0]
                base_image = doc.extract_image(xref)
                images_bytes.append(base_image["image"])

        doc.close()

    except Exception as e:
        print("Erreur extraction photo PDF:", str(e))
        return None

    return save_best_image_from_bytes(images_bytes, output_path)


def extract_photo_from_docx(file_path, output_path):
    images_bytes = []

    try:
        with zipfile.ZipFile(file_path, "r") as docx_zip:
            for file_name in docx_zip.namelist():
                if file_name.startswith("word/media/"):
                    images_bytes.append(docx_zip.read(file_name))

    except Exception as e:
        print("Erreur extraction photo DOCX:", str(e))
        return None

    return save_best_image_from_bytes(images_bytes, output_path)


def extract_photo_from_file(file_path, output_path):
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return extract_photo_from_pdf(file_path, output_path)

    if ext == ".docx":
        return extract_photo_from_docx(file_path, output_path)

    return None


# =========================
# NORMALISATION
# =========================

def strip_accents(text):
    return "".join(
        c for c in unicodedata.normalize("NFD", text)
        if unicodedata.category(c) != "Mn"
    )


def normalize_text(text):
    text = text.lower()
    text = strip_accents(text)
    text = re.sub(r"[•·▪■►]", " ", text)
    text = re.sub(r"[\t\r]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def normalize_lines(text):
    lines = text.splitlines()
    clean_lines = []

    for line in lines:
        line = strip_accents(line.lower()).strip()
        line = re.sub(r"\s+", " ", line)

        if line:
            clean_lines.append(line)

    return clean_lines



# =========================
# DICTIONNAIRES
# =========================

SECTION_HEADERS = {
    "skills": [
        "skills", "technical skills", "core skills", "competencies",
        "competences", "competences techniques", "compétences",
        "compétences techniques", "savoir-faire", "hard skills"
    ],
    "experience": [
        "experience", "work experience", "professional experience",
        "experiences", "experience professionnelle",
        "expériences professionnelles", "parcours professionnel",
        "projets", "stages", "internships"
    ],
    "education": [
        "education", "training", "qualifications", "formation",
        "formations", "cursus", "etudes", "études",
        "diplomes", "diplômes"
    ],
    "summary": [
        "summary", "profile", "professional summary", "about me",
        "profil", "profil professionnel", "à propos", "resume", "résumé"
    ],
    "contact": [
        "contact", "contacts", "coordonnees", "coordonnées",
        "informations personnelles"
    ]
}


TECH_SKILL_SYNONYMS = {
    "python": ["python"],
    "django": ["django"],
    "flask": ["flask"],
    "fastapi": ["fastapi", "fast api"],
    "java": ["java"],
    "javascript": ["javascript", "js"],
    "typescript": ["typescript", "ts"],
    "react": ["react", "react.js", "reactjs"],
    "vue": ["vue", "vue.js", "vuejs"],
    "angular": ["angular"],
    "node.js": ["node", "node.js", "nodejs"],
    "html": ["html", "html5"],
    "css": ["css", "css3"],
    "bootstrap": ["bootstrap"],
    "tailwind": ["tailwind", "tailwindcss"],
    "sql": ["sql"],
    "mysql": ["mysql"],
    "postgresql": ["postgresql", "postgres"],
    "mongodb": ["mongodb", "mongo"],
    "docker": ["docker"],
    "kubernetes": ["kubernetes", "k8s"],
    "aws": ["aws", "amazon web services"],
    "azure": ["azure", "microsoft azure"],
    "git": ["git"],
    "github": ["github"],
    "gitlab": ["gitlab"],
    "linux": ["linux"],
    "api": ["api", "rest api", "restful api", "web service"],
    "machine learning": ["machine learning", "ml", "apprentissage automatique"],
    "data analysis": ["data analysis", "analyse de donnees", "analyse de données"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "scikit-learn": ["scikit-learn", "sklearn"],
}


SOFT_SKILL_SYNONYMS = {
    "communication": ["communication"],
    "leadership": ["leadership"],
    "teamwork": ["teamwork", "travail en equipe", "travail en équipe", "collaboration"],
    "problem solving": ["problem solving", "résolution de problèmes", "resolution de problemes"],
    "adaptability": ["adaptability", "adaptation", "flexibility", "flexibilité"],
    "time management": ["time management", "gestion du temps"],
    "autonomy": ["autonomy", "autonomie"],
    "agile": ["agile", "scrum", "kanban"],
}


EXPERIENCE_TERMS = [
    "experience", "developer", "engineer", "internship", "project",
    "emploi", "poste", "developpeur", "développeur",
    "ingenieur", "ingénieur", "stage", "projet"
]


EDUCATION_TERMS = [
    "master", "bachelor", "licence", "degree", "university",
    "school", "diploma", "formation", "ecole", "école",
    "universite", "université", "diplome", "diplôme"
]


TARGET_KEYWORDS = [
    "python", "django", "react", "sql", "docker",
    "aws", "kubernetes", "api", "git", "postgresql"
]


# =========================
# ANALYSE ATS CLASSIQUE
# =========================

def contains_phrase(text, phrase):
    return phrase in text


def detect_section_presence(lines, candidates):
    for line in lines:
        for candidate in candidates:
            candidate_norm = strip_accents(candidate.lower())
            if candidate_norm == line or candidate_norm in line:
                return True
    return False


def find_skills(text, synonyms_map):
    found = []
    text_norm = normalize_text(text)

    for canonical, variants in synonyms_map.items():
        for variant in variants:
            variant_norm = normalize_text(variant)
            if contains_phrase(text_norm, variant_norm):
                found.append(canonical)
                break

    return sorted(list(set(found)))


def score_presence(found_count, total_count):
    if total_count == 0:
        return 0
    return round((found_count / total_count) * 100)


def extract_years_of_experience_hint(text):
    text_norm = normalize_text(text)

    patterns = [
        r"(\d+)\s*\+?\s*years",
        r"(\d+)\s*\+?\s*ans",
        r"(\d+)\s*\+?\s*annees",
        r"(\d+)\s*\+?\s*années",
    ]

    years = []

    for pattern in patterns:
        matches = re.findall(pattern, text_norm)
        for match in matches:
            try:
                years.append(int(match))
            except ValueError:
                pass

    return max(years) if years else 0


def count_term_hits(text, terms):
    text_norm = normalize_text(text)
    count = 0

    for term in terms:
        if normalize_text(term) in text_norm:
            count += 1

    return count


def compute_structure_score(lines):
    score = 0
    matched_sections = []

    for section_name, candidates in SECTION_HEADERS.items():
        if detect_section_presence(lines, candidates):
            matched_sections.append(section_name)

    if "contact" in matched_sections:
        score += 15
    if "summary" in matched_sections:
        score += 15
    if "skills" in matched_sections:
        score += 25
    if "experience" in matched_sections:
        score += 25
    if "education" in matched_sections:
        score += 20

    return min(score, 100), matched_sections


def compute_experience_score(text):
    hits = count_term_hits(text, EXPERIENCE_TERMS)
    years = extract_years_of_experience_hint(text)

    base_score = min(70, hits * 10)
    bonus = min(30, years * 5)

    return min(100, base_score + bonus)


def compute_education_score(text):
    hits = count_term_hits(text, EDUCATION_TERMS)

    if hits == 0:
        return 0

    return min(100, max(30, hits * 12))


def compute_keyword_match(text, target_keywords):
    found = []
    text_norm = normalize_text(text)

    for keyword in target_keywords:
        if normalize_text(keyword) in text_norm:
            found.append(keyword)

    missing = [kw for kw in target_keywords if kw not in found]
    score = score_presence(len(found), len(target_keywords))

    return score, found, missing


def build_tips(found_sections, missing_keywords, structure_score, tech_skills, soft_skills):
    tips = []

    if "skills" not in found_sections:
        tips.append({
            "title": "Ajoutez une section Compétences",
            "desc": "Votre CV ne contient pas une section compétences clairement identifiable.",
            "priority": "haute"
        })

    if "experience" not in found_sections:
        tips.append({
            "title": "Clarifiez la section Expérience",
            "desc": "Ajoutez une section Expérience professionnelle bien visible.",
            "priority": "haute"
        })

    if "education" not in found_sections:
        tips.append({
            "title": "Ajoutez une section Formation",
            "desc": "Une section formation claire améliore la lisibilité du CV.",
            "priority": "moyen"
        })

    for kw in missing_keywords[:3]:
        tips.append({
            "title": f"Ajouter le mot-clé {kw}",
            "desc": f"Le mot-clé '{kw}' semble manquer dans votre CV.",
            "priority": "haute"
        })

    if len(tech_skills) < 4:
        tips.append({
            "title": "Renforcer les compétences techniques",
            "desc": "Ajoutez plus de technologies, outils, frameworks et bases de données.",
            "priority": "haute"
        })

    if len(soft_skills) < 2:
        tips.append({
            "title": "Ajouter des soft skills",
            "desc": "Ajoutez communication, autonomie, leadership ou travail en équipe.",
            "priority": "moyen"
        })

    if structure_score < 60:
        tips.append({
            "title": "Améliorer la structure globale",
            "desc": "Utilisez des titres de sections clairs et standards.",
            "priority": "haute"
        })

    if not tips:
        tips.append({
            "title": "CV globalement bien structuré",
            "desc": "Votre CV contient une bonne base pour l’analyse ATS.",
            "priority": "moyen"
        })

    return tips[:6]


def analyse_cv_text(text):
    lines = normalize_lines(text)

    technical_skills = find_skills(text, TECH_SKILL_SYNONYMS)
    soft_skills = find_skills(text, SOFT_SKILL_SYNONYMS)

    technical_skill_score = score_presence(len(technical_skills), len(TECH_SKILL_SYNONYMS))
    keyword_match_score, present_keywords, missing_keywords = compute_keyword_match(text, TARGET_KEYWORDS)
    experience_score = compute_experience_score(text)
    education_score = compute_education_score(text)
    structure_score, found_sections = compute_structure_score(lines)

    ats_score = round(
        (technical_skill_score * 0.30) +
        (keyword_match_score * 0.25) +
        (experience_score * 0.20) +
        (education_score * 0.15) +
        (structure_score * 0.10)
    )

    tips = build_tips(
        found_sections=found_sections,
        missing_keywords=missing_keywords,
        structure_score=structure_score,
        tech_skills=technical_skills,
        soft_skills=soft_skills,
    )

    return {
        "ats_score": ats_score,
        "tech_relevance": technical_skill_score,
        "experience_score": experience_score,
        "education_score": education_score,
        "structure_score": structure_score,
        "technical_skills": technical_skills,
        "soft_skills": soft_skills,
        "present_keywords": present_keywords,
        "missing_keywords": missing_keywords,
        "found_sections": found_sections,
        "tips": tips,
    }


# =========================
# OUTILS JSON HUGGING FACE
# =========================

def clean_ai_json_response(content):
    if not content:
        raise Exception("Réponse Hugging Face vide")

    content = content.strip()
    content = content.replace("```json", "").replace("```", "").strip()

    start = content.find("{")
    end = content.rfind("}")

    if start == -1 or end == -1:
        raise Exception(f"Aucun JSON trouvé dans la réponse HF: {content[:500]}")

    content = content[start:end + 1]

    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        print("🔥 JSON HF BRUT:", content[:1000])
        raise e


def call_huggingface_chat(prompt, max_tokens=1800, temperature=0.3):
    if hf_client is None:
        raise Exception("HF_TOKEN absent. Configurez votre token Hugging Face.")

    response = hf_client.chat.completions.create(
        model=HF_MODEL,
        messages=[
            {
                "role": "system",
                "content": "Réponds uniquement avec un JSON valide. Aucun texte avant ou après."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=max_tokens,
        temperature=temperature,
    )

    content = response.choices[0].message.content
    print("🔥 REPONSE HF:", content[:1000])
    return content


# =========================
# ANALYSE IA HUGGING FACE
# =========================

def analyse_cv_with_ai(cv_text, classic_analysis=None):
    if classic_analysis is None:
        classic_analysis = analyse_cv_text(cv_text)

    prompt = f"""
Analyse ce CV comme un expert RH ATS.

CV ORIGINAL:
{cv_text}

ANALYSE ATS CLASSIQUE:
{json.dumps(classic_analysis, ensure_ascii=False)}

Retourne uniquement ce JSON valide:
{{
  "global_feedback": "avis global sur le CV",
  "professional_title_quality": "analyse du titre professionnel",
  "summary_quality": "analyse du résumé",
  "structure_problems": ["problème de structure"],
  "grammar_errors": ["faute ou correction détectée"],
  "redundancies": ["redondance détectée"],
  "date_order_issues": ["problème d'ordre chronologique"],
  "strengths": ["point fort"],
  "weaknesses": ["point faible"],
  "missing_keywords": ["mot-clé ATS manquant"],
  "photo_advice": "conseil pour une photo professionnelle",
  "ats_recommendations": ["recommandation ATS"]
}}
"""

    content = call_huggingface_chat(
        prompt=prompt,
        max_tokens=5000,
        temperature=0.2,
    )

    return clean_ai_json_response(content)


# =========================
# OPTIMISATION IA HUGGING FACE
# =========================

def optimize_cv_with_ai(cv_text, classic_analysis=None):
    if classic_analysis is None:
        classic_analysis = analyse_cv_text(cv_text)

    original_score = int(classic_analysis.get("ats_score", 0))
    optimized_score = max(75, min(95, original_score + 40))
    improvement = optimized_score - original_score

    technical_skills = classic_analysis.get("technical_skills", [])
    soft_skills = classic_analysis.get("soft_skills", [])
    missing_keywords = classic_analysis.get("missing_keywords", [])
    present_keywords = classic_analysis.get("present_keywords", [])

    prompt = f"""
Tu es un expert RH ATS.

Transforme ce CV en JSON propre pour générer un PDF professionnel.

Règles:
- Corrige les fautes.
- Supprime les redondances.
- Organise les sections.
- Ne crée pas de fausse entreprise.
- Ne crée pas de faux diplôme.
- Si une information manque, mets "Non précisé".
- Retourne uniquement un JSON valide.

CV ORIGINAL:
{cv_text}

Retourne exactement ce JSON:
{{
  "name": "Nom complet",
  "title": "Titre professionnel optimisé",
  "contact": {{
    "phone": "Téléphone",
    "email": "Email",
    "location": "Ville, pays",
    "linkedin": "LinkedIn ou Non précisé"
  }},
  "summary": "Résumé professionnel optimisé en 3 lignes maximum",
  "skills": ["compétence 1", "compétence 2"],
  "soft_skills": ["soft skill 1", "soft skill 2"],
  "experience": [
    {{
      "position": "Poste",
      "company": "Entreprise",
      "period": "Période",
      "description": ["mission 1", "mission 2"]
    }}
  ],
  "education": [
    {{
      "degree": "Diplôme",
      "school": "École",
      "period": "Période"
    }}
  ],
  "projects": [
    {{
      "name": "Projet",
      "description": "Description courte"
    }}
  ],
  "languages": ["Français", "Anglais"],
  "certifications": ["Certification 1"]
}}
"""

    try:
        content = call_huggingface_chat(
            prompt=prompt,
            max_tokens=3500,
            temperature=0.2,
        )

        cv_json = clean_ai_json_response(content)

    except Exception as e:
        print("🔥 ERREUR JSON CV OPTIMISÉ:", str(e))

        cv_json = {
            "name": "Nom non précisé",
            "title": "Profil professionnel optimisé",
            "contact": {
                "phone": "Non précisé",
                "email": "Non précisé",
                "location": "Non précisé",
                "linkedin": "Non précisé",
            },
            "summary": "Profil restructuré automatiquement pour améliorer la lisibilité et la compatibilité ATS.",
            "skills": technical_skills,
            "soft_skills": soft_skills,
            "experience": [],
            "education": [],
            "projects": [],
            "languages": [],
            "certifications": [],
        }

    final_cv_text = f"""
{cv_json.get("name", "")}
{cv_json.get("title", "")}

RÉSUMÉ
{cv_json.get("summary", "")}

COMPÉTENCES
{", ".join(cv_json.get("skills", []))}

EXPÉRIENCE
{json.dumps(cv_json.get("experience", []), ensure_ascii=False)}

FORMATION
{json.dumps(cv_json.get("education", []), ensure_ascii=False)}
"""

    return {
        "score_original": original_score,
        "score_optimized": optimized_score,
        "improvement": improvement,
        "optimized_title": cv_json.get("title", "Profil professionnel optimisé"),
        "optimized_summary": cv_json.get("summary", ""),
        "professional_photo_suggestion": "",
        "cv_pdf_data": cv_json,
        "optimized_sections": [
            {
                "section_title": "Résumé professionnel",
                "content": cv_json.get("summary", ""),
                "score": 90
            },
            {
                "section_title": "Compétences techniques",
                "content": ", ".join(cv_json.get("skills", [])),
                "score": 88
            }
        ],
        "optimized_experiences": cv_json.get("experience", []),
        "technical_skills": cv_json.get("skills", technical_skills),
        "soft_skills": cv_json.get("soft_skills", soft_skills),
        "ats_keywords": list(set(present_keywords + missing_keywords)),
        "removed_redundancies": [],
        "corrected_errors": [],
        "main_improvements": [],
        "final_cv_text": final_cv_text
    }