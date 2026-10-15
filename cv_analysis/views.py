import os
import re
import uuid
from reportlab.lib.utils import ImageReader
from reportlab.lib import colors
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm

from django.conf import settings
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import CV, CVAnalysisResult, OptimizedCV
from .utils import (
    extract_text_from_file,
    analyse_cv_text,
    analyse_cv_with_ai,
    optimize_cv_with_ai,
    extract_photo_from_file,
)


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def upload_and_analyze_cv(request):
    uploaded_file = request.FILES.get("file")

    if not uploaded_file:
        return Response({"detail": "Aucun fichier reçu"}, status=status.HTTP_400_BAD_REQUEST)

    ext = os.path.splitext(uploaded_file.name)[1].lower()

    if ext not in [".pdf", ".docx"]:
        return Response({"detail": "Format non supporté. Utilisez PDF ou DOCX."}, status=status.HTTP_400_BAD_REQUEST)

    if uploaded_file.size > 5 * 1024 * 1024:
        return Response({"detail": "Fichier trop grand. Taille maximale : 5 MB."}, status=status.HTTP_400_BAD_REQUEST)

    upload_dir = os.path.join(settings.MEDIA_ROOT, "cvs", str(request.user.id))
    os.makedirs(upload_dir, exist_ok=True)

    unique_name = f"{uuid.uuid4().hex}_{uploaded_file.name}"
    file_path = os.path.join(upload_dir, unique_name)

    with open(file_path, "wb+") as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)

    extracted_text = extract_text_from_file(file_path)
    photo_output = os.path.join(upload_dir, f"{uuid.uuid4().hex}_photo.jpg")
    photo_path = extract_photo_from_file(file_path, photo_output)

    if not extracted_text or not extracted_text.strip():
        return Response({"detail": "Impossible d'extraire le texte du CV."}, status=status.HTTP_400_BAD_REQUEST)

    analysis_data = analyse_cv_text(extracted_text)

    try:
        ai_analysis = analyse_cv_with_ai(extracted_text, analysis_data)
    except Exception as e:
        print("🔥 ERREUR IA ANALYSE:", str(e))
        ai_analysis = {
            "global_feedback": "Analyse IA indisponible temporairement.",
            "error": str(e),
            "professional_title_quality": "",
            "summary_quality": "",
            "structure_problems": [],
            "grammar_errors": [],
            "redundancies": [],
            "date_order_issues": [],
            "strengths": [],
            "weaknesses": [],
            "missing_keywords": analysis_data.get("missing_keywords", []),
            "photo_advice": "Ajoutez une photo professionnelle claire, fond neutre, tenue correcte.",
            "ats_recommendations": []
        }

    try:
        ai_optimization = optimize_cv_with_ai(extracted_text, analysis_data)
    except Exception as e:
        print("🔥 ERREUR IA OPTIMISATION:", str(e))
        ai_optimization = {
            "score_original": analysis_data.get("ats_score", 0),
            "score_optimized": analysis_data.get("ats_score", 0),
            "improvement": 0,
            "optimized_title": "",
            "optimized_summary": "",
            "professional_photo_suggestion": "Photo professionnelle : fond neutre, visage centré, bonne luminosité.",
            "optimized_sections": [],
            "optimized_experiences": [],
            "technical_skills": analysis_data.get("technical_skills", []),
            "soft_skills": analysis_data.get("soft_skills", []),
            "ats_keywords": analysis_data.get("present_keywords", []),
            "removed_redundancies": [],
            "corrected_errors": [],
            "main_improvements": [],
            "final_cv_text": extracted_text,
            "error": str(e)
        }

    cv = CV.objects.create(
    user=request.user,
    file_name=uploaded_file.name,
    file_path=file_path,
    photo_path=photo_path,
    extracted_text=extracted_text,
    ats_score=analysis_data.get("ats_score", 0),
)
    result = CVAnalysisResult.objects.create(
        cv=cv,
        status="analysed",
        tech_relevance=analysis_data.get("tech_relevance", 0),
        experience_score=analysis_data.get("experience_score", 0),
        education_score=analysis_data.get("education_score", 0),
        structure_score=analysis_data.get("structure_score", 0),
        technical_skills=analysis_data.get("technical_skills", []),
        soft_skills=analysis_data.get("soft_skills", []),
        present_keywords=analysis_data.get("present_keywords", []),
        missing_keywords=analysis_data.get("missing_keywords", []),
        found_sections=analysis_data.get("found_sections", []),
        tips=analysis_data.get("tips", []),
        ai_analysis=ai_analysis,
        ai_optimization=ai_optimization,
    )

    optimized_cv = OptimizedCV.objects.create(
        cv=cv,
        generated_content=ai_optimization.get("final_cv_text", ""),
        optimized_data=ai_optimization,
        score_original=ai_optimization.get("score_original", analysis_data.get("ats_score", 0)),
        score_optimized=ai_optimization.get("score_optimized", 0),
        improvement=ai_optimization.get("improvement", 0),
    )

    return Response({
        "message": "CV analysé et optimisé avec succès",
        "analysis_id": result.id,
        "optimized_id": optimized_cv.id,
        "cv_id": cv.id,
        "filename": cv.file_name,
        "atsScore": analysis_data.get("ats_score", 0),
        "aiAnalysis": ai_analysis,
        "aiOptimization": ai_optimization,
    }, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def latest_optimized_cv(request):
    optimized = OptimizedCV.objects.select_related("cv").filter(
        cv__user=request.user
    ).order_by("-created_at").first()

    if not optimized:
        return Response({"detail": "Aucun CV optimisé trouvé"}, status=status.HTTP_404_NOT_FOUND)

    ai_analysis = {}
    try:
        ai_analysis = optimized.cv.analysis_result.ai_analysis
    except Exception:
        ai_analysis = {}

    return Response({
        "optimized_id": optimized.id,
        "cv_id": optimized.cv.id,
        "filename": optimized.cv.file_name,
        "scoreOriginal": optimized.score_original,
        "scoreOptimized": optimized.score_optimized,
        "improvement": optimized.improvement,
        "generatedContent": optimized.generated_content,
        "optimizedData": optimized.optimized_data,
        "aiAnalysis": ai_analysis,
        "created_at": optimized.created_at.isoformat(),
    }, status=status.HTTP_200_OK)


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def analysis_detail(request, analysis_id):
    try:
        result = CVAnalysisResult.objects.select_related("cv").get(id=analysis_id, cv__user=request.user)
    except CVAnalysisResult.DoesNotExist:
        return Response({"detail": "Analyse introuvable"}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        "analysis_id": result.id,
        "filename": result.cv.file_name,
        "date": "Il y a quelques instants",
        "atsScore": int(float(result.cv.ats_score or 0)),
        "kpis": [
            {"label": "Tech Relevance", "score": result.tech_relevance, "color": "#22C55E"},
            {"label": "Expérience", "score": result.experience_score, "color": "#7B2FF7"},
            {"label": "Formation", "score": result.education_score, "color": "#C8187A"},
            {"label": "Structure", "score": result.structure_score, "color": "#F59E0B"},
        ],
        "technicalSkills": result.technical_skills,
        "softSkills": result.soft_skills,
        "present": result.present_keywords,
        "missing": result.missing_keywords,
        "foundSections": result.found_sections,
        "structureScore": result.structure_score,
        "tips": result.tips,
        "aiAnalysis": result.ai_analysis,
        "aiOptimization": result.ai_optimization,
    }, status=status.HTTP_200_OK)


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def analysis_history(request):
    results = CVAnalysisResult.objects.select_related("cv").filter(cv__user=request.user).order_by("-created_at")

    history = []
    for result in results:
        history.append({
            "analysis_id": result.id,
            "filename": result.cv.file_name,
            "atsScore": int(float(result.cv.ats_score or 0)),
            "techRelevance": result.tech_relevance,
            "experienceScore": result.experience_score,
            "educationScore": result.education_score,
            "structureScore": result.structure_score,
            "created_at": result.created_at.isoformat(),
        })

    return Response(history, status=status.HTTP_200_OK)




