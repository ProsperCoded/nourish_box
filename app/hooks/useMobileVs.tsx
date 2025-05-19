import  { useEffect, useState } from 'react'


const useMobileVs = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => { setIsMobile(window.innerWidth < breakpoint) }
        handleResize();
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        };
    }, []);
    return isMobile
}

export default useMobileVs