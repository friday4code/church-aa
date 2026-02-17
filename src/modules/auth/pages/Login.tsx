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
    Image,
    Container,
    ScrollArea
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Toaster, toaster } from "@/components/ui/toaster";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { delay } from "@/utils/helpers";
import { ENV } from "@/config/env";
import { Eye, EyeSlash, Lock, Sms } from "iconsax-reactjs";
import { authApi } from "@/api/auth.api";


const loginSchema = z.object({
    // email: z.email("Invalid email address").min(1, "Email is required"),
    email: z.string("Invalid email address").min(1, "Email is required"),
    password: z.string().min(5, "Password must be at least 5 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { setAuth } = useAuth();
    const navigate = useNavigate();

    // clear all queued toasts
    useEffect(() => {
        return () => {
            toaster.remove();
        }
    }, []);

    // const getRedirectPath = (userRoles: string[] = []) => {
    //     // Check if user has any admin roles
    //     const hasAdminRole = userRoles.includes('admin') ||
    //         userRoles.includes('Super Admin') ||
    //         userRoles.includes('State Admin') ||
    //         userRoles.includes('Region Admin') ||
    //         userRoles.includes('District Admin') ||
    //         userRoles.includes('Group Admin');

    //     if (hasAdminRole) {
    //         return "/admin/dashboard";
    //     }

    //     // If no admin role, redirect to user dashboard
    //     return "/admin/dashboard";
    // };

    // Update the getRedirectPath function to handle both string[] and Role[]
const getRedirectPath = (userRoles: any[] = []) => {
    // Convert roles to strings if they're objects
    const roleStrings = userRoles.map(role => {
        if (typeof role === 'object' && role !== null && 'name' in role) {
            return role.name;
        }
        return String(role);
    });
    
    // Check if user has any admin roles
    const hasAdminRole = roleStrings.some(role => 
        role === 'admin' ||
        role === 'Super Admin' ||
        role === 'State Admin' ||
        role === 'Region Admin' ||
        role === 'District Admin' ||
        role === 'Group Admin'
    );

    if (hasAdminRole) {
        return "/admin/dashboard";
    }

    // If no admin role, redirect to user dashboard
    return "/admin/dashboard";
};

    const mutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: async (response) => {
            // Handle successful login, e.g., redirect or store token
            console.log("Login successful:");

            // save data
            // console.log("user", response);

            setAuth({ user: response.user, tokens: { refresh_token: response.refresh_token, access_token: response.access_token } });

            if (response.user && response.access_token && response.refresh_token) {
                toaster.success({
                    description: "Login successful!",
                });
            } else {
                toaster.error({
                    title: "Login failed!",
                    description: "Invalid response from server"
                });
                return;
            }

            await delay(1000);


            // Get the appropriate redirect path based on user roles from the response
            const redirectPath = getRedirectPath(response.user?.roles || []);
            navigate(redirectPath);
        }
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = (data: LoginFormData) => {
        mutation.mutate(data);
        // console.log(data);

    };

    return (
        <ScrollArea.Root height="vh">
            <ScrollArea.Viewport>
                <ScrollArea.Content h="full">
                    <Box
                        bgImage="url(/auth-bg.png)"
                        bgPos="center"
                        bgSize="cover"
                        bgAttachment="fixed"
                        position="relative"
                    >
                        <Container maxW="md" h="vh" py={{ base: 8, md: 12 }} zIndex={2}>
                            {/* Logo - centered on mobile, positioned on desktop */}
                            <Box
                                display={{ base: "block", md: "none" }}
                                textAlign="center"
                                mb={6}
                            >
                                <Image
                                    src="/logo.png"
                                    h="16"
                                    mx="auto"
                                />
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
                                            {ENV.APP_NAME}
                                        </Heading>
                                        <Text textAlign="center">
                                            Please enter your credentials to continue
                                        </Text>
                                    </Stack>

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
                                                        placeholder="admin@dclm.com"
                                                        type="text"
                                                        autoComplete="email"
                                                    />
                                                </InputGroup>
                                                <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                                            </Field.Root>

                                            <Field.Root invalid={!!errors.password}>
                                                <HStack justify="space-between" w="full">
                                                    <Field.Label>
                                                        Password <Field.RequiredIndicator />
                                                    </Field.Label>
                                                    <Link to="/forgot-password">
                                                        <Span color="accent.300" fontWeight="semibold" textStyle="sm">Forgot Password?</Span>
                                                    </Link>
                                                </HStack>
                                                <InputGroup
                                                    startElement={
                                                        <Lock variant="Bulk" color="white" />
                                                    }
                                                    endElement={
                                                        <IconButton
                                                            size="xs"
                                                            variant="solid"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            aria-label="Show password"
                                                        >
                                                            {showPassword ? <EyeSlash variant="Bulk" color="white" /> : <Eye variant="Bulk" color="white" />}
                                                        </IconButton>
                                                    }
                                                >
                                                    <Input
                                                        _placeholder={{ color: "gray.400" }}
                                                        {...register("password")}
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

                                            <Button rounded="lg"
                                                type="submit"
                                                loading={isSubmitting || mutation.isPending}
                                                loadingText="Signing In"
                                                bg="white"
                                                _hover={{ bg: "whiteAlpha.800" }}
                                                color="accent"
                                                size="lg"
                                                fontWeight={"bold"}
                                                w="full"
                                            >
                                                Sign In
                                            </Button>
                                        </Stack>
                                    </form>
                                </Stack>
                            </Box>
                        </Container>

                        <Image
                            src="/logo.png"
                            h="20"
                            mx="auto"
                            pos="absolute"
                            right="6"
                            bottom='6'
                            mt="8"
                            display={{ base: "none", md: "block" }}
                        />

                        <Toaster />
                    </Box>
                </ScrollArea.Content>

            </ScrollArea.Viewport >
            <ScrollArea.Scrollbar>
                <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner />
        </ScrollArea.Root >
    );
};


export default Login;