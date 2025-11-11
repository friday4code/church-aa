import { useEffect } from 'react'
import { useLocation } from 'react-router';
import { toaster } from './ui/toaster';

const DismissToasts = () => {
    const loc = useLocation();
    useEffect(() => {
        toaster.dismiss()
        toaster.remove();
    }, [loc.pathname]);
    return null;
}

export default DismissToasts