import { ChakraProvider, Container, VStack, Heading } from '@chakra-ui/react'
import QuizGenerator from './components/QuizGenerator'

function App() {
  return (
    <ChakraProvider>
      <Container maxW="container.lg" py={10}>
        <VStack gap={8}>
          <Heading as="h1" size="2xl" textAlign="center" color="purple.600">
            Interactive Study Quiz Generator
          </Heading>
          <QuizGenerator />
        </VStack>
      </Container>
    </ChakraProvider>
  )
}

export default App
