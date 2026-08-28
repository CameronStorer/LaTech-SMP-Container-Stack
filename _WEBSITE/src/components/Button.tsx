// components/ServerIPDisplay.tsx
'use client';

// components/Button.tsx

import React from 'react';

interface ButtonProps {
    href: string;
    text: string;
    isPrimary?: boolean;
    target?: '_blank' | '_self' | '_parent' | '_top';
}

const Button: React.FC<ButtonProps> = ({ href, text, isPrimary = false, target = '_self' }) => {
    const baseClasses = "px-6 py-3 font-bold text-base rounded-lg shadow-xl transition duration-300 transform hover:scale-105 border-b-4";
    
    // Tech Red for the primary CTA
    const primaryClasses = "bg-[#E31B23] hover:bg-red-700 border-[#E31B23]/70";
    
    // Optional secondary style (using a mix of Tech Blue and Gray)
    const secondaryClasses = "bg-gray-700 hover:bg-gray-600 border-gray-600";

    return (
        <a 
            href={href} 
            target={target}
            className={`${baseClasses} ${isPrimary ? primaryClasses : secondaryClasses}`}
        >
            {text}
        </a>
    );
};

export default Button;