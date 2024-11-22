import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { VariableSizeList as List } from "react-window";
import { useRouter } from "next/navigation";
import { SceneType } from "../../types";
import { IconMenu2, IconSearch, IconMapPin } from "@tabler/icons-react";

const OuterElementContext = React.createContext({});
const OuterElementType = React.memo(
    React.forwardRef<HTMLDivElement>((props, ref) => {
        const outerProps = React.useContext(OuterElementContext);
        return <div ref={ref} {...props} {...outerProps} />;
    })
);
OuterElementType.displayName = "OuterElementType";

const renderRow = (
    {
        data,
        index,
        style,
    }: any) => {
    const option = data[index];

    return (
        <div style={style} key={index} className="flex flex-row items-center cursor-pointer bg-white hover:bg-gray-100 gap-4 pr-[9px] list-none">
            <IconMapPin size={16} stroke={3} color="grey" className="ml-4 flex-shrink-0" />
            <div className="overflow-hidden text-ellipsis whitespace-nowrap flex-grow w-full">
                {option}
            </div>
        </div>
    )
};

const ListboxComponent = React.memo(
    React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>(
        (props, ref) => {
            const { children, ...other } = props;
            const itemData = React.Children.toArray(children).map((item: any) => (
                React.cloneElement(item, {
                    className: "hover:bg-gray-100"
                })
            ));
            const itemCount = itemData.length;

            return (
                <div ref={ref}>
                    <OuterElementContext.Provider value={other}>
                        <List
                            height={250}
                            width="100%"
                            itemData={itemData}
                            itemCount={itemCount}
                            itemSize={() => 40}
                            outerElementType={OuterElementType}
                        >
                            {renderRow}
                        </List>
                    </OuterElementContext.Provider>
                </div>
            );
        }
    )
);
ListboxComponent.displayName = "ListboxComponent";

import reconMetadata from "../../public/data/recon_metadata.json";
interface SearchBarProps {
    onOptionClick: (scene: SceneType, rec_no: number) => void;
    togglePanel: (bool: boolean) => void;
    disableShortcuts: (bool: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
    onOptionClick,
    togglePanel,
    disableShortcuts,
}) => {
    const [inputValue, setInputValue] = useState("");
    const [value, setValue] = useState<SceneType | string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [scenes, setScenes] = useState<SceneType[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();

    const isMdOrLarger = () => {
        return window.innerWidth >= 768;
    };

    // load scenes
    useEffect(() => {
        const loadedScenes = Object.entries(reconMetadata).flatMap(([benchmark, landmarks]) =>
            Object.entries(landmarks).map(([name, values]) => ({
                name: String(name),
                normalized_name: `${benchmark.charAt(0).toUpperCase() + benchmark.slice(1)} - ${String(name)
                    .replace(/_/g, " ")
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")}`,
                benchmark: benchmark,
                no_of_rec: Number(values[0]),
            }))
        );

        setScenes(loadedScenes);

        const name = searchParams.get("name");
        const rec_no = searchParams.get("rec_no");
        const benchmark = searchParams.get("benchmark");
        if (name && rec_no && benchmark) {
            const sceneName = name;
            const foundScene = loadedScenes.find(
                (scene) => (scene.name === sceneName && scene.benchmark === benchmark)
            );
            if (foundScene) {
                onOptionClick(foundScene, Number(rec_no));
                setValue(foundScene.normalized_name);
                if (isMdOrLarger()) {
                    togglePanel(true);
                }
            }
        }
    }, [searchParams, onOptionClick, togglePanel])

    const handleOptionClick = (option: SceneType) => {
        console.log('here');
        router.push(`/?name=${option.name}&rec_no=0&benchmark=${option.benchmark}`);
    };

    const getOptionLabel = (option: string | SceneType) => {
        return typeof option === "string" ? option : option.normalized_name;
    };

    const filterOptions = (options: any[], _: any) => {
        const filtered = options.filter((option) =>
            typeof option === "string"
                ? option.toLowerCase().includes(inputValue.toLowerCase())
                : option.normalized_name
                    .toLowerCase()
                    .includes(inputValue.toLowerCase())
        );
        // round bottom corners with no options available
        if (filtered.length === 0 && inputValue) {
            setIsDropdownOpen(false);
        }

        return filtered;
    };

    const options = useMemo(() => scenes, [scenes]);

    return (
        <Autocomplete
            freeSolo
            openOnFocus
            id="free-solo-scene-search"
            inputValue={inputValue}
            value={
                value
                    ? typeof value === "string"
                        ? value
                        : value.normalized_name
                    : null
            }
            onInputChange={(event, newInputValue) =>
                setInputValue(newInputValue)
            }
            onChange={(event, newValue: any) => {
                if (newValue) {
                    setValue(newValue);
                    handleOptionClick(newValue);
                    setIsDropdownOpen(false);
                } else {
                    setValue(null);
                }
            }}
            options={options}
            getOptionLabel={getOptionLabel}
            filterOptions={filterOptions}
            open={isDropdownOpen}
            onOpen={() => {
                setIsDropdownOpen(true);
                togglePanel(false);
            }}
            onClose={() => {
                setIsDropdownOpen(false);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder={`Search ${scenes.length} scenes`}
                    variant="outlined"
                    onFocus={() => disableShortcuts(true)}
                    onBlur={() => disableShortcuts(false)}
                    InputLabelProps={{
                        ...params.InputLabelProps,
                        shrink: false,
                        style: {
                            transform: "translate(14px, 10px) scale(1)",
                        },
                    }}
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <>
                                <button
                                    onClick={(
                                        e: React.MouseEvent<HTMLButtonElement>
                                    ) => {
                                        e.stopPropagation();
                                        togglePanel(true);
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    <IconMenu2
                                        className="md:hidden mr-3"
                                        size={20}
                                        stroke={2}
                                        color="grey"
                                    />

                                </button>
                                <IconSearch
                                    className="hidden md:block mr-3"
                                    size={16}
                                    stroke={3}
                                    color="grey"
                                />
                            </>
                        ),
                        style: {
                            height: "40px",
                            borderRadius: isDropdownOpen
                                ? "20px 20px 0 0"
                                : "20px",
                            backgroundColor: "white",
                            paddingLeft: "15px",
                            paddingRight: "15px",
                        },
                    }}
                    className="w-full"
                />
            )}
            ListboxComponent={ListboxComponent}
            className="w-full min-w-64 md:min-w-96 shadow-xl rounded-[20px]"
        />
    );
};

export default SearchBar;
