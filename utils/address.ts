import type { Address } from "viem";

export const abbreviateAddress = (address: Address) => {
	const prefix = address.slice(0, 7); // 0x00000
	const suffix = address.slice(-5); // 00000
	return `${prefix}...${suffix}`;
};
