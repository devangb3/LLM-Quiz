from fastapi import APIRouter, File, UploadFile, HTTPException
from datetime import datetime
import logging

from app.services.file_service import FileService
from app.services.quiz_service import QuizService
from app.models.quiz import QuizResponse

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/generate-quiz", response_model=QuizResponse)
async def generate_quiz(file: UploadFile = File(...)):
    """Generate quiz questions from uploaded file."""
    try:
        logger.info(f"Received file: {file.filename}, content_type: {file.content_type}")
        
        # Extract text content
        text_content = await FileService.extract_text_content(file)
        if not text_content or len(text_content.strip()) == 0:
            raise HTTPException(status_code=400, detail="Extracted text content is empty")
        
        logger.info(f"Successfully extracted text content, length: {len(text_content)} characters")
        
        # Generate quiz
        questions = await QuizService.generate_quiz(text_content)
        
        return QuizResponse(questions=questions)
        
    except HTTPException as he:
        raise he
    except Exception as e:
        error_msg = f"Error generating quiz: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise HTTPException(status_code=500, detail=error_msg)

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    logger.info("Health check endpoint called")
    return {"status": "healthy", "timestamp": datetime.now().isoformat()} 