"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import type { ReactNode } from "react";
import { baseSepolia } from "wagmi/chains";

export function Providers(props: { children: ReactNode }) {
	const client = new ApolloClient({
		link: new HttpLink({ uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL }),
		cache: new InMemoryCache(),
	});

	return (
		<MiniKitProvider
			apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
			chain={baseSepolia}
			config={{
				appearance: {
					mode: "auto",
					theme: "mini-app-theme",
					name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
					logo: process.env.NEXT_PUBLIC_ICON_URL,
				},
			}}
		>
			<ApolloProvider client={client}>{props.children}</ApolloProvider>
		</MiniKitProvider>
	);
}
