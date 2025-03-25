from pydantic import BaseModel, Field
from typing import List

class QuizQuestion(BaseModel):
    question: str
    options: List[str] = Field(..., min_items=4, max_items=4)
    correct_answer: str

class QuizResponse(BaseModel):
    questions: List[QuizQuestion] 