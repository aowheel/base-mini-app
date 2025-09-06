import type { Address } from "viem";

export const abbreviateAddress = (address: Address) => {
	const prefix = address.slice(0, 6); // 0x0000
	const suffix = address.slice(-4); // 0000
	return `${prefix}...${suffix}`;
};
