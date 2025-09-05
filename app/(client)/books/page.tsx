"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useIpfsJson } from "@/hooks/ipfs";

const GET_BOOKS = gql`
  query GetBooksQuery($first: Int = 10) {
    reviews(orderBy: blockTimestamp, orderDirection: desc, first: $first) {
			id
      book {
        id
        bookURI
      }
    }
  }
`;

function BookDetail({ uri }: { uri: string }) {
	const { data, loading, error } = useIpfsJson<{
		title: string;
		description: string;
		image: string;
		author: string;
	}>(uri);

	return data ? (
		<div className="border p-4 my-2">
			<h3 className="text-lg font-bold">{data.title}</h3>
			<p className="text-sm text-gray-600">by {data.author}</p>
			<p className="mt-2">{data.description}</p>
		</div>
	) : null;
}

export default function Page() {
	const { data, loading, error } = useQuery<
		{
			reviews: Array<{
				id: string;
				book: {
					bookId: string;
					bookURI: string;
				};
			}>;
		},
		{
			first?: number;
		}
	>(GET_BOOKS, { fetchPolicy: "no-cache" });

	return data ? (
		<div>
			{data.reviews.map((review) => (
				<div key={review.id}>
					<BookDetail uri={review.book.bookURI} />
				</div>
			))}
		</div>
	) : null;
}
