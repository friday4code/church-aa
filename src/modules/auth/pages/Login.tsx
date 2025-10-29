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
    IconButton,
    HStack,
    Button,
    Text,
    InputGroup,
    Span,
    Flex,
    Image,
    Container,
    Switch
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Toaster, toaster } from "@/components/ui/toaster";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "@/store/auth.store";
import { delay } from "@/utils/helpers";
import { ENV } from "@/config/env";
import { ArrowRight, Eye, EyeSlash } from "iconsax-reactjs";

const loginSchema = z.object({
    email: z.email("Invalid email address").min(1, "Email is required"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.any()
});

export type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { setAuth, isAdmin, isUser } = useAuthStore();
    const navigate = useNavigate();

    // clear all queued toasts
    useEffect(() => {
        return () => {
            toaster.remove();
        }
    }, []);

    const getRedirectPath = () => {

        if (isUser()) {
            return "/user/dashboard";
        }
        if (isAdmin()) {
            return "/admin/dashboard";
        }

        // Default fallback
        return "/dashboard";
    };

    // const mutation = useMutation({
    //     mutationFn: authApi.login,
    //     onSuccess: async (response) => {
    //         // Handle successful login, e.g., redirect or store token
    //         console.log("Login successful:");
    //         console.log(response);

    //         // save data
    //         setAuth(response);

    //         toaster.success({
    //             description: "Login successful!",
    //         });

    //         await delay(1000);

    //         // Get the appropriate redirect path based on user roles
    //         const redirectPath = getRedirectPath();
    //         navigate(redirectPath);
    //     }
    // });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = (data: LoginFormData) => {
        // mutation.mutate(data);
        console.log(data);
        
    };

    const clearPasswordError = () => {
        if (errors.password) {
            setError("password", { type: undefined, message: undefined });
        }
    };

    return (
        <Box
            minH="100vh"
            bgImage="url(/auth-bg.png)"
            bgPos="center"
            bgSize="cover"
            bgAttachment="fixed"
            position="relative"
        >
            <Container pos="relative" maxW="md" h="vh" py={{ base: 8, md: 12 }} position="relative" zIndex={2}>

                {/* Form Section */}
                <Box
                    backdropFilter="blur(40px)"
                    rounded="xl"
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
                                {ENV.APP_NAME}
                            </Heading>
                            <Text textAlign="center">
                                Please enter your credentials to continue
                            </Text>
                        </Stack>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Stack gap={6} colorPalette="white">
                                <Field.Root invalid={!!errors.email}>
                                    <Field.Label>
                                        Email <Field.RequiredIndicator />
                                    </Field.Label>
                                    <Input
                                        _placeholder={{ color: "gray.400" }}
                                        {...register("email")}
                                        rounded="lg"
                                        size="lg"
                                        placeholder="student3@gf.edu.ng"
                                        type="email"
                                        autoComplete="email"
                                    />
                                    <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                                </Field.Root>

                                <Field.Root invalid={!!errors.password}>
                                    <HStack justify="space-between" w="full">
                                        <Field.Label>
                                            Password <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Link to="/forgot-password">
                                            <Span color="accent" fontWeight="semibold" textStyle="sm">Forgot Password?</Span>
                                        </Link>
                                    </HStack>
                                    <InputGroup
                                        endElement={
                                            <IconButton
                                                size="xs"
                                                variant="ghost"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label="Show password"
                                            >
                                                {showPassword ? <EyeSlash /> : <Eye />}
                                            </IconButton>
                                        }
                                    >
                                        <Input
                                            _placeholder={{ color: "gray.400" }}
                                            {...register("password")}
                                            onChange={clearPasswordError}
                                            name="password"
                                            rounded="lg"
                                            size="lg"
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            type={showPassword ? "text" : "password"}
                                        />
                                    </InputGroup>
                                    <Field.ErrorText>
                                        {errors.password?.message}
                                    </Field.ErrorText>
                                </Field.Root>

                                <Switch.Root>
                                    <Switch.HiddenInput {...register("rememberMe")} />
                                    <Switch.Control />
                                    <Switch.Label>Remember me</Switch.Label>
                                </Switch.Root>

                                <Button rounded="lg"
                                    type="submit"
                                    loading={isSubmitting}
                                    loadingText="Signing In"
                                    colorPalette=""
                                    size="lg"
                                    w="full"
                                >
                                    Sign In
                                </Button>
                            </Stack>
                        </form>
                    </Stack>
                </Box>
            </Container>

            <Toaster />
        </Box >
    );
};

export default Login;