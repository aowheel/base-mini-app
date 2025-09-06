"use client";

import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	DialogTitle,
} from "@headlessui/react";
import {
	ArrowLeftIcon,
	CheckCircleIcon,
	HeartIcon,
	HomeIcon,
	PlusIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import LIKE_ABI from "@/abis/like";
import { publicClient } from "@/utils/viem";

export default function LikesPage() {
	const router = useRouter();
	const account = useAccount();
	const { writeContract, isPending, isSuccess } = useWriteContract();
	const [likeBalance, setLikeBalance] = useState<bigint>(BigInt(0));
	const [showSuccessDialog, setShowSuccessDialog] = useState(false);
	const [mintAmount, setMintAmount] = useState<number>(100);

	// Fetch like balance
	useEffect(() => {
		if (account.address) {
			publicClient
				.readContract({
					address: process.env.NEXT_PUBLIC_LIKE_CONTRACT_ADDRESS as Address,
					abi: LIKE_ABI,
					functionName: "balanceOf",
					args: [account.address as Address],
				})
				.then((balance) => {
					setLikeBalance(balance);
				});
		}
	}, [account.address]);

	// Refresh balance after successful mint
	useEffect(() => {
		if (isSuccess && account.address) {
			publicClient
				.readContract({
					address: process.env.NEXT_PUBLIC_LIKE_CONTRACT_ADDRESS as Address,
					abi: LIKE_ABI,
					functionName: "balanceOf",
					args: [account.address as Address],
				})
				.then((balance) => {
					setLikeBalance(balance);
				});
		}
	}, [isSuccess, account.address]);

	const handleMintLikes = useCallback(() => {
		if (!account.address) return;

		writeContract({
			address: process.env.NEXT_PUBLIC_LIKE_CONTRACT_ADDRESS as Address,
			abi: LIKE_ABI,
			functionName: "mint",
			args: [account.address as Address, BigInt(mintAmount)],
		});
	}, [account.address, writeContract, mintAmount]);

	// Show success dialog when transaction is successful
	useEffect(() => {
		if (isSuccess) {
			setShowSuccessDialog(true);
		}
	}, [isSuccess]);

	const mintOptions = [50, 100, 200, 500];

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 px-3 py-4">
			<div className="max-w-md mx-auto">
				{/* Header with Back button */}
				<div className="mb-6">
					<div className="flex gap-3">
						<button
							type="button"
							onClick={() => router.back()}
							className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md group"
						>
							<ArrowLeftIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
							<span>Back</span>
						</button>
						<Link
							href="/"
							className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md group"
						>
							<HomeIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
							<span>Home</span>
						</Link>
					</div>
				</div>

				{/* Title */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold bg-gradient-to-r from-purple-900 via-pink-800 to-indigo-800 bg-clip-text text-transparent mb-2">
						LIKES
					</h1>
					<p className="text-gray-600 text-sm">
						Mint LIKES to appreciate book reviews
					</p>
				</div>

				{/* Current Balance Card */}
				<div className="bg-white rounded-xl shadow-lg border border-purple-200 p-6 mb-8">
					<div className="text-center">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
							<HeartIconSolid className="h-8 w-8 text-white" />
						</div>
						<h2 className="text-lg font-semibold text-gray-900 mb-2">
							Current Balance
						</h2>
						<div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
							{String(likeBalance)}
						</div>
						<p className="text-gray-500 text-sm mt-2">LIKES</p>
					</div>
				</div>

				{/* Mint Section */}
				<div className="bg-white rounded-xl shadow-lg border border-purple-200 p-6 mb-8">
					<h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
						Mint LIKES
					</h3>

					{/* Amount Selection */}
					<div className="mb-6">
						<div className="block text-sm font-medium text-gray-700 mb-3">
							Select Amount
						</div>
						<div className="grid grid-cols-2 gap-3">
							{mintOptions.map((amount) => (
								<button
									key={amount}
									type="button"
									onClick={() => setMintAmount(amount)}
									className={`p-3 rounded-xl border-2 transition-all duration-200 font-medium ${
										mintAmount === amount
											? "border-purple-500 bg-purple-50 text-purple-700"
											: "border-gray-200 hover:border-purple-300 text-gray-700"
									}`}
								>
									{amount} LIKES
								</button>
							))}
						</div>
					</div>

					{/* Custom Amount Input */}
					<div className="mb-6">
						<label
							htmlFor="mint-amount"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Or enter custom amount
						</label>
						<input
							id="mint-amount"
							type="number"
							min="1"
							max="10000"
							value={mintAmount}
							onChange={(e) => setMintAmount(Number(e.target.value))}
							className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
							placeholder="Enter amount"
						/>
					</div>

					{/* Mint Button */}
					<button
						type="button"
						onClick={handleMintLikes}
						disabled={!account.address || isPending || mintAmount <= 0}
						className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] backdrop-blur-sm"
					>
						<div className="flex items-center justify-center gap-2">
							{isPending ? (
								<>
									<div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
									<span>Minting...</span>
								</>
							) : (
								<>
									<PlusIcon className="h-5 w-5" />
									<span>Mint {mintAmount} LIKES</span>
								</>
							)}
						</div>
					</button>

					{!account.address && (
						<p className="text-center text-gray-500 text-sm mt-4">
							Please connect your wallet to mint lIKES
						</p>
					)}
				</div>

				{/* Info Card */}
				<div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5">
					<div className="flex items-start gap-3">
						<HeartIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
						<div>
							<h4 className="font-semibold text-purple-900 mb-1">
								About LIKES
							</h4>
							<p className="text-purple-700 text-sm leading-relaxed">
								Use LIKES to appreciate book reviews. When you give likes, they
								are automatically distributed equally between the reviewer and
								the book author via smart contract, supporting both content
								creators in the community.
							</p>
						</div>
					</div>
				</div>

				{/* Success Dialog */}
				<Dialog
					open={showSuccessDialog}
					onClose={() => setShowSuccessDialog(false)}
					className="relative z-50"
				>
					<DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
					<div className="fixed inset-0 flex items-center justify-center p-4">
						<DialogPanel className="bg-white rounded-2xl p-6 max-w-sm mx-auto shadow-2xl border border-gray-200">
							<div className="text-center">
								<CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
								<DialogTitle className="text-xl font-bold text-gray-900 mb-2">
									Tokens Minted!
								</DialogTitle>
								<p className="text-gray-600 text-sm mb-6">
									Your lIKES have been successfully minted and added to your
									balance.
								</p>
								<button
									type="button"
									onClick={() => setShowSuccessDialog(false)}
									className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105"
								>
									Continue
								</button>
							</div>
						</DialogPanel>
					</div>
				</Dialog>
			</div>
		</div>
	);
}
