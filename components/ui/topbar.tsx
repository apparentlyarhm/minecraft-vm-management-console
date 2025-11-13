import { ArrowUpRight } from 'lucide-react';
import React from 'react';

type TopBarItem = {
    label: string;
    content: React.ReactNode;
};

type TopBarProps = {
    items: TopBarItem[];
};

// never mind the name, its a side bar now
const TopBar: React.FC<TopBarProps> = ({ items }) => {
    return (
        <div className="w-64 flex-shrink-0 bg-gray-900 text-xs sm:text-sm text-white">

            <div className="flex flex-col h-full p-6 justify-between">
                <div className="flex flex-col gap-5">
                    {items.map((item, index) => (
                        <div key={index} className="flex flex-row items-center">
                            <div className="w-16 text-xs font-semibold text-gray-500">{item.label}</div>
                            <div className="px-2">{item.content}</div>
                        </div>
                    ))}
                </div>

                <div>
                    <a
                        href="https://github.com/apparentlyarhm/validator-gcp-java"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        View Source
                        <ArrowUpRight className="w-4 h-4 inline-block ml-1" />
                    </a>
                </div>
            </div>
        </div>

    );
};

export default TopBar;
