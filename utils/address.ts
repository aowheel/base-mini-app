import type { Address } from "viem";

export const abbreviateAddress = (address: Address) => {
	const prefix = address.slice(0, 5); // 0x000
	const suffix = address.slice(-3); // 000
	return `${prefix}...${suffix}`;
};
