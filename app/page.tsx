"use client";

import {
	Address,
	Avatar,
	EthBalance,
	Identity,
	Name,
} from "@coinbase/onchainkit/identity";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import {
	ConnectWallet,
	Wallet,
	WalletDropdown,
	WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
	ArrowRightIcon,
	BookOpenIcon,
	HeartIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function App() {
	const { setFrameReady, isFrameReady } = useMiniKit();
	const router = useRouter();

	useEffect(() => {
		if (!isFrameReady) {
			setFrameReady();
		}
	}, [setFrameReady, isFrameReady]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 px-3 py-4">
			<div className="max-w-md mx-auto">
				<header className="flex justify-between items-center mb-8 h-11">
					<div>
						<div className="flex items-center space-x-2">
							<Wallet className="z-10">
								<ConnectWallet>
									<Name className="text-inherit" />
								</ConnectWallet>
								<WalletDropdown>
									<Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
										<Avatar />
										<Name />
										<Address />
										<EthBalance />
									</Identity>
									<WalletDropdownDisconnect />
								</WalletDropdown>
							</Wallet>
						</div>
					</div>
				</header>

				<main className="flex-1 space-y-8">
					{/* Enhanced title section */}
					<div className="text-center space-y-3">
						<h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
							Book Review App
						</h1>
						<p className="text-gray-600 text-sm">
							Discover and review your favorite books on the blockchain
						</p>
					</div>

					{/* Navigation cards */}
					<div className="space-y-4">
						<button
							type="button"
							onClick={() => router.push("/books")}
							className="group w-full bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-indigo-300 p-6 transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
										<BookOpenIcon className="h-6 w-6 text-white" />
									</div>
									<div className="text-left">
										<h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-800 transition-colors">
											Browse Books
										</h3>
										<p className="text-sm text-gray-600">
											Explore our collection of books
										</p>
									</div>
								</div>
								<div className="text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300">
									<ArrowRightIcon className="w-5 h-5" />
								</div>
							</div>
						</button>

						<button
							type="button"
							onClick={() => router.push("/reviews")}
							className="group w-full bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-indigo-300 p-6 transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
										<HeartIcon className="h-6 w-6 text-white" />
									</div>
									<div className="text-left">
										<h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-800 transition-colors">
											Book Reviews
										</h3>
										<p className="text-sm text-gray-600">
											Read and share book reviews
										</p>
									</div>
								</div>
								<div className="text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300">
									<ArrowRightIcon className="w-5 h-5" />
								</div>
							</div>
						</button>
					</div>
				</main>
			</div>
		</div>
	);
}
