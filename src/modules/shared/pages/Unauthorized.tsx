import React from "react"
import { Container, VStack, Heading, Text, Button, Card, Center, Icon } from "@chakra-ui/react"
import { Warning2 } from "iconsax-reactjs"
import { ENV } from "@/config/env"
import { NavLink } from "react-router"

const Unauthorized: React.FC = () => {
  return (
    <Container maxW="md" py={{ base: 8, md: 12 }}>
      <title>401 Unauthorized | {ENV.APP_NAME}</title>
      <meta name="robots" content="noindex" />
      <meta name="description" content="Unauthorized access page" />
      <Card.Root rounded="xl" borderWidth="1px">
        <Card.Body>
          <VStack gap={{ base: 4, md: 6 }} textAlign="center" aria-live="polite">
            <Center>
              <Icon>
                <Warning2 size={48} color="currentColor" />
              </Icon>
            </Center>
            <Heading size="lg">401 Unauthorized Access</Heading>
            <Text color="gray.600">
              You don’t have permission to view this page. Please ensure your account has the required access rights.
            </Text>
            <Text fontSize="sm" color="gray.500">
              If you believe this is an error, please contact your administrator to request access.
            </Text>
            <NavLink to="/" aria-label="Return to home">
              <Button colorPalette="accent" size="md">Go to Home</Button>
            </NavLink>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Container>
  )
}

export default Unauthorized
