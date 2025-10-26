"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSidebarContext } from "./SidebarContext";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import SearchModal from "./SearchModal";
import { useSearch } from "./SearchContext";
import { Button } from "../../components/ui/button";
import { config } from "../../config/index";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Icon } from "@iconify/react";
import { useAccount, useEnsName } from "wagmi";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { useAppKit } from "@reown/appkit/react";
import { disconnect, getAccount, getBalance } from "@wagmi/core";
import { useBalance } from "wagmi";

export default function Topbar() {
  const { isSearchOpen, toggleSearchModal, closeSearchModal } = useSearch();

  const router = useRouter();
  const { data: session } = useSession();
  const { open } = useAppKit();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [image, updateImage] = useState("/NeowareLogo2.png");
  const { isShrunk, setIsShrunk } = useSidebarContext();
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { address, isConnected } = useAccount();

  // Memoize ENS name query to prevent unnecessary re-renders
  const {
    data: ensName,
    error,
    status,
  } = useEnsName({
    address,
    // enabled: !!address, // Only query when address exists
  });

  // Memoize balance queries with proper enabled conditions
  const {
    data: balanceData,
    error: balanceError,
    isLoading: isBalanceLoading,
  } = useBalance({
    address: address,
    // enabled: !!address && isConnected, // Only query when connected
  });

  const {
    data: tokenBalance,
    isError,
    isLoading,
  } = useBalance({
    address: address,
    // enabled: !!address && isConnected, // Only query when connected
  });

  // Memoize expensive computations
  const truncatedAddress = useMemo(() => {
    if (!address) return "";
    return `${address.substring(0, 10)}...${address.substring(
      address.length - 6
    )}`;
  }, [address]);

  const formattedBalance = useMemo(() => {
    if (!tokenBalance) return ".";
    return parseFloat(tokenBalance.formatted).toFixed(4);
  }, [tokenBalance]);

  const topbarWidth = useMemo(() => {
    return isShrunk ? "w-[calc(100%_-_4rem)]" : "w-[calc(100%_-_16rem)]";
  }, [isShrunk]);

  // Memoize theme icon classes
  const themeIconClasses = useMemo(
    () => ({
      light: `rounded-full p-2 ${
        theme === "light" ? "bg-white dark:bg-black" : ""
      }`,
      system: `rounded-full p-2 ${
        theme === "system" ? "bg-white dark:bg-black" : ""
      }`,
      dark: `rounded-full p-2 ${
        theme === "dark" ? "bg-white dark:bg-black" : ""
      }`,
    }),
    [theme]
  );

  // Memoize callback functions to prevent unnecessary re-renders
  const handleSidebarToggle = useCallback(() => {
    setIsShrunk(!isShrunk);
  }, [isShrunk, setIsShrunk]);

  const handleDropdownToggle = useCallback(() => {
    setVisible(!visible);
  }, [visible]);

  const handleMobileNavToggle = useCallback((isOpen: boolean) => {
    setMobileNavOpen(isOpen);
  }, []);

  const handleThemeChange = useCallback(
    (newTheme: string) => {
      setTheme(newTheme);
    },
    [setTheme]
  );

  const handleSettingsClick = useCallback(() => {
    router.push("/Settings");
    setVisible(false);
  }, [router]);

  const handleSupportClick = useCallback(() => {
    router.push("https://docs.openwave.tech");
    setVisible(false);
  }, [router]);

  const handleSignOut = useCallback(() => {
    signOut();
    setVisible(false);
  }, []);

  const handleWalletDisconnect = useCallback(async () => {
    const { connector } = getAccount(config);
    await disconnect(config, { connector });
  }, []);

  // Memoize click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.image) {
      updateImage(session?.user?.image);
    }
  }, [session?.user?.image]);

  useEffect(() => {
    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, handleClickOutside]);

  // Memoize mobile navigation buttons
  const mobileNavButton = useMemo(() => {
    return isMobileNavOpen ? (
      <button
        onClick={() => handleMobileNavToggle(false)}
        aria-label="Close navigation menu"
        className="p-2 hover:bg-neutral-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <Icon icon="maki:cross" width="24" height="24" />
      </button>
    ) : (
      <button
        onClick={() => handleMobileNavToggle(true)}
        aria-label="Open navigation menu"
        className="p-2 hover:bg-neutral-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <Icon icon="fluent:navigation-16-filled" width="24" height="24" />
      </button>
    );
  }, [isMobileNavOpen, handleMobileNavToggle]);

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="hidden md:block">
          <div
            className={`dark:bg-neutral-950 z-[950] bg-neutral-50
             border-b-1 fixed top-0 px-5 py-2 border-b-[1px] border-custom-neutral dark:border-custom-dark-neutral ${topbarWidth} transition-all duration-400 ease-in-out`}
            style={{ transitionProperty: "width, padding" }}
          >
            <div className="flex justify-between">
              <div className="flex items-center">
                <div
                  className="pr-2 border-r-1 dark:border-custom-dark-neutral"
                  onClick={handleSidebarToggle}
                  style={{ cursor: "pointer" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                    <path d="M9 3v18"></path>
                  </svg>
                </div>

                <div className="my-auto ml-4">
                  <button
                    onClick={toggleSearchModal}
                    className="my-auto flex items-center py-2 space-x-2 border-1 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-300 px-3 rounded-md text-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span>Search</span>
                    <span className="text-xs bg-[#d6d6d6] dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded">
                      ⌘K
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex space-x-4 my-auto">
                <div className="my-auto">
                  <div className="gap-1 flex my-auto py-1 px-4 rounded-full bg-neutral-200 dark:bg-neutral-900">
                    <Icon
                      className={themeIconClasses.light}
                      onClick={() => handleThemeChange("light")}
                      icon="streamline-stickies-color:sun"
                      width="36"
                      height="36"
                    />
                    <Icon
                      className={themeIconClasses.system}
                      onClick={() => handleThemeChange("system")}
                      icon="material-symbols:computer-outline"
                      width="36"
                      height="36"
                    />
                    <Icon
                      className={themeIconClasses.dark}
                      onClick={() => handleThemeChange("dark")}
                      icon="streamline-plump-color:moon-stars"
                      width="36"
                      height="36"
                    />
                  </div>
                </div>

                {session ? (
                  <div
                    onClick={handleDropdownToggle}
                    className="flex py-2 px-4 rounded-full gap-2 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <img
                      src={image}
                      alt="user_image"
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                    <div className=" ">
                      <div className="text-[12px]">{session?.user?.name}</div>
                      <div className="text-[11px]">{session?.user?.email}</div>
                    </div>
                    <div className="my-auto">
                      <Icon icon="eva:arrow-up-fill" width="12" height="12" />
                      <Icon icon="eva:arrow-down-fill" width="12" height="12" />
                    </div>
                  </div>
                ) : (
                  <>
                    <Link href={`/Login`}>
                      <button className="px-4 py-2 text-[14px] rounded-lg dark:text-black text-white bg-black dark:bg-white">
                        Login
                      </button>
                    </Link>
                  </>
                )}
              </div>

              {visible && (
                <div
                  ref={dropdownRef}
                  className="fixed w-[220px] top-18 right-8 bg-white dark:bg-neutral-900 border-[1px] px-2 py-2 rounded-[10px] dark:border-neutral-700 text-bold"
                >
                  <div className="">
                    {isConnected ? (
                      <>
                        <div className="text-[14px] px-4 py-2 dark:hover:bg-custom-dark-neutral hover:bg-neutral-200 dark:text-white text-black rounded-lg cursor-pointer text-center flex gap-2">
                          <div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              className="mx-auto"
                            >
                              <path
                                fill="currentColor"
                                d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2m0 14H4V6h16zM6 10h8v2H6zm0 4h5v2H6z"
                              />
                            </svg>
                          </div>
                          {truncatedAddress}
                        </div>

                        <div>
                          <div className="text-[14px] flex px-4 mt-1">
                            Balance:
                            <span>
                              <img src="https://hashscan.io/crypto-logo-light.svg" className="w-5 h-5 rounded-full" />
                            </span>
                            {formattedBalance}
                          </div>
                        </div>

                        <div
                          className="text-[14px] rounded my-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 px-4 py-2"
                          onClick={handleWalletDisconnect}
                        >
                          Disconnect Wallet
                        </div>
                      </>
                    ) : (
                      <div
                        className="text-[14px] px-4 py-2 dark:hover:bg-custom-dark-neutral hover:bg-neutral-200 dark:text-white text-black rounded-lg cursor-pointer text-center flex gap-2"
                        onClick={() => open()}
                      >
                        Connect Wallet
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      onClick={handleSettingsClick}
                      className="px-2 py-1 text-center items-center justify-center gap-1 mx-auto text-center rounded text-[14px] cursor-pointer flex hover:bg-neutral-200 dark:hover:bg-neutral-800"
                    >
                      <Icon
                        icon="mingcute:settings-2-line"
                        width="24"
                        height="24"
                      />
                      Settings
                    </div>
                    <div
                      onClick={handleSupportClick}
                      className="px-2 py-1 text-center items-center justify-center mx-auto text-[14px] rounded gap-1 my-auto cursor-pointer flex hover:bg-neutral-200 dark:hover:bg-neutral-800"
                    >
                      <Icon
                        icon="material-symbols-light:support"
                        width="24"
                        height="24"
                      />
                      Support
                    </div>
                  </div>

                  <button
                    className="pb-1 text-[14px] pt-1 w-full text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded px-4 py-2 mt-2"
                    onClick={handleSignOut}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 md:hidden block">
          <header className="fixed bg-black top-0 left-0 right-0 z-[992] border border-b-1 h-16   md:top-4 md:left-4 md:right-4 md:border-none">
            <div className="md:max-w-7xl w-full mx-auto md:bg-black md:dark:bg-[#1A1A1A]/80 md:backdrop-blur-md md:rounded-full md:border md:dark:border-custom-dark-neutral/50">
              <div className="flex justify-between items-center px-4 py-3 md:px-6">
                <div className="flex gap-1">
                  <img
                    src="/NeowareLogo2.png"
                    alt="openwave logo"
                    width={24}
                    height={24}
                  />
                  <span
                    style={{ fontFamily: "var(--font-cypher)" }}
                    className="text-xl"
                  >
                    openwave
                  </span>
                </div>

                <div className="md:hidden">
                  <div className="text-white focus:outline-none">
                    {isMobileNavOpen ? (
                      <button
                        onClick={() => setMobileNavOpen(false)}
                        aria-label="Close navigation menu"
                        className="p-2 hover:bg-neutral-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <Icon icon="maki:cross" width="24" height="24" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setMobileNavOpen(true)}
                        aria-label="Open navigation menu"
                        className="p-2 hover:bg-neutral-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <Icon
                          icon="fluent:navigation-16-filled"
                          width="24"
                          height="24"
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {isMobileNavOpen ? (
            <>
              <div
                className={`fixed z-[99] w-full bg-white dark:bg-black h-[calc(100%-_64px)] w-full transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${
                  isMobileNavOpen ? "translate-y-0" : "translate-y-[-100%]"
                }`}
              >
                <div>
                  <div className="px-4 flex flex-col h-[calc(100%-_64px)] justify-between">
                    <div className="">
                      <div>
                        <div className="pt-4">
                          <div className="text-[13px] text-neutral-400 ">
                            Explore
                          </div>
                          <Link href="/homepage">
                            <div className="rounded-lg text-sm data-[active=true]:bg-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                              <Icon
                                icon="mdi:folder-search"
                                width="24"
                                height="24"
                              />
                              Discover
                            </div>
                          </Link>

                          <Link href={`/Browse`}>
                            <div className="rounded-lg text-sm data-[active=true]:bg-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                              <Icon
                                icon="meteor-icons:folder-search"
                                width="24"
                                height="24"
                              />
                              Browse
                            </div>
                          </Link>
                          <Link href="/GitBot">
                            <div className="rounded-lg text-sm active:bg-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                              <Icon icon="tabler:bulb" width="24" height="24" />
                              Recommendations
                            </div>
                          </Link>
                        </div>
                        <div className="pt-3">
                          <div className="text-[13px] text-neutral-400 py-2">
                            Contributor
                          </div>

                          <Link
                            href={{
                              pathname: "/userProfile",
                              query: {
                                user: (session?.user as any)?.username,
                              },
                            }}
                          >
                            <div className="rounded-lg text-sm focus:bg-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                              <Icon
                                icon="tabler:user-filled"
                                width="24"
                                height="24"
                              />
                              User Profile
                            </div>
                          </Link>
                          <Link href="/assignedProjects" className="">
                            <div className="rounded-lg text-sm data-[active=true]:bg-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                              <Icon
                                icon="material-symbols:folder-code"
                                width="24"
                                height="24"
                              />
                              Projects
                            </div>
                          </Link>
                          <a href="Rewards">
                            <div className="rounded-lg text-sm data-[active=true]:bg-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                              <Icon
                                icon="arcticons:rewards"
                                width="24"
                                height="24"
                              />
                              Rewards
                            </div>
                          </a>
                        </div>
                        <div className="pt-3">
                          <div className="text-[13px] text-neutral-400 py-2">
                            Maintainer
                          </div>
                          <Link href="/contributorRequests">
                            <div className="rounded-lg text-sm focus:bg-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                              <Icon
                                icon="material-symbols-light:folder-data"
                                width="24"
                                height="24"
                              />
                              Contribution Requests
                            </div>
                          </Link>

                          <Link href="/myProjects">
                            <div className="rounded-lg text-sm focus:bg-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                              <Icon
                                icon="material-symbols-light:folder-data"
                                width="24"
                                height="24"
                              />
                              My Projects
                            </div>
                          </Link>

                          <Link href="/openwaveChat">
                            <div className="rounded-lg text-sm focus:bg-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#27272a] pl-1 pr-4 py-2 flex">
                              <div className="flex gap-1">
                                <Icon
                                  icon="material-symbols:chat"
                                  width="24"
                                  height="24"
                                />
                                openwave Chat
                              </div>
                            </div>
                          </Link>
                          {/* <Link href="/MaintainerWallet">
                            <div className="rounded-lg text-sm focus:bg-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#27272a] pl-1 pr-4 py-2 flex">
                              <div className="flex gap-1">
                                <Icon
                                  icon="material-symbols:account-balance-wallet-outline"
                                  width="24"
                                  height="24"
                                />
                                Maintainer Wallet
                              </div>
                            </div>
                          </Link> */}
                        </div>
                      </div>{" "}
                      {/* End of wrapper for top content */}
                      <div
                        onClick={() => open()}
                        className=" px-4 py-2 dark:bg-custom-dark-neutral bg-neutral-200 dark:text-white text-black  rounded-lg cursor-pointer text-center mb-4"
                      >
                        {isConnected ? (
                          <div
                            onClick={() => {
                              open;
                            }}
                          >
                            <div className="flex gap-2">
                              <div>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  className="mx-auto"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2m0 14H4V6h16zM6 10h8v2H6zm0 4h5v2H6z"
                                  />
                                </svg>
                              </div>
                              {truncatedAddress}
                            </div>
                          </div>
                        ) : (
                          "Connect Wallet"
                        )}
                      </div>
                    </div>{" "}
                    {/* End of flex container */}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </Suspense>
    </>
  );
}
