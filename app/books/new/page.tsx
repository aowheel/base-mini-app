"use client";

import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	DialogTitle,
} from "@headlessui/react";
import {
	ArrowLeftIcon,
	BookOpenIcon,
	CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useWriteContract } from "wagmi";
import BOOK_ABI from "@/abis/book";

interface BookMetadata {
	name: string;
	description: string;
	author?: string;
	image?: string;
}

export default function NewBookPage() {
	const { writeContract, isPending, isSuccess } = useWriteContract();

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		author: "",
	});
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadStatus, setUploadStatus] = useState<{
		type: "success" | "error" | null;
		message: string;
	}>({ type: null, message: "" });
	const [metadataCid, setMetadataCid] = useState<string>("");
	const [currentStep, setCurrentStep] = useState<
		"idle" | "uploading" | "minting" | "completed"
	>("idle");
	const [showSuccessDialog, setShowSuccessDialog] = useState(false);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
		}
	};

	const uploadImageToIpfs = async (file: File): Promise<string> => {
		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch("/api/ipfs/image", {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error("Failed to upload image");
		}

		const cid = await response.json();
		return cid;
	};

	const uploadJsonToIpfs = async (metadata: BookMetadata): Promise<string> => {
		const response = await fetch("/api/ipfs", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(metadata),
		});

		if (!response.ok) {
			throw new Error("Failed to upload metadata");
		}

		const result = await response.json();
		return result.cid;
	};

	const generateIpfsUri = (cid: string): string => {
		return `ipfs://${cid}`;
	};

	// Handle contract success
	useEffect(() => {
		if (isSuccess && currentStep === "minting") {
			setCurrentStep("completed");
			setShowSuccessDialog(true);
			// Reset form
			setFormData({ name: "", description: "", author: "" });
			setSelectedFile(null);
			setMetadataCid("");
			setUploadStatus({ type: null, message: "" });
		}
	}, [isSuccess, currentStep]);

	// Reset to idle state when success dialog is closed
	const handleCloseSuccessDialog = () => {
		setShowSuccessDialog(false);
		setCurrentStep("idle");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name || !formData.description) {
			setUploadStatus({
				type: "error",
				message: "Please fill in the required fields (name and description)",
			});
			return;
		}

		setCurrentStep("uploading");
		setIsUploading(true);
		setUploadStatus({ type: null, message: "" });

		try {
			let imageIpfsUri: string | undefined;

			// Step 1: Upload image to IPFS (if provided)
			if (selectedFile) {
				const imageCid = await uploadImageToIpfs(selectedFile);
				imageIpfsUri = generateIpfsUri(imageCid);
			}

			// Step 2: Create metadata object
			const metadata: BookMetadata = {
				name: formData.name,
				description: formData.description,
				...(formData.author && { author: formData.author }),
				...(imageIpfsUri && { image: imageIpfsUri }),
			};

			// Step 3: Upload metadata JSON to IPFS
			const metadataCid = await uploadJsonToIpfs(metadata);
			setMetadataCid(metadataCid);

			// Step 4: Mint NFT to blockchain
			setCurrentStep("minting");
			setUploadStatus({
				type: "success",
				message: "Metadata uploaded! Now registering on blockchain...",
			});

			writeContract({
				address: process.env.NEXT_PUBLIC_BOOK_CONTRACT_ADDRESS as `0x${string}`,
				abi: BOOK_ABI,
				functionName: "mint",
				args: [
					"0x8C713BB047edcc200427f7605E66E0329258dAC9",
					`ipfs://${metadataCid}`,
				],
			});
		} catch (error) {
			setCurrentStep("idle");
			setUploadStatus({
				type: "error",
				message:
					error instanceof Error
						? error.message
						: "An error occurred during upload",
			});
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-6">
			<div className="max-w-2xl mx-auto">
				{/* Navigation */}
				<div className="mb-8">
					<Link
						href="/books"
						className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md group"
					>
						<ArrowLeftIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
						<span>Back to Books</span>
					</Link>
				</div>

				{/* Title */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
						Create New Book
					</h1>
					<p className="text-gray-600 text-sm">Add a new book to the library</p>
				</div>

				{/* Form */}
				<div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-8 shadow-lg">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Book Name */}
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Book Name *
							</label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								required
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 text-gray-900 placeholder-gray-500"
								placeholder="Enter book name"
							/>
						</div>

						{/* Description */}
						<div>
							<label
								htmlFor="description"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Description *
							</label>
							<textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								required
								rows={4}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 resize-none text-gray-900 placeholder-gray-500"
								placeholder="Enter book description"
							/>
						</div>

						{/* Author */}
						<div>
							<label
								htmlFor="author"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Author
							</label>
							<input
								type="text"
								id="author"
								name="author"
								value={formData.author}
								onChange={handleInputChange}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 text-gray-900 placeholder-gray-500"
								placeholder="Enter author name (optional)"
							/>
						</div>

						{/* Book Cover Image */}
						<div>
							<label
								htmlFor="image"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Book Cover Image
							</label>
							<div className="relative">
								<input
									type="file"
									id="image"
									accept="image/*"
									onChange={handleFileChange}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
								/>
								{selectedFile && (
									<div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-3">
										<BookOpenIcon className="h-4 w-4 text-green-600" />
										<span>Selected: {selectedFile.name}</span>
									</div>
								)}
							</div>
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={
								isUploading ||
								isPending ||
								currentStep === "uploading" ||
								currentStep === "minting"
							}
							className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
						>
							{currentStep === "uploading" ? (
								<div className="flex items-center justify-center gap-2">
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									<span>Uploading to IPFS...</span>
								</div>
							) : currentStep === "minting" || isPending ? (
								<div className="flex items-center justify-center gap-2">
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									<span>Registering on Blockchain...</span>
								</div>
							) : (
								"Create Book"
							)}
						</button>
					</form>

					{/* Error Messages */}
					{uploadStatus.type === "error" && (
						<div className="mt-6 p-4 rounded-lg border bg-red-50 text-red-700 border-red-200">
							<p className="font-medium">{uploadStatus.message}</p>
						</div>
					)}

					{/* Progress Messages */}
					{uploadStatus.type === "success" && (
						<div className="mt-6 p-4 rounded-lg border bg-blue-50 text-blue-700 border-blue-200">
							<p className="font-medium">{uploadStatus.message}</p>
							{metadataCid && (
								<div className="mt-3 p-3 bg-white/50 rounded-lg">
									<p className="text-sm font-medium text-gray-700 mb-1">
										Metadata IPFS URI:
									</p>
									<p className="font-mono text-xs break-all text-gray-600 bg-gray-100 p-2 rounded">
										ipfs://{metadataCid}
									</p>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Success Dialog */}
				<Dialog
					open={showSuccessDialog}
					onClose={handleCloseSuccessDialog}
					className="relative z-50"
				>
					<DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
					<div className="fixed inset-0 flex items-center justify-center p-4">
						<DialogPanel className="bg-white rounded-2xl p-6 max-w-sm mx-auto shadow-2xl border border-gray-200">
							<div className="text-center">
								<CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
								<DialogTitle className="text-xl font-bold text-gray-900 mb-2">
									Book Created Successfully!
								</DialogTitle>
								<p className="text-gray-600 text-sm mb-6">
									Your book has been successfully registered on the blockchain
									and added to the library.
								</p>
								<button
									type="button"
									onClick={handleCloseSuccessDialog}
									className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105"
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
