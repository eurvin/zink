import {
  Button,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from '@chakra-ui/react'
import { env } from '@config/environment'
import { encodeAddress } from '@polkadot/util-crypto'
import {
  SubstrateChain,
  SubstrateWalletPlatform,
  allSubstrateWallets,
  getSubstrateChain,
  isWalletInstalled,
  useBalance,
  useInkathon,
} from '@scio-labs/use-inkathon'
import { truncateHash } from '@utils/truncateHash'
import { useIsSSR } from '@utils/useIsSSR'
import { FC, useState } from 'react'
import { toast } from 'react-hot-toast'
import { AiOutlineCheckCircle, AiOutlineDisconnect } from 'react-icons/ai'
import { FiChevronDown, FiExternalLink } from 'react-icons/fi'
import 'twin.macro'

export interface ConnectButtonProps {}
export const ConnectButton: FC<ConnectButtonProps> = () => {
  const {
    activeChain,
    switchActiveChain,
    connect,
    disconnect,
    isConnecting,
    activeAccount,
    accounts,
    setActiveAccount,
  } = useInkathon()
  const { balanceFormatted } = useBalance(activeAccount?.address)
  const [supportedChains] = useState(
    env.supportedChains.map((networkId) => getSubstrateChain(networkId) as SubstrateChain),
  )
  const [browserWallets] = useState(
    allSubstrateWallets.filter((w) => w.platforms.includes(SubstrateWalletPlatform.Browser)),
  )
  const isSSR = useIsSSR()

  // Connect Button
  if (!activeAccount)
    return (
      <Menu>
        <MenuButton
          as={Button}
          isLoading={isConnecting}
          size="md"
          rightIcon={<FiChevronDown size={22} />}
          py={6}
          fontWeight="bold"
          rounded="2xl"
          colorScheme="purple"
        >
          Connect Wallet
        </MenuButton>

        <MenuList bgColor="blackAlpha.900" borderColor="whiteAlpha.300" rounded="2xl">
          {/* Installed Wallets */}
          {!isSSR &&
            !activeAccount &&
            browserWallets.map((w) =>
              isWalletInstalled(w) ? (
                <MenuItem
                  key={w.id}
                  onClick={() => {
                    connect?.(undefined, w)
                  }}
                  tw="bg-transparent hocus:bg-gray-800"
                >
                  {w.name}
                </MenuItem>
              ) : (
                <MenuItem
                  as={Link}
                  href={w.urls.website}
                  key={w.id}
                  tw="bg-transparent opacity-50 hocus:bg-gray-800 hover:(no-underline opacity-70)"
                >
                  <VStack align="start" spacing={0}>
                    <HStack>
                      <Text>{w.name}</Text>
                      <FiExternalLink size={16} />
                    </HStack>
                    <Text fontSize="xs">Not installed</Text>
                  </VStack>
                </MenuItem>
              ),
            )}
        </MenuList>
      </Menu>
    )

  // Account Menu & Disconnect Button
  return (
    <Menu>
      <HStack>
        {balanceFormatted !== undefined && (
          <Button py={6} pl={5} rounded="2xl" fontWeight="bold" fontSize="sm" pointerEvents="none">
            Account balance at session start: {balanceFormatted}
          </Button>
        )}
        <MenuButton
          as={Button}
          rightIcon={<FiChevronDown size={22} />}
          hidden={false}
          py={6}
          pl={5}
          rounded="2xl"
          fontWeight="bold"
        >
          <VStack spacing={0.5}>
            <Text fontSize="sm">{activeAccount.name}</Text>
            <Text fontSize="xs" fontWeight="normal" opacity={0.75}>
              {truncateHash(encodeAddress(activeAccount.address, activeChain?.ss58Prefix || 42), 8)}
            </Text>
          </VStack>
        </MenuButton>
      </HStack>

      <MenuList bgColor="blackAlpha.900" borderColor="whiteAlpha.300" rounded="2xl">
        {/* Supported Chains */}
        {supportedChains.map((chain) => (
          <MenuItem
            key={chain.network}
            isDisabled={chain.network === activeChain?.network}
            onClick={async () => {
              await switchActiveChain?.(chain)
              toast.success(`Switched to ${chain.name}`)
            }}
            tw="bg-transparent hocus:bg-gray-800"
          >
            <VStack align="start" spacing={0}>
              <HStack>
                <Text>{chain.name}</Text>
                {chain.network === activeChain?.network && <AiOutlineCheckCircle size={16} />}
              </HStack>
            </VStack>
          </MenuItem>
        ))}

        {/* Available Accounts/Wallets */}
        <MenuDivider />
        {(accounts || []).map((acc) => {
          const encodedAddress = encodeAddress(acc.address, activeChain?.ss58Prefix || 42)
          const truncatedEncodedAddress = truncateHash(encodedAddress, 10)
          return (
            <MenuItem
              key={encodedAddress}
              isDisabled={acc.address === activeAccount.address}
              onClick={() => {
                setActiveAccount?.(acc)
              }}
              tw="bg-transparent hocus:bg-gray-800"
            >
              <VStack align="start" spacing={0}>
                <HStack>
                  <Text>{acc.name}</Text>
                  {acc.address === activeAccount.address && <AiOutlineCheckCircle size={16} />}
                </HStack>
                <Text fontSize="xs">{truncatedEncodedAddress}</Text>
              </VStack>
            </MenuItem>
          )
        })}

        {/* Disconnect Button */}
        <MenuDivider />
        <MenuItem
          onClick={disconnect}
          icon={<AiOutlineDisconnect size={18} />}
          tw="bg-transparent hocus:bg-gray-800"
        >
          Disconnect
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
