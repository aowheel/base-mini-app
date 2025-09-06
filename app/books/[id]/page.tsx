"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Transition } from "@headlessui/react";
import {
	ArrowLeftIcon,
	BookOpenIcon,
	ExclamationTriangleIcon,
	HomeIcon,
	PencilIcon,
	UserIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, use } from "react";
import { useIpfsJson } from "@/hooks/ipfs";

const GET_BOOK = gql`
	query GetBookQuery($id: ID = "") {
		book(id: $id) {
			bookURI
			likes {
				amount
			}
		}
	}
`;

interface BookData {
	name: string;
	description: string;
	author?: string;
	image?: string;
}

function BookContent({ bookURI }: { bookURI: string }) {
	const { data, loading, error } = useIpfsJson<BookData>(bookURI);

	if (loading) {
		return (
			<div className="animate-pulse space-y-6">
				<div className="h-64 bg-gray-200 rounded-2xl"></div>
				<div className="space-y-4">
					<div className="h-8 bg-gray-200 rounded w-3/4"></div>
					<div className="h-6 bg-gray-200 rounded w-1/2"></div>
					<div className="space-y-2">
						<div className="h-4 bg-gray-200 rounded"></div>
						<div className="h-4 bg-gray-200 rounded w-5/6"></div>
						<div className="h-4 bg-gray-200 rounded w-4/5"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
				<ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
				<h2 className="text-xl font-semibold text-red-800 mb-2">
					Failed to Load Book
				</h2>
				<p className="text-red-600">
					There was an error loading the book details. Please try again later.
				</p>
			</div>
		);
	}

	return (
		<Transition
			appear
			show={true}
			as={Fragment}
			enter="transition-all duration-300"
			enterFrom="opacity-0 scale-95 translate-y-4"
			enterTo="opacity-100 scale-100 translate-y-0"
		>
			<div className="space-y-6">
				{/* Book Image */}
				{data.image && (
					<div className="flex justify-center">
						<div className="relative">
							<Image
								src={`/api/ipfs/image/${data.image.startsWith("ipfs://") ? data.image.replace("ipfs://", "") : data.image}`}
								alt={data.name}
								width={240}
								height={320}
								className="rounded-xl shadow-lg object-cover"
								priority
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl"></div>
						</div>
					</div>
				)}

				{/* Book Info */}
				<div className="bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
					<div className="space-y-5">
						{/* Title */}
						<div>
							<h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
								{data.name}
							</h1>
							{data.author && (
								<div className="flex items-center gap-2 text-gray-600">
									<UserIcon className="h-4 w-4" />
									<span className="text-sm font-medium">{data.author}</span>
								</div>
							)}
						</div>

						{/* Description */}
						<div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
							<p className="text-gray-700 leading-relaxed text-sm">
								{data.description}
							</p>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	);
}

export default function BookDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const router = useRouter();
	const resolvedParams = use(params);
	const { data, loading, error } = useQuery<{
		book: {
			bookURI: string;
			likes: Array<{ amount: string }>;
		};
	}>(GET_BOOK, {
		variables: { id: resolvedParams.id },
		fetchPolicy: "no-cache",
	});

	const totalLikes = data?.book?.likes.reduce(
		(sum, like) => sum + BigInt(like.amount),
		BigInt(0),
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 px-3 py-4">
			<div className="max-w-md mx-auto">
				{/* Navigation */}
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

				{/* Content */}
				{loading ? (
					<div className="animate-pulse space-y-4">
						<div className="h-48 bg-gray-200 rounded-xl"></div>
						<div className="bg-white rounded-xl p-5 space-y-3">
							<div className="h-6 bg-gray-200 rounded w-3/4"></div>
							<div className="h-4 bg-gray-200 rounded w-1/2"></div>
							<div className="space-y-2">
								<div className="h-4 bg-gray-200 rounded"></div>
								<div className="h-4 bg-gray-200 rounded w-5/6"></div>
								<div className="h-4 bg-gray-200 rounded w-4/5"></div>
							</div>
						</div>
					</div>
				) : error ? (
					<div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
						<ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
						<h2 className="text-lg font-semibold text-red-800 mb-2">
							Book Not Found
						</h2>
						<p className="text-red-600 text-sm">
							The book you&apos;re looking for doesn&apos;t exist or
							couldn&apos;t be loaded.
						</p>
					</div>
				) : data?.book ? (
					<>
						{/* Total Likes Display */}
						<div className="mb-6 text-center">
							<div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-sm">
								<HeartIconSolid className="h-4 w-4 text-red-500" />
								<span className="text-red-700 font-medium text-sm">
									{String(totalLikes)} total LIKES
								</span>
							</div>
						</div>

						<BookContent bookURI={data.book.bookURI} />

						{/* Write Review Button */}
						<div className="mt-6">
							<Link
								href={`/reviews/new/${resolvedParams.id}`}
								className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] group"
							>
								<PencilIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
								<span>Write a Review</span>
							</Link>
						</div>
					</>
				) : (
					<div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
						<BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h2 className="text-lg font-semibold text-gray-700 mb-2">
							Book Not Found
						</h2>
						<p className="text-gray-500 text-sm">
							The book you&apos;re looking for doesn&apos;t exist.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
