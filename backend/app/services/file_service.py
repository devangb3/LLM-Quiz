from fastapi import UploadFile, HTTPException
import chardet
import PyPDF2
import io
import logging

logger = logging.getLogger(__name__)

class FileService:
    @staticmethod
    async def extract_text_content(file: UploadFile) -> str:
        """Extract text content from different file types."""
        try:
            content = await file.read()
            # Seek back to start of file for potential future reads
            await file.seek(0)
            
            if file.content_type == 'application/pdf':
                return FileService._extract_pdf_content(content)
            else:
                return FileService._extract_text_content(content)
                
        except Exception as e:
            logger.error(f"Error reading file: {str(e)}")
            raise HTTPException(status_code=400, detail="Error reading file content")
    
    @staticmethod
    def _extract_pdf_content(content: bytes) -> str:
        """Extract text from PDF content."""
        try:
            pdf_file = io.BytesIO(content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text_content = ""
            for page in pdf_reader.pages:
                text_content += page.extract_text() + "\n"
            logger.info("Successfully extracted text from PDF")
            return text_content.strip()
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise HTTPException(status_code=400, detail="Could not extract text from PDF file")
    
    @staticmethod
    def _extract_text_content(content: bytes) -> str:
        """Extract text from text file content."""
        try:
            result = chardet.detect(content)
            encoding = result['encoding'] if result['encoding'] else 'utf-8'
            logger.info(f"Detected file encoding: {encoding}")
            text_content = content.decode(encoding)
            return text_content.strip()
        except Exception as e:
            logger.error(f"Error decoding file content: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Could not decode file content (detected encoding: {result.get('encoding', 'unknown')}). Please ensure the file is properly encoded text or PDF."
            ) 