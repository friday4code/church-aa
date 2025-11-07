import { useScrollStore } from "@/store/ui.store";
import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * ScrollRest component
 * Automatically scrolls to the top whenever the pathname changes.
 */
const ScrollRest: React.FC = () => {
    const { pathname } = useLocation();
    const { scrollArea } = useScrollStore();

    useEffect(() => {
        if (scrollArea) {
            scrollArea.scrollToEdge({ edge: "top", behavior: "smooth" });
        }

    }, [pathname, scrollArea]);

    return null;
};

export default ScrollRest;