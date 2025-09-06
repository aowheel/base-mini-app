"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Transition } from "@headlessui/react";
import {
	BookOpenIcon,
	ExclamationTriangleIcon,
	HomeIcon,
	PlusIcon,
	UserIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { useIpfsJson } from "@/hooks/ipfs";

const GET_BOOKS = gql`
	query GetBooksQuery($first: Int = 10) {
		books(orderBy: blockTimestamp, orderDirection: desc, first: $first) {
			id
			bookId
			bookURI
		}
	}
`;

interface BookData {
	name: string;
	description: string;
	author?: string;
	image?: string;
}

function BookCard({ uri, bookId }: { uri: string; bookId: string }) {
	const { data, loading, error } = useIpfsJson<BookData>(uri);

	if (loading) {
		return (
			<div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 animate-pulse">
				<div className="flex gap-4">
					<div className="w-20 h-28 bg-gray-200 rounded-lg flex-shrink-0"></div>
					<div className="flex-1 space-y-3">
						<div className="h-6 bg-gray-200 rounded w-3/4"></div>
						<div className="h-4 bg-gray-200 rounded w-1/2"></div>
						<div className="space-y-2">
							<div className="h-3 bg-gray-200 rounded"></div>
							<div className="h-3 bg-gray-200 rounded w-5/6"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-xl p-4">
				<div className="flex items-center gap-2 text-red-600">
					<ExclamationTriangleIcon className="h-5 w-5" />
					<span className="text-sm font-medium">Failed to load book</span>
				</div>
			</div>
		);
	}

	const MAX_DESCRIPTION_LENGTH = 120;
	const truncatedDescription =
		data.description.length > MAX_DESCRIPTION_LENGTH
			? `${data.description.slice(0, MAX_DESCRIPTION_LENGTH)}...`
			: data.description;

	return (
		<Transition
			appear
			show={true}
			as={Fragment}
			enter="transition-all duration-300"
			enterFrom="opacity-0 scale-95 translate-y-4"
			enterTo="opacity-100 scale-100 translate-y-0"
		>
			<Link href={`/books/${bookId}`}>
				<div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-xl transition-all duration-300 hover:border-gray-300 cursor-pointer group">
					<div className="flex gap-4">
						{/* Book Cover */}
						<div className="flex-shrink-0">
							{data.image ? (
								<Image
									src={`/api/ipfs/image/${data.image.startsWith("ipfs://") ? data.image.replace("ipfs://", "") : data.image}`}
									alt={data.name}
									width={80}
									height={112}
									className="rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow duration-300"
								/>
							) : (
								<div className="w-20 h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
									<BookOpenIcon className="h-8 w-8 text-gray-500" />
								</div>
							)}
						</div>

						{/* Book Info */}
						<div className="flex-1 min-w-0">
							<div className="space-y-2">
								<h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
									{data.name}
								</h3>
								<div className="flex items-center gap-1 text-gray-600">
									<UserIcon className="h-4 w-4 flex-shrink-0" />
									<span className="text-sm font-medium truncate">
										{data.author}
									</span>
								</div>
								<p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
									{truncatedDescription}
								</p>
							</div>
						</div>
					</div>
				</div>
			</Link>
		</Transition>
	);
}

export default function BooksPage() {
	const { data, loading, error } = useQuery<{
		books: Array<{
			id: string;
			bookId: string;
			bookURI: string;
		}>;
	}>(GET_BOOKS, { fetchPolicy: "no-cache" });

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-6">
			<div className="max-w-4xl mx-auto">
				{/* Navigation */}
				<div className="mb-8 flex justify-between items-center">
					<Link
						href="/"
						className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md group"
					>
						<HomeIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
						<span>Home</span>
					</Link>

					<Link
						href="/books/new"
						className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl border border-transparent transition-all duration-200 hover:shadow-md group"
					>
						<PlusIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
						<span>Add New Book</span>
					</Link>
				</div>

				{/* Title */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
						Book Library
					</h1>
					<p className="text-gray-600 text-sm">
						Discover books from our community reviews
					</p>
				</div>

				{/* Content */}
				{loading ? (
					<div className="grid gap-6 md:grid-cols-2">
						{Array.from({ length: 6 }, (_, i) => (
							<div
								key={`skeleton-loading-${Date.now()}-${i}`}
								className="bg-white rounded-xl shadow-md border border-gray-200 p-5 animate-pulse"
							>
								<div className="flex gap-4">
									<div className="w-20 h-28 bg-gray-200 rounded-lg flex-shrink-0"></div>
									<div className="flex-1 space-y-3">
										<div className="h-6 bg-gray-200 rounded w-3/4"></div>
										<div className="h-4 bg-gray-200 rounded w-1/2"></div>
										<div className="space-y-2">
											<div className="h-3 bg-gray-200 rounded"></div>
											<div className="h-3 bg-gray-200 rounded w-5/6"></div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				) : error ? (
					<div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
						<ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-red-800 mb-2">
							Failed to Load Books
						</h2>
						<p className="text-red-600">
							There was an error loading the books. Please try again later.
						</p>
					</div>
				) : data?.books && data.books.length > 0 ? (
					<div className="grid gap-6 md:grid-cols-2">
						{data.books.map((book, index) => (
							<div key={book.id} style={{ animationDelay: `${index * 100}ms` }}>
								<BookCard uri={book.bookURI} bookId={book.bookId} />
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200">
							<BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-semibold text-gray-700 mb-2">
								No Books Found
							</h3>
							<p className="text-gray-500 text-sm">
								No books have been reviewed yet. Be the first to add a review!
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
