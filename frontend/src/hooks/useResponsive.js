import { useState, useEffect } from 'react';
import { Grid } from 'antd';

const { useBreakpoint } = Grid;

export const useResponsive = () => {
    const screens = useBreakpoint();
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        setIsMobile(screens.xs && !screens.sm);
        setIsTablet(screens.sm && !screens.lg);
        setIsDesktop(screens.lg);
    }, [screens]);

    return {
        isMobile,
        isTablet,
        isDesktop,
        screens
    };
};