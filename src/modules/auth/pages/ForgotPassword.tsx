import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ArrowRight, CheckCircle } from "lucide-react";
import {
    Box,
    Stack,
    Heading,
    Field,
    Input,
    HStack,
    Button,
    Text,
    Span,
    Flex,
    Image,
    Container, AbsoluteCenter,
    InputGroup,
    CloseButton,
    Dialog,
    Portal,
    useDisclosure
} from "@chakra-ui/react";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import ErrorFallback from "@/components/feedback/ErrorFallback";
import { Toaster, toaster } from "@/components/ui/toaster";
import { ENV } from "@/config/env";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import { authApi } from "@/api/auth.api";

const ForgotPasswordPage: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();
    return (
        <ErrorBoundary
            onReset={reset}
            fallbackRender={({ resetErrorBoundary, error }) => (
                <AbsoluteCenter>
                    <ErrorFallback {...{ resetErrorBoundary, error }} />
                </AbsoluteCenter>
            )}
        >
            <Suspense fallback={<ForgotPasswordLoader />}>
                <ForgotPasswordContent />
            </Suspense>
        </ErrorBoundary>
    );
};

const forgotPasswordSchema = z.object({
    tenantSlug: z.string().min(1, "Tenant slug is required"),
    email: z.email("Invalid email address").min(1, "Email is required"),
    phone_number: z.string().min(1, "Phone number is requird").min(10, "Incomplete phone number")
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordContent: React.FC = () => {
    const { open, onClose, onOpen } = useDisclosure();

    // clear all queued toasts
    useEffect(() => {
        return () => {
            toaster.remove();
        };
    }, []);

    const { mutate, isPending } = useMutation({
        mutationKey: ["forgotPassword"],
        mutationFn: authApi.requestPasswordReset,
        onSuccess: async () => {
            // open dialog
            onOpen();
            reset();
        }
    });


    const {
        handleSubmit,
        register,
        reset,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            tenantSlug: ENV.TENANT_SLUG,
            email: "",
            phone_number: "",
        },
    });


    const onSubmit = (data: ForgotPasswordFormData) => {
        const payload = { ...data, phone_number: "+234" + data.phone_number };
        mutate(payload);
    };

    return (
        <Box
            minH="100vh"
            bgImage="url(/hero.webp)"
            bgPos="center"
            bgSize="cover"
            bgAttachment="fixed"
            position="relative"
        >
            {/* Overlay */}
            <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                gradientFrom={"accent/50"}
                gradientVia={"black"}
                gradientTo={"transparent"}
                bgGradient={"to-br"}
                zIndex={1}
            />
            <Container pos="relative" maxW="container.xl" h="vh" py={{ base: 8, md: 12 }} position="relative" zIndex={2}>
                <Flex
                    direction={{ base: "column", md: "row" }}
                    align="center"
                    justify={{ base: "start", md: "space-between" }}
                    gap={{ base: 8, md: 12 }}
                    w="full"
                    h={{
                        base: "fit", md: "full"
                    }}
                >
                    {/* Form Section */}
                    <Box
                        order={{ base: 2, md: 1 }}
                        flex={{ base: 2, md: 0.6 }}
                        maxW={{ base: "full", md: "md" }}
                        w="full"
                        mx={{ base: "auto", md: "auto" }}
                    >
                        <Box
                            backdropFilter="blur(5px)"
                            rounded="lg"
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
                                    <Heading size="lg" textAlign="center" color={"accent"}>
                                        Forgot Password
                                    </Heading>
                                    <Text textAlign="center">
                                        Enter your email or phone to receive a reset link
                                    </Text>
                                </Stack>

                                {/* Form */}
                                <form noValidate onSubmit={handleSubmit(onSubmit)}>
                                    <Stack gap={6} colorPalette="accent">
                                        {/* Hidden tenant slug */}
                                        <Field.Root hidden invalid={!!errors.tenantSlug}>
                                            <Field.Label>Tenant Slug</Field.Label>
                                            <Input
                                                readOnly
                                                _placeholder={{ color: "gray.400" }}
                                                {...register("tenantSlug")}
                                                placeholder="e.g., greenfield"
                                                type="text"
                                                autoComplete="username"
                                            />
                                            <Field.ErrorText>{errors.tenantSlug?.message}</Field.ErrorText>
                                        </Field.Root>


                                        <Field.Root invalid={!!errors.email} required>
                                            <Field.Label textStyle="md">
                                                Email Address
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                {...register("email")}
                                                _placeholder={{ color: "gray.400" }}
                                                size="lg"
                                                rounded="lg"
                                                placeholder="Enter your Email Address"
                                                type="email"
                                                autoComplete="email"
                                            />
                                            <Field.ErrorText>{errors?.email?.message}</Field.ErrorText>
                                        </Field.Root>

                                        {/* phnone number */}
                                        <Field.Root invalid={!!errors.phone_number} required>
                                            <Field.Label textStyle="md">
                                                Phone number
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <InputGroup startAddon={<Span color="accent">+234</Span>}>
                                                <Input
                                                    {...register("phone_number")}
                                                    _placeholder={{ color: "gray.400" }}
                                                    size="lg"
                                                    rounded="lg"
                                                    maxLength={10}
                                                    placeholder="e.g 9087654372"
                                                    type="tel"
                                                    autoComplete="tel"
                                                />
                                            </InputGroup>
                                            <Field.ErrorText>{errors?.phone_number?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Button
                                            rounded="lg"
                                            type="submit"
                                            loading={isPending}
                                            loadingText="Sending..."
                                            colorPalette="accent"
                                            size="lg"
                                            w="full"
                                        >
                                            Request Recovery Password
                                        </Button>

                                        <HStack justify="center" w="full">
                                            <Link to="/login">
                                                <Span color="accent" fontWeight="semibold" textStyle="sm">Back to Sign In</Span>
                                            </Link>
                                        </HStack>
                                    </Stack>
                                </form>
                            </Stack>
                        </Box>
                    </Box>

                    {/* Hero Section */}
                    <Stack
                        gap="6"
                        h="fit"
                        flex={{ base: 1, md: 1 }}
                        textAlign={{ base: "center", md: "left" }}
                        order={{ base: 1, md: 2 }}
                        color="white"
                    >
                        <Image mx={{ base: "auto", md: "initial" }} src="/logo.png" h="12" w="fit" alt="SIWES Logo" />
                        <Heading
                            color="white"
                            size={{ base: "2xl", md: "3xl" }}
                            fontWeight="bold"
                        >
                            Recover Your Password
                        </Heading>
                        <Text
                            fontSize={{ base: "lg", md: "xl" }}
                            maxW="md"
                            opacity={0.9}
                        >
                            Recover access to your account securely and get back to managing your academic tasks.
                        </Text>
                    </Stack>
                </Flex>

                {/* home link */}
                <Link to="/">
                    <Button pos="absolute" top="10" right="10" rounded="lg" variant={"ghost"} color="white" _hover={{ bg: "whiteAlpha.200" }} size="xs">
                        Continue to home
                        <ArrowRight />
                    </Button>
                </Link>
            </Container>

            <Helmet>
                <title>{ENV.APP_NAME || import.meta.env.VITE_APP_NAME} | Forgot Password</title>
                <meta name="description" content="Reset your account password by requesting a reset link via email or phone." />
                <meta name="keywords" content="forgot password, reset password, recover account" />
            </Helmet>


            {/* confirm dialog */}
            <Dialog.Root role="alertdialog" open={open} onOpenChange={(d) => !d.open && onClose()}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content p="4">
                            <Dialog.Header>
                                <CheckCircle color="green" />
                                <Dialog.Title>Password Reset Instructions Sent</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Stack gap={3}>
                                    <Text>
                                        We've sent a temporary password to your email address. Please follow these steps:
                                    </Text>
                                    <Stack gap={2}>
                                        <HStack gap={2}>
                                            <Box color="green.500" fontSize="sm">1.</Box>
                                            <Text fontSize="sm">Check your email inbox for the temporary password</Text>
                                        </HStack>
                                        <HStack gap={2}>
                                            <Box color="green.500" fontSize="sm">2.</Box>
                                            <Text fontSize="sm">Use the temporary password to log into your account</Text>
                                        </HStack>
                                        <HStack gap={2}>
                                            <Box color="green.500" fontSize="sm">3.</Box>
                                            <Text fontSize="sm">Go to your profile settings to reset your password</Text>
                                        </HStack>
                                    </Stack>
                                    <Box mt={2} p={3} bg="orange.50" border="1px" borderColor="orange.200" rounded="md">
                                        <Text fontSize="sm" color="orange.700" fontWeight="medium">
                                            ⚠️ Important: This is a one-time password and will expire after use.
                                            You must reset your password immediately after logging in.
                                        </Text>
                                    </Box>
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button colorPalette="accent" size="sm" rounded="lg">Understood, I'll check my email</Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            <Toaster />
        </Box>
    );
};

export default ForgotPasswordPage;

export const ForgotPasswordLoader: React.FC = () => (
    <Box
        minH="100vh"
        bgImage="url(/hero.webp)"
        bgPos="center"
        bgSize="cover"
        bgAttachment="fixed"
        position="relative"
    >
        <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            gradientFrom={"accent/50"}
            gradientVia={"black"}
            gradientTo={"transparent"}
            bgGradient={"to-br"}
            zIndex={1}
        />
        <Container pos="relative" maxW="container.xl" h="vh" py={{ base: 8, md: 12 }} position="relative" zIndex={2}>
            <Flex
                direction={{ base: "column", md: "row" }}
                align="center"
                justify={{ base: "start", md: "space-between" }}
                gap={{ base: 8, md: 12 }}
                w="full"
            >
                <Box
                    order={{ base: 2, md: 1 }}
                    flex={{ base: 2, md: 0.6 }}
                    maxW={{ base: "full", md: "md" }}
                    w="full"
                    mx={{ base: "auto", md: "auto" }}
                >
                    <Box
                        backdropFilter="blur(5px)"
                        rounded="lg"
                        shadow="2xl"
                        border="xs"
                        borderColor={"accent.50/20"}
                        p={{ base: 4, md: 8 }}
                        color={"white"}
                    >
                        <Stack gap={6} align="stretch">
                            <Stack gap={2}>
                                <Box height="32px" width="200px" bg="whiteAlpha.200" rounded="md" />
                                <Box height="16px" width="250px" bg="whiteAlpha.200" rounded="md" />
                            </Stack>

                            <Stack gap={4}>
                                <Stack gap={2}>
                                    <Box height="16px" width="200px" bg="whiteAlpha.200" rounded="md" />
                                    <Box height="48px" width="100%" bg="whiteAlpha.200" rounded="lg" />
                                    <Box height="16px" width="80%" bg="whiteAlpha.200" rounded="md" />
                                </Stack>
                                <Box height="48px" width="100%" bg="whiteAlpha.200" rounded="lg" />
                            </Stack>
                        </Stack>
                    </Box>
                </Box>

                <Stack
                    gap="6"
                    h="fit"
                    flex={{ base: 1, md: 1 }}
                    textAlign={{ base: "center", md: "left" }}
                    order={{ base: 1, md: 2 }}
                    color="white"
                >
                    <Box height="48px" width="48px" bg="whiteAlpha.200" rounded="full" mx={{ base: "auto", md: "initial" }} />
                    <Box height="64px" width="300px" bg="whiteAlpha.200" rounded="md" />
                    <Box height="32px" width="200px" bg="whiteAlpha.200" rounded="md" />
                </Stack>
            </Flex>
        </Container>
    </Box>
);