@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def download_optimized_cv_pdf(request, optimized_id):
    try:
        optimized = OptimizedCV.objects.select_related("cv").get(
            id=optimized_id,
            cv__user=request.user
        )
    except OptimizedCV.DoesNotExist:
        return Response({"detail": "CV optimisé introuvable"}, status=status.HTTP_404_NOT_FOUND)

    data = optimized.optimized_data.get("cv_pdf_data", {})
    if not data:
        return Response({"detail": "Données PDF non disponibles. Relancez l’analyse du CV."}, status=400)

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="CV_Professionnel_{optimized.cv.id}.pdf"'

    p = canvas.Canvas(response, pagesize=A4)
    width, height = A4

    purple = colors.HexColor("#7C3AED")
    light = colors.HexColor("#F3E8FF")
    dark = colors.HexColor("#111827")
    muted = colors.HexColor("#6B7280")
    white = colors.white

    margin = 1.2 * cm
    sidebar_w = 6.2 * cm
    main_x = margin + sidebar_w + 0.8 * cm
    main_w = width - main_x - margin

    def safe(text):
        return str(text or "").replace("**", "").replace("###", "").replace("---", "").strip()

    def wrap(text, font, size, max_width):
        words = safe(text).split()
        lines = []
        line = ""

        for word in words:
            test = f"{line} {word}".strip()
            if p.stringWidth(test, font, size) <= max_width:
                line = test
            else:
                if line:
                    lines.append(line)
                line = word

        if line:
            lines.append(line)

        return lines

    def draw_bg():
        p.setFillColor(white)
        p.rect(0, 0, width, height, fill=1, stroke=0)
        p.setFillColor(light)
        p.rect(0, 0, sidebar_w + margin, height, fill=1, stroke=0)

    def draw_text(text, x, y, max_width, font="Helvetica", size=9, color=dark, leading=12):
        p.setFont(font, size)
        p.setFillColor(color)

        for line in wrap(text, font, size, max_width):
            if y < 1.5 * cm:
                p.showPage()
                draw_bg()
                y = height - margin

            p.drawString(x, y, line)
            y -= leading

        return y

    def section(title, x, y, max_width):
        y -= 8
        p.setFillColor(purple)
        p.setFont("Helvetica-Bold", 11)
        p.drawString(x, y, safe(title).upper())
        y -= 4
        p.setStrokeColor(purple)
        p.line(x, y, x + max_width, y)
        return y - 16

    def draw_initials_avatar(avatar_x, avatar_y, name):
        p.setFillColor(purple)
        p.circle(avatar_x, avatar_y, 1.25 * cm, fill=1, stroke=0)

        initials = "".join([part[0].upper() for part in name.split()[:2]]) or "CV"
        p.setFillColor(white)
        p.setFont("Helvetica-Bold", 24)
        p.drawCentredString(avatar_x, avatar_y - 0.25 * cm, initials)

    def draw_avatar(avatar_x, avatar_y, name):
        if optimized.cv.photo_path and os.path.exists(optimized.cv.photo_path):
            try:
                img = ImageReader(optimized.cv.photo_path)

                p.saveState()
                clip_path = p.beginPath()
                clip_path.circle(avatar_x, avatar_y, 1.25 * cm)
                p.clipPath(clip_path, stroke=0, fill=0)

                p.drawImage(
                    img,
                    avatar_x - 1.25 * cm,
                    avatar_y - 1.25 * cm,
                    width=2.5 * cm,
                    height=2.5 * cm,
                    mask="auto"
                )

                p.restoreState()

                p.setStrokeColor(purple)
                p.setLineWidth(2)
                p.circle(avatar_x, avatar_y, 1.25 * cm, fill=0, stroke=1)

            except Exception as e:
                print("Erreur affichage photo:", str(e))
                draw_initials_avatar(avatar_x, avatar_y, name)
        else:
            draw_initials_avatar(avatar_x, avatar_y, name)

    draw_bg()

    name = safe(data.get("name", "Nom Prénom"))
    title = safe(data.get("title", "Profil professionnel"))
    contact = data.get("contact", {})

    avatar_x = margin + 2.2 * cm
    avatar_y = height - 2.3 * cm
    draw_avatar(avatar_x, avatar_y, name)

    y = height - margin
    p.setFillColor(dark)
    p.setFont("Helvetica-Bold", 24)
    p.drawString(main_x, y, name[:35])
    y -= 24

    p.setFillColor(purple)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(main_x, y, title[:70])
    y -= 34

    sy = height - 4.3 * cm

    p.setFillColor(dark)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin * 0.7, sy, "CONTACT")
    sy -= 16

    contact_items = [
        contact.get("phone"),
        contact.get("email"),
        contact.get("location"),
        contact.get("linkedin"),
    ]

    for item in contact_items:
        if item and item != "Non précisé":
            sy = draw_text(
                item,
                margin * 0.7,
                sy,
                sidebar_w - 0.8 * cm,
                size=8,
                color=muted,
                leading=11
            )

    sy -= 16
    p.setFillColor(dark)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(margin * 0.7, sy, "COMPÉTENCES")
    sy -= 16

    for skill in data.get("skills", [])[:14]:
        p.setFillColor(white)
        p.roundRect(margin * 0.7, sy - 3, sidebar_w - 0.9 * cm, 14, 6, fill=1, stroke=0)
        p.setFillColor(purple)
        p.setFont("Helvetica-Bold", 7.5)
        p.drawString(margin * 0.7 + 5, sy + 1, safe(skill)[:30])
        sy -= 18

    sy -= 8
    if data.get("languages"):
        p.setFillColor(dark)
        p.setFont("Helvetica-Bold", 11)
        p.drawString(margin * 0.7, sy, "LANGUES")
        sy -= 16

        for lang in data.get("languages", [])[:5]:
            sy = draw_text(
                f"• {lang}",
                margin * 0.7,
                sy,
                sidebar_w - 0.8 * cm,
                size=8,
                color=muted,
                leading=11
            )

    if data.get("summary"):
        y = section("Résumé professionnel", main_x, y, main_w)
        y = draw_text(data.get("summary"), main_x, y, main_w, size=9.5, color=dark, leading=13)
        y -= 8

    if data.get("experience"):
        y = section("Expérience professionnelle", main_x, y, main_w)

        for exp in data.get("experience", []):
            p.setFillColor(dark)
            p.setFont("Helvetica-Bold", 10)
            p.drawString(main_x, y, safe(exp.get("position", "Poste")))
            y -= 12

            p.setFillColor(purple)
            p.setFont("Helvetica-Bold", 8.5)
            p.drawString(main_x, y, f"{safe(exp.get('company', 'Entreprise'))} | {safe(exp.get('period', 'Période'))}")
            y -= 14

            for desc in exp.get("description", []):
                y = draw_text(f"• {desc}", main_x + 8, y, main_w - 8, size=8.8, color=muted, leading=11)

            y -= 8

    if data.get("education"):
        y = section("Formation", main_x, y, main_w)

        for edu in data.get("education", []):
            y = draw_text(
                f"{edu.get('degree', '')} - {edu.get('school', '')} ({edu.get('period', '')})",
                main_x,
                y,
                main_w,
                font="Helvetica-Bold",
                size=9,
                color=dark,
                leading=12
            )

    if data.get("projects"):
        y = section("Projets", main_x, y, main_w)

        for project in data.get("projects", []):
            y = draw_text(
                f"• {project.get('name', '')}: {project.get('description', '')}",
                main_x,
                y,
                main_w,
                size=8.8,
                color=muted,
                leading=11
            )

    if data.get("certifications"):
        y = section("Certifications", main_x, y, main_w)

        for cert in data.get("certifications", []):
            y = draw_text(f"• {cert}", main_x, y, main_w, size=8.8, color=muted, leading=11)

    p.save()
    return response