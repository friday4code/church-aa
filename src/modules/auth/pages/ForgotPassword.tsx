import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
    Box,
    Stack,
    Heading,
    Field,
    Input,
    Button,
    Text,
    InputGroup,
    Span,
    Image,
    Container,
    Alert,
    ScrollArea,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { Toaster, toaster } from "@/components/ui/toaster";
import { Link, useNavigate } from "react-router";
import { delay } from "@/utils/helpers";
import { Sms, ArrowLeft } from "iconsax-reactjs";
import { authApi } from "@/api/auth.api";

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address").min(1, "Email is required"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
    const navigate = useNavigate();

    // Clear all queued toasts
    useEffect(() => {
        return () => {
            toaster.remove();
        };
    }, []);

    const mutation = useMutation({
        mutationFn: authApi.requestPasswordReset, // You'll need to add this to your authApi
        onSuccess: async (response) => {
            console.log("Password reset email sent:", response);

            toaster.success({
                description: "Password reset instructions sent to your email!",
            });

            await delay(2000);

            // Optionally redirect to login page or confirmation page
            navigate("/login");
        },
        onError: (error: any) => {
            toaster.error({
                description: error?.message || "Failed to send reset instructions. Please try again.",
            });
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        mutation.mutate(data);
        console.log("Forgot password data:", data);
    };

    return (
        <ScrollArea.Root h="vh">
            <ScrollArea.Viewport>
                <ScrollArea.Content h="full">
                    <Box
                        h="full"
                        bgImage="url(/auth-bg.png)"
                        bgPos="center"
                        bgSize="cover"
                        bgAttachment="fixed"
                    >
                        <Container maxW="md" py={{ base: 8, md: 12 }} zIndex={2}>
                            {/* Back to Login */}
                            <Box mb={4}>
                                <Button
                                    variant="ghost"
                                    color="white"
                                    rounded={"xl"}
                                    onClick={() => navigate("/login")}
                                    _hover={{ bg: "whiteAlpha.200" }}
                                >
                                    <ArrowLeft variant="Bulk" />
                                    Back to Login
                                </Button>
                            </Box>

                            {/* Form Section */}
                            <Box
                                backdropFilter="blur(40px)"
                                rounded="2xl"
                                shadow="2xl"
                                border="xs"
                                borderColor={"accent.50/20"}
                                p={{ base: 4, md: 8 }}
                                color={"white"}
                            >
                                <Stack gap={6} align="stretch"
                                    css={{
                                        "& input:-webkit-autofill": {
                                            WebkitBoxShadow: "0 0 0px 1000px transparent inset !important",
                                            WebkitTextFillColor: "white !important",
                                            transition: "background-color 9999s ease-in-out 0s !important",
                                        },
                                    }}
                                >
                                    <Stack gap={2}>
                                        <Heading textAlign="center" color={"white"} fontWeight={"black"}>
                                            Forgot Password
                                        </Heading>
                                        <Text textAlign="center">
                                            Enter your email address and we'll send you instructions to reset your password.
                                        </Text>
                                    </Stack>

                                    {/* Info Alert */}
                                    {mutation.isSuccess && <Alert.Root status="info" borderRadius="lg">
                                        <Alert.Indicator />
                                        <Alert.Content>
                                            <Alert.Title>Check your email</Alert.Title>
                                            <Alert.Description>
                                                We'll send a password reset link to your registered email address.
                                            </Alert.Description>
                                        </Alert.Content>
                                    </Alert.Root>}

                                    {/* Form */}
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <Stack gap={6} colorPalette="accent">
                                            <Field.Root invalid={!!errors.email}>
                                                <Field.Label>
                                                    Email <Field.RequiredIndicator />
                                                </Field.Label>
                                                <InputGroup startElement={
                                                    <Sms variant="Bulk" color="white" />
                                                }>
                                                    <Input
                                                        _placeholder={{ color: "gray.400" }}
                                                        {...register("email")}
                                                        rounded="lg"
                                                        size="lg"
                                                        placeholder="your-email@example.com"
                                                        type="email"
                                                        autoComplete="email"
                                                    />
                                                </InputGroup>
                                                <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                                            </Field.Root>

                                            <Button
                                                rounded="lg"
                                                type="submit"
                                                loading={isSubmitting || mutation.isPending}
                                                loadingText="Sending Instructions"
                                                bg="white"
                                                _hover={{ bg: "whiteAlpha.800" }}
                                                color="accent"
                                                size="lg"
                                                fontWeight={"bold"}
                                                w="full"
                                            >
                                                Send Reset Instructions
                                            </Button>
                                        </Stack>
                                    </form>

                                    {/* Back to Login Link */}
                                    <Text textAlign="center" mt={4}>
                                        Remember your password?{" "}
                                        <Link to="/login">
                                            <Span color="accent.300" fontWeight="semibold" textDecoration="underline">
                                                Back to Login
                                            </Span>
                                        </Link>
                                    </Text>
                                </Stack>
                            </Box>
                        </Container>

                        <Image
                            src="/logo.png"
                            h="20"
                            mx="auto"
                            pos="fixed"
                            right="6"
                            bottom="6"
                            mt="8"
                        />
                        <Toaster />
                    </Box>
                </ScrollArea.Content>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar>
                <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner />
        </ScrollArea.Root>

    );
};

export default ForgotPassword;