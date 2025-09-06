"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Transition } from "@headlessui/react";
import {
	ArrowLeftIcon,
	BookOpenIcon,
	ExclamationTriangleIcon,
	PencilIcon,
	UserIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
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
			enter="transition-all duration-500"
			enterFrom="opacity-0 scale-95 translate-y-8"
			enterTo="opacity-100 scale-100 translate-y-0"
		>
			<div className="space-y-8">
				{/* Book Image */}
				{data.image && (
					<div className="flex justify-center">
						<div className="relative">
							<Image
								src={`/api/ipfs/image/${data.image.startsWith("ipfs://") ? data.image.replace("ipfs://", "") : data.image}`}
								alt={data.name}
								width={300}
								height={400}
								className="rounded-2xl shadow-2xl object-cover"
								priority
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
						</div>
					</div>
				)}

				{/* Book Info */}
				<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg">
					<div className="space-y-6">
						{/* Title */}
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
								{data.name}
							</h1>
							<div className="flex items-center gap-2 text-gray-600">
								<UserIcon className="h-5 w-5" />
								<span className="text-lg font-medium">by {data.author}</span>
							</div>
						</div>

						{/* Description */}
						<div className="space-y-3">
							<div className="flex items-center gap-2 text-gray-700">
								<BookOpenIcon className="h-5 w-5" />
								<h2 className="text-lg font-semibold">Description</h2>
							</div>
							<p className="text-gray-700 leading-relaxed text-base">
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

				{/* Content */}
				{loading ? (
					<div className="animate-pulse space-y-6">
						<div className="h-64 bg-gray-200 rounded-2xl"></div>
						<div className="bg-white/80 rounded-2xl p-8 space-y-4">
							<div className="h-8 bg-gray-200 rounded w-3/4"></div>
							<div className="h-6 bg-gray-200 rounded w-1/2"></div>
							<div className="space-y-2">
								<div className="h-4 bg-gray-200 rounded"></div>
								<div className="h-4 bg-gray-200 rounded w-5/6"></div>
								<div className="h-4 bg-gray-200 rounded w-4/5"></div>
							</div>
						</div>
					</div>
				) : error ? (
					<div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
						<ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-red-800 mb-2">
							Book Not Found
						</h2>
						<p className="text-red-600">
							The book you&apos;re looking for doesn&apos;t exist or
							couldn&apos;t be loaded.
						</p>
					</div>
				) : data?.book ? (
					<>
						{/* Total Likes Display */}
						{totalLikes && totalLikes > 0 && (
							<div className="mb-6 text-center">
								<div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-gray-200">
									<HeartIconSolid className="h-5 w-5 text-red-500" />
									<span className="text-gray-700 font-medium">
										{String(totalLikes)} total likes
									</span>
								</div>
							</div>
						)}

						<BookContent bookURI={data.book.bookURI} />

						{/* Write Review Button */}
						<div className="mt-8">
							<Link
								href={`/reviews/new/${resolvedParams.id}`}
								className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] group"
							>
								<PencilIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
								<span>Write a Review</span>
							</Link>
						</div>
					</>
				) : (
					<div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
						<BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-gray-700 mb-2">
							Book Not Found
						</h2>
						<p className="text-gray-500">
							The book you&apos;re looking for doesn&apos;t exist.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
