import { useState, type ChangeEvent } from 'react'
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Progress,
  Radio,
  RadioGroup,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  HStack,
} from '@chakra-ui/react'
import axios, { AxiosError } from 'axios'
import { ENDPOINTS } from '../config/api'

interface Question {
  question: string
  options: string[]
  correct_answer: string
}

// Custom logger
const logger = {
  info: (message: string, data?: any) => {
    console.info(`[${new Date().toISOString()}] INFO:`, message, data || '')
  },
  error: (message: string, error?: any) => {
    console.error(`[${new Date().toISOString()}] ERROR:`, message, error || '')
  },
  warn: (message: string, data?: any) => {
    console.warn(`[${new Date().toISOString()}] WARN:`, message, data || '')
  }
}

const QuizGenerator = () => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [numQuestions, setNumQuestions] = useState<number>(5)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const toast = useToast()

  const resetQuiz = () => {
    setQuestions([])
    setFile(null)
    setSelectedAnswers([])
    setCurrentQuestion(0)
    setShowResults(false)
    setError(null)
    setAnswerSubmitted(false)
    setScore(0)
    logger.info('Quiz reset')
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    try {
      if (event.target.files && event.target.files[0]) {
        const selectedFile = event.target.files[0]
        logger.info('File selected:', { 
          name: selectedFile.name, 
          type: selectedFile.type, 
          size: selectedFile.size 
        })
        
        // Validate file type
        const allowedTypes = [
          'text/plain',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        
        if (!allowedTypes.includes(selectedFile.type)) {
          const errorMsg = `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
          logger.error(errorMsg)
          toast({
            title: 'Invalid file type',
            description: errorMsg,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          return
        }
        
        setFile(selectedFile)
        setError(null)
      }
    } catch (err) {
      const errorMsg = 'Error selecting file'
      logger.error(errorMsg, err)
      setError(errorMsg)
      toast({
        title: 'Error',
        description: errorMsg,
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      const errorMsg = 'No file selected'
      logger.warn(errorMsg)
      toast({
        title: errorMsg,
        status: 'error',
        duration: 3000,
      })
      return
    }

    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('num_questions', numQuestions.toString())

    try {
      logger.info('Sending file to backend for quiz generation', { 
        fileName: file.name,
        numQuestions 
      })
      const response = await axios.post(ENDPOINTS.GENERATE_QUIZ, formData)
      
      logger.info('Quiz generated successfully', { 
        questionCount: response.data.questions.length 
      })
      
      setQuestions(response.data.questions)
      setSelectedAnswers(new Array(response.data.questions.length).fill(''))
      setCurrentQuestion(0)
      setShowResults(false)
      setAnswerSubmitted(false)
      setScore(0)
      
      toast({
        title: 'Quiz Generated',
        description: `Created ${response.data.questions.length} questions`,
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      let errorMsg = 'Error generating quiz'
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail: string }>
        errorMsg = axiosError.response?.data?.detail || errorMsg
        logger.error('API Error:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          error: axiosError.message
        })
      } else {
        logger.error('Unexpected error:', error)
      }
      
      setError(errorMsg)
      toast({
        title: 'Error',
        description: errorMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (value: string) => {
    logger.info('Answer selected', { 
      questionNumber: currentQuestion + 1, 
      selectedAnswer: value 
    })
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = value
    setSelectedAnswers(newAnswers)
    setAnswerSubmitted(false)
  }

  const submitAnswer = () => {
    const currentAnswer = selectedAnswers[currentQuestion]
    const correctAnswer = questions[currentQuestion].correct_answer
    const isCorrect = currentAnswer === correctAnswer
    
    if (isCorrect) {
      setScore(prev => prev + 1)
    }
    
    setAnswerSubmitted(true)
    
    toast({
      title: isCorrect ? 'Correct!' : 'Incorrect',
      description: isCorrect 
        ? 'Great job!' 
        : `The correct answer was: ${correctAnswer}`,
      status: isCorrect ? 'success' : 'error',
      duration: 3000,
      isClosable: true,
    })
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      logger.info('Moving to next question', { 
        currentQuestion: currentQuestion + 1 
      })
      setCurrentQuestion(currentQuestion + 1)
      setAnswerSubmitted(false)
    } else {
      logger.info('Quiz completed, showing results')
      setShowResults(true)
    }
  }

  if (loading) {
    return (
      <Box w="100%">
        <Text mb={4}>Generating your quiz...</Text>
        <Progress size="xs" isIndeterminate colorScheme="purple" />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        borderRadius="lg"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Error Generating Quiz
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          <Text mb={2}>{error}</Text>
          <Code p={2} borderRadius="md" variant="subtle">
            Please try again or contact support if the issue persists.
          </Code>
        </AlertDescription>
      </Alert>
    )
  }

  if (showResults) {
    return (
      <Box textAlign="center" p={6} borderWidth={1} borderRadius="lg">
        <Text fontSize="2xl" mb={4}>
          Quiz Complete!
        </Text>
        <Text fontSize="xl" mb={4}>
          Your final score: {score} out of {questions.length}
        </Text>
        <Text fontSize="lg" mb={6} color={score / questions.length >= 0.7 ? "green.500" : "orange.500"}>
          {score / questions.length >= 0.7 ? "Great job!" : "Keep practicing!"}
        </Text>
        <Button
          colorScheme="purple"
          onClick={resetQuiz}
        >
          Start New Quiz
        </Button>
      </Box>
    )
  }

  if (questions.length > 0) {
    const question = questions[currentQuestion]
    return (
      <Box p={6} borderWidth={1} borderRadius="lg" w="100%">
        <Text fontSize="xl" mb={4}>
          Question {currentQuestion + 1} of {questions.length}
        </Text>
        <Text fontSize="lg" mb={4}>
          {question.question}
        </Text>
        <RadioGroup 
          onChange={handleAnswer} 
          value={selectedAnswers[currentQuestion]}
          isDisabled={answerSubmitted}
        >
          <Stack spacing={4}>
            {question.options.map((option, index) => (
              <Radio 
                key={index} 
                value={option}
                colorScheme={
                  answerSubmitted
                    ? option === question.correct_answer
                      ? "green"
                      : selectedAnswers[currentQuestion] === option
                      ? "red"
                      : "gray"
                    : "purple"
                }
              >
                <Text
                  color={
                    answerSubmitted
                      ? option === question.correct_answer
                        ? "green.500"
                        : selectedAnswers[currentQuestion] === option
                        ? "red.500"
                        : "gray.700"
                      : "gray.700"
                  }
                >
                  {option}
                </Text>
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
        <HStack mt={6} spacing={4} justify="center">
          {!answerSubmitted ? (
            <Button
              colorScheme="purple"
              onClick={submitAnswer}
              isDisabled={!selectedAnswers[currentQuestion]}
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              colorScheme="purple"
              onClick={nextQuestion}
            >
              {currentQuestion === questions.length - 1 ? 'Show Final Results' : 'Next Question'}
            </Button>
          )}
        </HStack>
      </Box>
    )
  }

  return (
    <VStack spacing={6} w="100%">
      <Box
        w="100%"
        h="200px"
        border="2px dashed"
        borderColor="gray.300"
        borderRadius="lg"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        <input
          type="file"
          onChange={handleFileChange}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
          }}
          accept=".txt,.doc,.docx,.pdf"
        />
        <Text color="gray.500">
          {file ? file.name : 'Drop your study material here or click to browse'}
        </Text>
      </Box>
      <FormControl>
        <FormLabel>Number of Questions</FormLabel>
        <NumberInput
          min={1}
          max={20}
          value={numQuestions}
          onChange={(_, value) => setNumQuestions(value)}
          defaultValue={5}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      <Button
        colorScheme="purple"
        onClick={handleSubmit}
        isDisabled={!file}
        w="full"
        size="lg"
      >
        Generate Quiz
      </Button>
    </VStack>
  )
}

export default QuizGenerator 