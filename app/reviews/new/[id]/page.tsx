"use client";

import { Transition } from "@headlessui/react";
import {
	ArrowLeftIcon,
	BookOpenIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	PencilIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, use, useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import { useWriteContract } from "wagmi";
import REVIEW_ABI from "@/abis/review";

export default function NewReviewPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const router = useRouter();
	const resolvedParams = use(params);
	const { writeContract, isPending, isSuccess, error } = useWriteContract();

	// Form state
	const [formData, setFormData] = useState({
		name: "",
		description: "",
	});
	const [uploadingToIpfs, setUploadingToIpfs] = useState(false);
	const [uploadError, setUploadError] = useState<string>();

	const handleInputChange = useCallback(
		(field: "name" | "description", value: string) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
		},
		[],
	);

	const handleFormSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();

			if (!formData.name.trim() || !formData.description.trim()) {
				return;
			}

			setUploadingToIpfs(true);
			setUploadError(undefined);

			try {
				// Upload to IPFS
				const response = await fetch("/api/ipfs", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: formData.name.trim(),
						description: formData.description.trim(),
					}),
				});

				const { cid } = await response.json();
				if (!cid) return;
				setUploadingToIpfs(false);

				// Submit to contract
				writeContract({
					address: process.env.NEXT_PUBLIC_REVIEW_CONTRACT_ADDRESS as Address,
					abi: REVIEW_ABI,
					functionName: "mint",
					args: [BigInt(resolvedParams.id), `ipfs://${cid}`],
				});
			} catch {
				setUploadError("Failed to upload review. Please try again.");
				setUploadingToIpfs(false);
			}
		},
		[formData, writeContract, resolvedParams.id],
	);

	// Redirect on success
	useEffect(() => {
		if (isSuccess) {
			const timer = setTimeout(() => {
				router.push("/reviews");
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [isSuccess, router]);

	const isFormValid = formData.name.trim() && formData.description.trim();
	const isSubmitting = uploadingToIpfs || isPending;

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-6">
			<div className="max-w-2xl mx-auto">
				{/* Navigation */}
				<div className="mb-8">
					<Link
						href="/reviews"
						className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md group"
					>
						<ArrowLeftIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
						<span>Back to Reviews</span>
					</Link>
				</div>

				{/* Title */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
						Write a Review
					</h1>
					<p className="text-gray-600 text-sm">
						Share your thoughts about this book with the community
					</p>
				</div>

				{/* Success State */}
				{isSuccess && (
					<Transition
						appear
						show={true}
						as={Fragment}
						enter="transition-all duration-500"
						enterFrom="opacity-0 scale-95 translate-y-8"
						enterTo="opacity-100 scale-100 translate-y-0"
					>
						<div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mb-8">
							<CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
							<h2 className="text-xl font-semibold text-green-800 mb-2">
								Review Published!
							</h2>
							<p className="text-green-600 text-sm">
								Your review has been successfully published to the blockchain.
								Redirecting to reviews...
							</p>
						</div>
					</Transition>
				)}

				{/* Error State */}
				{(uploadError || error) && (
					<div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
						<div className="flex items-center gap-2 text-red-600 mb-2">
							<ExclamationTriangleIcon className="h-5 w-5" />
							<span className="font-medium">Error</span>
						</div>
						<p className="text-red-600 text-sm">
							{uploadError ||
								(error && "Failed to publish review. Please try again.")}
						</p>
					</div>
				)}

				{/* Form */}
				{!isSuccess && (
					<Transition
						appear
						show={true}
						as={Fragment}
						enter="transition-all duration-500"
						enterFrom="opacity-0 scale-95 translate-y-8"
						enterTo="opacity-100 scale-100 translate-y-0"
					>
						<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg">
							<form onSubmit={handleFormSubmit} className="space-y-6">
								{/* Review Title */}
								<div className="space-y-2">
									<label
										htmlFor="review-title"
										className="flex items-center gap-2 text-sm font-medium text-gray-700"
									>
										<PencilIcon className="h-4 w-4" />
										Review Title
									</label>
									<input
										id="review-title"
										type="text"
										value={formData.name}
										onChange={(e) => handleInputChange("name", e.target.value)}
										placeholder="Enter a title for your review..."
										className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
										disabled={isSubmitting}
									/>
								</div>

								{/* Review Description */}
								<div className="space-y-2">
									<label
										htmlFor="review-description"
										className="flex items-center gap-2 text-sm font-medium text-gray-700"
									>
										<BookOpenIcon className="h-4 w-4" />
										Your Review
									</label>
									<textarea
										id="review-description"
										value={formData.description}
										onChange={(e) =>
											handleInputChange("description", e.target.value)
										}
										placeholder="Share your thoughts about this book..."
										rows={6}
										className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
										disabled={isSubmitting}
									/>
								</div>

								{/* Submit Button */}
								<div className="pt-4">
									<button
										type="submit"
										disabled={!isFormValid || isSubmitting}
										className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] backdrop-blur-sm"
									>
										<div className="flex items-center justify-center gap-2">
											{isSubmitting ? (
												<>
													<div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
													<span>
														{uploadingToIpfs
															? "Uploading to IPFS..."
															: "Publishing to Blockchain..."}
													</span>
												</>
											) : (
												<>
													<PencilIcon className="h-5 w-5" />
													<span>Publish Review</span>
												</>
											)}
										</div>
									</button>
								</div>
							</form>
						</div>
					</Transition>
				)}
			</div>
		</div>
	);
}
