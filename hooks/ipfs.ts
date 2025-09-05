"use client";

import { useEffect, useState } from "react";

export const useIpfsJson = <T>(uri: string) => {
	const cid = uri.startsWith("ipfs://") ? uri.replace("ipfs://", "") : null;
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (cid) {
			setLoading(true);
			fetch(`/api/ipfs/${cid}`)
				.then(async (response) => {
					const body = await response.json();
					setData(body as T);
				})
				.catch((error) => {
					setError(error.message);
				})
				.finally(() => setLoading(false));
		}
	}, [cid]);

	return { data, loading, error };
};
