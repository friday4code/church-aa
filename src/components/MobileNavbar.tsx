import React from "react"
import { Box, HStack, IconButton, Image, Avatar, Flex } from "@chakra-ui/react"
import { HamburgerMenu } from "iconsax-reactjs"
import { ENV } from "@/config/env"
import { NavLink } from "react-router"
import { ColorModeButton } from "@/components/ui/color-mode"
import { useAuth } from "@/hooks/useAuth"

interface MobileNavbarProps {
  onMenuClick: () => void
  height?: number | string
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ onMenuClick, height = 16 }) => {
  const { user } = useAuth()

  return (
    <Box
      as="nav"
      pos="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={3}
      bg="bg"
      _dark={{ bg: "gray.800" }}
      borderBottomWidth="1px"
      borderColor="border"
      h={height}
    >
      <Flex h="full" px="4" justify="space-between" align="center">
        {/* Left side: Hamburger menu */}
        <IconButton
          aria-label="Open navigation menu"
          rounded="xl"
          variant="ghost"
          onClick={onMenuClick}
        >
          <HamburgerMenu />
        </IconButton>

        {/* Center: Logo */}
        <Box position="absolute" left="50%" transform="translateX(-50%)">
          <NavLink to="/" aria-label={`${ENV.APP_NAME} home`}>
            <Image
              src="/logo.png"
              alt={`${ENV.APP_NAME} Logo`}
              h={{ base: 6, sm: 7 }}
              objectFit="contain"
            />
          </NavLink>
        </Box>

        {/* Right side: Theme toggler and Profile avatar */}
        <HStack gap="2">
          <ColorModeButton aria-label="Toggle color mode" size="md" rounded="xl" />
          <NavLink to="/admin/profile" aria-label="Profile">
            <Avatar.Root size="sm">
              <Avatar.Fallback name={user?.name} />
              <Avatar.Image src={undefined} />
            </Avatar.Root>
          </NavLink>
        </HStack>
      </Flex>
    </Box>
  )
}

export default MobileNavbar

