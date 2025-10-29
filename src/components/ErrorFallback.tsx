import { Button, Icon, Stack, Text } from "@chakra-ui/react";
import { ArrowRotateLeft } from "iconsax-reactjs";

// Error boundary fallback
const ErrorFallback = ({ resetErrorBoundary, error }: { resetErrorBoundary: () => void; error: Error }) => {
    return (
        <Stack alignItems={"center"} justify={"center"} textAlign={"center"} gap="4" p="6" border="xs" borderColor="gray.200" rounded="lg" w="full" bg="white">
            <Text color="red.500">{error?.message}</Text>
            <Button rounded="lg"  bg="red.500" color="white" w="fit-content" onClick={resetErrorBoundary}>
                <Icon as={ArrowRotateLeft} /> Try Again
            </Button>
        </Stack>
    );
};
export default ErrorFallback;
