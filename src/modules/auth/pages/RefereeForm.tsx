import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import {
    Box,
    Stack,
    Heading,
    Field, Button,
    Flex,
    Image,
    Container,
    Grid,
    ScrollArea,
    AbsoluteCenter,
    Textarea,
    Stat
} from "@chakra-ui/react";
import { useEffect } from "react";
import { Toaster, toaster } from "@/components/ui/toaster";
import { Link, useSearchParams } from "react-router";
import { authApi } from "@/api/auth.api";
import { delay } from "@/utils/helpers";
import { ENV } from "@/config/env";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/feedback/ErrorFallback";
import { applicantApi } from "@/api/applicant.api";

const refereeFormSchema = z
    .object({
        years_known: z.string().min(10, "This field is required"),
        academic_remark: z.string().min(10, "Academic remark is required"),
        expression_remark: z.string().min(10, "Expression remark is required"),
        language_proficiency: z.string().min(5, "Language proficiency is required"),
    });

export type RefereeFormData = z.infer<typeof refereeFormSchema>;


const RefereeForm: React.FC = () => {
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
            <Content />
        </ErrorBoundary>
    );
};


const Content = () => {
    const [sp] = useSearchParams();
    // const id = sp.get("id") as string;
    const hasTenantId = sp.has("tenant_id");
    const hasUserId = sp.has("user_id");

    // clear all queued toasts
    useEffect(() => {
        return () => {
            toaster.remove();
        }
    }, []);

    const { mutate, isPending } = useMutation({
        mutationFn: applicantApi.sendRefereeReport,
        onSuccess(data) {

        }
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<RefereeFormData>({
        resolver: zodResolver(refereeFormSchema),
    });

    const onSubmit = (data: RefereeFormData) => {
        console.log(data);

        const payload = {
            meta: data
        };
        reset();

        mutate(payload);
    };

    if (!hasTenantId || !hasUserId) throw new Error("No Tenant or  User id found!");

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
                    gap={{ base: 8, md: 4 }}
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
                        maxW={{ base: "full", md: "70%" }}
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
                                            <Heading size="3xl" fontWeight={"black"} color="white">REFEREE'S FORM</Heading>
                                            <Heading size="sm" fontWeight={"black"} color="gray.50">Referee's Report on Candidates Seeking Admission</Heading>

                                            {/* Form */}
                                            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                                                <Stack gap={4} colorPalette="accent"
                                                    css={{
                                                        "& input:-webkit-autofill": {
                                                            WebkitBoxShadow: "0 0 0px 1000px transparent inset !important",
                                                            WebkitTextFillColor: "white !important",
                                                            transition: "background-color 9999s ease-in-out 0s !important",
                                                        },
                                                    }}
                                                >
                                                    <Grid alignContent={"end"} templateColumns="repeat(2, 1fr)" gap={8}>

                                                        <Field.Root alignSelf={"end"} required invalid={!!errors.years_known}>
                                                            <Field.Label>How long and in what capacity have you known the candidate?
                                                                <Field.RequiredIndicator />
                                                            </Field.Label>
                                                            <Textarea
                                                                rounded="lg"
                                                                h="40"
                                                                placeholder="write here..."
                                                                {...register("years_known")}
                                                            />
                                                            <Field.ErrorText>{errors.years_known?.message}</Field.ErrorText>
                                                        </Field.Root>

                                                        <Field.Root required invalid={!!errors.academic_remark}>
                                                            <Field.Label>
                                                                Comment on the candidate's academic ability with special reference to intelligence, Judgment, imaginative thought and capacity to sustained work at graduate level
                                                                <Field.RequiredIndicator />
                                                            </Field.Label>
                                                            <Textarea
                                                                rounded="lg"
                                                                h="40"
                                                                placeholder="write here..."
                                                                {...register("academic_remark")}
                                                            />
                                                            <Field.ErrorText>{errors.academic_remark?.message}</Field.ErrorText>
                                                        </Field.Root>


                                                        <Field.Root required invalid={!!errors.expression_remark}>
                                                            <Field.Label>
                                                                Do you consider the candidate's ability for oral and written expression in English adequate for high-level work in an English speaking university in a graduate programme?
                                                                <Field.RequiredIndicator />
                                                            </Field.Label>
                                                            <Textarea
                                                                rounded="lg"
                                                                h="40"
                                                                placeholder="write here..."
                                                                {...register("expression_remark")}
                                                            />
                                                            <Field.ErrorText>{errors.expression_remark?.message}</Field.ErrorText>
                                                        </Field.Root>


                                                        <Field.Root alignSelf={"end"} required invalid={!!errors.language_proficiency}>
                                                            <Field.Label>
                                                                Comment on the candidate's proficiency in other languages                                                                <Field.RequiredIndicator />
                                                            </Field.Label>
                                                            <Textarea
                                                                rounded="lg"
                                                                h="40"
                                                                placeholder="write here..."
                                                                {...register("language_proficiency")}
                                                            />
                                                            <Field.ErrorText>{errors.language_proficiency?.message}</Field.ErrorText>
                                                        </Field.Root>


                                                    </Grid>

                                                    <Button rounded="lg"
                                                        type="submit"
                                                        loading={isSubmitting || isPending}
                                                        loadingText="Submitting"
                                                        colorPalette="accent"
                                                        size="lg"
                                                        w="fit"
                                                    >
                                                        Submit report
                                                    </Button>

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
                        w="30%"
                        bg="white"
                        gap="6"
                        rounded="lg"
                        h="fit"
                        flex={{ base: 1, md: 1 }}
                        textAlign={{ base: "center", md: "left" }}
                        order={{ base: 1, md: 1 }}
                        color="white"
                        p="4"
                    >
                        <Image mx={{ base: "auto", md: "initial" }} src="/logo.png" h="12" w="fit" alt="LMS LOGO" />


                        <Stack gap={0}>
                            {/* Candidate's Details */}
                            <Box p={4} border="1px" borderColor="gray.200" rounded="lg">
                                <Heading size="md" mb={3}>Candidate's Details</Heading>
                                <Stack columns={{ base: 1, md: 3 }} gap={3}>
                                    <Stat.Root size="sm">
                                        <Stat.Label fontSize="sm">Name of Candidate</Stat.Label>
                                        <Stat.ValueText fontSize={"xs"} color="black">John Doe</Stat.ValueText>
                                    </Stat.Root>
                                    <Stat.Root size="sm">
                                        <Stat.Label fontSize="sm">Programme</Stat.Label>
                                        <Stat.ValueText fontSize={"xs"} color="black">Computer Science</Stat.ValueText>
                                    </Stat.Root>
                                    <Stat.Root size="sm">
                                        <Stat.Label fontSize="sm">Application No</Stat.Label>
                                        <Stat.ValueText fontSize={"xs"} color="black">APP-2024-00123</Stat.ValueText>
                                    </Stat.Root>
                                </Stack>
                            </Box>

                            {/* Referee's Details */}
                            <Box p={4} border="1px" borderColor="gray.200" rounded="lg">
                                <Heading size="md" mb={3}>Referee's Details</Heading>
                                <Stack gap={3}>
                                    <Stat.Root size="sm">
                                        <Stat.Label fontSize="sm">Name of Referee</Stat.Label>
                                        <Stat.ValueText fontSize={"xs"} color="black">Dr. Sarah Johnson</Stat.ValueText>
                                    </Stat.Root>
                                    <Stat.Root size="sm">
                                        <Stat.Label fontSize="sm">Email</Stat.Label>
                                        <Stat.ValueText fontSize={"xs"} color="black">s.johnson@university.edu</Stat.ValueText>
                                    </Stat.Root>
                                    <Stat.Root size="sm">
                                        <Stat.Label fontSize="sm">Phone Number</Stat.Label>
                                        <Stat.ValueText fontSize={"xs"} color="black">+1 (555) 123-4567</Stat.ValueText>
                                    </Stat.Root>
                                </Stack>
                            </Box>
                        </Stack>

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

            <Toaster />
        </Box >
    );
};

export default RefereeForm;
