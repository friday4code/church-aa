import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, CheckCircle, Eye, EyeOff } from "lucide-react";
import {
    Box,
    Stack,
    Heading,
    Field,
    Input,
    IconButton,
    Button,
    Text,
    InputGroup,
    Span,
    Flex,
    Image,
    Container,
    Grid,
    ScrollArea,
    Dialog,
    CloseButton,
    HStack,
    Portal,
    useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Toaster, toaster } from "@/components/ui/toaster";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { ENV } from "@/config/env";
import { Link } from "react-router";

const registerSchema = z
    .object({
        tenantSlug: z.string().min(1, "Tenant slug is required"),
        username: z.string().min(1, "Username is required"),
        firstName: z.string().min(1, "First name is required"),
        middleName: z.string().optional(),
        lastName: z.string().min(1, "Last name is required"),
        role: z.string().min(1, "Role is required"),
        email: z.email("Invalid email address").min(1, "Email is required"),
        phoneNumber: z
            .string()
            .regex(/^\+?[\d\s-()]{10,}$/, "Invalid phone number")
            .min(1, "Phone number is required"),
        password: z.string()
            .min(6, "Password must be at least 6 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
        confirmPassword: z.string().min(1, "Confirm password is required"),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // clear all queued toasts
    useEffect(() => {
        return () => {
            toaster.remove();
        }
    }, []);

    const { setAuth } = useAuthStore();
    const { open, onClose, onOpen } = useDisclosure();

    const mutation = useMutation({
        mutationFn: authApi.register,
        onSuccess: async (response) => {
            console.log("Registration successful");

            // save data
            setAuth(response);

            // Handle successful registration, e.g., redirect or store token
            toaster.success({
                description: "Registration successful! You can now login.",
            });

            onOpen();
        }
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            tenantSlug: ENV.TENANT_SLUG
        }
    });

    const onSubmit = (data: RegisterFormData) => {
        console.log(data);
        const reformedData = {
            first_name: data.firstName,
            last_name: data.lastName,
            middle_name: data.middleName,
            email: data.email,
            tenantSlug: data.tenantSlug,
            phone_number: "+234" + data.phoneNumber,
            role: data.role,
            password: data.password,
            metadata: {
                middle_name: data.middleName,
                user_name: data.username
            }
        } as Record<string, string | Record<string, string>>

        mutation.mutate(reformedData);

    };

    const clearPasswordError = () => {
        if (errors.password) {
            setError("password", { type: undefined, message: undefined });
        }
    };

    const clearConfirmPasswordError = () => {
        if (errors.confirmPassword) {
            setError("confirmPassword", { type: undefined, message: undefined });
        }
    };

    return (
        <Box
            bgImg={"url(/hero.webp)"}
            bgPos="center"
            bgSize="cover"
            bgAttachment="fixed"
            position="relative"
            overflow={"hidden"}
            h={{ base: "full", md: "vh" }}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
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
            <Container
                pos="relative"
                maxW="container.xl"
                py={{ base: 8, md: 12 }} position="relative" zIndex={2}>
                <Flex
                    direction={{ base: "column", md: "row" }}
                    align="center"
                    justify={{ base: "start", md: "space-between" }}
                    gap={{ base: 8, md: 12 }}
                    w="full"
                    h={{
                        base: "fit", md: "vh"
                    }}
                >

                    <ScrollArea.Root
                        h={"80vh"}
                        backdropFilter="blur(10px)"
                        rounded="lg"
                        shadow="2xl"
                        border="xs"
                        borderColor={"accent.50/20"}
                        maxW={{ base: "full", md: "xl" }}
                        w="full">
                        <ScrollArea.Viewport>
                            <ScrollArea.Content>
                                {/* Form Section */}
                                < Box
                                    order={{ base: 2, md: 1 }}
                                    flex={{ base: 2, md: 0.6 }}
                                    mx={{ base: "auto", md: "auto" }}
                                    overflow={"auto"}
                                >
                                    <Box
                                        p={{ base: 4, md: 8 }}
                                        color={"white"}
                                    >
                                        <Stack gap={6} align="stretch">
                                            <Stack gap={2}>
                                                <Heading size="lg" textAlign="center" color={"accent"}>
                                                    Sign Up
                                                </Heading>
                                                <Text textAlign="center">
                                                    Create your account to get started
                                                </Text>
                                            </Stack>

                                            {/* Form */}
                                            <form onSubmit={handleSubmit(onSubmit)}>
                                                <Stack gap={4} colorPalette="accent"
                                                    css={{
                                                        "& input:-webkit-autofill": {
                                                            WebkitBoxShadow: "0 0 0px 1000px transparent inset !important",
                                                            WebkitTextFillColor: "white !important",
                                                            transition: "background-color 9999s ease-in-out 0s !important",
                                                        },
                                                    }}
                                                >
                                                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                                        {/* hidden fields */}
                                                        <Input hidden
                                                            {...register("role")}
                                                            value={"applicant"} required readOnly />
                                                        <Input hidden
                                                            {...register("tenantSlug")}
                                                            required readOnly />

                                                        <Field.Root invalid={!!errors.username}>
                                                            <Field.Label>
                                                                Username <Field.RequiredIndicator />
                                                            </Field.Label>
                                                            <Input
                                                                _placeholder={{ color: "whiteAlpha.500" }}
                                                                {...register("username")}
                                                                placeholder="Enter your username"
                                                                type="text"
                                                                color="white"
                                                                autoComplete="username"
                                                            />
                                                            <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
                                                        </Field.Root>

                                                        <Field.Root invalid={!!errors.middleName}>
                                                            <Field.Label>Middle Name</Field.Label>
                                                            <Input
                                                                _placeholder={{ color: "whiteAlpha.500" }}
                                                                {...register("middleName")}
                                                                placeholder="Enter your middle name (optional)"
                                                                type="text"
                                                                autoComplete="additional-name"
                                                            />
                                                            <Field.ErrorText>{errors.middleName?.message}</Field.ErrorText>
                                                        </Field.Root>

                                                        <Field.Root invalid={!!errors.firstName}>
                                                            <Field.Label>
                                                                First Name <Field.RequiredIndicator />
                                                            </Field.Label>
                                                            <Input
                                                                _placeholder={{ color: "whiteAlpha.500" }}
                                                                {...register("firstName")}
                                                                placeholder="Enter your first name"
                                                                type="text"
                                                                autoComplete="given-name"
                                                            />
                                                            <Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
                                                        </Field.Root>

                                                        <Field.Root invalid={!!errors.lastName}>
                                                            <Field.Label>
                                                                Last Name <Field.RequiredIndicator />
                                                            </Field.Label>
                                                            <Input
                                                                _placeholder={{ color: "whiteAlpha.500" }}
                                                                {...register("lastName")}
                                                                placeholder="Enter your last name"
                                                                type="text"
                                                                autoComplete="family-name"
                                                            />
                                                            <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
                                                        </Field.Root>

                                                        <Field.Root invalid={!!errors.email}>
                                                            <Field.Label>
                                                                Email <Field.RequiredIndicator />
                                                            </Field.Label>
                                                            <Input
                                                                _placeholder={{ color: "whiteAlpha.500" }}
                                                                {...register("email")}
                                                                placeholder="Enter your email"
                                                                type="email"
                                                                autoComplete="email"
                                                            />
                                                            <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                                                        </Field.Root>


                                                        {/* phnone number */}
                                                        <Field.Root invalid={!!errors.phoneNumber} required>
                                                            <Field.Label textStyle="md">
                                                                Phone number
                                                                <Field.RequiredIndicator />
                                                            </Field.Label>
                                                            <InputGroup startAddon={<Span color="accent">+234</Span>}>
                                                                <Input
                                                                    {...register("phoneNumber")}
                                                                    _placeholder={{ color: "whiteAlpha.500" }}
                                                                    size="lg"
                                                                    rounded="lg"
                                                                    maxLength={10}
                                                                    placeholder="e.g 9087654372"
                                                                    type="tel"
                                                                    autoComplete="tel"
                                                                />
                                                            </InputGroup>
                                                            <Field.ErrorText>{errors?.phoneNumber?.message}</Field.ErrorText>
                                                        </Field.Root>
                                                    </Grid>

                                                    <Field.Root invalid={!!errors.password}>
                                                        <Field.Label>
                                                            Password <Field.RequiredIndicator />
                                                        </Field.Label>
                                                        <InputGroup
                                                            endElement={
                                                                <IconButton
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    aria-label="Show password"
                                                                >
                                                                    {showPassword ? <EyeOff /> : <Eye />}
                                                                </IconButton>
                                                            }
                                                        >
                                                            <Input
                                                                _placeholder={{ color: "whiteAlpha.500" }}
                                                                {...register("password")}
                                                                onChange={clearPasswordError}
                                                                name="password"
                                                                autoComplete="new-password"
                                                                placeholder="Enter your password"
                                                                type={showPassword ? "text" : "password"}
                                                            />
                                                        </InputGroup>
                                                        <Field.ErrorText>
                                                            {errors.password?.message}
                                                        </Field.ErrorText>
                                                    </Field.Root>

                                                    <Field.Root invalid={!!errors.confirmPassword}>
                                                        <Field.Label>
                                                            Confirm Password <Field.RequiredIndicator />
                                                        </Field.Label>
                                                        <InputGroup
                                                            endElement={
                                                                <IconButton
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    aria-label="Show confirm password"
                                                                >
                                                                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                                                                </IconButton>
                                                            }
                                                        >
                                                            <Input
                                                                _placeholder={{ color: "whiteAlpha.500" }}
                                                                {...register("confirmPassword")}
                                                                onChange={clearConfirmPasswordError}
                                                                name="confirmPassword"
                                                                autoComplete="new-password"
                                                                placeholder="Confirm your password"
                                                                type={showConfirmPassword ? "text" : "password"}
                                                            />
                                                        </InputGroup>
                                                        <Field.ErrorText>
                                                            {errors.confirmPassword?.message}
                                                        </Field.ErrorText>
                                                    </Field.Root>

                                                    <Button rounded="lg"
                                                        type="submit"
                                                        loading={isSubmitting || mutation.isPending}
                                                        loadingText="Signing Up"
                                                        colorPalette="accent"
                                                        size="lg"
                                                        w="full"
                                                    >
                                                        Sign Up
                                                    </Button>

                                                    <Text textAlign="center" mt={4} color="whiteAlpha.700">
                                                        Already have an account?{" "}
                                                        <Link to="/login">
                                                            <Span color="accent.300" fontWeight="medium">Sign in</Span>
                                                        </Link>
                                                    </Text>
                                                </Stack>
                                            </form>
                                        </Stack>
                                    </Box>
                                </Box>
                            </ScrollArea.Content>
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar>
                            <ScrollArea.Thumb bg="whiteAlpha.600" />
                        </ScrollArea.Scrollbar>
                        <ScrollArea.Corner />
                    </ScrollArea.Root>



                    {/* Hero Section */}
                    <Stack
                        gap="6"
                        h="fit"
                        flex={{ base: 1, md: 1 }}
                        textAlign={{ base: "center", md: "left" }}
                        order={{ base: 1, md: 1 }}
                        color="white"
                    >
                        <Image mx={{ base: "auto", md: "initial" }} src="/logo.png" h="12" w="fit" alt="LMS LOGO" />
                        <Heading
                            color="white"
                            size={{ base: "2xl", md: "3xl" }}
                            fontWeight="bold"
                        >
                            Join <Span color="accent">{ENV.APP_NAME}</Span>
                        </Heading>
                        <Text
                            fontSize={{ base: "lg", md: "xl" }}
                            maxW="md"
                            opacity={0.9}
                        >
                            Create your account to access personalized learning, track progress, and connect with your academic community.
                        </Text>

                    </Stack>
                </Flex >


                {/* home link */}
                <Link to="/">
                    <Button pos="absolute" top="20" right="10" rounded="lg" variant={"ghost"} color="white" _hover={{ bg: "whiteAlpha.200" }} size="xs">
                        Continue to home
                        <ArrowRight />
                    </Button>
                </Link>

            </Container >



            {/* Email Verification Dialog */}
            <Dialog.Root role="alertdialog" open={open} onOpenChange={(d) => !d.open && onClose()}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content p="4">
                            <Dialog.Header>
                                <CheckCircle color="green" />
                                <Dialog.Title>Verify Your Email Address</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Stack gap={3}>
                                    <Text>
                                        We've sent a verification link to your email address. Please verify your email to complete your registration.
                                    </Text>
                                    <Stack gap={2}>
                                        <HStack gap={2}>
                                            <Box color="green.500" fontSize="sm">1.</Box>
                                            <Text fontSize="sm">Check your email inbox for the verification link</Text>
                                        </HStack>
                                        <HStack gap={2}>
                                            <Box color="green.500" fontSize="sm">2.</Box>
                                            <Text fontSize="sm">Click on the verification link in the email</Text>
                                        </HStack>
                                        <HStack gap={2}>
                                            <Box color="green.500" fontSize="sm">3.</Box>
                                            <Text fontSize="sm">Your account will be activated immediately</Text>
                                        </HStack>
                                    </Stack>
                                    <Box mt={2} p={3} bg="blue.50" border="1px" borderColor="blue.200" rounded="md">
                                        <Text fontSize="sm" color="blue.700" fontWeight="medium">
                                            📧 Can't find the email? Check your spam folder or request a new verification link.
                                        </Text>
                                    </Box>
                                    <Box mt={1} p={3} bg="orange.50" border="1px" borderColor="orange.200" rounded="md">
                                        <Text fontSize="sm" color="orange.700" fontWeight="medium">
                                            ⚠️ Important: You must verify your email before you can log in to your account.
                                        </Text>
                                    </Box>
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button colorPalette="accent" size="sm" rounded="lg">
                                        Got it, I'll check my email
                                    </Button>
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
        </Box >
    );
};

export default Register;