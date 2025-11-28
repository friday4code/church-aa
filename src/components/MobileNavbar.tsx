import React from "react"
import { Box, HStack, IconButton, Image } from "@chakra-ui/react"
import { SidebarRight } from "iconsax-reactjs"
import { ENV } from "@/config/env"
import { NavLink } from "react-router"

interface MobileNavbarProps {
  onMenuClick: () => void
  height?: number | string
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ onMenuClick, height = 16 }) => {
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
      <HStack h="full" px="4" justify="space-between" align="center">
        <NavLink to="/" aria-label={`${ENV.APP_NAME} home`}>
          <Image
            src="/logo.png"
            alt={`${ENV.APP_NAME} Logo`}
            h={{ base: 6, sm: 7 }}
            objectFit="contain"
          />
        </NavLink>
        <IconButton
          aria-label="Open navigation menu"
          rounded="xl"
          variant="ghost"
          onClick={onMenuClick}
        >
          <SidebarRight />
        </IconButton>
      </HStack>
    </Box>
  )
}

export default MobileNavbar

