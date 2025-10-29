import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
    globalCss: {
        body: {
            backgroundColor: "{colors.bg.subtle}",
            color: "{colors.gray.800}",
            _dark: {
                backgroundColor: "{colors.bg.subtle}",
                color: "{colors.white}",
            },
        },
        "h1,h2,h3,h4,h5,h6": {
            color: "{colors.gray.700}",
            _dark: {
                color: "{colors.white}",
            },
        },
        "p": {
            color: "{colors.gray.700}",
            _dark: {
                color: "{colors.gray.300}",
            },
        },

        ".swiper-pagination-bullet": {
            backgroundColor: "{colors.accent.500}",
            opacity: 0.5,
        },

        ".swiper-pagination-bullet-active": {
            backgroundColor: "{colors.accent.500}",
            opacity: 1,
        },

        ".no-transition *": {
            transitionDuration: "unset"
        }
    },
    theme: {
        tokens: {
            colors: {
                accent: {
                    DEFAULT: {
                        value: "#16365E", // main brand accent
                    },
                    50: {
                        value: "#EDF2F7", // very light tint
                    },
                    100: {
                        value: "#E1EAF5",
                    },
                    200: {
                        value: "#C5D6EB",
                    },
                    300: {
                        value: "#9BB8DB",
                    },
                    400: {
                        value: "#5D8BC4",
                    },
                    500: {
                        value: "#16365E", // base blue/dark blue
                    },
                    600: {
                        value: "#132F53",
                    },
                    700: {
                        value: "#102847",
                    },
                    800: {
                        value: "#0D213A",
                    },
                    900: {
                        value: "#0A1A2E",
                    },
                },
            },
            fonts: {
                heading: { value: "Montserrat, sans-serif" },
                body: { value: "Montserrat, sans-serif" },
            },
        },
        semanticTokens: {
            colors: {
                accent: {
                    solid: {
                        value: "{colors.accent.600}", // main solid color for buttons, etc.
                    },
                    muted: {
                        value: "{colors.accent.400}", // lighter for hover or subtle accents
                    },
                    subtle: {
                        value: "{colors.accent.100}", // for light backgrounds
                    },
                    contrast: {
                        value: "{colors.accent.50}", // strong contrast areas
                    },
                    fg: {
                        value: "{colors.accent.700}", // text accent color
                    },
                    emphasized: {
                        value: "{colors.accent.800}", // stronger emphasis (headings, etc.)
                    },
                    focusRing: {
                        value: "{colors.accent.500}", // focus outlines, inputs, etc.
                    },
                },
                border: {
                    default: {
                        value: {
                            base: "{colors.gray.200}",
                            _dark: "{colors.gray.200}",
                        },
                    },
                },
            },
        }
    },
});

export default createSystem(defaultConfig, config)