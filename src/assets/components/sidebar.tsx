"use client";

import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "./SidebarContext";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useBalance } from "wagmi";
import { useSession } from "next-auth/react";
import { Suspense, useState, useRef } from "react";
import NeowareLogo from "../../components/NavBar/RotatingLogo";
import gsap from "gsap";
import { useThemeChange } from "../../components/End/ThemeChangeContext";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Icon } from "@iconify/react";

interface User {
  username?: string;
  email?: string;
  name?: string;
  image?: string;
}

interface session {
  accessToken?: string;
  expires?: string;
  user?: {
    username?: string;
    email?: string;
    name?: string;
    image?: string;
  };
}

export default function Sidebar() {
  const { open } = useAppKit();
  const { data: session } = useSession(); // Added useAccount and useBalance
  const { isShrunk } = useSidebarContext();
  const speedRef = useRef({ value: 0.08 });
  const speedTween = useRef(null);
  const textRef = useRef(null);
  const { address, isConnected } = useAccount(); // Get account status and address
  const [speed, setSpeed] = useState<number>(0.08);
  const [spinDirection, setSpinDirection] = useState("clockwise");

  type RotatingLogoProps = {
    size?: number;
    speed?: number;
    direction?: "clockwise" | "counter-clockwise";
  };

  const RotatingLogo = ({
    size = 1,
    speed = 0.01,
    direction = "clockwise",
  }: RotatingLogoProps) => {
    const modelRef = useRef<THREE.Group>(null);

    const { scene } = useGLTF("/NeowareLogo1.glb");

    useFrame(() => {
      if (modelRef.current) {
        const spinSpeed = direction === "clockwise" ? speed : -speed;
        modelRef.current.rotation.y += spinSpeed;
      }
    });

    return <primitive ref={modelRef} object={scene} scale={size} />;
  };

  const {
    data: balanceData,
    error: balanceError,
    isLoading: isBalanceLoading,
  } = useBalance({
    address: address,
  });
  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 10)}...${addr.substring(addr.length - 6)}`;
  };

  return (
    <div className="hidden md:block fixed left-0 top-0 bottom-0 z-40">
      <div
        className={
          (isShrunk ? "w-[4rem] mx-auto px-1" : "w-[16rem] px-4") +
          " " +
          "h-screen bg-white dark:bg-black border-r-[1px] dark:border-custom-dark-neutral py-4 transition-all duration-400 ease-in-out"
        }
        style={{ transitionProperty: "width, padding" }}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="flex-1 overHBAR-y-auto">
            <div className="mb-4">
              {isShrunk ? (
                <>
                  <Suspense
                    fallback={
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src="/NeowareLogo2.png" // Replace with your actual fallback image path
                          alt="Loading logo..."
                        />
                      </div>
                    }
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        position: "relative",
                      }}
                    >
                      <Canvas
                        camera={{ position: [0, 0, 3] }}
                        gl={{ preserveDrawingBuffer: true }}
                      >
                        <ambientLight intensity={1} />
                        <directionalLight
                          position={[2, 2, 5]}
                          intensity={1.5}
                        />
                        <RotatingLogo
                          size={2.2}
                          speed={3}
                          direction={`clockwise`}
                        />
                      </Canvas>
                    </div>
                  </Suspense>
                </>
              ) : (
                <>
                  <div className="flex">
                    <Suspense
                      fallback={
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <img
                            src="/NeowareLogo2.png" // Replace with your actual fallback image path
                            alt="Loading logo..."
                          />
                        </div>
                      }
                    >
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          position: "relative",
                        }}
                      >
                        <Canvas
                          camera={{ position: [0, 0, 3] }}
                          gl={{ preserveDrawingBuffer: true }}
                        >
                          <ambientLight intensity={1} />
                          <directionalLight
                            position={[2, 2, 5]}
                            intensity={1.5}
                          />
                          <RotatingLogo
                            size={2.2}
                            speed={3}
                            direction={`clockwise`}
                          />
                        </Canvas>
                      </div>
                    </Suspense>
                    <div className="my-auto overHBAR-hidden">
                      <h1
                        ref={textRef}
                        className={`dark:text-white text-black text-2xl text-center  `}
                        style={{ fontFamily: "var(--font-cypher)" }}
                      >
                        openwave
                      </h1>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div>
              <div className="">
                {!isShrunk && (
                  <div className="text-[13px] text-neutral-400 py-2">
                    Explore
                  </div>
                )}
                <Link href="/homepage">
                  <div className="rounded-lg text-sm data-[active=true]:bg-neutral-400 gap-1 my-auto hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <Icon icon="mdi:folder-search" width="24" height="24" />
                    <div className="my-auto">{!isShrunk && "Discover"}</div>
                  </div>
                </Link>

                <Link href={`/Browse`} className="">
                  <div className="rounded-lg text-sm data-[active=true]:bg-neutral-400 gap-1 my-auto hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <Icon
                      icon="mdi:folder-search-outline"
                      width="24"
                      height="24"
                    />
                    <div className="my-auto">{!isShrunk && "Browse"}</div>
                  </div>
                </Link>

                <Link href="/GitBot">
                  <div className="rounded-lg text-sm data-[active=true]:bg-neutral-400 gap-1 my-auto hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <Icon icon="tabler:bulb" width="24" height="24" />
                    <div className="my-auto">
                      {!isShrunk && "Recommendations"}
                    </div>
                  </div>
                </Link>
              </div>

              <div className="pt-3">
                {!isShrunk && (
                  <div className="text-[13px] text-neutral-400 py-2">
                    Contributor
                  </div>
                )}

                <Link
                  href={{
                    pathname: "/userProfile",
                    query: {
                      user: (session?.user as User)?.username,
                    },
                  }}
                >
                  <div className="rounded-lg text-sm data-[active=true]:bg-neutral-400 gap-1 my-auto hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <Icon icon="tabler:user-filled" width="24" height="24" />
                    <div className="my-auto">{!isShrunk && "User Profile"}</div>
                  </div>
                </Link>

                <Link href="/assignedProjects" className="">
                  <div className="rounded-lg text-sm data-[active=true]:bg-neutral-400 gap-1 my-auto hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <Icon
                      icon="material-symbols:folder-code"
                      width="24"
                      height="24"
                    />
                    <div className="my-auto">{!isShrunk && "Projects"}</div>
                  </div>
                </Link>

                <a href="Rewards">
                  <div className="rounded-lg text-sm data-[active=true]:bg-neutral-400 gap-1 my-auto hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <Icon icon="arcticons:rewards" width="24" height="24" />
                    <div className="my-auto">{!isShrunk && "Rewards"}</div>
                  </div>
                </a>
              </div>

              <div className="pt-3">
                {!isShrunk && (
                  <div className="text-[13px] text-neutral-400 py-2">
                    Maintainer
                  </div>
                )}

                <Link href="/myProjects">
                  <div className="rounded-lg text-sm data-[active=true]:bg-neutral-400 gap-1 my-auto hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <Icon
                      icon="material-symbols-light:folder-data"
                      width="24"
                      height="24"
                    />
                    <div className="my-auto">{!isShrunk && "My Projects"}</div>
                  </div>
                </Link>

                <Link href="/openwave-chat">
                  <div className="rounded-lg text-sm data-[active=true]:bg-neutral-400 gap-1 my-auto hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <div className="flex gap-1">
                      <Icon
                        icon="material-symbols:chat"
                        width="24"
                        height="24"
                      />
                      <div className="my-auto">
                        {!isShrunk && "openwave Chat"}
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/hacks">
                  <div className="rounded-lg text-sm data-[active=true]:bg-neutral-400 gap-1 my-auto hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <div className="flex gap-1">
                      <Icon
                        icon="material-symbols:code-blocks"
                        width="24"
                        height="24"
                      />
                      <div className="my-auto">
                        {!isShrunk && "Hacks"}
                      </div>
                    </div>
                  </div>
                </Link>
                {/* <Link href="/MaintainerWallet">
                  <div className="rounded-lg text-sm data-[active=true]:bg-neutral-400 gap-1 my-auto hover:bg-neutral-100 dark:hover:bg-[#27272a] px-2 py-2 flex">
                    <div className="flex gap-1">
                      <Icon
                        icon="material-symbols:account-balance-wallet-outline"
                        width="24"
                        height="24"
                      />
                      <div className="my-auto">
                        {!isShrunk && "Maintainer Wallet"}
                      </div>
                    </div>
                  </div>
                </Link> */}
              </div>
            </div>
          </div>

          {/* Wallet connection section - fixed at bottom */}
          <div className="flex-shrink-0 mt-4">
            <div
              onClick={() => open()}
              className="px-4 py-2 dark:bg-custom-dark-neutral bg-neutral-200 dark:text-white text-black rounded-lg cursor-pointer text-center"
            >
              {isConnected ? (
                isShrunk ? (
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
                ) : (
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
                    {truncateAddress(address as string)}
                  </div>
                )
              ) : isShrunk ? (
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
              ) : (
                "Connect Wallet"
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
