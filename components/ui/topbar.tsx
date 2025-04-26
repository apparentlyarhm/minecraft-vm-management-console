import React from 'react';

type TopBarProps = {
  items: Array<React.ReactNode>; // Accepts strings, icons, any JSX
};

const TopBar: React.FC<TopBarProps> = ({ items }) => {
    return (
        <div className="bg-gray-900 text-xs sm:text-sm text-white py-3 px-6 flex justify-center sm:justify-end">
            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <div className='px-2'>{item}</div>
                    {index < items.length - 1 && <span className="mx-2 opacity-20">|</span>}
                </div>
            ))}
        </div>
    );
};

export default TopBar;
