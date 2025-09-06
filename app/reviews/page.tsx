"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	DialogTitle,
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
	Transition,
} from "@headlessui/react";
import {
	ArrowDownIcon,
	ArrowLeftIcon,
	BookOpenIcon,
	CheckCircleIcon,
	ChevronDownIcon,
	ExclamationTriangleIcon,
	HeartIcon,
	HomeIcon,
	UserCircleIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { Address } from "viem";
import { baseSepolia } from "viem/chains";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import LIKE_ABI from "@/abis/like";
import { useIpfsJson } from "@/hooks/ipfs";
import { abbreviateAddress } from "@/utils/address";
import { publicClient } from "@/utils/viem";

const GET_REVIEWS = gql`
	query GetReviewsQuery($first: Int = 10) {
		reviews(orderBy: blockNumber, orderDirection: desc, first: $first) {
			id
			owner
			reviewId
			reviewURI
			book {
				owner
				bookId
				bookURI
			}
			likes {
				amount
			}
		}
	}
`;

function BookDetail({ uri, bookId }: { uri: string; bookId: string }) {
	const { data, loading, error } = useIpfsJson<{
		name: string;
		description: string;
		author?: string;
		image?: string;
	}>(uri);

	if (loading) {
		return (
			<div className="animate-pulse bg-gray-200 h-4 w-20 rounded flex-shrink-0"></div>
		);
	}

	if (error || !data) {
		return (
			<span className="text-gray-400 italic flex-shrink-0">Unknown Book</span>
		);
	}

	return (
		<Link
			href={`/books/${bookId}`}
			className="group flex items-center gap-2 font-bold text-indigo-800 hover:text-indigo-900 transition-all duration-300 flex-shrink-0 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 px-4 py-2.5 rounded-xl border border-indigo-200 hover:border-indigo-300 shadow-md hover:shadow-lg transform hover:scale-105 backdrop-blur-sm"
			title={data.name}
		>
			<div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
				<BookOpenIcon className="h-3.5 w-3.5 text-white" />
			</div>
			<span className="font-semibold text-sm leading-tight max-w-[200px] truncate">
				{data.name}
			</span>
		</Link>
	);
}

function ReviewDetail({
	uri,
	bookUri,
	bookId,
	owner,
	likes,
	userLikes,
	onLike,
	onResetLike,
	isPending,
	isSuccess,
}: {
	uri: string;
	bookUri: string;
	bookId: string;
	owner: Address;
	likes: bigint;
	userLikes?: bigint;
	onLike: () => void;
	onResetLike: () => void;
	isPending: boolean;
	isSuccess: boolean;
}) {
	const { data, loading, error } = useIpfsJson<{
		name: string;
		description: string;
	}>(uri);

	if (loading) {
		return (
			<div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 my-3 animate-pulse">
				<div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
				<div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
				<div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
				<div className="space-y-2">
					<div className="h-4 bg-gray-200 rounded"></div>
					<div className="h-4 bg-gray-200 rounded w-5/6"></div>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-lg p-4 my-3">
				<div className="flex items-center gap-2 text-red-600">
					<ExclamationTriangleIcon className="h-5 w-5" />
					<span className="text-sm font-medium">Failed to load review</span>
				</div>
			</div>
		);
	}

	const MAX_DESCRIPTION_LENGTH = 200;
	const shouldTruncate = data.description.length > MAX_DESCRIPTION_LENGTH;

	return (
		<Transition
			appear
			show={true}
			as={Fragment}
			enter="transition-all duration-300"
			enterFrom="opacity-0 scale-95 translate-y-4"
			enterTo="opacity-100 scale-100 translate-y-0"
		>
			<div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 my-4 hover:shadow-xl transition-all duration-300 hover:border-gray-300">
				{/* Header with owner and book info */}
				<div className="mb-6">
					<div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-5 rounded-2xl border border-indigo-100 shadow-sm">
						{/* Decorative background pattern */}
						<div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
						<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>

						<div className="relative space-y-3">
							{/* User info */}
							<div className="flex justify-center">
								<div className="group flex items-center gap-2 font-bold text-indigo-800 transition-all duration-300 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2.5 rounded-xl border border-indigo-200 shadow-md backdrop-blur-sm">
									<div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm transition-all duration-300">
										<UserCircleIcon className="h-3.5 w-3.5 text-white" />
									</div>
									<span className="font-semibold text-sm leading-tight">
										{abbreviateAddress(owner)}
									</span>
								</div>
							</div>

							{/* Arrow */}
							<div className="flex justify-center">
								<ArrowDownIcon className="h-4 w-4 text-indigo-400" />
							</div>

							{/* Book info */}
							<div className="flex justify-center">
								<BookDetail uri={bookUri} bookId={bookId} />
							</div>
						</div>
					</div>
				</div>

				{/* Review content - title and description combined */}
				<div className="space-y-5">
					<div className="bg-gradient-to-r from-gray-50 to-blue-50 p-5 rounded-xl border border-gray-200">
						{/* Title */}
						<h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
							{data.name}
						</h3>

						{/* Description with Disclosure for expand/collapse */}
						<div className="border-t border-gray-200 pt-4">
							{shouldTruncate ? (
								<Disclosure>
									{({ open }) => (
										<div>
											<div className="text-gray-700 leading-relaxed text-sm">
												{open
													? data.description
													: `${data.description.slice(0, MAX_DESCRIPTION_LENGTH)}...`}
											</div>
											<DisclosureButton className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium mt-3 transition-colors duration-200 group">
												<span>{open ? "Show less" : "Show more"}</span>
												<ChevronDownIcon
													className={`h-4 w-4 transition-transform duration-200 ${
														open ? "rotate-180" : ""
													} group-hover:scale-110`}
												/>
											</DisclosureButton>
											<Transition
												enter="transition duration-200 ease-out"
												enterFrom="transform scale-95 opacity-0"
												enterTo="transform scale-100 opacity-100"
												leave="transition duration-150 ease-out"
												leaveFrom="transform scale-100 opacity-100"
												leaveTo="transform scale-95 opacity-0"
											>
												<DisclosurePanel className="mt-2" />
											</Transition>
										</div>
									)}
								</Disclosure>
							) : (
								<p className="text-gray-700 leading-relaxed text-sm">
									{data.description}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Like and Reset buttons */}
				<div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
					{userLikes && (
						<button
							type="button"
							onClick={onResetLike}
							disabled={isPending || isSuccess}
							className="group flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 text-sm shadow-md hover:shadow-lg transform hover:scale-105 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
						>
							<XMarkIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
							<span className="font-semibold">Reset</span>
						</button>
					)}
					<button
						type="button"
						onClick={onLike}
						disabled={isPending || isSuccess}
						className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 text-sm shadow-md hover:shadow-lg transform hover:scale-105 ${
							userLikes
								? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
								: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
						}`}
					>
						{userLikes ? (
							<HeartIconSolid className="h-4 w-4 group-hover:scale-110 transition-transform" />
						) : (
							<HeartIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
						)}
						<span className="font-semibold">{String(userLikes || likes)}</span>
					</button>
				</div>
			</div>
		</Transition>
	);
}

export default function Page() {
	const router = useRouter();
	const { data, loading, error } = useQuery<
		{
			reviews: Array<{
				id: string;
				owner: string;
				reviewId: string;
				reviewURI: string;
				book: {
					owner: string;
					bookId: string;
					bookURI: string;
				};
				likes: Array<{ amount: string }>;
			}>;
		},
		{
			first?: number;
		}
	>(GET_REVIEWS, { fetchPolicy: "no-cache" });

	const account = useAccount();
	const [likeBalance, setLikeBalance] = useState<bigint>(BigInt(0));
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

	const [state, setState] = useState<{
		bookIds: Array<bigint>;
		reviewIds: Array<bigint>;
		amounts: Array<bigint>;
	}>({
		bookIds: [],
		reviewIds: [],
		amounts: [],
	});

	const [showSuccessDialog, setShowSuccessDialog] = useState(false);

	const handleLike = useCallback((bookId: bigint, reviewId: bigint) => {
		setState((prev) => {
			// Find if the same bookId and reviewId combination already exists
			const existingIndex = prev.bookIds.findIndex(
				(id, index) => id === bookId && prev.reviewIds[index] === reviewId,
			);

			if (existingIndex !== -1) {
				// If exists, increment the amount at that index
				const newAmounts = [...prev.amounts];
				newAmounts[existingIndex] = newAmounts[existingIndex] + BigInt(1);
				return {
					...prev,
					amounts: newAmounts,
				};
			} else {
				// If doesn't exist, add new entry
				return {
					bookIds: [...prev.bookIds, bookId],
					reviewIds: [...prev.reviewIds, reviewId],
					amounts: [...prev.amounts, BigInt(1)],
				};
			}
		});
	}, []);

	const handleResetLike = useCallback((bookId: bigint, reviewId: bigint) => {
		setState((prev) => {
			// Find if the same bookId and reviewId combination exists
			const existingIndex = prev.bookIds.findIndex(
				(id, index) => id === bookId && prev.reviewIds[index] === reviewId,
			);

			if (existingIndex !== -1) {
				// If exists, remove it from all arrays
				const newBookIds = [...prev.bookIds];
				const newReviewIds = [...prev.reviewIds];
				const newAmounts = [...prev.amounts];

				newBookIds.splice(existingIndex, 1);
				newReviewIds.splice(existingIndex, 1);
				newAmounts.splice(existingIndex, 1);

				return {
					bookIds: newBookIds,
					reviewIds: newReviewIds,
					amounts: newAmounts,
				};
			}

			// If doesn't exist, return unchanged state
			return prev;
		});
	}, []);

	const { switchChain } = useSwitchChain();
	const { writeContract, isPending, isSuccess } = useWriteContract();

	const handleSubmitLike = useCallback(
		(
			bookIds: Array<bigint>,
			reviewIds: Array<bigint>,
			amounts: Array<bigint>,
		) => {
			try {
				switchChain(
					{ chainId: baseSepolia.id },
					{
						onSuccess: () =>
							writeContract({
								address: process.env
									.NEXT_PUBLIC_LIKE_CONTRACT_ADDRESS as Address,
								abi: LIKE_ABI,
								functionName: "batchDistribute",
								args: [bookIds, reviewIds, amounts],
							}),
					},
				);
			} catch {
				console.error("Error calling contract");
			}
		},
		[switchChain, writeContract],
	);

	// Store submitted data for success dialog before resetting state
	const [submittedData, setSubmittedData] = useState<{
		bookIds: Array<bigint>;
		reviewIds: Array<bigint>;
		amounts: Array<bigint>;
	}>({
		bookIds: [],
		reviewIds: [],
		amounts: [],
	});

	// Track if we've already processed the success state
	const hasProcessedSuccess = useRef(false);

	// Show success dialog when transaction is successful
	useEffect(() => {
		if (isSuccess && !hasProcessedSuccess.current) {
			// Store the submitted data before resetting
			setSubmittedData({
				bookIds: [...state.bookIds],
				reviewIds: [...state.reviewIds],
				amounts: [...state.amounts],
			});
			setShowSuccessDialog(true);
			// Reset state after successful submission
			setState({
				bookIds: [],
				reviewIds: [],
				amounts: [],
			});
			hasProcessedSuccess.current = true;
		}

		// Reset the ref when isSuccess becomes false (for next transaction)
		if (!isSuccess) {
			hasProcessedSuccess.current = false;
		}
	}, [isSuccess, state]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-3 py-4">
				<div className="max-w-md mx-auto">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-gray-200 rounded w-1/3"></div>
						<div className="h-10 bg-gray-200 rounded w-2/3 mx-auto"></div>
						{Array.from({ length: 3 }, (_, i) => (
							<div
								key={`skeleton-loading-${Date.now()}-${i}`}
								className="bg-white rounded-xl p-5 space-y-3"
							>
								<div className="h-4 bg-gray-200 rounded w-1/2"></div>
								<div className="h-6 bg-gray-200 rounded w-3/4"></div>
								<div className="h-4 bg-gray-200 rounded w-1/3"></div>
								<div className="space-y-2">
									<div className="h-4 bg-gray-200 rounded"></div>
									<div className="h-4 bg-gray-200 rounded w-5/6"></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-3 py-4">
				<div className="max-w-md mx-auto">
					<div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
						<ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
						<h2 className="text-lg font-semibold text-red-800 mb-2">
							Failed to Load Reviews
						</h2>
						<p className="text-red-600 text-sm">
							There was an error loading the reviews. Please try again later.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 px-3 py-4">
			<div className="max-w-md mx-auto">
				{/* Header with Home button and Like Balance */}
				<div className="flex justify-between items-center mb-6">
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

					{/* Like Balance Display */}
					{account.address && (
						<Link
							href="/likes"
							className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl border border-purple-400 transition-all duration-200 hover:shadow-md transform hover:scale-105"
						>
							<HeartIcon className="h-4 w-4 text-white" />
							<span className="font-semibold">{String(likeBalance)}</span>
						</Link>
					)}
				</div>

				{/* Enhanced title */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
						Book Reviews
					</h1>
					<p className="text-gray-600 text-sm">
						Discover and appreciate community book reviews
					</p>
				</div>

				{/* Reviews list */}
				{data && data.reviews.length > 0 ? (
					<div className="space-y-4">
						{data.reviews.map((review, index) => {
							const userLikes = state.amounts.find(
								(_, idx) => state.reviewIds[idx] === BigInt(review.reviewId),
							);
							const allLikes = review.likes.reduce(
								(sum, like) => sum + BigInt(like.amount),
								BigInt(0),
							);
							return (
								<div
									key={review.id}
									style={{ animationDelay: `${index * 100}ms` }}
								>
									<ReviewDetail
										uri={review.reviewURI}
										bookUri={review.book.bookURI}
										bookId={review.book.bookId}
										owner={review.owner as Address}
										likes={allLikes}
										userLikes={userLikes}
										onLike={() =>
											handleLike(
												BigInt(review.book.bookId),
												BigInt(review.reviewId),
											)
										}
										onResetLike={() =>
											handleResetLike(
												BigInt(review.book.bookId),
												BigInt(review.reviewId),
											)
										}
										isPending={isPending}
										isSuccess={isSuccess}
									/>
								</div>
							);
						})}
					</div>
				) : null}

				{/* Enhanced Submit button with Transition */}
				<Transition
					show={state.reviewIds.length > 0}
					as={Fragment}
					enter="transition-all duration-300"
					enterFrom="opacity-0 translate-y-8 scale-95"
					enterTo="opacity-100 translate-y-0 scale-100"
					leave="transition-all duration-200"
					leaveFrom="opacity-100 translate-y-0 scale-100"
					leaveTo="opacity-0 translate-y-8 scale-95"
				>
					<div className="mt-8 sticky bottom-4">
						<button
							type="button"
							onClick={() =>
								handleSubmitLike(state.bookIds, state.reviewIds, state.amounts)
							}
							disabled={state.reviewIds.length === 0 || isPending || isSuccess}
							className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] backdrop-blur-sm"
						>
							<div className="flex items-center justify-center gap-2">
								{isPending ? (
									<>
										<div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
										<span>Submitting Likes...</span>
									</>
								) : (
									<>
										<HeartIcon className="h-5 w-5" />
										<span>
											Submit Likes for {state.reviewIds.length} Reviews
										</span>
									</>
								)}
							</div>
						</button>
					</div>
				</Transition>

				{/* Success Dialog with Distribution Details */}
				<Dialog
					open={showSuccessDialog}
					onClose={() => setShowSuccessDialog(false)}
					className="relative z-50"
				>
					<DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
					<div className="fixed inset-0 flex items-center justify-center p-4">
						<DialogPanel className="bg-white rounded-2xl p-6 max-w-lg mx-auto shadow-2xl border border-gray-200 max-h-[80vh] overflow-y-auto">
							<div className="text-center mb-6">
								<CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
								<DialogTitle className="text-xl font-bold text-gray-900 mb-2">
									Likes Distributed!
								</DialogTitle>
								<p className="text-gray-600 text-sm">
									Your likes have been successfully distributed on the
									blockchain.
								</p>
							</div>

							{/* Distribution Details */}
							<div className="space-y-4 mb-6">
								<h3 className="text-lg font-semibold text-gray-800 text-center mb-4">
									Distribution Summary
								</h3>

								{submittedData.reviewIds.map((reviewId, index) => {
									const review = data?.reviews.find(
										(r) => BigInt(r.reviewId) === reviewId,
									);
									const amount = submittedData.amounts[index];
									const halfAmount = amount / BigInt(2);

									if (!review) return null;

									return (
										<div
											key={`distribution-${reviewId}`}
											className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200"
										>
											<div className="text-center mb-3">
												<div className="inline-flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
													<HeartIcon className="h-4 w-4 text-blue-600" />
													<span className="font-semibold text-blue-800 text-sm">
														{String(amount)} LIKES
													</span>
												</div>
											</div>

											<div className="space-y-3">
												{/* Review Owner */}
												<div className="flex items-center justify-between bg-white/70 rounded-lg p-3 border border-blue-100">
													<div className="flex items-center gap-2">
														<UserCircleIcon className="h-5 w-5 text-indigo-600" />
														<div>
															<div className="text-xs text-gray-500 font-medium">
																Review Owner
															</div>
															<div className="text-sm font-semibold text-gray-800">
																{abbreviateAddress(review.owner as Address)}
															</div>
														</div>
													</div>
													<div className="text-right">
														<div className="text-xs text-gray-500">
															Receives
														</div>
														<div className="font-bold text-indigo-600">
															{String(halfAmount)} LIKES
														</div>
													</div>
												</div>

												{/* Book Owner */}
												<div className="flex items-center justify-between bg-white/70 rounded-lg p-3 border border-blue-100">
													<div className="flex items-center gap-2">
														<BookOpenIcon className="h-5 w-5 text-purple-600" />
														<div>
															<div className="text-xs text-gray-500 font-medium">
																Book Owner
															</div>
															<div className="text-sm font-semibold text-gray-800">
																{abbreviateAddress(
																	review.book.owner as Address,
																)}
															</div>
														</div>
													</div>
													<div className="text-right">
														<div className="text-xs text-gray-500">
															Receives
														</div>
														<div className="font-bold text-purple-600">
															{String(halfAmount)} LIKES
														</div>
													</div>
												</div>
											</div>

											{/* Split indicator */}
											<div className="mt-3 text-center">
												<div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
													<span>50% / 50% Split</span>
												</div>
											</div>
										</div>
									);
								})}
							</div>

							<button
								type="button"
								onClick={() => {
									setShowSuccessDialog(false);
									// Clear submitted data
									setSubmittedData({
										bookIds: [],
										reviewIds: [],
										amounts: [],
									});
								}}
								className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105"
							>
								Continue
							</button>
						</DialogPanel>
					</div>
				</Dialog>
			</div>
		</div>
	);
}
