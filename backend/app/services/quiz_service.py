import json
import logging
import requests
from fastapi import HTTPException
from typing import Dict, Any

from app.config.settings import settings
from app.models.quiz import QuizQuestion

logger = logging.getLogger(__name__)

class QuizService:
    @staticmethod
    async def generate_quiz(text_content: str) -> list[QuizQuestion]:
        """Generate quiz questions from text content."""
        try:
            response_json = await QuizService._call_deepseek_api(text_content)
            return QuizService._process_api_response(response_json)
        except Exception as e:
            logger.error(f"Error in quiz generation: {str(e)}")
            raise

    @staticmethod
    async def _call_deepseek_api(text_content: str) -> Dict[str, Any]:
        """Call Deepseek API with error handling."""
        headers = {
            "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        prompt = QuizService._create_prompt(text_content)
        
        try:
            api_request = {
                "model": settings.MODEL_NAME,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a quiz generator that creates multiple choice questions. Always respond with valid JSON arrays."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": settings.TEMPERATURE
            }
            
            logger.debug(f"API Request: {json.dumps(api_request, indent=2)}")
            
            response = requests.post(
                settings.DEEPSEEK_API_URL,
                headers=headers,
                json=api_request,
                timeout=30
            )
            
            logger.info(f"Deepseek API response status: {response.status_code}")
            logger.debug(f"Raw response: {response.text[:1000]}")
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"API error (Status {response.status_code}): {response.text}"
                )
            
            return response.json()
            
        except requests.exceptions.Timeout:
            raise HTTPException(status_code=504, detail="API request timed out")
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=500, detail=f"API request failed: {str(e)}")

    @staticmethod
    def _create_prompt(text_content: str) -> str:
        """Create the prompt for the API."""
        return f"""Create 5 multiple choice questions based on this study material. Format your response as a JSON array.

Example format:
[
    {{
        "question": "What is X?",
        "options": ["A", "B", "C", "D"],
        "correct_answer": "A"
    }}
]

Rules:
1. Response must be a valid JSON array
2. Each question must have exactly 4 options
3. The correct_answer must exactly match one of the options
4. No explanations or additional text, only the JSON array

Study material:
{text_content}"""

    @staticmethod
    def _process_api_response(response_json: Dict[str, Any]) -> list[QuizQuestion]:
        """Process and validate the API response."""
        try:
            content = response_json["choices"][0]["message"]["content"].strip()
            
            # Clean up the content
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            
            content = content.strip()
            
            # Extract JSON array if needed
            if not content.startswith('['):
                start_idx = content.find('[')
                end_idx = content.rfind(']')
                if start_idx != -1 and end_idx != -1:
                    content = content[start_idx:end_idx + 1]
                else:
                    raise ValueError("Could not find JSON array in response")
            
            # Parse and validate the content
            try:
                quiz_data = json.loads(content)
            except json.JSONDecodeError:
                # Try to fix common JSON issues
                content = ' '.join(content.replace('\n', ' ').replace('\r', '').split())
                quiz_data = json.loads(content)
            
            # Validate structure
            if not isinstance(quiz_data, list):
                raise ValueError("Quiz data is not a list")
            
            questions = []
            for item in quiz_data:
                question = QuizQuestion(**item)
                if question.correct_answer not in question.options:
                    raise ValueError(f"Correct answer '{question.correct_answer}' not in options")
                questions.append(question)
            
            return questions
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {str(e)}\nContent: {content}")
            raise HTTPException(status_code=500, detail="Failed to parse API response")
        except ValueError as e:
            logger.error(f"Validation error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e)) 