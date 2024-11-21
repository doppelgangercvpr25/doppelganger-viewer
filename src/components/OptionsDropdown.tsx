import React, { useRef, useEffect } from "react";
import {
    IconCaretDownFilled,
    IconCaretUpFilled,
    IconDownload,
    IconHospital,
    IconBrandGithub,
    IconKeyboard,
    IconAxisX,
    IconAlertCircle,
} from "@tabler/icons-react";
import ControlsModal from "./ControlsModal";

const S3_BASE_URL =
    "https://doppelgangercvpr25.s3.us-east-2.amazonaws.com/";

interface Option {
    id: string;
    label: string;
    icon: JSX.Element;
    onClick: () => void;
}

interface OptionsDropdownProps {
    isMenuOpen: boolean;
    isAxisEnabled: boolean;
    isModalOpen: boolean;
    onChangeHUD: () => void;
    onOpenModal: () => void;
    onCloseModal: () => void;
    onAxisToggle: () => void;
    toggleMenu: (value: boolean) => void;
}

const OptionsDropdown: React.FC<OptionsDropdownProps> = ({
    isMenuOpen,
    isAxisEnabled,
    isModalOpen,
    onChangeHUD,
    onOpenModal,
    onCloseModal,
    onAxisToggle,
    toggleMenu,
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const toggleDropdown = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        toggleMenu(!isMenuOpen);
    };

    const options: Option[] = [
        {
            id: "shortcuts",
            label: "Shortcuts",
            icon: <IconKeyboard size={16} stroke={2.5} />,
            onClick: () => {
                onOpenModal();
                toggleMenu(false);
            },
        },
        {
            id: "hud",
            label: "Hide HUD",
            icon: <IconHospital size={16} stroke={2.5} />,
            onClick: () => {
                onChangeHUD();
                toggleMenu(false);
            },
        },
        {
            id: "axis",
            label: isAxisEnabled ? "Hide Axis" : "Show Axis",
            icon: <IconAxisX size={16} stroke={2.5} />,
            onClick: () => {
                onAxisToggle();
                toggleMenu(false);
            },
        },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                toggleMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, toggleMenu]);

    return (
        <div className="relative select-none" ref={ref}>
            <button
                className="bg-gray-600 hover:bg-gray-500 transition-bg duration-300 pl-5 pr-5 pt-2 pb-2 rounded-full shadow-lg active:shadow-[inset_0_-1px_10px_rgba(0,0,0,0.6)]"
                onClick={toggleDropdown}
            >
                <div className="flex flex-row items-center justify-center gap-3">
                    <span className="text-white font-medium font-sans">
                        Options
                    </span>
                    {isMenuOpen ? (
                        <IconCaretUpFilled
                            size={16}
                            stroke={1.5}
                            color="white"
                        />
                    ) : (
                        <IconCaretDownFilled
                            size={16}
                            stroke={1.5}
                            color="white"
                        />
                    )}
                </div>
            </button>
            {isMenuOpen && (
                <ul className="absolute top-12 bg-white shadow-md rounded-md w-full z-10">
                    {options.map((option, index) => (
                        <li
                            key={option.id}
                            className={`p-2 hover:bg-gray-200 cursor-pointer ${index === 0 ? "rounded-t-md" : ""
                                } ${index === options.length - 1
                                    ? "rounded-b-md"
                                    : ""
                                }`}
                            onClick={option.onClick}
                        >
                            <div className="flex flex-row justify-between items-center">
                                <span className="font-medium text-sm">
                                    {option.label}
                                </span>
                                <div>{option.icon}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {isModalOpen && <ControlsModal onClose={onCloseModal} />}
        </div>
    );
};

export default OptionsDropdown;
